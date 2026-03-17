import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getUserCrmConfig, getCrmHeaders, CRM_BASE } from '@/lib/crm/config'

export const dynamic = 'force-dynamic'

interface CrmTag {
  id: string
  name: string
  locationId?: string
}

/**
 * GET /api/console/crm/tags
 * List all tags for the active location.
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

  try {
    const res = await fetch(
      `${CRM_BASE}/locations/${config.locationId}/tags`,
      {
        method: 'GET',
        headers: getCrmHeaders(config.pitToken),
        signal: AbortSignal.timeout(15000),
      }
    )

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: `CRM API error: ${res.status}`, details: errText },
        { status: res.status >= 500 ? 502 : res.status }
      )
    }

    const data = (await res.json()) as { tags: CrmTag[] }

    return NextResponse.json({
      tags: data.tags || [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * POST /api/console/crm/tags
 * Create a new tag. Body: { name }
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

  const { name } = body as { name?: string }

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${CRM_BASE}/locations/${config.locationId}/tags`,
      {
        method: 'POST',
        headers: getCrmHeaders(config.pitToken),
        body: JSON.stringify({ name }),
        signal: AbortSignal.timeout(15000),
      }
    )

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: `CRM API error: ${res.status}`, details: errText },
        { status: res.status >= 500 ? 502 : res.status }
      )
    }

    const data = (await res.json()) as { tag: CrmTag }

    return NextResponse.json({ tag: data.tag })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
