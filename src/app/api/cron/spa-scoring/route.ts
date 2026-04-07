/**
 * GET /api/cron/spa-scoring — Daily Lead Score Recalculation + Birthday Check
 *
 * Vercel Cron: runs daily at 8am ET
 * Replaces n8n Workflows B (Daily Score Monitor) and D (Birthday Trigger)
 *
 * 1. Fetches all contacts for Spa Ligonier location
 * 2. Recalculates RFM+E score for each
 * 3. Updates contacts whose tier changed
 * 4. Triggers campaigns for tier drops/rises
 * 5. Checks for birthdays in 7 days → enrolls birthday sequence
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CRM_API = 'https://services.leadconnectorhq.com'
const SPA_LOCATION = 'F76MNKOMQCMruMrumtdf'
const SPA_PIT = process.env.CRM_SPA_PIT || 'pit-bafea751-0228-4db1-a9f7-3d426b33713c'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

function crmHeaders() {
  return {
    'Authorization': `Bearer ${SPA_PIT}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json',
  }
}

// RFM+E Scoring Algorithm (from 0nSpa spec)
function scoreContact(contact: Record<string, unknown>) {
  const now = Date.now()
  const cf = (contact.customField || contact.customFields || {}) as Record<string, unknown>

  // Recency (0-25)
  const lastVisit = cf.last_visit_date ? new Date(cf.last_visit_date as string).getTime() : 0
  const daysAgo = lastVisit ? Math.floor((now - lastVisit) / 86400000) : 999
  let r = 0
  if (daysAgo <= 7) r = 25
  else if (daysAgo <= 14) r = 22
  else if (daysAgo <= 30) r = 18
  else if (daysAgo <= 60) r = 12
  else if (daysAgo <= 90) r = 7
  else if (daysAgo <= 180) r = 3

  // Frequency (0-25)
  const visits = parseInt(cf.total_visits as string || '0', 10)
  let f = 0
  if (visits >= 11) f = 25
  else if (visits >= 7) f = 21
  else if (visits >= 4) f = 17
  else if (visits >= 2) f = 12
  else if (visits >= 1) f = 5

  // Monetary (0-25)
  const avgSpend = parseFloat(cf.avg_spend as string || '0')
  let m = 0
  if (avgSpend >= 150) m = 25
  else if (avgSpend >= 100) m = 18
  else if (avgSpend >= 50) m = 12
  else if (avgSpend >= 25) m = 6
  else m = 2

  // Engagement (0-25) minus no-show penalty
  const noShows = parseInt(cf.no_show_count as string || '0', 10)
  let e = Math.max(10 - (noShows * 5), 0) // simplified — no email stats available via API

  const score = r + f + m + e

  let tier: string
  if (score >= 81) tier = 'vip'
  else if (score >= 61) tier = 'hot'
  else if (score >= 41) tier = 'warm'
  else if (score >= 21) tier = 'lukewarm'
  else if (score > 0) tier = 'cold'
  else tier = 'dormant'

  const previousTier = cf.score_tier as string || null
  const tierChanged = previousTier !== tier

  return { score, tier, r, f, m, e, daysAgo, previousTier, tierChanged }
}

export async function GET(request: Request) {
  // Verify cron secret (Vercel adds this header)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()
  let processed = 0
  let tierChanges = 0
  let birthdaysFound = 0
  const errors: string[] = []

  try {
    // Fetch all contacts with pagination
    let hasMore = true
    let offset = 0

    while (hasMore) {
      const res = await fetch(`${CRM_API}/contacts/?locationId=${SPA_LOCATION}&limit=100&startAfter=${offset}`, {
        headers: crmHeaders(),
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) {
        errors.push(`CRM fetch failed: ${res.status}`)
        break
      }

      const data = await res.json()
      const contacts = data.contacts || []
      if (contacts.length === 0) { hasMore = false; break }

      for (const contact of contacts) {
        processed++
        const result = scoreContact(contact)

        // Update if tier changed
        if (result.tierChanged) {
          tierChanges++
          try {
            await fetch(`${CRM_API}/contacts/${contact.id}`, {
              method: 'PUT',
              headers: crmHeaders(),
              body: JSON.stringify({
                customField: {
                  lead_score: result.score,
                  score_tier: result.tier,
                },
              }),
            })

            // Fire webhook to our own runner for campaign triggers
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/api/webhooks/crm`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'contact.tag.update',
                contactId: contact.id,
                locationId: SPA_LOCATION,
                previousTier: result.previousTier,
                newTier: result.tier,
                score: result.score,
                source: 'daily-scoring',
              }),
            })
          } catch (err) {
            errors.push(`Update ${contact.id}: ${(err as Error).message}`)
          }
        }

        // Birthday check
        if (contact.dateOfBirth) {
          const bday = new Date(contact.dateOfBirth)
          const today = new Date()
          const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
          const daysUntil = Math.ceil((thisYearBday.getTime() - today.getTime()) / 86400000)

          if (daysUntil >= 0 && daysUntil <= 7) {
            birthdaysFound++
            const tags = (contact.tags || []) as string[]
            if (!tags.includes('birthday_active')) {
              try {
                await fetch(`${CRM_API}/contacts/${contact.id}/tags`, {
                  method: 'POST',
                  headers: crmHeaders(),
                  body: JSON.stringify({ tags: ['birthday_active'] }),
                })
              } catch (err) {
                errors.push(`Birthday tag ${contact.id}: ${(err as Error).message}`)
              }
            }
          }
        }
      }

      offset += contacts.length
      if (contacts.length < 100) hasMore = false
    }

    // Log summary to Supabase
    await admin.from('crm_workflow_runs').insert({
      workflow_id: null, // system cron, not a specific workflow
      trigger_event: 'cron.daily_scoring',
      trigger_payload: { source: 'vercel-cron', location: SPA_LOCATION },
      status: errors.length > 0 ? 'completed_with_errors' : 'completed',
      steps_completed: processed,
      steps_total: processed,
      results: [{ processed, tierChanges, birthdaysFound, errors: errors.slice(0, 10) }],
      duration_ms: 0,
      services_called: ['crm', 'supabase'],
    })

  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    processed,
    tierChanges,
    birthdaysFound,
    errors: errors.length,
  })
}
