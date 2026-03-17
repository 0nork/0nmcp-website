// app/api/crm/oauth/install/route.ts
// Add0n — OAuth install entry point.
// Builds the CRM authorization URL with PKCE and redirects the installer.
//
// Registered in CRM Developer Portal as: OAuth Redirect URI (install leg)
// Install URL to share: https://marketplace.rocketclients.com/api/crm/oauth/install

import { NextRequest, NextResponse } from 'next/server'
import { cookies }                   from 'next/headers'
import crypto                        from 'crypto'

// ─── CRM OAuth endpoint ───────────────────────────────────────────────────────
// The consent screen — installers choose which sub-location to connect

const CRM_AUTH_URL = 'https://marketplace.gohighlevel.com/oauth/chooselocation'

// ─── Scopes ───────────────────────────────────────────────────────────────────
// Full Add0n scope set — covers website builder, workflow builder,
// pipeline builder, snapshot deploy, and future agent capabilities.

const SCOPES = [
  'contacts.readonly',
  'contacts.write',
  'conversations.readonly',
  'conversations.write',
  'conversations/message.write',
  'conversations/message.readonly',
  'opportunities.readonly',
  'opportunities.write',
  'locations.readonly',
  'notes.write',
  'workflows.readonly',
  'funnels.readonly',
  'funnels.write',
  'medias.readonly',
  'medias.write',
].join(' ')

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const clientId    = process.env.CRM_APP_CLIENT_ID
  const redirectUri = process.env.CRM_OAUTH_REDIRECT_URI ??
    'https://marketplace.rocketclients.com/api/crm/oauth/callback'

  if (!clientId) {
    return NextResponse.json({ error: 'CRM_APP_CLIENT_ID not configured' }, { status: 500 })
  }

  // ── PKCE ─────────────────────────────────────────────────────────────────
  const codeVerifier  = crypto.randomBytes(64).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  // ── State — CSRF nonce + install metadata ─────────────────────────────────
  const nonce      = crypto.randomBytes(16).toString('hex')
  const state      = Buffer.from(JSON.stringify({
    nonce,
    plan:   req.nextUrl.searchParams.get('plan')   ?? 'standard',
    source: req.nextUrl.searchParams.get('source') ?? 'direct',
    ts:     Date.now(),
  })).toString('base64url')

  // ── Store in httpOnly cookies (30 min TTL) ────────────────────────────────
  const cookieStore = await cookies()
  cookieStore.set('add0n_pkce_verifier', codeVerifier, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 1800, path: '/api/crm/oauth',
  })
  cookieStore.set('add0n_oauth_nonce', nonce, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 1800, path: '/api/crm/oauth',
  })

  // ── Build and redirect ────────────────────────────────────────────────────
  const params = new URLSearchParams({
    response_type:         'code',
    client_id:             clientId,
    redirect_uri:          redirectUri,
    scope:                 SCOPES,
    state,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
  })

  return NextResponse.redirect(`${CRM_AUTH_URL}?${params.toString()}`)
}

// ─── Required env vars ────────────────────────────────────────────────────────
// CRM_APP_CLIENT_ID        — CRM Developer Portal → My Apps → Client Credentials
// CRM_OAUTH_REDIRECT_URI   — https://marketplace.rocketclients.com/api/crm/oauth/callback
