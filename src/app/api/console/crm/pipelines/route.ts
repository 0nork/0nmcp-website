import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const CRM_BASE = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

function getCrmHeaders(): Record<string, string> {
  const token = process.env.CRM_PIT || process.env.CRM_API_KEY || ''
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Version': CRM_VERSION,
  }
}

function getLocationId(): string {
  return process.env.CRM_LOCATION_ID || process.env.CRM_COMMUNITY_LOCATION_ID || ''
}

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

/**
 * GET /api/console/crm/pipelines
 * List pipelines and their stages.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const locationId = getLocationId()

  try {
    const res = await fetch(`${CRM_BASE}/opportunities/pipelines?locationId=${locationId}`, {
      method: 'GET',
      headers: getCrmHeaders(),
      signal: AbortSignal.timeout(15000),
    })

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
