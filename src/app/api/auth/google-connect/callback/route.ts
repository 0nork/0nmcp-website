import { NextRequest, NextResponse } from 'next/server'
import { storeUserCredential } from '@/lib/vault-bridge'
import { createClient } from '@supabase/supabase-js'
import { exchangeGoogleCode, storeGoogleTokens } from '@/lib/google-auth'
import { getGrantedServices } from '@/lib/google-scopes'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * GET /api/auth/google-connect/callback?code=XXX&state=USER_ID
 * Handles Google OAuth callback:
 * 1. Exchange code for tokens
 * 2. Store tokens in google_oauth_tokens
 * 3. Auto-populate vault entries for unlocked services
 * 4. Redirect to console with success
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // userId
  const error = searchParams.get('error')
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.0nmcp.com'

  // User denied consent
  if (error) {
    return NextResponse.redirect(`${baseUrl}/console/vault?google=denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/console/vault?google=error`)
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeGoogleCode(code)

    if (!tokens.refresh_token) {
      return NextResponse.redirect(`${baseUrl}/console/vault?google=error&reason=no_refresh_token`)
    }

    // Parse granted scopes
    const grantedScopes = tokens.scope.split(' ').filter(Boolean)
    const grantedServices = getGrantedServices(grantedScopes)

    // Store tokens
    await storeGoogleTokens(
      state,
      tokens.access_token,
      tokens.refresh_token,
      tokens.expires_in,
      grantedScopes
    )

    // Auto-populate vault entries for each unlocked Google service
    const admin = getAdminClient()
    if (admin) {
      const clientId = process.env.GOOGLE_CLIENT_ID || ''
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''

      for (const serviceKey of grantedServices) {
        try {
          // Build the credential data for this service
          const credData: Record<string, string> = {
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: tokens.refresh_token,
          }

          // One vault: the record goes to 0n3 as a .0n connection (encrypted there), never as base64 in a table.
          await storeUserCredential(state, serviceKey, credData as Record<string, string>, { name: `${serviceKey} (Google OAuth)`, meta: { provider: 'google', scopes: tokens.scope || '' } })
        } catch {
          // Non-fatal — continue with other services
        }
      }
    }

    return NextResponse.redirect(
      `${baseUrl}/console/vault?google=connected&services=${grantedServices.length}`
    )
  } catch (err) {
    console.error('[google-connect] Callback error:', err)
    return NextResponse.redirect(`${baseUrl}/console/vault?google=error`)
  }
}
