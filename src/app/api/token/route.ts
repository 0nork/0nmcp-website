import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getTokenForUser, regenerateToken } from '@/lib/token-auth'

/**
 * GET /api/token — Get the current user's 0n access token
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getTokenForUser(user.id)
  if (!token) return NextResponse.json({ error: 'No token found' }, { status: 404 })

  return NextResponse.json({ token })
}

/**
 * POST /api/token — Regenerate (revoke + create new)
 */
export async function POST() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const newToken = await regenerateToken(user.id)
  if (!newToken) return NextResponse.json({ error: 'Failed to regenerate' }, { status: 500 })

  return NextResponse.json({ token: newToken })
}
