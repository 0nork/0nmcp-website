/**
 * GET /api/console/agent-workflows — List all AI agent workflows from crm_agent_workflows
 * Query: ?location=F76MNKOMQCMruMrumtdf (optional filter)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ workflows: [] })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const location = request.nextUrl.searchParams.get('location')

  let query = supabase
    .from('crm_agent_workflows')
    .select('*')
    .order('name')

  // If location filter, only return workflows for that location
  if (location) {
    query = query.or(`trigger_conditions->locations.cs.["${location}"],trigger_conditions->location_id.eq.${location},slug.like.0nspa-%`)
  }

  const { data } = await query
  return NextResponse.json({ workflows: data || [] })
}
