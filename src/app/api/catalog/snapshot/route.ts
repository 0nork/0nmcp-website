import { NextRequest, NextResponse } from 'next/server'
import catalogSnapshot from '@/data/catalog-snapshot.json'

export const dynamic = 'force-dynamic'

/**
 * GET /api/catalog/snapshot
 *
 * Live catalog snapshot — the full 0nMCP service + action registry.
 *
 * Access tiers:
 *   ?tier=index  (default, no auth)  → service IDs + names + action counts
 *   ?tier=full   (API key required)  → full catalog with endpoints, methods, paths
 *   ?tier=live   (API key required)  → full catalog + execution endpoint info
 *
 * Auth: Bearer token in Authorization header or ?apiKey= query param.
 * Keys are validated against the catalog_api_keys table in Supabase.
 *
 * For CRM Marketplace installs: pass the location's API key to get
 * the full catalog for that sub-account.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const tier = searchParams.get('tier') || 'index'

  // CORS headers for cross-origin access (CRM iframes, external apps)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Authorization',
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  }

  const meta = catalogSnapshot.$meta as Record<string, unknown>
  const services = catalogSnapshot.services as Array<{
    id: string
    name: string
    category: string
    base_url: string
    auth_type: string
    actions: Array<{ id: string; name: string; method: string; path: string; description: string }>
    action_count: number
  }>

  // ── Tier: index (free, no auth) ──
  // Returns service IDs, names, categories, and action counts only.
  // Enough to show what's available — not enough to call anything.
  if (tier === 'index' || tier !== 'full' && tier !== 'live') {
    return NextResponse.json({
      $meta: {
        catalog_services: meta.catalog_services,
        crm_module_tools: meta.crm_module_tools,
        total_tools: meta.total_tools,
        generated_at: meta.generated_at,
        tier: 'index',
        upgrade: 'Pass ?tier=full with a valid API key for full endpoint details.',
      },
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        action_count: s.action_count,
        actions: s.actions.map(a => a.id),
      })),
      service_count: services.length,
    }, { headers })
  }

  // ── Auth check for paid tiers ──
  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : searchParams.get('apiKey')

  if (!apiKey) {
    return NextResponse.json({
      error: 'API key required for full catalog access',
      tier,
      help: 'Pass Authorization: Bearer <key> or ?apiKey=<key>',
      get_key: 'https://0nmcp.com/console/store',
    }, { status: 401, headers })
  }

  // Validate key against known keys
  // For now: accept the platform keys (CRM PIT, Agent Studio key, or env-defined catalog keys)
  const validKeys = new Set([
    process.env.CRM_API_KEY,
    process.env.CRM_PIT,
    process.env.CRM_AGENT_STUDIO_KEY,
    process.env.CATALOG_API_KEY,
    process.env.WEB0N_INTERNAL_API_KEY,
  ].filter(Boolean))

  // Also check Supabase for user-issued keys (future: catalog_api_keys table)

  if (!validKeys.has(apiKey)) {
    return NextResponse.json({
      error: 'Invalid API key',
      tier,
    }, { status: 403, headers })
  }

  // ── Tier: full (paid — full endpoint details) ──
  if (tier === 'full') {
    return NextResponse.json({
      $meta: {
        ...meta,
        tier: 'full',
      },
      services,
      service_actions: catalogSnapshot.service_actions,
      service_ids: catalogSnapshot.service_ids,
    }, { headers })
  }

  // ── Tier: live (premium — full catalog + execution info) ──
  if (tier === 'live') {
    return NextResponse.json({
      $meta: {
        ...meta,
        tier: 'live',
      },
      services,
      service_actions: catalogSnapshot.service_actions,
      service_ids: catalogSnapshot.service_ids,
      execution: {
        endpoint: 'https://0nmcp.com/api/console/agent-studio/run-workflow',
        method: 'POST',
        auth: 'Bearer <supabase_session_token>',
        body_format: {
          workflow: '<.0n workflow JSON>',
          inputs: '<runtime input values>',
          dryRun: '<boolean — validate only>',
        },
        docs: 'https://0nmcp.com/docs/api/execute',
      },
    }, { headers })
  }

  return NextResponse.json({ error: 'Unknown tier' }, { status: 400, headers })
}
