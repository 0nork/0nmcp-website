// app/api/crm/oauth/callback/route.ts
// Add0n — OAuth callback handler.
//
// Flow:
//   1. CRM redirects here with ?code=...&state=...&locationId=...
//   2. Validate CSRF state nonce + PKCE verifier
//   3. Exchange code → access_token + refresh_token
//   4. Encrypt and store in crm_tokens via token-store
//   5. Redirect installer to success or error page

import { NextRequest, NextResponse } from 'next/server'
import { cookies }                   from 'next/headers'
import { upsertToken }               from '@/lib/crm/token-store'

const CRM_TOKEN_URL = 'https://services.leadconnectorhq.com/oauth/token'
const SUCCESS_URL   = 'https://marketplace.rocketclients.com/install/success'
const ERROR_URL     = 'https://marketplace.rocketclients.com/install/error'

interface CRMTokenResponse {
  access_token:  string
  refresh_token: string
  token_type:    string
  expires_in:    number
  scope:         string
  locationId?:   string
  companyId?:    string
  userId?:       string
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl
  const code             = searchParams.get('code')
  const stateParam       = searchParams.get('state')
  const locationIdParam  = searchParams.get('locationId')

  if (!code || !stateParam) {
    return errorRedirect('Missing OAuth code or state parameter')
  }

  // ── Validate state nonce ──────────────────────────────────────────────────
  let passthrough: { nonce: string; plan: string; source: string; ts: number }
  try {
    passthrough = JSON.parse(Buffer.from(stateParam, 'base64url').toString())
  } catch {
    return errorRedirect('Invalid state parameter')
  }

  const cookieStore  = await cookies()
  const storedNonce  = cookieStore.get('add0n_oauth_nonce')?.value
  const codeVerifier = cookieStore.get('add0n_pkce_verifier')?.value

  if (!storedNonce || storedNonce !== passthrough.nonce) {
    return errorRedirect('State nonce mismatch — possible CSRF')
  }

  // Consume cookies
  cookieStore.delete('add0n_oauth_nonce')
  cookieStore.delete('add0n_pkce_verifier')

  // ── Exchange code for tokens ──────────────────────────────────────────────
  let tokens: CRMTokenResponse
  try {
    const body = new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     process.env.CRM_APP_CLIENT_ID!,
      client_secret: process.env.CRM_APP_CLIENT_SECRET!,
      redirect_uri:  process.env.CRM_OAUTH_REDIRECT_URI ??
        'https://marketplace.rocketclients.com/api/crm/oauth/callback',
      code,
    })
    if (codeVerifier) body.set('code_verifier', codeVerifier)

    const res = await fetch(CRM_TOKEN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) throw new Error(`Token exchange HTTP ${res.status}: ${await res.text()}`)
    tokens = await res.json()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Token exchange failed'
    console.error('[crm/oauth/callback]', msg)
    return errorRedirect(msg)
  }

  // ── Resolve IDs ───────────────────────────────────────────────────────────
  const locationId = tokens.locationId ?? locationIdParam
  const companyId  = tokens.companyId  ?? ''

  if (!locationId) {
    return errorRedirect('No locationId in token response — cannot store token')
  }

  // ── Store encrypted tokens ────────────────────────────────────────────────
  try {
    await upsertToken({
      location_id:       locationId,
      company_id:        companyId,
      access_token:      tokens.access_token,
      refresh_token:     tokens.refresh_token,
      token_type:        tokens.token_type ?? 'Bearer',
      expires_in:        tokens.expires_in  ?? 86400,
      scopes:            tokens.scope?.split(' ') ?? [],
      installed_by_user: tokens.userId,
      app_version:       '1.0',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Token store failed'
    console.error('[crm/oauth/callback]', msg)
    return errorRedirect(msg)
  }

  // ── Redirect to success ───────────────────────────────────────────────────
  const url = new URL(SUCCESS_URL)
  url.searchParams.set('location_id', locationId)
  url.searchParams.set('plan',        passthrough.plan)
  url.searchParams.set('source',      passthrough.source)
  return NextResponse.redirect(url.toString())
}

function errorRedirect(reason: string): NextResponse {
  const url = new URL(ERROR_URL)
  url.searchParams.set('reason', encodeURIComponent(reason))
  return NextResponse.redirect(url.toString())
}

// ─── Required env vars ────────────────────────────────────────────────────────
// CRM_APP_CLIENT_ID         — CRM Developer Portal
// CRM_APP_CLIENT_SECRET     — CRM Developer Portal (one-time display — store immediately)
// CRM_OAUTH_REDIRECT_URI    — https://marketplace.rocketclients.com/api/crm/oauth/callback
// CRM_TOKEN_ENCRYPTION_KEY  — openssl rand -hex 32
// NEXT_PUBLIC_SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY
