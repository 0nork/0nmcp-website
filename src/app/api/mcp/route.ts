/* ═══════════════════════════════════════════════════════════════
   0nMCP — HTTP Streamable MCP Server Endpoint

   Serves as a standard MCP server that CRM Agent Studio, Cursor,
   Windsurf, or any MCP client can connect to.

   Also supports legacy console proxy format for backwards compat.

   CRM Agent Studio Config:
     Server URL: https://0nmcp.com/api/mcp
     Server Label: 0nMCP
     Headers:
       Authorization: Bearer {pit_token}
       locationId: {location_id}
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server'
import { resolveCrmAuth } from '@/lib/crm/resolve-mcp-auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CRM_BASE = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

// ─── MCP Tool Definitions ───────────────────────────────────────────────────

const MCP_TOOLS = [
  { name: 'search_contacts', description: 'Search CRM contacts by name, email, or phone', inputSchema: { type: 'object' as const, properties: { query: { type: 'string' }, limit: { type: 'number' } } } },
  { name: 'create_contact', description: 'Create a new CRM contact', inputSchema: { type: 'object' as const, properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } } }, required: ['email'] } },
  { name: 'get_contact', description: 'Get a CRM contact by ID', inputSchema: { type: 'object' as const, properties: { contactId: { type: 'string' } }, required: ['contactId'] } },
  { name: 'update_contact', description: 'Update a CRM contact', inputSchema: { type: 'object' as const, properties: { contactId: { type: 'string' }, firstName: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' } }, required: ['contactId'] } },
  { name: 'add_contact_tags', description: 'Add tags to a CRM contact', inputSchema: { type: 'object' as const, properties: { contactId: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } } }, required: ['contactId', 'tags'] } },
  { name: 'add_contact_note', description: 'Add a note to a CRM contact', inputSchema: { type: 'object' as const, properties: { contactId: { type: 'string' }, body: { type: 'string' } }, required: ['contactId', 'body'] } },
  { name: 'search_conversations', description: 'Search CRM conversations', inputSchema: { type: 'object' as const, properties: { contactId: { type: 'string' }, limit: { type: 'number' } } } },
  { name: 'send_message', description: 'Send a message (Email, SMS, WhatsApp)', inputSchema: { type: 'object' as const, properties: { contactId: { type: 'string' }, type: { type: 'string', enum: ['Email', 'SMS', 'WhatsApp'] }, message: { type: 'string' }, subject: { type: 'string' } }, required: ['contactId', 'type', 'message'] } },
  { name: 'get_pipelines', description: 'List all CRM pipelines and stages', inputSchema: { type: 'object' as const, properties: {} } },
  { name: 'search_opportunities', description: 'Search CRM opportunities/deals', inputSchema: { type: 'object' as const, properties: { pipelineId: { type: 'string' }, query: { type: 'string' } } } },
  { name: 'create_opportunity', description: 'Create a new opportunity/deal', inputSchema: { type: 'object' as const, properties: { name: { type: 'string' }, pipelineId: { type: 'string' }, stageId: { type: 'string' }, contactId: { type: 'string' }, monetaryValue: { type: 'number' } }, required: ['name', 'pipelineId', 'stageId'] } },
  { name: 'get_calendars', description: 'List all CRM calendars', inputSchema: { type: 'object' as const, properties: {} } },
  { name: 'get_appointments', description: 'Get appointments in a date range', inputSchema: { type: 'object' as const, properties: { startTime: { type: 'string' }, endTime: { type: 'string' }, calendarId: { type: 'string' } } } },
  { name: 'send_email', description: 'Send an email to a contact', inputSchema: { type: 'object' as const, properties: { contactId: { type: 'string' }, subject: { type: 'string' }, htmlBody: { type: 'string' } }, required: ['contactId', 'subject', 'htmlBody'] } },
  { name: 'get_location', description: 'Get CRM location details', inputSchema: { type: 'object' as const, properties: {} } },
  { name: 'get_custom_fields', description: 'List all custom fields', inputSchema: { type: 'object' as const, properties: {} } },
  { name: 'verify_service', description: 'Verify an API key against a service (stripe, github, sendgrid, openai, anthropic, slack, notion, airtable, resend, hubspot, vercel) and return an account summary + a .0n connection descriptor', inputSchema: { type: 'object' as const, properties: { service: { type: 'string' }, apiKey: { type: 'string' } }, required: ['service', 'apiKey'] } },
]

// ─── CRM API caller ─────────────────────────────────────────────────────────

async function crmFetch(path: string, token: string, locationId: string, opts?: { method?: string; body?: unknown }) {
  const url = `${CRM_BASE}${path}`
  const sep = url.includes('?') ? '&' : '?'
  const fullUrl = `${url}${sep}locationId=${locationId}`

  const res = await fetch(fullUrl, {
    method: opts?.method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': CRM_VERSION,
      'Content-Type': 'application/json',
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
    signal: AbortSignal.timeout(15000),
  })

  return res.json()
}

// ─── Tool executor ──────────────────────────────────────────────────────────

async function executeTool(name: string, args: Record<string, unknown>, token: string, locationId: string) {
  switch (name) {
    case 'search_contacts':
      return crmFetch(`/contacts/?query=${encodeURIComponent(String(args.query || ''))}&limit=${args.limit || 20}`, token, locationId)
    case 'create_contact':
      return crmFetch('/contacts/', token, locationId, { method: 'POST', body: args })
    case 'get_contact':
      return crmFetch(`/contacts/${args.contactId}`, token, locationId)
    case 'update_contact': {
      const { contactId, ...rest } = args
      return crmFetch(`/contacts/${contactId}`, token, locationId, { method: 'PUT', body: rest })
    }
    case 'add_contact_tags':
      return crmFetch(`/contacts/${args.contactId}/tags`, token, locationId, { method: 'POST', body: { tags: args.tags } })
    case 'add_contact_note':
      return crmFetch(`/contacts/${args.contactId}/notes`, token, locationId, { method: 'POST', body: { body: args.body } })
    case 'search_conversations':
      return crmFetch(`/conversations/search?contactId=${args.contactId || ''}&limit=${args.limit || 20}`, token, locationId)
    case 'send_message':
      return crmFetch('/conversations/messages', token, locationId, { method: 'POST', body: { type: args.type, contactId: args.contactId, message: args.message, subject: args.subject } })
    case 'get_pipelines':
      return crmFetch('/opportunities/pipelines', token, locationId)
    case 'search_opportunities':
      return crmFetch(`/opportunities/search?pipelineId=${args.pipelineId || ''}&q=${encodeURIComponent(String(args.query || ''))}`, token, locationId)
    case 'create_opportunity':
      return crmFetch('/opportunities/', token, locationId, { method: 'POST', body: args })
    case 'get_calendars':
      return crmFetch('/calendars/', token, locationId)
    case 'get_appointments': {
      const start = args.startTime || new Date().toISOString()
      const end = args.endTime || new Date(Date.now() + 30 * 86400000).toISOString()
      return crmFetch(`/calendars/events?startTime=${start}&endTime=${end}${args.calendarId ? `&calendarId=${args.calendarId}` : ''}`, token, locationId)
    }
    case 'send_email':
      return crmFetch('/conversations/messages', token, locationId, { method: 'POST', body: { type: 'Email', contactId: args.contactId, subject: args.subject, html: args.htmlBody } })
    case 'get_location':
      return crmFetch(`/locations/${locationId}`, token, locationId)
    case 'get_custom_fields':
      return crmFetch(`/locations/${locationId}/customFields`, token, locationId)
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

// ─── Path 2: verify a pasted API key against the real service API ───────────
// Lets 0nVault (and any client) confirm a credential is live + describe the
// account before it's sealed into a hand-off. Uses the PASSED key, not CRM auth.
type VerifyEntry = { label: string; url: string; headers: (k: string) => Record<string, string>; pick: (d: any, status: number) => Record<string, unknown> }

const VERIFY_MAP: Record<string, VerifyEntry> = {
  stripe:    { label: 'Stripe',     url: 'https://api.stripe.com/v1/account',                 headers: (k) => ({ Authorization: `Bearer ${k}` }), pick: (d) => ({ account: d.id, name: d.business_profile?.name, country: d.country, email: d.email }) },
  github:    { label: 'GitHub',     url: 'https://api.github.com/user',                       headers: (k) => ({ Authorization: `Bearer ${k}`, 'User-Agent': '0nVault' }), pick: (d) => ({ login: d.login, name: d.name, repos: d.public_repos }) },
  sendgrid:  { label: 'SendGrid',   url: 'https://api.sendgrid.com/v3/scopes',                headers: (k) => ({ Authorization: `Bearer ${k}` }), pick: (d) => ({ scopes: Array.isArray(d.scopes) ? d.scopes.length : undefined }) },
  openai:    { label: 'OpenAI',     url: 'https://api.openai.com/v1/models',                  headers: (k) => ({ Authorization: `Bearer ${k}` }), pick: (d) => ({ models: Array.isArray(d.data) ? d.data.length : undefined }) },
  anthropic: { label: 'Anthropic',  url: 'https://api.anthropic.com/v1/models',               headers: (k) => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01' }), pick: (d) => ({ models: Array.isArray(d.data) ? d.data.length : undefined }) },
  slack:     { label: 'Slack',      url: 'https://slack.com/api/auth.test',                   headers: (k) => ({ Authorization: `Bearer ${k}` }), pick: (d) => ({ team: d.team, user: d.user, ok: d.ok }) },
  notion:    { label: 'Notion',     url: 'https://api.notion.com/v1/users/me',                headers: (k) => ({ Authorization: `Bearer ${k}`, 'Notion-Version': '2022-06-28' }), pick: (d) => ({ name: d.name, type: d.type, bot: d.bot?.workspace_name }) },
  airtable:  { label: 'Airtable',   url: 'https://api.airtable.com/v0/meta/whoami',           headers: (k) => ({ Authorization: `Bearer ${k}` }), pick: (d) => ({ user: d.id, email: d.email }) },
  resend:    { label: 'Resend',     url: 'https://api.resend.com/domains',                    headers: (k) => ({ Authorization: `Bearer ${k}` }), pick: (d) => ({ domains: Array.isArray(d.data) ? d.data.length : undefined }) },
  hubspot:   { label: 'HubSpot',    url: 'https://api.hubapi.com/account-info/v3/details',    headers: (k) => ({ Authorization: `Bearer ${k}` }), pick: (d) => ({ portalId: d.portalId, currency: d.companyCurrency }) },
  vercel:    { label: 'Vercel',     url: 'https://api.vercel.com/v2/user',                    headers: (k) => ({ Authorization: `Bearer ${k}` }), pick: (d) => ({ user: d.user?.username, email: d.user?.email }) },
}

async function verifyService(args: Record<string, unknown>) {
  const service = String(args.service || '').toLowerCase().trim()
  const apiKey = String(args.apiKey || args.api_key || '')
  const entry = VERIFY_MAP[service]
  if (!entry) return { ok: false, error: `unsupported service '${service}'`, supported: Object.keys(VERIFY_MAP) }
  if (!apiKey) return { ok: false, error: 'apiKey required' }
  try {
    const res = await fetch(entry.url, { headers: entry.headers(apiKey), signal: AbortSignal.timeout(12000) })
    const data = await res.json().catch(() => ({}))
    const live = res.ok && data?.ok !== false
    return {
      ok: live, service, label: entry.label, status: res.status,
      account: live ? entry.pick(data, res.status) : undefined,
      // a descriptors-only .0n connection stub the buyer can import (no secret)
      connection: live ? { '0n': '1.0', kind: 'connection', service, label: entry.label, auth_type: 'api_key', verified_at: new Date().toISOString() } : undefined,
      error: live ? undefined : (data?.error?.message || data?.message || `verify failed (${res.status})`),
    }
  } catch (e) {
    return { ok: false, service, error: e instanceof Error ? e.message : 'verify failed' }
  }
}

// ─── POST — MCP Protocol + Legacy Console Proxy ─────────────────────────────

export async function POST(req: NextRequest) {
  // Raw, unresolved. An 0n_ token is NOT a valid CRM API token — it identifies a
  // 0nCore user and is exchanged for that user's CRM OAuth token at execution time.
  const rawToken = req.headers.get('authorization')?.replace('Bearer ', '') || process.env.CRM_PIT || ''
  const headerLocationId = req.headers.get('locationid') || req.headers.get('locationId') || process.env.CRM_LOCATION_ID || ''

  if (!rawToken) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // ── Standard MCP JSON-RPC protocol (Agent Studio, Cursor, etc.) ──
    if (body.jsonrpc || body.method === 'initialize' || body.method === 'tools/list' || body.method === 'tools/call') {
      const { method, params, id } = body

      switch (method) {
        case 'initialize':
          return NextResponse.json({
            jsonrpc: '2.0', id,
            result: {
              protocolVersion: '2024-11-05',
              serverInfo: { name: '0nMCP', version: '3.0.1' },
              capabilities: { tools: { listChanged: false } },
            },
          })

        case 'tools/list':
          return NextResponse.json({
            jsonrpc: '2.0', id,
            result: { tools: MCP_TOOLS },
          })

        case 'tools/call': {
          const toolName = params?.name || ''
          const toolArgs = params?.arguments || {}
          // Path 2: verify_service uses the passed API key — no CRM auth needed.
          if (toolName === 'verify_service') {
            const result = await verifyService(toolArgs)
            return NextResponse.json({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } })
          }
          const resolved = await resolveCrmAuth(rawToken, headerLocationId)
          if (!resolved.ok) {
            return NextResponse.json({
              jsonrpc: '2.0', id,
              error: { code: -32001, message: resolved.error },
            }, { status: resolved.status })
          }
          const { token, locationId } = resolved.auth
          const result = await executeTool(toolName, toolArgs, token, locationId)
          return NextResponse.json({
            jsonrpc: '2.0', id,
            result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
          })
        }

        default:
          return NextResponse.json({
            jsonrpc: '2.0', id,
            error: { code: -32601, message: `Method not found: ${method}` },
          })
      }
    }

    // ── Legacy console proxy format: { tool, params, service } ──
    const { tool, params: legacyParams = {} } = body
    if (tool) {
      const resolved = await resolveCrmAuth(rawToken, headerLocationId)
      if (!resolved.ok) {
        return NextResponse.json({ error: resolved.error }, { status: resolved.status })
      }
      const { token, locationId } = resolved.auth
      const result = await executeTool(tool, legacyParams, token, locationId)
      return NextResponse.json({ data: result, source: 'direct' })
    }

    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({
      jsonrpc: '2.0', id: null,
      error: { code: -32603, message: err instanceof Error ? err.message : 'Internal error' },
    }, { status: 500 })
  }
}

// ─── GET — Discovery + Health ───────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    name: '0nMCP',
    version: '3.0.1',
    protocol: 'mcp',
    transport: 'streamable_http',
    tools: MCP_TOOLS.length,
    description: 'Universal AI API Orchestrator — 1,640+ tools, 111 services. Official MCP Registry listed.',
    setup: {
      crm_agent_studio: {
        server_url: 'https://0nmcp.com/api/mcp',
        server_label: '0nMCP',
        headers: { Authorization: 'Bearer {pit_token}', locationId: '{location_id}' },
      },
      cursor: {
        mcpServers: { '0nmcp': { url: 'https://0nmcp.com/api/mcp', transport: 'streamable_http' } },
      },
    },
  })
}
