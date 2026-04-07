/**
 * POST /api/console/agent-workflows/deploy
 *
 * Deploys an AI-generated workflow to crm_agent_workflows.
 * Called when user clicks "Deploy" on a generated workflow in chat.
 *
 * Body: { workflow: { name, slug, trigger_event, trigger_conditions, steps, services } }
 *
 * Automatically:
 * 1. Saves to crm_agent_workflows
 * 2. Registers webhook for the location if not already registered
 * 3. Returns the deployed workflow ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveAuth } from '@/lib/token-auth'

const CRM_API = 'https://services.leadconnectorhq.com'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const LOCATION_PITS: Record<string, string> = {
  'F76MNKOMQCMruMrumtdf': process.env.CRM_SPA_PIT || 'pit-bafea751-0228-4db1-a9f7-3d426b33713c',
  'nphConTwfHcVE1oA0uep': process.env.CRM_PIT || 'pit-0317b406-8a47-478e-ac28-a88763a9bb3f',
}

export async function POST(request: NextRequest) {
  const auth = await resolveAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    workflow?: {
      name: string
      slug: string
      description?: string
      trigger_event: string
      trigger_conditions?: Record<string, unknown>
      steps: Array<{ step: number; service: string; action: string; description: string }>
      services?: string[]
    }
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const wf = body.workflow
  if (!wf?.name || !wf?.slug || !wf?.trigger_event || !wf?.steps?.length) {
    return NextResponse.json({ error: 'Missing required workflow fields (name, slug, trigger_event, steps)' }, { status: 400 })
  }

  const admin = getAdmin()

  // Get user's location
  const { data: account } = await admin
    .from('user_crm_accounts')
    .select('location_id')
    .eq('user_id', auth.userId)
    .maybeSingle()

  const locationId = account?.location_id ||
    (wf.trigger_conditions as Record<string, unknown>)?.location_id as string ||
    ((wf.trigger_conditions as Record<string, unknown>)?.locations as string[])?.[0]

  // Ensure location is in trigger conditions
  const conditions = wf.trigger_conditions || {}
  if (locationId && !conditions.locations) {
    (conditions as Record<string, unknown>).locations = [locationId]
  }

  // Derive services from steps if not provided
  const services = wf.services || [...new Set(wf.steps.map(s => s.service))]

  // Save to database
  const { data: deployed, error } = await admin
    .from('crm_agent_workflows')
    .upsert({
      name: wf.name,
      slug: wf.slug,
      description: wf.description || `Auto-generated workflow: ${wf.name}`,
      status: 'active',
      trigger_event: wf.trigger_event,
      trigger_conditions: conditions,
      steps: wf.steps,
      services,
      ai_model: 'claude-opus-4-6',
      created_by: auth.userId,
    }, { onConflict: 'slug' })
    .select('id, slug')
    .single()

  if (error) {
    return NextResponse.json({ error: `Deploy failed: ${error.message}` }, { status: 500 })
  }

  // Auto-register webhook for this location if we have a PIT
  let webhookRegistered = false
  if (locationId && LOCATION_PITS[locationId]) {
    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/api/webhooks/crm`
      const pit = LOCATION_PITS[locationId]

      // Check if already registered
      const listRes = await fetch(`${CRM_API}/webhooks/?locationId=${locationId}`, {
        headers: { 'Authorization': `Bearer ${pit}`, 'Version': '2021-07-28' },
        signal: AbortSignal.timeout(8000),
      })

      if (listRes.ok) {
        const listData = await listRes.json()
        const existing = (listData.webhooks || []).find((w: { url: string }) => w.url === webhookUrl)

        if (!existing) {
          await fetch(`${CRM_API}/webhooks/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${pit}`, 'Version': '2021-07-28', 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: webhookUrl, locationId }),
            signal: AbortSignal.timeout(8000),
          })
        }
        webhookRegistered = true
      }
    } catch {
      // Non-fatal — workflow is saved, webhook can be registered later
    }
  }

  return NextResponse.json({
    success: true,
    workflowId: deployed?.id,
    slug: deployed?.slug,
    locationId,
    webhookRegistered,
    message: `Workflow "${wf.name}" deployed successfully${webhookRegistered ? ' with webhook connected' : ''}`,
  })
}
