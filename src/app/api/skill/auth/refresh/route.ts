import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/skill/auth/refresh — Refresh an expired skill session token
 *
 * Body: { refresh_token }
 * Returns: { access_token, refresh_token, expires_at, user }
 *
 * Used by the /0nmcp skill when the access_token has expired.
 * The skill stores the refresh_token in ~/.0n/0nmcp-session.json
 * and calls this endpoint to get a new access_token without
 * re-prompting the user for credentials.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { refresh_token } = body

  if (!refresh_token) {
    return NextResponse.json({ error: 'refresh_token required' }, { status: 400 })
  }

  // Use the refresh token to get a new session
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data, error } = await supabase.auth.refreshSession({ refresh_token })

  if (error || !data.session) {
    return NextResponse.json({
      error: 'refresh_failed',
      message: error?.message || 'Failed to refresh session. Run: /0nmcp login',
    }, { status: 401 })
  }

  // Get profile
  const admin = createClient(SUPABASE_URL, SERVICE_KEY)
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, handle')
    .eq('id', data.user!.id)
    .maybeSingle()

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: {
      id: data.user!.id,
      email: data.user!.email,
      full_name: profile?.full_name || null,
      handle: profile?.handle || null,
    },
  })
}
