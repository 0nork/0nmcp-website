/**
 * Google OAuth — Server-side token exchange & refresh
 *
 * Handles the full lifecycle:
 * 1. Build consent URL with expanded scopes
 * 2. Exchange authorization code for tokens
 * 3. Refresh expired access tokens
 * 4. Fetch valid token from DB (auto-refresh if expired)
 */

import { createClient } from '@supabase/supabase-js'
import { GOOGLE_CONNECT_SCOPES } from './google-scopes'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'
  return `${base}/api/auth/google-connect/callback`
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/** Build Google OAuth consent URL with all scopes */
export function getGoogleConnectUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: GOOGLE_CONNECT_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: userId,
    include_granted_scopes: 'true',
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

/** Exchange authorization code for access + refresh tokens */
export async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: getRedirectUri(),
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google token exchange failed: ${err}`)
  }

  return res.json()
}

/** Refresh an expired access token using the refresh token */
export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google token refresh failed: ${err}`)
  }

  return res.json()
}

/** Get a valid access token for a user, auto-refreshing if expired */
export async function getValidGoogleToken(userId: string): Promise<{
  accessToken: string
  scopes: string[]
} | null> {
  const admin = getAdminClient()
  if (!admin) return null

  const { data, error } = await admin
    .from('google_oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  const expiresAt = new Date(data.token_expires_at)
  const now = new Date()

  // Token still valid (with 5-minute buffer)
  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return { accessToken: data.access_token, scopes: data.scopes }
  }

  // Token expired — refresh it
  try {
    const refreshed = await refreshGoogleToken(data.refresh_token)
    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000)

    await admin.from('google_oauth_tokens').update({
      access_token: refreshed.access_token,
      token_expires_at: newExpiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)

    return {
      accessToken: refreshed.access_token,
      scopes: data.scopes,
    }
  } catch {
    return null
  }
}

/** Store tokens in the database (upsert) */
export async function storeGoogleTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  scopes: string[]
): Promise<void> {
  const admin = getAdminClient()
  if (!admin) throw new Error('Missing Supabase admin client')

  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  const { error } = await admin.from('google_oauth_tokens').upsert({
    user_id: userId,
    access_token: accessToken,
    refresh_token: refreshToken,
    token_expires_at: expiresAt.toISOString(),
    scopes,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (error) throw new Error(`Failed to store Google tokens: ${error.message}`)
}
