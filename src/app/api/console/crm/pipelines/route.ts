import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getUserCrmConfig, getCrmHeaders, CRM_BASE } from '@/lib/crm/config'

export const dynamic = 'force-dynamic'

interface CrmPipelineStage {
  id: string
  name: string
  position?: number
}

interface CrmPipeline {
  id: string
  name: string
  stages: CrmPipelineStage[]
  locationId?: string
}

interface CrmPipelinesResponse {
  pipelines: CrmPipeline[]
}

interface CrmOpportunity {
  id: string
  name?: string
  pipelineId?: string
  stageId?: string
  contactId?: string
  monetaryValue?: number
  status?: string
}

/**
 * GET /api/console/crm/pipelines
 * List pipelines and their stages.
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
      `${CRM_BASE}/opportunities/pipelines?locationId=${config.locationId}`,
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

    const data: CrmPipelinesResponse = await res.json()

    return NextResponse.json({
      pipelines: data.pipelines || [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * POST /api/console/crm/pipelines
 * Create an opportunity. Body: { name, pipelineId, stageId, contactId?, monetaryValue?, status? }
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

  const { name, pipelineId, stageId, contactId, monetaryValue, status } = body as {
    name?: string
    pipelineId?: string
    stageId?: string
    contactId?: string
    monetaryValue?: number
    status?: string
  }

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  if (!pipelineId) {
    return NextResponse.json({ error: 'pipelineId is required' }, { status: 400 })
  }

  if (!stageId) {
    return NextResponse.json({ error: 'stageId is required' }, { status: 400 })
  }

  const payload: Record<string, unknown> = {
    locationId: config.locationId,
    name,
    pipelineId,
    pipelineStageId: stageId,
    ...(contactId ? { contactId } : {}),
    ...(monetaryValue !== undefined ? { monetaryValue } : {}),
    ...(status ? { status } : {}),
  }

  try {
    const res = await fetch(`${CRM_BASE}/opportunities/`, {
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

    const data = (await res.json()) as { opportunity: CrmOpportunity }

    return NextResponse.json({ opportunity: data.opportunity })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * PUT /api/console/crm/pipelines
 * Update an opportunity. Body: { opportunityId, stageId?, monetaryValue?, status? }
 */
export async function PUT(request: NextRequest) {
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

  const { opportunityId, stageId, monetaryValue, status } = body as {
    opportunityId?: string
    stageId?: string
    monetaryValue?: number
    status?: string
  }

  if (!opportunityId) {
    return NextResponse.json({ error: 'opportunityId is required' }, { status: 400 })
  }

  const payload: Record<string, unknown> = {
    ...(stageId ? { pipelineStageId: stageId } : {}),
    ...(monetaryValue !== undefined ? { monetaryValue } : {}),
    ...(status ? { status } : {}),
  }

  try {
    const res = await fetch(`${CRM_BASE}/opportunities/${opportunityId}`, {
      method: 'PUT',
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

    const data = (await res.json()) as { opportunity: CrmOpportunity }

    return NextResponse.json({ opportunity: data.opportunity })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
