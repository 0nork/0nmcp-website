import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getActiveSubscription, isOwnerEmail, getMonthlyExecutionCount, FREE_TIER_MONTHLY_LIMIT } from '@/lib/console/billing'

export const dynamic = 'force-dynamic'

/**
 * GET /api/console/usage
 * Returns the user's execution usage for the current month.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isOwner = user.email ? isOwnerEmail(user.email) : false
  if (isOwner) {
    const count = await getMonthlyExecutionCount(user.id)
    return NextResponse.json({
      plan: 'owner',
      used: count,
      limit: null,
      remaining: null,
      unlimited: true,
    })
  }

  // Check if paid user
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let isPaid = false
  if (profile?.stripe_customer_id) {
    const sub = await getActiveSubscription(profile.stripe_customer_id).catch(() => null)
    isPaid = !!sub
  }

  const used = await getMonthlyExecutionCount(user.id)
  // A usage page that prints "0 used" when the count could not be read is the
  // display half of the same falsehood the gate had.
  if (used === null) {
    return NextResponse.json({ error: 'usage_check_failed', message: 'Usage could not be read' }, { status: 503 })
  }

  if (isPaid) {
    return NextResponse.json({
      plan: 'metered',
      used,
      limit: null,
      remaining: null,
      unlimited: true,
      costPerExecution: 0.10,
    })
  }

  return NextResponse.json({
    plan: 'free',
    used,
    limit: FREE_TIER_MONTHLY_LIMIT,
    remaining: Math.max(0, FREE_TIER_MONTHLY_LIMIT - used),
    unlimited: false,
  })
}
