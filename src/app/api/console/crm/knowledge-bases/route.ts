import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getUserCrmConfig, getCrmHeaders, CRM_BASE } from '@/lib/crm/config'

export const dynamic = 'force-dynamic'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  locationId: string
  createdAt?: string
  updatedAt?: string
}

/**
 * GET /api/console/crm/knowledge-bases
 * List knowledge bases for the user's CRM location.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const config = await getUserCrmConfig(supabase)
  if (!config) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = new URLSearchParams({
    locationId: config.locationId,
  })

  try {
    const res = await fetch(`${CRM_BASE}/knowledge-bases/?${params.toString()}`, {
      method: 'GET',
      headers: getCrmHeaders(config.pitToken),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: `CRM API error: ${res.status}`, details: errText },
        { status: res.status >= 500 ? 502 : res.status }
      )
    }

    const data = await res.json()

    return NextResponse.json({
      knowledgeBases: data.knowledgeBases || data.knowledge_bases || [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * POST /api/console/crm/knowledge-bases
 * Create a new knowledge base. Body: { name, description }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const config = await getUserCrmConfig(supabase)
  if (!config) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, description } = body as {
    name?: string
    description?: string
  }

  if (!name) {
    return NextResponse.json(
      { error: 'name is required' },
      { status: 400 }
    )
  }

  const payload: Record<string, unknown> = {
    locationId: config.locationId,
    name,
    ...(description ? { description } : {}),
  }

  try {
    const res = await fetch(`${CRM_BASE}/knowledge-bases/`, {
      method: 'POST',
      headers: getCrmHeaders(config.pitToken),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: `CRM API error: ${res.status}`, details: errText },
        { status: res.status >= 500 ? 502 : res.status }
      )
    }

    const data = (await res.json()) as { knowledgeBase?: KnowledgeBase; knowledge_base?: KnowledgeBase }

    return NextResponse.json({
      knowledgeBase: data.knowledgeBase || data.knowledge_base || data,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
