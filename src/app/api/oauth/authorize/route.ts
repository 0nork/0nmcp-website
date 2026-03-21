import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import {
  validateClient,
  validateRedirectUri,
  validateScopes,
  storeAuthCode,
} from '@/lib/oauth'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.0nmcp.com'

function errorRedirect(redirectUri: string, error: string, description: string, state?: string) {
  const url = new URL(redirectUri)
  url.searchParams.set('error', error)
  url.searchParams.set('error_description', description)
  if (state) url.searchParams.set('state', state)
  return NextResponse.redirect(url.toString())
}

// GET — Authorization Request (RFC 6749 Section 4.1.1)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const responseType = params.get('response_type')
  const clientId = params.get('client_id') || ''
  const redirectUri = params.get('redirect_uri') || ''
  const scope = params.get('scope') || 'openid'
  const state = params.get('state') || ''
  const codeChallenge = params.get('code_challenge') || ''
  const codeChallengeMethod = params.get('code_challenge_method') || 'S256'

  // Validate response_type
  if (responseType !== 'code') {
    if (redirectUri) {
      return errorRedirect(redirectUri, 'unsupported_response_type', 'Only response_type=code is supported', state)
    }
    return NextResponse.json({ error: 'unsupported_response_type' }, { status: 400 })
  }

  // Validate client
  const client = await validateClient(clientId)
  if (!client) {
    return NextResponse.json({ error: 'invalid_client', error_description: 'Unknown client_id' }, { status: 400 })
  }

  // Validate redirect URI
  if (!validateRedirectUri(client, redirectUri)) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Invalid redirect_uri' },
      { status: 400 }
    )
  }

  // Validate scopes
  const requestedScopes = scope.split(' ').filter(Boolean)
  const { valid } = validateScopes(requestedScopes)
  if (!valid) {
    return errorRedirect(redirectUri, 'invalid_scope', 'One or more requested scopes are invalid', state)
  }

  // PKCE required for public clients
  if (!client.is_confidential && !codeChallenge) {
    return errorRedirect(redirectUri, 'invalid_request', 'PKCE code_challenge required for public clients', state)
  }

  // Check user session
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return errorRedirect(redirectUri, 'server_error', 'Authentication service unavailable', state)
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login with return URL
    const returnUrl = request.nextUrl.pathname + request.nextUrl.search
    return NextResponse.redirect(
      `${SITE_URL}/login?redirect=${encodeURIComponent(returnUrl)}`
    )
  }

  // Redirect to consent page with all params
  const consentUrl = new URL(`${SITE_URL}/oauth/authorize`)
  consentUrl.searchParams.set('client_id', clientId)
  consentUrl.searchParams.set('redirect_uri', redirectUri)
  consentUrl.searchParams.set('scope', scope)
  consentUrl.searchParams.set('state', state)
  consentUrl.searchParams.set('response_type', 'code')
  consentUrl.searchParams.set('app_name', client.app_name)
  if (client.app_logo_url) consentUrl.searchParams.set('app_logo_url', client.app_logo_url)
  if (codeChallenge) {
    consentUrl.searchParams.set('code_challenge', codeChallenge)
    consentUrl.searchParams.set('code_challenge_method', codeChallengeMethod)
  }

  return NextResponse.redirect(consentUrl.toString())
}

// POST — Consent Decision
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const action = formData.get('action') as string
  const clientId = formData.get('client_id') as string || ''
  const redirectUri = formData.get('redirect_uri') as string || ''
  const scope = formData.get('scope') as string || 'openid'
  const state = formData.get('state') as string || ''
  const codeChallenge = formData.get('code_challenge') as string || ''
  const codeChallengeMethod = formData.get('code_challenge_method') as string || 'S256'

  // Verify user session
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Handle deny
  if (action === 'deny') {
    return errorRedirect(redirectUri, 'access_denied', 'User denied the request', state)
  }

  // Re-validate client and redirect URI (defense in depth)
  const client = await validateClient(clientId)
  if (!client || !validateRedirectUri(client, redirectUri)) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Invalid client or redirect URI' },
      { status: 400 }
    )
  }

  // Generate and store authorization code
  const crypto = globalThis.crypto
  const codeBytes = new Uint8Array(32)
  crypto.getRandomValues(codeBytes)
  const code = btoa(String.fromCharCode(...codeBytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  try {
    await storeAuthCode({
      code,
      clientId,
      userId: user.id,
      redirectUri,
      scope,
      state: state || undefined,
      codeChallenge: codeChallenge || undefined,
      codeChallengeMethod: codeChallenge ? codeChallengeMethod : undefined,
    })
  } catch {
    return errorRedirect(redirectUri, 'server_error', 'Failed to generate authorization code', state)
  }

  // Redirect with code
  const callbackUrl = new URL(redirectUri)
  callbackUrl.searchParams.set('code', code)
  if (state) callbackUrl.searchParams.set('state', state)

  return NextResponse.redirect(callbackUrl.toString())
}
