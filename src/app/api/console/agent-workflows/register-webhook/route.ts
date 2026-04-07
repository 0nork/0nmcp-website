/**
 * POST /api/console/agent-workflows/register-webhook
 *
 * Registers the 0nMCP webhook runner URL with a CRM sub-location.
 * Body: { locationId, pitToken? }
 *
 * Uses the Spa PIT or agency PIT from env vars if not provided.
 */

import { NextRequest, NextResponse } from 'next/server'
import { resolveAuth } from '@/lib/token-auth'

const CRM_API = 'https://services.leadconnectorhq.com'
const WEBHOOK_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/crm`
  : 'https://0nmcp.com/api/webhooks/crm'

// Known PIT tokens by location
const LOCATION_PITS: Record<string, string> = {
  'F76MNKOMQCMruMrumtdf': process.env.CRM_SPA_PIT || 'pit-bafea751-0228-4db1-a9f7-3d426b33713c',
  'nphConTwfHcVE1oA0uep': process.env.CRM_PIT || 'pit-0317b406-8a47-478e-ac28-a88763a9bb3f',
}

const WEBHOOK_EVENTS = [
  'ContactCreate',
  'ContactDelete',
  'ContactDndUpdate',
  'ContactTagUpdate',
  'AppointmentCreate',
  'AppointmentUpdate',
  'AppointmentDelete',
  'InboundMessage',
  'OutboundMessage',
  'NoteCreate',
  'TaskCreate',
  'OpportunityCreate',
  'OpportunityUpdate',
  'OpportunityStageUpdate',
  'CampaignStatusUpdate',
]

export async function POST(request: NextRequest) {
  const auth = await resolveAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { locationId?: string; pitToken?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const locationId = body.locationId
  if (!locationId) return NextResponse.json({ error: 'locationId required' }, { status: 400 })

  const pit = body.pitToken || LOCATION_PITS[locationId] || process.env.CRM_AGENCY_PIT
  if (!pit) return NextResponse.json({ error: 'No PIT token available for this location' }, { status: 400 })

  const headers = {
    'Authorization': `Bearer ${pit}`,
    'Version': '2021-07-28',
    'Content-Type': 'application/json',
  }

  // First check existing webhooks
  let existingWebhooks: Array<{ id: string; url: string }> = []
  try {
    const listRes = await fetch(`${CRM_API}/webhooks/?locationId=${locationId}`, {
      headers,
      signal: AbortSignal.timeout(10000),
    })
    if (listRes.ok) {
      const listData = await listRes.json()
      existingWebhooks = listData.webhooks || []
    }
  } catch { /* ignore */ }

  // Check if already registered
  const alreadyRegistered = existingWebhooks.find(w => w.url === WEBHOOK_URL)
  if (alreadyRegistered) {
    return NextResponse.json({
      success: true,
      message: 'Webhook already registered',
      webhookId: alreadyRegistered.id,
      url: WEBHOOK_URL,
      alreadyExisted: true,
    })
  }

  // Register new webhook
  try {
    const res = await fetch(`${CRM_API}/webhooks/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        url: WEBHOOK_URL,
        locationId,
        events: WEBHOOK_EVENTS,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `CRM API ${res.status}: ${err}` }, { status: 502 })
    }

    const data = await res.json()

    return NextResponse.json({
      success: true,
      message: 'Webhook registered successfully',
      webhookId: data.id || data.webhookId,
      url: WEBHOOK_URL,
      events: WEBHOOK_EVENTS.length,
      alreadyExisted: false,
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
