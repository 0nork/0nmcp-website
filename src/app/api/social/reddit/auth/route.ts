import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getAuthorizationUrl } from '@/lib/reddit/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', 'https://0nmcp.com'))
  }

  // Generate state token (includes user ID for verification)
  const state = Buffer.from(JSON.stringify({
    userId: user.id,
    ts: Date.now(),
    nonce: Math.random().toString(36).slice(2),
  })).toString('base64url')

  // Store state in cookie for CSRF verification
  const cookieStore = await cookies()
  cookieStore.set('reddit_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  const authUrl = getAuthorizationUrl(state)
  return NextResponse.redirect(authUrl)
}
