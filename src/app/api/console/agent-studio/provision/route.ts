import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { provisionUser, getUserCrmAccount } from '@/lib/crm-provisioning'

export const dynamic = 'force-dynamic'

/**
 * POST /api/console/agent-studio/provision
 *
 * Manually trigger CRM sub-account provisioning for the current user.
 * Idempotent — returns existing account if already provisioned.
 */
export async function POST() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if already provisioned
  const existing = await getUserCrmAccount(user.id)
  if (existing) {
    return NextResponse.json({
      provisioned: true,
      locationId: existing.location_id,
      contactId: existing.contact_id,
      agentId: existing.default_agent_id,
      status: existing.status,
    })
  }

  // Get profile for provisioning
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, company')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.email) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const result = await provisionUser({
    userId: user.id,
    email: profile.email,
    fullName: profile.full_name || '',
    company: profile.company || '',
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    provisioned: true,
    locationId: result.locationId,
    contactId: result.contactId,
    agentId: result.agentId,
  })
}

/**
 * GET /api/console/agent-studio/provision
 *
 * Check provisioning status for the current user.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ provisioned: false })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ provisioned: false }, { status: 401 })
  }

  const account = await getUserCrmAccount(user.id)
  if (!account) {
    return NextResponse.json({ provisioned: false })
  }

  return NextResponse.json({
    provisioned: true,
    locationId: account.location_id,
    contactId: account.contact_id,
    agentId: account.default_agent_id,
    executionCount: account.execution_count,
    status: account.status,
  })
}
