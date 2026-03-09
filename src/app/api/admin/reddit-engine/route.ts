import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getPerformanceDashboard } from '@/lib/reddit-engine'

const ADMIN_EMAILS = ['mike@rocketopp.com']

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/reddit-engine
 * Returns Reddit Growth Engine dashboard data.
 * Admin-only endpoint.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const dashboard = await getPerformanceDashboard()
    return NextResponse.json(dashboard)
  } catch (err) {
    console.error('[admin/reddit-engine] Error:', err)
    return NextResponse.json(
      { error: 'Failed to load dashboard', details: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
    )
  }
}
