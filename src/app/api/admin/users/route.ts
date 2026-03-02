import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['mike@rocketopp.com']

// Service role client for admin operations
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !key) return null
  return createClient(url, key)
}

async function requireAdmin() {
  const supabase = await createSupabaseServer()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check email whitelist OR is_admin in DB
  if (ADMIN_EMAILS.includes(user.email || '')) return user

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin) return user
  return null
}

/**
 * GET /api/admin/users — List all user profiles
 */
export async function GET(request: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getServiceClient()
  if (!admin) return NextResponse.json({ error: 'Service client not available' }, { status: 500 })

  const statsOnly = request.nextUrl.searchParams.get('stats') === 'true'

  if (statsOnly) {
    const { count } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    return NextResponse.json({ total: count || 0 })
  }

  const { data, error, count } = await admin
    .from('profiles')
    .select('id, email, full_name, company, role, is_admin, onboarding_completed, created_at, post_count, karma, last_seen_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data || [], total: count || 0 })
}

/**
 * PATCH /api/admin/users — Update user profile
 * Body: { userId, is_admin?, role? }
 */
export async function PATCH(request: NextRequest) {
  const currentUser = await requireAdmin()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getServiceClient()
  if (!admin) return NextResponse.json({ error: 'Service client not available' }, { status: 500 })

  const { userId, is_admin, role } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Cannot revoke own admin
  if (userId === currentUser.id && is_admin === false) {
    return NextResponse.json({ error: 'Cannot revoke your own admin access' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (typeof is_admin === 'boolean') updates.is_admin = is_admin
  if (typeof role === 'string') updates.role = role

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }

  const { error } = await admin
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
