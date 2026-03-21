/**
 * lib/oauth.ts
 * Core OAuth 2.0 server logic for 0nmcp.com
 * Used by all /api/oauth/* routes
 */

import { createClient } from '@supabase/supabase-js'
import { createHash, randomBytes } from 'crypto'

// ── Supabase (service role — bypasses RLS) ──────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ── Constants ────────────────────────────────────────────────────────────────
const CODE_TTL_MS    = 10 * 60 * 1000        // 10 minutes
const ACCESS_TTL_MS  = 60 * 60 * 1000        // 1 hour
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000  // 30 days

export const ALLOWED_SCOPES = [
  'vault:read',
  'vault:write',
  'runs:read',
  'runs:spend',
  'workflows:execute',
  'brain:read',
  'brain:contribute',
] as const

export type OAuthScope = typeof ALLOWED_SCOPES[number]

// ── Crypto helpers ───────────────────────────────────────────────────────────

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function generateToken(prefix: string = ''): string {
  const rand = randomBytes(32).toString('hex')
  return prefix ? `${prefix}_${rand}` : rand
}

// ── Client validation ────────────────────────────────────────────────────────

export interface OAuthClient {
  client_id: string
  name: string
  redirect_uris: string[]
  allowed_scopes: string[]
}

export async function getClient(clientId: string): Promise<OAuthClient | null> {
  const { data } = await supabase
    .from('oauth_clients')
    .select('client_id, name, redirect_uris, allowed_scopes')
    .eq('client_id', clientId)
    .single()
  return data ?? null
}

export async function validateClientSecret(
  clientId: string,
  clientSecret: string
): Promise<boolean> {
  const { data } = await supabase
    .from('oauth_clients')
    .select('client_secret')
    .eq('client_id', clientId)
    .single()
  if (!data) return false
  return data.client_secret === sha256(clientSecret)
}

export function validateRedirectUri(client: OAuthClient, uri: string): boolean {
  return client.redirect_uris.includes(uri)
}

export function validateScopes(
  requested: string[],
  allowed: string[]
): { valid: boolean; scopes: string[] } {
  const valid = requested.filter(s => allowed.includes(s))
  return {
    valid: valid.length > 0 && valid.length === requested.length,
    scopes: valid,
  }
}

// ── Authorization codes ──────────────────────────────────────────────────────

export async function createAuthCode(
  clientId: string,
  userId: string,
  redirectUri: string,
  scopes: string[]
): Promise<string> {
  const code = generateToken('code')
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString()

  const { error } = await supabase.from('oauth_codes').insert({
    code,
    client_id: clientId,
    user_id: userId,
    redirect_uri: redirectUri,
    scopes,
    expires_at: expiresAt,
  })

  if (error) throw new Error(`Failed to create auth code: ${error.message}`)
  return code
}

export async function consumeAuthCode(
  code: string,
  clientId: string,
  redirectUri: string
): Promise<{ userId: string; scopes: string[] } | null> {
  const { data, error } = await supabase
    .from('oauth_codes')
    .select('*')
    .eq('code', code)
    .eq('client_id', clientId)
    .eq('redirect_uri', redirectUri)
    .eq('used', false)
    .single()

  if (error || !data) return null

  // Check expiry
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('oauth_codes').delete().eq('id', data.id)
    return null
  }

  // Mark used (one-time use)
  await supabase.from('oauth_codes').update({ used: true }).eq('id', data.id)

  return { userId: data.user_id, scopes: data.scopes }
}

// ── Token management ─────────────────────────────────────────────────────────

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: 'Bearer'
  expires_in: number
  scope: string
}

export async function issueTokens(
  clientId: string,
  userId: string,
  scopes: string[]
): Promise<TokenPair> {
  const accessToken  = generateToken('0n')
  const refreshToken = generateToken('ref')
  const now = Date.now()

  const { error } = await supabase.from('oauth_tokens').insert({
    access_token:       accessToken,
    refresh_token:      refreshToken,
    client_id:          clientId,
    user_id:            userId,
    scopes,
    access_expires_at:  new Date(now + ACCESS_TTL_MS).toISOString(),
    refresh_expires_at: new Date(now + REFRESH_TTL_MS).toISOString(),
  })

  if (error) throw new Error(`Failed to issue tokens: ${error.message}`)

  return {
    access_token:  accessToken,
    refresh_token: refreshToken,
    token_type:    'Bearer',
    expires_in:    ACCESS_TTL_MS / 1000,
    scope:         scopes.join(' '),
  }
}

export async function rotateRefreshToken(
  refreshToken: string,
  clientId: string
): Promise<TokenPair | null> {
  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('*')
    .eq('refresh_token', refreshToken)
    .eq('client_id', clientId)
    .eq('revoked', false)
    .single()

  if (error || !data) return null

  // Check refresh token expiry
  if (data.refresh_expires_at && new Date(data.refresh_expires_at) < new Date()) {
    await supabase.from('oauth_tokens').update({ revoked: true }).eq('id', data.id)
    return null
  }

  // Revoke old token
  await supabase.from('oauth_tokens').update({ revoked: true }).eq('id', data.id)

  // Issue fresh pair
  return issueTokens(clientId, data.user_id, data.scopes)
}

export async function revokeToken(token: string): Promise<boolean> {
  const { error } = await supabase
    .from('oauth_tokens')
    .update({ revoked: true })
    .or(`access_token.eq.${token},refresh_token.eq.${token}`)

  return !error
}

// ── Token introspection (used by /api/skill/* to validate bearer tokens) ─────

export interface TokenInfo {
  userId: string
  clientId: string
  scopes: string[]
  expiresAt: Date
}

export async function introspectToken(accessToken: string): Promise<TokenInfo | null> {
  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('user_id, client_id, scopes, access_expires_at, revoked')
    .eq('access_token', accessToken)
    .single()

  if (error || !data || data.revoked) return null
  if (new Date(data.access_expires_at) < new Date()) return null

  return {
    userId:    data.user_id,
    clientId:  data.client_id,
    scopes:    data.scopes,
    expiresAt: new Date(data.access_expires_at),
  }
}

// ── Middleware helper: require OAuth scope ───────────────────────────────────

export async function requireScope(
  request: Request,
  scope: OAuthScope
): Promise<{ tokenInfo: TokenInfo } | Response> {
  const auth = request.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null

  if (!token) {
    return new Response(
      JSON.stringify({ error: 'unauthorized', message: 'Missing Bearer token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const tokenInfo = await introspectToken(token)
  if (!tokenInfo) {
    return new Response(
      JSON.stringify({ error: 'invalid_token', message: 'Token expired or revoked' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!tokenInfo.scopes.includes(scope)) {
    return new Response(
      JSON.stringify({ error: 'insufficient_scope', message: `Requires scope: ${scope}` }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return { tokenInfo }
}

// ── OAuth error response builder ─────────────────────────────────────────────

export function oauthError(
  error: string,
  description: string,
  redirectUri?: string,
  state?: string
): Response {
  if (redirectUri) {
    const url = new URL(redirectUri)
    url.searchParams.set('error', error)
    url.searchParams.set('error_description', description)
    if (state) url.searchParams.set('state', state)
    return Response.redirect(url.toString(), 302)
  }
  return new Response(
    JSON.stringify({ error, error_description: description }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  )
}
