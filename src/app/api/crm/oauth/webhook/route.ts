// app/api/crm/oauth/webhook/route.ts
// Add0n — install lifecycle webhook receiver.
// Register in CRM Developer Portal → My Apps → Webhooks.
// URL: https://marketplace.rocketclients.com/api/crm/oauth/webhook
//
// Events: INSTALL | UNINSTALL | SUBSCRIPTION_PAUSED | SUBSCRIPTION_RESUMED

import { NextRequest, NextResponse }              from 'next/server'
import { deactivateToken, reactivateToken }       from '@/lib/crm/token-store'
import { createClient }                           from '@supabase/supabase-js'
import crypto                                     from 'crypto'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

interface CRMWebhookPayload {
  type:       'INSTALL' | 'UNINSTALL' | 'SUBSCRIPTION_PAUSED' | 'SUBSCRIPTION_RESUMED'
  appId:      string
  locationId: string
  companyId?: string
  userId?:    string
  planId?:    string
  timestamp?: number
}

// ── HMAC-SHA256 signature verification ───────────────────────────────────────
// Header: x-ghl-signature  (CRM platform sends this — header name is fixed)

function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.CRM_WEBHOOK_SIGNING_SECRET
  if (!secret) {
    console.warn('[crm/webhook] CRM_WEBHOOK_SIGNING_SECRET not set')
    return true // dev only — always set in production
  }
  if (!header) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(header, 'hex'), Buffer.from(expected, 'hex'))
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()

  if (!verifySignature(rawBody, req.headers.get('x-ghl-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: CRMWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, locationId, companyId, userId, appId } = payload

  if (appId && appId !== process.env.CRM_APP_ID) {
    return NextResponse.json({ error: 'Unknown appId' }, { status: 400 })
  }

  switch (type) {

    case 'INSTALL': {
      // OAuth callback stores the actual token.
      // This event is logged as an audit record — idempotent.
      await db().from('crm_install_events').insert({
        location_id: locationId,
        company_id:  companyId ?? '',
        event_type:  'install',
        payload:     { appId, userId, planId: payload.planId },
      })
      console.log(`[crm/webhook] INSTALL location=${locationId}`)
      break
    }

    case 'UNINSTALL': {
      await deactivateToken(locationId)
      console.log(`[crm/webhook] UNINSTALL location=${locationId}`)
      break
    }

    case 'SUBSCRIPTION_PAUSED': {
      await deactivateToken(locationId)
      console.log(`[crm/webhook] SUBSCRIPTION_PAUSED location=${locationId}`)
      break
    }

    case 'SUBSCRIPTION_RESUMED': {
      await reactivateToken(locationId)
      console.log(`[crm/webhook] SUBSCRIPTION_RESUMED location=${locationId}`)
      break
    }

    default: {
      console.warn(`[crm/webhook] Unhandled event type: ${type}`)
    }
  }

  return NextResponse.json({ received: true })
}

// ─── Required env vars ────────────────────────────────────────────────────────
// CRM_WEBHOOK_SIGNING_SECRET  — CRM Developer Portal → My Apps → Webhooks
// CRM_APP_ID                  — CRM Developer Portal (visible in app URL)
// NEXT_PUBLIC_SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY
