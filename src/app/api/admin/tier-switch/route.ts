/**
 * POST /api/admin/tier-switch
 *
 * Superadmin only — switch the viewing experience to any subscription tier.
 * Only mike@rocketopp.com can use this.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

const OWNER_EMAIL = 'mike@rocketopp.com'
const VALID_PLANS = ['free', 'creator', 'pro', 'team', 'enterprise', 'operator', 'unlimited']

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== OWNER_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { plan } = await request.json()

  if (!plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: `Invalid plan. Valid: ${VALID_PLANS.join(', ')}` }, { status: 400 })
  }

  const admin = getAdmin()
  const { error } = await admin
    .from('profiles')
    .update({ plan, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, plan, message: `Switched to ${plan} view` })
}

export async function GET() {
  return NextResponse.json({
    plans: VALID_PLANS,
    description: 'POST with { plan: "creator" } to switch your view',
  })
}
