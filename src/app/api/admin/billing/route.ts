import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/admin/billing
 * Returns billing stats: execution counts, revenue, active subscribers, top users.
 * Admin-only (mike@rocketopp.com).
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'mike@rocketopp.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const admin = getAdmin()

  // Parallel queries
  const [
    totalExecs,
    billedExecs,
    recentExecs,
    monthlyData,
    topUsers,
    activeSubscribers,
    storePurchases,
  ] = await Promise.all([
    // Total executions
    admin.from('console_executions').select('id', { count: 'exact', head: true }),

    // Billed executions (revenue)
    admin.from('console_executions').select('id, billing_amount_cents', { count: 'exact' }).eq('billed', true),

    // Last 50 executions
    admin.from('console_executions')
      .select('id, user_id, task, workflow_name, status, duration_ms, steps_executed, services_used, billed, billing_amount_cents, created_at')
      .order('created_at', { ascending: false })
      .limit(50),

    // Monthly summary (from view)
    admin.from('console_billing_summary').select('*').limit(12),

    // Top users by execution count (from view)
    admin.from('console_user_billing').select('*').order('total_executions', { ascending: false }).limit(20),

    // Users with stripe_customer_id (potential subscribers)
    admin.from('profiles').select('id, full_name, email, stripe_customer_id, plan', { count: 'exact' }).not('stripe_customer_id', 'is', null),

    // Store purchases
    admin.from('user_purchases').select('id', { count: 'exact', head: true }),
  ])

  // Calculate total revenue from billed executions
  const totalRevenueCents = billedExecs.data?.reduce(
    (sum, e) => sum + (e.billing_amount_cents || 10), 0
  ) || 0

  return NextResponse.json({
    executions: {
      total: totalExecs.count || 0,
      billed: billedExecs.count || 0,
      totalRevenueCents,
      totalRevenueDollars: (totalRevenueCents / 100).toFixed(2),
    },
    monthly: monthlyData.data || [],
    topUsers: topUsers.data || [],
    recentExecutions: recentExecs.data || [],
    subscribers: {
      total: activeSubscribers.count || 0,
      list: activeSubscribers.data || [],
    },
    storePurchases: storePurchases.count || 0,
  })
}
