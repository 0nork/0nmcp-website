import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getGoogleConnectUrl } from '@/lib/google-auth'

/**
 * GET /api/auth/google-connect
 * Redirects authenticated user to Google consent screen with expanded scopes.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login?redirect=/console', process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'))
  }

  const url = getGoogleConnectUrl(user.id)
  return NextResponse.redirect(url)
}
