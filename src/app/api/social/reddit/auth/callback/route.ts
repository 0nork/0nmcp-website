import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { exchangeCode, fetchProfile, upsertConnection } from '@/lib/reddit/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'

  if (error) {
    return NextResponse.redirect(new URL(`/console?reddit_error=${encodeURIComponent(error)}`, baseUrl))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/console?reddit_error=missing_params', baseUrl))
  }

  // Verify state (CSRF protection)
  const cookieStore = await cookies()
  const storedState = cookieStore.get('reddit_oauth_state')?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(new URL('/console?reddit_error=invalid_state', baseUrl))
  }

  // Clear state cookie
  cookieStore.delete('reddit_oauth_state')

  // Decode state to get user ID
  let userId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    userId = decoded.userId
    // Check expiry (10 min)
    if (Date.now() - decoded.ts > 600_000) {
      return NextResponse.redirect(new URL('/console?reddit_error=state_expired', baseUrl))
    }
  } catch {
    return NextResponse.redirect(new URL('/console?reddit_error=invalid_state', baseUrl))
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCode(code)

    // Fetch Reddit profile
    const profile = await fetchProfile(tokens.access_token)

    // Upsert connection record
    await upsertConnection(userId, profile, tokens)

    // Redirect to console social hub
    const params = new URLSearchParams({
      reddit: 'connected',
      reddit_user: profile.name,
    })

    return NextResponse.redirect(new URL(`/console?${params.toString()}`, baseUrl))
  } catch (err) {
    console.error('Reddit callback error:', err)
    const msg = err instanceof Error ? err.message : 'unknown_error'
    return NextResponse.redirect(new URL(`/console?reddit_error=${encodeURIComponent(msg)}`, baseUrl))
  }
}
