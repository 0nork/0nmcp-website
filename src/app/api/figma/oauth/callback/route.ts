import { NextRequest, NextResponse } from 'next/server'
import {
  verifyOAuthState,
  exchangeFigmaCode,
  fetchFigmaUser,
  storeFigmaConnection,
} from '@/lib/figma/auth'

/**
 * GET /api/figma/oauth/callback?code=XXX&state=YYY
 * Handles Figma OAuth callback:
 * 1. Verify CSRF state
 * 2. Exchange code for tokens
 * 3. Fetch Figma user profile
 * 4. Encrypt & store tokens
 * 5. Redirect to console
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'

  // User denied consent
  if (error) {
    return NextResponse.redirect(`${baseUrl}/console/onpress?figma=denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/console/onpress?figma=error`)
  }

  // Verify CSRF state
  const userId = await verifyOAuthState(state)
  if (!userId) {
    return NextResponse.redirect(`${baseUrl}/console/onpress?figma=error&reason=invalid_state`)
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeFigmaCode(code)

    // Fetch Figma user profile
    const figmaUser = await fetchFigmaUser(tokens.access_token)

    // Encrypt and store connection
    await storeFigmaConnection(userId, tokens, figmaUser)

    return NextResponse.redirect(`${baseUrl}/console/onpress?figma=connected`)
  } catch (err) {
    console.error('[figma-oauth] Callback error:', err)
    return NextResponse.redirect(`${baseUrl}/console/onpress?figma=error`)
  }
}
