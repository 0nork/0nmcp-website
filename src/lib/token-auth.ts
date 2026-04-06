/**
 * 0n Access Token — Authentication & Resolution
 *
 * Validates 0n tokens (0n_xxx) and resolves to user identity.
 * Used by external clients (Claude Desktop, Cursor, CLI, Slack).
 * Web console uses Supabase session auth — this is for EXTERNAL access only.
 */

import { createClient } from '@supabase/supabase-js'

export interface TokenIdentity {
  userId: string
  email: string
  fullName: string
  crmLocationId: string | null
  crmContactId: string | null
  accessToken: string
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Validate an 0n access token and return the user's identity.
 * Returns null if invalid.
 */
export async function validateToken(token: string): Promise<TokenIdentity | null> {
  if (!token || !token.startsWith('0n_')) return null

  const admin = getAdmin()
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
  }
}

/**
 * Generate a new token for a user. Revokes the old one.
 */
export async function regenerateToken(userId: string): Promise<string | null> {
  const admin = getAdmin()

  // Generate cryptographically secure token
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  const newToken = `0n_${hex}`

  const { error } = await admin
    .from('profiles')
    .update({ access_token: newToken, token_created_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return null
  return newToken
}

/**
 * Get the token for a user (by user ID from session auth).
 */
export async function getTokenForUser(userId: string): Promise<string | null> {
  const admin = getAdmin()
  const { data, error } = await admin
    .from('profiles')
    .select('access_token')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data.access_token || null
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
