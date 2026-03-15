import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { listAgents } from '@/lib/agent-studio'
import { getUserCrmAccount } from '@/lib/crm-provisioning'

export const dynamic = 'force-dynamic'

/**
 * GET /api/console/agent-studio/agents
 *
 * List available agents for the current user's CRM location.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ agents: [] })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ agents: [] }, { status: 401 })
  }

  // Get user's CRM account
  const account = await getUserCrmAccount(user.id)
  const locationId = account?.location_id || process.env.CRM_AGENT_STUDIO_LOCATION_ID || ''

  if (!locationId) {
    return NextResponse.json({ agents: [], message: 'No CRM location configured' })
  }

  try {
    const result = await listAgents(locationId, { isPublished: true })
    return NextResponse.json({
      agents: result.agents || [],
      locationId,
      hasAccount: !!account,
    })
  } catch (err) {
    return NextResponse.json({
      agents: [],
      error: err instanceof Error ? err.message : 'Failed to list agents',
    })
  }
}
