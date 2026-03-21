import { createSupabaseAdmin } from '@/lib/supabase/admin'

// ─── Constants ──────────────────────────────────────────────────────────────

const ACCESS_TOKEN_EXPIRY  = 60 * 60              // 1 hour (seconds)
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60    // 30 days (seconds)
const AUTH_CODE_EXPIRY     = 10 * 60               // 10 minutes (seconds)

const VALID_SCOPES = [
  'openid', 'email', 'profile',
  'read:vault', 'write:vault',
  'read:workflows', 'write:workflows',
] as const

type ValidScope = (typeof VALID_SCOPES)[number]

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OAuthClient {
  id: string
  client_id: string
  client_secret_hash: string | null
  app_name: string
  app_logo_url: string | null
  redirect_uris: string[]
  allowed_scopes: string[]
  is_confidential: boolean
  is_active: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  refresh_token: string
  scope: string
}

export interface TokenData {
  userId: string
  scopes: string[]
  clientId: string
}

// ─── Crypto Helpers (Web Crypto API — Edge-compatible) ──────────────────────

function generateRandomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  // base64url encode
  const base64 = btoa(String.fromCharCode(...bytes))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function hashToken(token: string): Promise<string> {
  const encoded = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(digest))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function generateAuthCode(): string {
  return generateRandomToken(32)
}

function generateAccessToken(): string {
  return '0nat_' + generateRandomToken(32)
}

function generateRefreshToken(): string {
  return '0nrt_' + generateRandomToken(48)
}

// ─── PKCE ───────────────────────────────────────────────────────────────────

async function verifyPkce(
  codeVerifier: string,
  codeChallenge: string,
  method: string
): Promise<boolean> {
  if (method === 'plain') {
    return codeVerifier === codeChallenge
  }
  // S256: BASE64URL(SHA256(code_verifier)) === code_challenge
  const encoded = new TextEncoder().encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
  const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return base64url === codeChallenge
}

// ─── Validation ─────────────────────────────────────────────────────────────

export function validateScopes(requested: string[]): { valid: boolean; scopes: ValidScope[] } {
  const scopes = requested.filter((s): s is ValidScope =>
    (VALID_SCOPES as readonly string[]).includes(s)
  )
  return { valid: scopes.length === requested.length, scopes }
}

export async function validateClient(
  clientId: string,
  clientSecret?: string
): Promise<OAuthClient | null> {
  const admin = createSupabaseAdmin()
  if (!admin) return null

  const { data: client } = await admin
    .from('oauth_clients')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .single()

  if (!client) return null

  // Confidential clients must provide a valid secret
  if (client.is_confidential) {
    if (!clientSecret) return null
    const secretHash = await hashToken(clientSecret)
    if (secretHash !== client.client_secret_hash) return null
  }

  return client as OAuthClient
}

export function validateRedirectUri(client: OAuthClient, redirectUri: string): boolean {
  return client.redirect_uris.includes(redirectUri)
}

// ─── Client Credentials Parsing ─────────────────────────────────────────────

export function parseClientCredentials(
  request: Request,
  body: Record<string, string>
): { clientId: string; clientSecret?: string } {
  // Check Authorization: Basic header first
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Basic ')) {
    const decoded = atob(authHeader.slice(6))
    const colonIndex = decoded.indexOf(':')
    if (colonIndex > 0) {
      return {
        clientId: decodeURIComponent(decoded.slice(0, colonIndex)),
        clientSecret: decodeURIComponent(decoded.slice(colonIndex + 1)),
      }
    }
  }

  // Fall back to body params
  return {
    clientId: body.client_id || '',
    clientSecret: body.client_secret || undefined,
  }
}

// ─── Authorization Code ─────────────────────────────────────────────────────

export async function storeAuthCode(params: {
  code: string
  clientId: string
  userId: string
  redirectUri: string
  scope: string
  state?: string
  codeChallenge?: string
  codeChallengeMethod?: string
}): Promise<void> {
  const admin = createSupabaseAdmin()
  if (!admin) throw new Error('Database unavailable')

  const codeHash = await hashToken(params.code)
  const expiresAt = new Date(Date.now() + AUTH_CODE_EXPIRY * 1000).toISOString()

  const { error } = await admin.from('oauth_authorization_codes').insert({
    code_hash: codeHash,
    client_id: params.clientId,
    user_id: params.userId,
    redirect_uri: params.redirectUri,
    scope: params.scope,
    state: params.state || null,
    code_challenge: params.codeChallenge || null,
    code_challenge_method: params.codeChallengeMethod || null,
    expires_at: expiresAt,
  })

  if (error) throw new Error(`Failed to store auth code: ${error.message}`)
}

