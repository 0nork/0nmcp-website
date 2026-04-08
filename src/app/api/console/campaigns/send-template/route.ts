/**
 * POST /api/console/campaigns/send-template
 *
 * Pushes an HTML email template to a CRM sub-location and optionally
 * sends it to a single contact (for testing) or saves it for campaign use.
 *
 * DOUBLE CONFIRMATION REQUIRED for actual sends.
 * This endpoint only creates the template in CRM and returns the template ID.
 * Actual campaign sends go through the campaign runner with approval flow.
 *
 * Body: {
 *   locationId: string,
 *   name: string,
 *   subject: string,
 *   preheader?: string,
 *   html: string,
 *   testContactId?: string (if provided, sends a test email to this contact)
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { resolveAuth } from '@/lib/token-auth'

const CRM_API = 'https://services.leadconnectorhq.com'

const LOCATION_PITS: Record<string, string> = {
  'F76MNKOMQCMruMrumtdf': process.env.CRM_SPA_PIT || 'pit-bafea751-0228-4db1-a9f7-3d426b33713c',
  'nphConTwfHcVE1oA0uep': process.env.CRM_PIT || 'pit-0317b406-8a47-478e-ac28-a88763a9bb3f',
}

export async function POST(request: NextRequest) {
  const auth = await resolveAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { locationId, name, subject, preheader, html, testContactId } = body

  if (!locationId || !name || !html) {
    return NextResponse.json({ error: 'locationId, name, and html required' }, { status: 400 })
  }

  const pit = LOCATION_PITS[locationId] || process.env.CRM_AGENCY_PIT
  if (!pit) return NextResponse.json({ error: 'No PIT token for this location' }, { status: 400 })

  const headers = {
    'Authorization': `Bearer ${pit}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json',
  }

  // Step 1: Save template to CRM
  let templateId: string | null = null
  try {
    const templateRes = await fetch(`${CRM_API}/emails/builder`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        locationId,
        name,
        subject: subject || name,
        preheader: preheader || '',
        html,
        type: 'html',
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (templateRes.ok) {
      const templateData = await templateRes.json()
      templateId = templateData.id
    } else {
      const err = await templateRes.text()
      return NextResponse.json({ error: `CRM template creation failed: ${err}` }, { status: 502 })
    }
  } catch (err) {
    return NextResponse.json({ error: `CRM API error: ${(err as Error).message}` }, { status: 500 })
  }

  // Step 2: If test contact provided, send a test email via conversations API
  let testSent = false
  if (testContactId && templateId) {
    try {
      const sendRes = await fetch(`${CRM_API}/conversations/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'Email',
          contactId: testContactId,
          subject: subject || name,
          html,
          emailFrom: `The Spa in Ligonier <spaligonier@gmail.com>`,
        }),
        signal: AbortSignal.timeout(15000),
      })

      testSent = sendRes.ok
      if (!sendRes.ok) {
        const err = await sendRes.text()
        console.warn(`[campaigns] Test send failed: ${err}`)
      }
    } catch {
      // Non-fatal — template still saved
    }
  }

  return NextResponse.json({
    success: true,
    templateId,
    templateName: name,
    locationId,
    testSent,
    message: testContactId
      ? `Template saved (${templateId})${testSent ? ' and test email sent' : ' but test send failed'}`
      : `Template saved to CRM (${templateId}). Use campaign builder to schedule sends.`,
  })
}
