// app/api/crm-agent/trigger/route.ts
// Add0n — CRM AI Agent trigger dispatch
// Combines all trigger modes (form, project button, pipeline webhook) into one endpoint.
// Uses per-location OAuth tokens from crm_tokens (Supabase) — no static API key per client.
//
// Auth:
//   Bearer <WEB0N_INTERNAL_API_KEY>  — dashboard / project buttons
//   x-webhook-secret                 — CRM automation webhook triggers

import { NextRequest, NextResponse } from 'next/server'
import { getToken }                  from '@/lib/crm/token-store'

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE    = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'
const BUILD_PAGES = ['Home', 'Services', 'About', 'Booking', 'Contact']

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgentPayload {
  // Business info (direct mode)
  businessName?: string
  email?:        string
  phone?:        string
  address?:      string
  city?:         string
  state?:        string
  zip?:          string
  website?:      string
  brandColor?:   string
  // Routing
  locationId?:   string
  contactId?:    string
  projectId?:    string
  // Dispatch — determines which agent action to invoke
  action?:       'build_website' | 'build_funnel' | 'build_workflow' | 'build_pipeline' | 'deploy_snapshot'
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const bearer = req.headers.get('authorization')
  if (bearer === `Bearer ${process.env.WEB0N_INTERNAL_API_KEY}`) return true
  const secret = req.headers.get('x-webhook-secret')
  if (secret && secret === process.env.WEB0N_WEBHOOK_SECRET) return true
  return false
}

// ─── Token resolution ─────────────────────────────────────────────────────────

/**
 * Resolve a live access token for the target location.
 * Priority: per-location OAuth token (crm_tokens) → CRM_API_KEY env var fallback.
 * Auto-refreshes tokens expiring within 5 minutes.
 */
async function resolveToken(locationId: string): Promise<string> {
  const record = await getToken(locationId)
  if (record?.access_token) return record.access_token

  const fallback = process.env.CRM_API_KEY
  if (fallback) {
    console.warn(`[crm-agent/trigger] No OAuth token for ${locationId} — using CRM_API_KEY fallback`)
    return fallback
  }

  throw new Error(
    `No active token for location ${locationId}. ` +
    `Install Add0n at marketplace.rocketclients.com/api/crm/oauth/install`
  )
}

// ─── API helpers ──────────────────────────────────────────────────────────────

function apiHeaders(token: string) {
  return {
    Authorization:  `Bearer ${token}`,
    Version:        API_VERSION,
    'Content-Type': 'application/json',
  }
}

async function upsertContact(
  locationId: string,
  payload:    AgentPayload,
  token:      string
): Promise<string> {
  if (payload.contactId) return payload.contactId

  if (payload.email) {
    const res  = await fetch(
      `${API_BASE}/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(payload.email)}`,
      { headers: apiHeaders(token) }
    )
    const data = await res.json()
    if (data?.contact?.id) return data.contact.id
  }

  const res  = await fetch(`${API_BASE}/contacts/`, {
    method:  'POST',
    headers: apiHeaders(token),
    body:    JSON.stringify({
      locationId,
      name:         payload.businessName,
      email:        payload.email,
      phone:        payload.phone,
      address1:     payload.address,
      city:         payload.city,
      state:        payload.state,
      postalCode:   payload.zip,
      website:      payload.website,
      tags:         ['add0n-client', 'build-queued'],
      customFields: [{ key: 'brand_color', value: payload.brandColor ?? '#6EE05A' }],
    }),
  })
  const data = await res.json()
  if (!data?.contact?.id) throw new Error(`Contact upsert failed: ${JSON.stringify(data)}`)
  return data.contact.id
}

async function openConversation(
  locationId: string,
  contactId:  string,
  token:      string
): Promise<string> {
  const res  = await fetch(`${API_BASE}/conversations/`, {
    method:  'POST',
    headers: apiHeaders(token),
    body:    JSON.stringify({ locationId, contactId }),
  })
  const data = await res.json()
  if (!data?.conversation?.id) throw new Error(`Conversation create failed: ${JSON.stringify(data)}`)
  return data.conversation.id
}

async function sendAgentCommand(
  conversationId: string,
  agentId:        string,
  payload:        AgentPayload & { locationId: string; contactId: string },
  token:          string
): Promise<void> {
  const command = {
    action:    payload.action ?? 'build_website',
    version:   '1.0',
    source:    payload.projectId ? 'project_lookup' : 'direct',
    timestamp: new Date().toISOString(),
    pages:     BUILD_PAGES,
    payload,
  }

  const res = await fetch(`${API_BASE}/conversations/messages`, {
    method:  'POST',
    headers: apiHeaders(token),
    body:    JSON.stringify({
      type:                   'TYPE_LIVE_CHAT',
      conversationId,
      message:                JSON.stringify(command),
      conversationProviderId: agentId,
    }),
  })

  if (!res.ok) {
    throw new Error(`Agent command send failed HTTP ${res.status}: ${await res.text()}`)
  }
}

