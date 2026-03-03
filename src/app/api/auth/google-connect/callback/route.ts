import { NextRequest, NextResponse } from 'next/server'
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'

  // User denied consent
  if (error) {
    return NextResponse.redirect(`${baseUrl}/console?google=denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/console?google=error`)
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeGoogleCode(code)

    if (!tokens.refresh_token) {
      return NextResponse.redirect(`${baseUrl}/console?google=error&reason=no_refresh_token`)
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

          // Encrypt using the same vault crypto pattern
          const plaintext = JSON.stringify(credData)

          // Use a simpler server-side encryption for auto-populated entries
          // The vault crypto uses Web Crypto API which needs userId as key derivation
          // We'll store with a marker so the client knows it's OAuth-populated
          const { data: existing } = await admin
            .from('user_vaults')
            .select('id')
            .eq('user_id', state)
            .eq('service_name', serviceKey)
            .single()

          if (existing) {
            // Don't overwrite manually configured credentials
            continue
          }

          // Insert with a special marker — client-side vault will pick these up
          // We store the OAuth data as base64-encoded JSON (not encrypted with user key
          // since we don't have it server-side; the client will re-encrypt on next load)
          const b64 = Buffer.from(plaintext).toString('base64')
          await admin.from('user_vaults').insert({
            user_id: state,
            service_name: serviceKey,
            encrypted_key: b64,
            iv: 'google-oauth',  // marker for OAuth-populated entries
            salt: 'google-oauth',
            key_hint: 'oauth',
          })
        } catch {
          // Non-fatal — continue with other services
        }
      }
    }

    return NextResponse.redirect(
      `${baseUrl}/console?google=connected&services=${grantedServices.length}`
    )
  } catch (err) {
    console.error('[google-connect] Callback error:', err)
    return NextResponse.redirect(`${baseUrl}/console?google=error`)
  }
}
