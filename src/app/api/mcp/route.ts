/* ═══════════════════════════════════════════════════════════════
   MCP Proxy API Route
   Proxies requests from the Console/Builder to the 0nMCP HTTP server.
   Supports both local (localhost:3001) and cloud MCP endpoints.

   POST /api/mcp
   Body: { tool: "search_contacts", params: { locationId: "...", query: "..." } }
   Returns: { data: {...}, error?: string, source: "local"|"cloud" }
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MCP_LOCAL_URL = process.env.MCP_LOCAL_URL || 'http://localhost:3001'
const MCP_CLOUD_URL = process.env.MCP_CLOUD_URL || ''

// CRM API for direct calls when MCP server isn't available
const CRM_BASE = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

// Tool → CRM endpoint mapping for direct API fallback
const CRM_TOOL_MAP: Record<string, { method: string; path: string }> = {
  search_contacts:    { method: 'GET',  path: '/contacts/search' },
  get_contact:        { method: 'GET',  path: '/contacts/{contactId}' },
  list_pipelines:     { method: 'GET',  path: '/opportunities/pipelines' },
  list_opportunities: { method: 'GET',  path: '/opportunities/' },
  list_calendars:     { method: 'GET',  path: '/calendars/' },
  list_invoices:      { method: 'GET',  path: '/invoices/' },
  list_conversations: { method: 'GET',  path: '/conversations/' },
  list_social_posts:  { method: 'GET',  path: '/social-media-posting/' },
  list_tags:          { method: 'GET',  path: '/locations/{locationId}/tags' },
  list_workflows:     { method: 'GET',  path: '/workflows/' },
}

interface McpRequest {
  tool: string
  params?: Record<string, string | number | boolean>
  service?: string
}

async function getAuthToken(userId: string): Promise<string | null> {
  // Check Supabase for stored CRM credentials
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data } = await supabase
    .from('vault_credentials')
    .select('encrypted_value')
    .eq('user_id', userId)
    .eq('service', 'crm')
    .single()

  return data?.encrypted_value || null
}

async function callMcpServer(tool: string, params: Record<string, unknown>): Promise<{ data: unknown; source: string }> {
  // Try local MCP server first
  try {
    const res = await fetch(`${MCP_LOCAL_URL}/api/tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, params }),
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      return { data, source: 'local' }
    }
  } catch {
    // Local server not available, fall through
  }

  // Try cloud MCP if configured
  if (MCP_CLOUD_URL) {
    try {
      const res = await fetch(`${MCP_CLOUD_URL}/api/tool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, params }),
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        const data = await res.json()
        return { data, source: 'cloud' }
      }
    } catch {
      // Cloud also unavailable
    }
  }

  throw new Error('MCP server unavailable')
}

async function callCrmDirect(
  tool: string,
  params: Record<string, string | number | boolean>,
  token: string,
): Promise<unknown> {
  const mapping = CRM_TOOL_MAP[tool]
  if (!mapping) throw new Error(`Unknown CRM tool: ${tool}`)

  let path = mapping.path
  // Replace path params
  for (const [key, val] of Object.entries(params)) {
    if (path.includes(`{${key}}`)) {
      path = path.replace(`{${key}}`, String(val))
    }
  }

  // Build query string for GET requests
  const url = new URL(`${CRM_BASE}${path}`)
  if (mapping.method === 'GET') {
    for (const [key, val] of Object.entries(params)) {
      if (!path.includes(`{${key}}`)) {
        url.searchParams.set(key, String(val))
      }
    }
  }

  const res = await fetch(url.toString(), {
    method: mapping.method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Version': CRM_VERSION,
    },
    ...(mapping.method !== 'GET' ? { body: JSON.stringify(params) } : {}),
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`CRM API error ${res.status}: ${text}`)
  }

  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const body: McpRequest = await req.json()
    const { tool, params = {}, service } = body

    if (!tool) {
      return NextResponse.json({ error: 'Missing tool parameter' }, { status: 400 })
    }

    // Try MCP server first (handles all services)
    try {
      const result = await callMcpServer(tool, params)
      return NextResponse.json(result)
    } catch {
      // MCP unavailable — try direct API fallback for CRM tools
    }

    // Direct CRM API fallback
    if (service === 'crm' || CRM_TOOL_MAP[tool]) {
      // Get auth token from request header or vault
      const authHeader = req.headers.get('x-crm-token')
      const userId = req.headers.get('x-user-id')

      let token = authHeader
      if (!token && userId) {
        token = await getAuthToken(userId)
      }

      if (!token) {
        return NextResponse.json(
          { error: 'CRM not connected. Add your CRM credentials in the Vault.', code: 'NO_AUTH' },
          { status: 401 }
        )
      }

      const data = await callCrmDirect(tool, params, token)
      return NextResponse.json({ data, source: 'direct' })
    }

    return NextResponse.json(
      { error: 'MCP server unavailable and no direct fallback for this tool', code: 'MCP_OFFLINE' },
      { status: 503 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET endpoint for health check / widget discovery
export async function GET() {
  let mcpStatus = 'offline'

  try {
    const res = await fetch(`${MCP_LOCAL_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    })
    if (res.ok) mcpStatus = 'local'
  } catch {
    if (MCP_CLOUD_URL) {
      try {
        const res = await fetch(`${MCP_CLOUD_URL}/health`, {
          signal: AbortSignal.timeout(3000),
        })
        if (res.ok) mcpStatus = 'cloud'
      } catch { /* */ }
    }
  }

  return NextResponse.json({
    status: mcpStatus,
    tools: Object.keys(CRM_TOOL_MAP).length,
    directFallback: true,
    services: ['crm', 'stripe', 'cloudflare', 'n8n', 'make'],
  })
}
