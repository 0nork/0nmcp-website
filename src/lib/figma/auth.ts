/**
 * Figma OAuth — Server-side token exchange, refresh & storage
 *
 * Follows the same pattern as google-auth.ts:
 * 1. Build consent URL with CSRF state
 * 2. Exchange authorization code for tokens
 * 3. Refresh expired access tokens
 * 4. Fetch valid token from DB (auto-refresh if expired)
 */

import { createClient } from '@supabase/supabase-js'
import { encryptVaultData, decryptVaultData } from '@/lib/vault-crypto'
import type { FigmaTokenResponse, FigmaTokens, FigmaUser } from './types'

const FIGMA_CLIENT_ID = process.env.FIGMA_CLIENT_ID || ''
const FIGMA_CLIENT_SECRET = process.env.FIGMA_CLIENT_SECRET || ''
const FIGMA_REDIRECT_URI = process.env.FIGMA_OAUTH_REDIRECT_URI || 'https://0nmcp.com/api/figma/oauth/callback'
const FIGMA_AUTH_URL = 'https://www.figma.com/oauth'
const FIGMA_TOKEN_URL = 'https://api.figma.com/v1/oauth/token'

const FIGMA_SCOPES = [
  'file_read',
  'file_variables:read',
  'file_variables:write',
  'webhooks:write',
  'file_comments:write',
]

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/** Generate a CSRF state, store it, and return the Figma consent URL */
export async function initiateFigmaOAuth(userId: string): Promise<string> {
  const admin = getAdminClient()
  if (!admin) throw new Error('Missing Supabase admin client')

  // Generate CSRF state
  const state = crypto.randomUUID()

  // Store state for verification on callback
  await admin.from('figma_oauth_states').insert({
    state,
    user_id: userId,
  })

  // Clean up old expired states (fire and forget)
  try { await admin.rpc('clean_expired_figma_states') } catch { /* non-fatal */ }

  const params = new URLSearchParams({
    client_id: FIGMA_CLIENT_ID,
    redirect_uri: FIGMA_REDIRECT_URI,
    scope: FIGMA_SCOPES.join(','),
    state,
    response_type: 'code',
  })

  return `${FIGMA_AUTH_URL}?${params.toString()}`
}

/** Verify CSRF state from callback — returns userId if valid */
export async function verifyOAuthState(state: string): Promise<string | null> {
  const admin = getAdminClient()
  if (!admin) return null

  const { data, error } = await admin
    .from('figma_oauth_states')
    .select('user_id, created_at, used')
    .eq('state', state)
    .single()

  if (error || !data) return null

  // Check not already used
  if (data.used) return null

  // Check not expired (10 minutes)
  const createdAt = new Date(data.created_at)
  if (Date.now() - createdAt.getTime() > 10 * 60 * 1000) return null

  // Mark as used
  await admin
    .from('figma_oauth_states')
    .update({ used: true })
    .eq('state', state)

  return data.user_id
}

/** Exchange authorization code for tokens */
export async function exchangeFigmaCode(code: string): Promise<FigmaTokenResponse> {
  const res = await fetch(FIGMA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: FIGMA_CLIENT_ID,
      client_secret: FIGMA_CLIENT_SECRET,
      redirect_uri: FIGMA_REDIRECT_URI,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Figma token exchange failed: ${err}`)
  }

  return res.json()
}

/** Refresh an expired access token */
async function refreshFigmaToken(refreshToken: string): Promise<FigmaTokenResponse> {
  const res = await fetch(FIGMA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: FIGMA_CLIENT_ID,
      client_secret: FIGMA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Figma token refresh failed: ${err}`)
  }

  return res.json()
}

/** Fetch current Figma user profile */
export async function fetchFigmaUser(accessToken: string): Promise<FigmaUser> {
  const res = await fetch('https://api.figma.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Figma /me failed: ${res.status}`)
  }

  return res.json()
}

/** Store encrypted tokens + user info in figma_connections */
export async function storeFigmaConnection(
  userId: string,
  tokens: FigmaTokenResponse,
  figmaUser: FigmaUser
): Promise<void> {
  const admin = getAdminClient()
  if (!admin) throw new Error('Missing Supabase admin client')

  const tokenData: FigmaTokens = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
  }

  const { encrypted, iv, salt } = await encryptVaultData(
    userId,
    JSON.stringify(tokenData)
  )

  const { error } = await admin.from('figma_connections').upsert({
    user_id: userId,
    figma_user_id: figmaUser.id,
    handle: figmaUser.handle,
    email: figmaUser.email,
    encrypted_tokens: encrypted,
    iv,
    salt,
    scopes: FIGMA_SCOPES,
    connected_at: new Date().toISOString(),
    last_refreshed_at: new Date().toISOString(),
    is_active: true,
  }, { onConflict: 'user_id' })

  if (error) throw new Error(`Failed to store Figma connection: ${error.message}`)
}

/** Get a valid Figma access token, auto-refreshing if expired */
export async function getFigmaAccessToken(userId: string): Promise<string | null> {
  const admin = getAdminClient()
  if (!admin) return null

  const { data, error } = await admin
    .from('figma_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  // Decrypt stored tokens
  let tokens: FigmaTokens
  try {
    const plaintext = await decryptVaultData(
      userId,
      data.encrypted_tokens,
      data.iv,
      data.salt
    )
    tokens = JSON.parse(plaintext)
  } catch {
    return null
  }

  // Token still valid (with 5-minute buffer)
  if (tokens.expires_at - Date.now() > 5 * 60 * 1000) {
    return tokens.access_token
  }

  // Token expired — refresh
  try {
    const refreshed = await refreshFigmaToken(tokens.refresh_token)

    const newTokens: FigmaTokens = {
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: Date.now() + refreshed.expires_in * 1000,
    }

    const { encrypted, iv, salt } = await encryptVaultData(
      userId,
      JSON.stringify(newTokens)
    )

    await admin.from('figma_connections').update({
      encrypted_tokens: encrypted,
      iv,
      salt,
      last_refreshed_at: new Date().toISOString(),
    }).eq('user_id', userId)

    return refreshed.access_token
  } catch {
    return null
  }
}

/** Soft-delete a Figma connection */
export async function disconnectFigma(userId: string): Promise<void> {
  const admin = getAdminClient()
  if (!admin) throw new Error('Missing Supabase admin client')

  await admin
    .from('figma_connections')
    .update({ is_active: false })
    .eq('user_id', userId)
}

/** Get connection status (safe for client) */
export async function getFigmaConnectionStatus(userId: string) {
  const admin = getAdminClient()
  if (!admin) return { connected: false }

  const { data } = await admin
    .from('figma_connections')
    .select('handle, email, scopes, connected_at, is_active')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (!data) return { connected: false }

  return {
    connected: true,
    handle: data.handle,
    email: data.email,
    scopes: data.scopes,
    connected_at: data.connected_at,
  }
}
