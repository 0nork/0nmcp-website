import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { listAgents, createAgent } from '@/lib/agent-studio'
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

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
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

/**
 * POST /api/console/agent-studio/agents
 *
 * Create a new Agent Studio agent in the user's CRM location.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
  }

  // Get user's CRM location
  const account = await getUserCrmAccount(user.id)
  const locationId = account?.location_id || process.env.CRM_AGENT_STUDIO_LOCATION_ID || ''

  if (!locationId) {
    return NextResponse.json({ error: 'No CRM location. Your account is being provisioned — try again in a moment.' }, { status: 422 })
  }

  try {
    const agent = await createAgent({
      locationId,
      name: name.trim(),
      description: description?.trim() || undefined,
    })

    return NextResponse.json({ agent, success: true }, { status: 201 })
  } catch (err) {
    console.error('[agent-studio] Create agent error:', err)
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Failed to create agent',
    }, { status: 500 })
  }
}
