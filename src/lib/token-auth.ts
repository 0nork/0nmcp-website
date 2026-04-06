/**
 * 0n Access Token — Authentication & Resolution
 *
 * Validates 0n tokens (0n_xxx) and resolves to user identity.
 * Used by external clients (Claude Desktop, Cursor, CLI, Slack).
 * Web console uses Supabase session auth — this is for EXTERNAL access only.
 *
 * Supports two token types:
 *   1. Scoped tokens — stored in `access_tokens` table (preferred)
 *   2. Master token  — stored in `profiles.access_token` (legacy / default)
 */

import { createClient } from '@supabase/supabase-js'

export interface TokenIdentity {
  userId: string
  email: string
  fullName: string
  crmLocationId: string | null
  crmContactId: string | null
  accessToken: string
  permissions: string[]
  tokenType: 'master' | 'scoped'
  tokenId?: string
  label?: string
  expiresAt?: string
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Validate an 0n access token and return the user's identity.
 * Checks scoped tokens first, then falls back to master token on profiles.
 * Returns null if invalid.
 */
export async function validateToken(token: string): Promise<TokenIdentity | null> {
  if (!token || !token.startsWith('0n_')) return null

  const admin = getAdmin()

  // --- 1. Check scoped tokens (access_tokens table) ---
  const { data: scopedToken, error: scopedError } = await admin
    .from('access_tokens')
    .select('id, user_id, token, label, permissions, expires_at, is_revoked')
    .eq('token', token)
    .single()

  if (!scopedError && scopedToken) {
    // Revoked?
    if (scopedToken.is_revoked) return null

    // Expired?
    if (scopedToken.expires_at && new Date(scopedToken.expires_at) < new Date()) return null

    // Fetch profile for this user
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id, email, full_name, crm_location_id, crm_contact_id')
      .eq('id', scopedToken.user_id)
      .single()

    if (profileError || !profile) return null

    // Update last_used_at (fire and forget)
    admin
      .from('access_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', scopedToken.id)
      .then(() => { /* ignore */ })

    return {
      userId: profile.id,
      email: profile.email || '',
      fullName: profile.full_name || '',
      crmLocationId: profile.crm_location_id || null,
      crmContactId: profile.crm_contact_id || null,
      accessToken: token,
      permissions: scopedToken.permissions || ['all'],
      tokenType: 'scoped',
      tokenId: scopedToken.id,
      label: scopedToken.label || undefined,
      expiresAt: scopedToken.expires_at || undefined,
    }
  }

  // --- 2. Fall back to master token (profiles.access_token) ---
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, full_name, crm_location_id, crm_contact_id, access_token')
    .eq('access_token', token)
    .single()

  if (error || !data) return null

  return {
    userId: data.id,
    email: data.email || '',
    fullName: data.full_name || '',
    crmLocationId: data.crm_location_id || null,
    crmContactId: data.crm_contact_id || null,
    accessToken: data.access_token,
    permissions: ['all'],
    tokenType: 'master',
  }
}

/**
 * Generate a new master token for a user. Revokes the old one.
 */
export async function regenerateToken(userId: string): Promise<string | null> {
  const admin = getAdmin()

  // Use Node.js crypto for server-side token generation
  const { randomBytes } = await import('crypto')
  const hex = randomBytes(24).toString('hex')
  const newToken = `0n_${hex}`

  const { error } = await admin
    .from('profiles')
    .update({ access_token: newToken, token_created_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return null
  return newToken
}

/**
 * Create a scoped access token.
 */
export async function createScopedToken(
  userId: string,
  options: { label?: string; permissions?: string[]; expiresAt?: string | null }
): Promise<{ token: string; id: string; label: string; permissions: string[]; expires_at: string | null } | null> {
  const admin = getAdmin()

  // Use Node.js crypto for server-side token generation
  const { randomBytes } = await import('crypto')
  const hex = randomBytes(24).toString('hex')
  const token = `0n_${hex}`

  const label = options.label || 'My Token'
  const permissions = options.permissions || ['all']
  const expiresAt = options.expiresAt || null

  const { data, error } = await admin
    .from('access_tokens')
    .insert({
      user_id: userId,
      token,
      label,
      permissions,
      expires_at: expiresAt,
    })
    .select('id, label, permissions, expires_at')
    .single()

  if (error) {
    console.error('[token-auth] createScopedToken insert error:', error.message, error.details)
    return null
  }
  if (!data) return null

  return {
    token,
    id: data.id,
    label: data.label,
    permissions: data.permissions,
    expires_at: data.expires_at,
  }
}

/**
 * Revoke a scoped token (soft delete).
 */
export async function revokeScopedToken(userId: string, tokenId: string): Promise<boolean> {
  const admin = getAdmin()

  const { error } = await admin
    .from('access_tokens')
    .update({ is_revoked: true })
    .eq('id', tokenId)
    .eq('user_id', userId)

  return !error
}

/**
 * List all scoped tokens for a user.
 */
export async function listScopedTokens(userId: string) {
  const admin = getAdmin()

  const { data, error } = await admin
    .from('access_tokens')
    .select('id, token, label, permissions, expires_at, created_at, last_used_at, is_revoked')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map(t => ({
    id: t.id,
    label: t.label,
    permissions: t.permissions,
    expires_at: t.expires_at,
    created_at: t.created_at,
    last_used_at: t.last_used_at,
    is_revoked: t.is_revoked,
    token_preview: t.token ? `${t.token.slice(0, 6)}...${t.token.slice(-4)}` : '',
  }))
}

/**
 * Get the master token for a user (by user ID from session auth).
 */
export async function getTokenForUser(userId: string): Promise<{ token: string; created_at: string | null } | null> {
  const admin = getAdmin()
  const { data, error } = await admin
    .from('profiles')
    .select('access_token, token_created_at')
    .eq('id', userId)
    .single()

  if (error || !data || !data.access_token) return null
  return { token: data.access_token, created_at: data.token_created_at || null }
}

/**
 * Extract token from request headers.
 * Supports: Authorization: Bearer 0n_xxx
 * Or: X-0n-Token: 0n_xxx
 */
export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer 0n_')) {
    return authHeader.slice(7)
  }

  const tokenHeader = request.headers.get('x-0n-token')
  if (tokenHeader?.startsWith('0n_')) {
    return tokenHeader
  }

  return null
}

/**
 * Resolve auth from either session or token.
 * Returns userId or null.
 */
export async function resolveAuth(request: Request): Promise<{ userId: string; source: 'session' | 'token' } | null> {
  // Try token first (external clients)
  const token = extractToken(request)
  if (token) {
    const identity = await validateToken(token)
    if (identity) return { userId: identity.userId, source: 'token' }
  }

  // Fall back to session auth (web console)
  try {
    const { createSupabaseServer } = await import('@/lib/supabase/server')
    const supabase = await createSupabaseServer()
    if (!supabase) return null
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return { userId: user.id, source: 'session' }
  } catch { /* ignore */ }

  return null
}
