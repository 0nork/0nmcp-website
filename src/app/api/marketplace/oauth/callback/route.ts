/**
 * OAuth Callback — exchanges auth code for tokens, saves installation
 * GET /api/marketplace/oauth/callback?code=xxx
 */

import { NextRequest, NextResponse } from 'next/server'
import { exchangeOAuthCode, saveInstallation } from '@/lib/marketplace'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/install?error=no_code', req.url))
  }

  try {
    const tokens = await exchangeOAuthCode(code)

    await saveInstallation({
      locationId: tokens.locationId,
      companyId: tokens.companyId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      installedBy: tokens.userId,
    })

    return NextResponse.redirect(
      new URL(`/install/success?location=${tokens.locationId}`, req.url)
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/install?error=auth_failed', req.url))
  }
}