export async function exchangeAuthCode(
  code: string,
  clientId: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<TokenResponse> {
  const admin = createSupabaseAdmin()
  if (!admin) throw new Error('Database unavailable')

  const codeHash = await hashToken(code)

  // Atomically mark code as used (prevents replay)
  const { data: authCode, error } = await admin
    .from('oauth_authorization_codes')
    .update({ used: true })
    .eq('code_hash', codeHash)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .select()
    .single()

  if (error || !authCode) throw new Error('Invalid or expired authorization code')
  if (authCode.client_id !== clientId) throw new Error('Client ID mismatch')
  if (authCode.redirect_uri !== redirectUri) throw new Error('Redirect URI mismatch')

  // PKCE verification
  if (authCode.code_challenge) {
    if (!codeVerifier) throw new Error('Code verifier required')
    const valid = await verifyPkce(
      codeVerifier,
      authCode.code_challenge,
      authCode.code_challenge_method || 'S256'
    )
    if (!valid) throw new Error('PKCE verification failed')
  }

  // Generate tokens
  const accessToken = generateAccessToken()
  const refreshToken = generateRefreshToken()
  const scopes = authCode.scope.split(' ').filter(Boolean)
  const now = Date.now()

  const accessHash = await hashToken(accessToken)
  const refreshHash = await hashToken(refreshToken)

  // Store both tokens
  const [accessResult, refreshResult] = await Promise.all([
    admin.from('oauth_access_tokens').insert({
      token_hash: accessHash,
      client_id: clientId,
      user_id: authCode.user_id,
      scopes,
      expires_at: new Date(now + ACCESS_TOKEN_EXPIRY * 1000).toISOString(),
    }),
    admin.from('oauth_refresh_tokens').insert({
      token_hash: refreshHash,
      client_id: clientId,
      user_id: authCode.user_id,
      scopes,
      expires_at: new Date(now + REFRESH_TOKEN_EXPIRY * 1000).toISOString(),
    }),
  ])

  if (accessResult.error) throw new Error(`Failed to store access token: ${accessResult.error.message}`)
  if (refreshResult.error) throw new Error(`Failed to store refresh token: ${refreshResult.error.message}`)

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_EXPIRY,
    refresh_token: refreshToken,
    scope: authCode.scope,
  }
}

// ─── Refresh ────────────────────────────────────────────────────────────────

export async function refreshAccessToken(
  refreshToken: string,
  clientId: string
): Promise<TokenResponse> {
  const admin = createSupabaseAdmin()
  if (!admin) throw new Error('Database unavailable')

  const tokenHash = await hashToken(refreshToken)

  const { data: stored } = await admin
    .from('oauth_refresh_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .eq('revoked', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!stored) throw new Error('Invalid or expired refresh token')
  if (stored.client_id !== clientId) throw new Error('Client ID mismatch')

  // Generate new access token
  const accessToken = generateAccessToken()
  const accessHash = await hashToken(accessToken)

  const { error } = await admin.from('oauth_access_tokens').insert({
    token_hash: accessHash,
    client_id: clientId,
    user_id: stored.user_id,
    scopes: stored.scopes,
    expires_at: new Date(Date.now() + ACCESS_TOKEN_EXPIRY * 1000).toISOString(),
  })

  if (error) throw new Error(`Failed to store access token: ${error.message}`)

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_EXPIRY,
    refresh_token: refreshToken, // same refresh token
    scope: stored.scopes.join(' '),
  }
}

// ─── Revocation ─────────────────────────────────────────────────────────────

export async function revokeToken(
  token: string,
  tokenTypeHint?: 'access_token' | 'refresh_token'
): Promise<void> {
  const admin = createSupabaseAdmin()
  if (!admin) return

  const tokenHash = await hashToken(token)

  if (tokenTypeHint === 'access_token') {
    await admin.from('oauth_access_tokens').delete().eq('token_hash', tokenHash)
  } else if (tokenTypeHint === 'refresh_token') {
    await admin.from('oauth_refresh_tokens').update({ revoked: true }).eq('token_hash', tokenHash)
  } else {
    // Try both
    const { count } = await admin
      .from('oauth_refresh_tokens')
      .update({ revoked: true })
      .eq('token_hash', tokenHash)
      .select('*', { count: 'exact', head: true })

    if (!count) {
      await admin.from('oauth_access_tokens').delete().eq('token_hash', tokenHash)
    }
  }
}

// ─── Token Validation ───────────────────────────────────────────────────────

export async function validateAccessToken(token: string): Promise<TokenData | null> {
  const admin = createSupabaseAdmin()
  if (!admin) return null

  const tokenHash = await hashToken(token)

  const { data } = await admin
    .from('oauth_access_tokens')
    .select('user_id, scopes, client_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!data) return null

  return {
    userId: data.user_id,
    scopes: data.scopes,
    clientId: data.client_id,
  }
}

export function requireScope(...requiredScopes: string[]) {
  return async (token: string): Promise<TokenData | null> => {
    const tokenData = await validateAccessToken(token)
    if (!tokenData) return null
    const hasAll = requiredScopes.every(s => tokenData.scopes.includes(s))
    return hasAll ? tokenData : null
  }
}
