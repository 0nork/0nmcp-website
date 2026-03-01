import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/console/account
 * Returns the authenticated user's profile data.
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || '',
    company: profile?.company || '',
    role: profile?.role || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || null,
    created_at: profile?.created_at || user.created_at,
    stripe_customer_id: profile?.stripe_customer_id || null,
    preferences: profile?.preferences || {},
  })
}

/**
 * PATCH /api/console/account
 * Updates the authenticated user's profile.
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Whitelist allowed fields
  const updates: Record<string, unknown> = {}
  if (typeof body.full_name === 'string') updates.full_name = body.full_name
  if (typeof body.company === 'string') updates.company = body.company
  if (typeof body.role === 'string') updates.role = body.role
  if (typeof body.bio === 'string') updates.bio = body.bio
  if (body.preferences && typeof body.preferences === 'object') {
    updates.preferences = body.preferences
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