// ─── Project lookup ───────────────────────────────────────────────────────────

async function resolveProject(projectId: string): Promise<Partial<AgentPayload>> {
  const { createClient } = await import('@supabase/supabase-js')
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data } = await db
    .from('web0n_projects')
    .select('business_name,email,phone,address,city,state,zip,website,brand_color,crm_location_id,crm_contact_id')
    .eq('id', projectId)
    .single()

  if (!data) return {}

  return {
    businessName: data.business_name,
    email:        data.email,
    phone:        data.phone,
    address:      data.address,
    city:         data.city,
    state:        data.state,
    zip:          data.zip,
    website:      data.website,
    brandColor:   data.brand_color,
    locationId:   data.crm_location_id,
    contactId:    data.crm_contact_id,
  }
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let payload: AgentPayload = await req.json()

    // Project lookup mode — resolve fields from Supabase
    if (payload.projectId && !payload.businessName) {
      const project = await resolveProject(payload.projectId)
      payload = { ...project, ...payload }
    }

    const locationId = payload.locationId ?? process.env.CRM_LOCATION_ID
    if (!locationId) {
      return NextResponse.json(
        { error: 'locationId required — pass in payload or set CRM_LOCATION_ID env var' },
        { status: 400 }
      )
    }

    const agentId = process.env.CRM_WEBSITE_BUILDER_AGENT_ID
    if (!agentId) {
      return NextResponse.json({ error: 'CRM_WEBSITE_BUILDER_AGENT_ID not configured' }, { status: 500 })
    }

    // Resolve per-location token (OAuth or fallback)
    const accessToken = await resolveToken(locationId)

    // 3-step dispatch
    const contactId      = await upsertContact(locationId, payload, accessToken)
    const conversationId = await openConversation(locationId, contactId, accessToken)
    await sendAgentCommand(conversationId, agentId, { ...payload, locationId, contactId }, accessToken)

    return NextResponse.json({
      success:        true,
      conversationId,
      contactId,
      locationId,
      agentId,
      action:         payload.action ?? 'build_website',
      source:         payload.projectId ? 'project_lookup' : 'direct',
      token_source:   payload.locationId ? 'oauth' : 'fallback',
      message:        'Add0n build triggered — agent is processing',
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    console.error('[crm-agent/trigger]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint:        'POST /api/crm-agent/trigger',
    version:         '2.0',
    app:             'Add0n — Rocket+CRM powered by 0nMCP',
    token_strategy:  'per-location OAuth (crm_tokens) with CRM_API_KEY fallback',
    install_url:     'https://marketplace.rocketclients.com/api/crm/oauth/install',
    auth: {
      internal: 'Authorization: Bearer <WEB0N_INTERNAL_API_KEY>',
      webhook:  'x-webhook-secret: <WEB0N_WEBHOOK_SECRET>',
    },
    supported_actions: [
      'build_website',   // live
      'build_funnel',    // next
      'build_workflow',  // next
      'build_pipeline',  // next
      'deploy_snapshot', // next
    ],
    crm_webhook_body: {
      businessName: '{{contact.company_name}}',
      locationId:   '{{location.id}}',
      contactId:    '{{contact.id}}',
      email:        '{{contact.email}}',
      phone:        '{{contact.phone}}',
      address:      '{{contact.address1}}',
      city:         '{{contact.city}}',
      state:        '{{contact.state}}',
      zip:          '{{contact.postal_code}}',
      website:      '{{contact.website}}',
      brandColor:   '#6EE05A',
      action:       'build_website',
    },
  })
}

// ─── Required env vars ────────────────────────────────────────────────────────
// WEB0N_INTERNAL_API_KEY        — bearer token for dashboard calls
// WEB0N_WEBHOOK_SECRET          — shared secret for CRM automation webhook
// CRM_LOCATION_ID               — default sub-location (own 0n location)
// CRM_API_KEY                   — fallback private integration token
// CRM_WEBSITE_BUILDER_AGENT_ID  — Agent Studio ID (from agent URL)
// CRM_TOKEN_ENCRYPTION_KEY      — openssl rand -hex 32
// NEXT_PUBLIC_SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY
