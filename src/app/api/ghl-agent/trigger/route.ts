/**
 * CRM Agent Studio — Build Trigger Dispatch
 *
 * POST /api/ghl-agent/trigger
 *   Accepts client data (direct or project_lookup), resolves/creates CRM contact,
 *   opens a conversation, and sends a structured build command to the CRM AI Agent.
 *
 * Auth: Bearer WEB0N_INTERNAL_API_KEY (dashboard) or x-webhook-secret (CRM webhook)
 *
 * Env: CRM_LOCATION_ID, CRM_API_KEY, CRM_WEBSITE_BUILDER_AGENT_ID,
 *       WEB0N_WEBHOOK_SECRET, WEB0N_INTERNAL_API_KEY
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const CRM_BASE = 'https://services.leadconnectorhq.com'
const CRM_V = '2021-07-28'
const BUILD_PAGES = ['Home', 'Services', 'About', 'Booking', 'Contact']

// ── Types ──

interface BuildPayload {
  businessName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  website?: string
  brandColor?: string
  projectId?: string
  locationId?: string
  contactId?: string
}

interface TriggerResponse {
  success: boolean
  conversationId: string
  contactId: string
  locationId: string
  agentId: string
  source: 'direct' | 'project_lookup'
  message: string
}

// ── Helpers ──

function crmHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Version: CRM_V,
    'Content-Type': 'application/json',
  }
}

/** Resolve project from Supabase if only projectId provided */
async function resolveProject(projectId: string): Promise<Partial<BuildPayload>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { projectId }

  const supabase = createClient(url, key)
  const { data } = await supabase
    .from('web0n_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!data) return { projectId }

  return {
    projectId,
    businessName: data.business_name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    website: data.website_url,
    brandColor: data.brand_colors?.primary,
    contactId: data.crm_contact_id || undefined,
    locationId: data.crm_location_id || undefined,
  }
}

/** Find existing CRM contact by email or create new one */
async function upsertContact(
  locationId: string,
  payload: BuildPayload,
  token: string
): Promise<string> {
  if (payload.email) {
    const res = await fetch(
      `${CRM_BASE}/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(payload.email)}`,
      { headers: crmHeaders(token) }
    )
    const data = await res.json()
    if (data?.contact?.id) return data.contact.id
  }

  const res = await fetch(`${CRM_BASE}/contacts/`, {
    method: 'POST',
    headers: crmHeaders(token),
    body: JSON.stringify({
      locationId,
      name: payload.businessName,
      email: payload.email,
      phone: payload.phone,
      address1: payload.address,
      city: payload.city,
      state: payload.state,
      postalCode: payload.zip,
      website: payload.website,
      tags: ['web0n-client', 'build-site'],
      customFields: [
        { key: 'brand_color', value: payload.brandColor ?? '#7ed957' },
      ],
    }),
  })
  const data = await res.json()

  if (!data?.contact?.id) {
    throw new Error(`CRM contact create failed: ${JSON.stringify(data).slice(0, 200)}`)
  }
  return data.contact.id
}

/** Open a CRM conversation for the contact */
async function openConversation(
  locationId: string,
  contactId: string,
  token: string
): Promise<string> {
  const res = await fetch(`${CRM_BASE}/conversations/`, {
    method: 'POST',
    headers: crmHeaders(token),
    body: JSON.stringify({ locationId, contactId }),
  })
  const data = await res.json()
  const id = data?.conversation?.id

  if (!id) throw new Error(`CRM conversation create failed: ${JSON.stringify(data).slice(0, 200)}`)
  return id
}

/** Send structured build command message into the conversation */
async function sendBuildMessage(
  conversationId: string,
  agentId: string,
  payload: BuildPayload,
  token: string
): Promise<void> {
  const command = {
    action: 'build_website',
    version: '1.0',
    source: payload.projectId ? 'project_lookup' : 'direct',
    timestamp: new Date().toISOString(),
    pages: BUILD_PAGES,
    payload,
  }

  const res = await fetch(`${CRM_BASE}/conversations/messages`, {
    method: 'POST',
    headers: crmHeaders(token),
    body: JSON.stringify({
      type: 'TYPE_LIVE_CHAT',
      conversationId,
      message: JSON.stringify(command),
      conversationProviderId: agentId,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`CRM message send failed: ${err}`)
  }
}

// ── Auth ──

function authResult(req: NextRequest): { ok: boolean; mode: 'internal' | 'webhook' | null } {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    if (token === process.env.WEB0N_INTERNAL_API_KEY) {
      return { ok: true, mode: 'internal' }
    }
  }

  const webhookSecret = req.headers.get('x-webhook-secret')
  if (webhookSecret && webhookSecret === process.env.WEB0N_WEBHOOK_SECRET) {
    return { ok: true, mode: 'webhook' }
  }

  // Also allow authenticated Supabase users (console dashboard)
  // Checked via cookie-based auth in the SiteBuilderView
  const cookie = req.cookies.get('sb-access-token')?.value
    || req.headers.get('cookie')?.includes('sb-')
  if (cookie) {
    return { ok: true, mode: 'internal' }
  }

  return { ok: false, mode: null }
}

// ── Route handlers ──

export async function POST(req: NextRequest): Promise<NextResponse<TriggerResponse | { error: string }>> {
  const auth = authResult(req)
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let payload: BuildPayload = await req.json()

    // Resolve project lookup mode
    if (payload.projectId && !payload.businessName) {
      const project = await resolveProject(payload.projectId)
      payload = { ...project, ...payload }
    }

    const locationId = payload.locationId ?? process.env.CRM_LOCATION_ID!
    const token = process.env.CRM_API_KEY!
    const agentId = process.env.CRM_WEBSITE_BUILDER_AGENT_ID!

    if (!token || !agentId) {
      return NextResponse.json(
        { error: 'CRM_API_KEY and CRM_WEBSITE_BUILDER_AGENT_ID must be configured' },
        { status: 500 }
      )
    }

    // Step 1 — resolve or create contact
    const contactId = payload.contactId ?? await upsertContact(locationId, payload, token)

    // Step 2 — open conversation
    const conversationId = await openConversation(locationId, contactId, token)

    // Step 3 — send build command to agent
    await sendBuildMessage(conversationId, agentId, { ...payload, locationId, contactId }, token)

    return NextResponse.json({
      success: true,
      conversationId,
      contactId,
      locationId,
      agentId,
      source: payload.projectId ? 'project_lookup' : 'direct',
      message: 'Build triggered — CRM AI agent is processing',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    console.error('[ghl-agent/trigger]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/** Setup/docs endpoint */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    endpoint: 'POST /api/ghl-agent/trigger',
    auth: {
      internal: 'Authorization: Bearer <WEB0N_INTERNAL_API_KEY>',
      webhook: 'x-webhook-secret: <WEB0N_WEBHOOK_SECRET>',
      session: 'Supabase session cookie (console users)',
    },
    modes: {
      direct: {
        description: 'Dashboard form — pass client fields directly',
        required: ['businessName', 'email'],
        optional: ['phone', 'address', 'city', 'state', 'zip', 'website', 'brandColor', 'locationId', 'contactId'],
      },
      project_lookup: {
        description: 'Pipeline stage hook — resolve from Supabase web0n_projects',
        required: ['projectId'],
      },
    },
  })
}
