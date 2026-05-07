/**
 * app/api/oauth/authorize/route.ts
 *
 * GET  — Validates OAuth params, checks user session, redirects to consent UI
 * POST — Called by consent UI after user approves; issues auth code → redirects to client
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  getClient,
  validateRedirectUri,
  validateScopes,
  createAuthCode,
  oauthError,
  ALLOWED_SCOPES,
} from '@/lib/oauth'

// ── GET /api/oauth/authorize ─────────────────────────────────────────────────
// Anthropic redirects the user here to start the OAuth flow
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const responseType = searchParams.get('response_type')
  const clientId     = searchParams.get('client_id')
  const redirectUri  = searchParams.get('redirect_uri')
  const scope        = searchParams.get('scope') ?? ''
  const state        = searchParams.get('state') ?? ''

  // ── Validate response_type ──────────────────────────────────────────────
  if (responseType !== 'code') {
    return oauthError('unsupported_response_type', 'Only "code" is supported', undefined, state)
  }

  // ── Validate client ─────────────────────────────────────────────────────
  if (!clientId) return oauthError('invalid_request', 'Missing client_id')
  const client = await getClient(clientId)
  if (!client) return oauthError('invalid_client', 'Unknown client_id')

  // ── Validate redirect_uri ───────────────────────────────────────────────
  if (!redirectUri) return oauthError('invalid_request', 'Missing redirect_uri')
  if (!validateRedirectUri(client, redirectUri)) {
    return oauthError('invalid_request', 'redirect_uri not allowed for this client')
  }

  // ── Validate scopes ─────────────────────────────────────────────────────
  const requestedScopes = scope.split(' ').filter(Boolean)
  const { valid, scopes } = validateScopes(requestedScopes, client.allowed_scopes)
  if (!valid || scopes.length === 0) {
    return oauthError('invalid_scope', 'One or more requested scopes are invalid', redirectUri, state)
  }

  // ── Check if user is logged into 0nmcp.com ──────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const user = (await supabase.auth.getSession()).data.session?.user ?? null

  // Build consent page URL (always go through the UI)
  const consentUrl = new URL('/oauth/authorize', request.url)
  consentUrl.searchParams.set('client_id',     clientId)
  consentUrl.searchParams.set('redirect_uri',  redirectUri)
  consentUrl.searchParams.set('scope',         scopes.join(' '))
  consentUrl.searchParams.set('state',         state)
  consentUrl.searchParams.set('client_name',   client.name)

  // If not logged in, send to login first, return here after
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', consentUrl.toString())
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.redirect(consentUrl)
}

// ── POST /api/oauth/authorize ────────────────────────────────────────────────
// Called by the consent page when user clicks "Allow"
export async function POST(request: NextRequest) {
  const body = await request.json() as {
    client_id:    string
    redirect_uri: string
    scope:        string
    state:        string
    approved:     boolean
  }

  const { client_id, redirect_uri, scope, state, approved } = body

  // ── User denied ─────────────────────────────────────────────────────────
  if (!approved) {
    return oauthError('access_denied', 'User denied authorization', redirect_uri, state)
  }

  // ── Re-validate everything server-side ──────────────────────────────────
  const client = await getClient(client_id)
  if (!client || !validateRedirectUri(client, redirect_uri)) {
    return oauthError('invalid_client', 'Invalid client or redirect_uri')
  }

  const scopes = scope.split(' ').filter(Boolean)
  const { valid } = validateScopes(scopes, client.allowed_scopes)
  if (!valid) {
    return oauthError('invalid_scope', 'Invalid scopes', redirect_uri, state)
  }

  // ── Get authenticated user ──────────────────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'unauthorized', message: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // ── Issue authorization code ────────────────────────────────────────────
  try {
    const code = await createAuthCode(client_id, user.id, redirect_uri, scopes)

    const callbackUrl = new URL(redirect_uri)
    callbackUrl.searchParams.set('code', code)
    if (state) callbackUrl.searchParams.set('state', state)

    return NextResponse.json({ redirect: callbackUrl.toString() })
  } catch (err) {
    console.error('[oauth/authorize] createAuthCode error:', err)
    return oauthError('server_error', 'Failed to issue authorization code', redirect_uri, state)
  }
}
