import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/skill/auth — Authenticate a skill user
 *
 * Body: { email, password }
 * Returns: { access_token, user: { id, email, full_name }, expires_at }
 *
 * Used by the downloadable /0nmcp skill to log in from Claude Code.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  // Authenticate via Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return NextResponse.json({
      error: 'auth_failed',
      message: error?.message || 'Invalid email or password',
    }, { status: 401 })
  }

  // Get profile
  const admin = createClient(SUPABASE_URL, SERVICE_KEY)
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, handle')
    .eq('id', data.user.id)
    .maybeSingle()

  // Get Runs balance
  const { data: runs } = await admin
    .from('run_balances')
    .select('balance')
    .eq('user_id', data.user.id)
    .maybeSingle()

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: {
      id: data.user.id,
      email: data.user.email,
      full_name: profile?.full_name || null,
      handle: profile?.handle || null,
    },
    runs: runs?.balance || 0,
  })
}
