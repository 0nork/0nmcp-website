import { createClient } from '@supabase/supabase-js'
import type { RedditProfile, RedditTokens } from '@/lib/reddit/types'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/authorize'
const REDDIT_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token'
const REDDIT_PROFILE_URL = 'https://oauth.reddit.com/api/v1/me'

const SCOPES = ['identity', 'submit', 'read', 'mysubreddits']
const USER_AGENT = '0nMCP/2.0 (by /u/0nork)'

function getClientId(): string {
  return process.env.REDDIT_OAUTH_CLIENT_ID || process.env.REDDIT_CLIENT_ID || ''
}

function getClientSecret(): string {
  return process.env.REDDIT_OAUTH_CLIENT_SECRET || process.env.REDDIT_CLIENT_SECRET || ''
}

function getBasicAuth(): string {
  return Buffer.from(`${getClientId()}:${getClientSecret()}`).toString('base64')
}

/**
 * Build the Reddit OAuth authorization URL.
 */
export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    response_type: 'code',
    state,
    redirect_uri: getRedirectUri(),
    duration: 'permanent',
    scope: SCOPES.join(' '),
  })
  return `${REDDIT_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for tokens.
 * Reddit uses HTTP Basic Auth (not POST body params like LinkedIn).
 */
export async function exchangeCode(code: string): Promise<RedditTokens> {
  const res = await fetch(REDDIT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${getBasicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Reddit token exchange failed: ${res.status} — ${err}`)
  }

  return res.json()
}

/**
 * Refresh an expired access token.
 * Reddit tokens expire every hour — must refresh before API calls.
 */
export async function refreshAccessToken(refreshToken: string): Promise<RedditTokens> {
  const res = await fetch(REDDIT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${getBasicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Reddit token refresh failed: ${res.status} — ${err}`)
  }

  const data = await res.json()
  // Reddit reuses the same refresh_token — ensure it's in the response
  return {
    ...data,
    refresh_token: data.refresh_token || refreshToken,
  }
}

/**
 * Fetch the Reddit user profile using an access token.
 */
export async function fetchProfile(accessToken: string): Promise<RedditProfile> {
  const res = await fetch(REDDIT_PROFILE_URL, {
    headers: {
      'Authorization': `bearer ${accessToken}`,
      'User-Agent': USER_AGENT,
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Reddit profile fetch failed: ${res.status} — ${err}`)
  }

  return res.json()
}

/**
 * Create or update a social_connections record for Reddit.
 */
export async function upsertConnection(
  userId: string,
  profile: RedditProfile,
  tokens: RedditTokens
): Promise<void> {
  const admin = getAdmin()

  const connectionData = {
    user_id: userId,
    platform: 'reddit',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    platform_user_id: profile.id,
    platform_username: profile.name,
    platform_avatar_url: profile.icon_img?.split('?')[0] || null,
    platform_metadata: {
      total_karma: profile.total_karma,
      link_karma: profile.link_karma,
      comment_karma: profile.comment_karma,
      subreddit: profile.subreddit?.display_name_prefixed || null,
    },
    is_connected: true,
    updated_at: new Date().toISOString(),
  }

  const { error } = await admin
    .from('social_connections')
    .upsert(connectionData, { onConflict: 'user_id,platform' })

  if (error) throw new Error(`Failed to save Reddit connection: ${error.message}`)
}

/**
 * Get a user's Reddit connection, refreshing the token if expired.
 */
export async function getConnection(userId: string) {
  const admin = getAdmin()

  const { data: conn } = await admin
    .from('social_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', 'reddit')
    .eq('is_connected', true)
    .maybeSingle()

  if (!conn?.access_token) return null

  // Check if token is expired (or will expire within 5 minutes)
  const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0
  const isExpired = expiresAt < Date.now() + 5 * 60 * 1000

  if (isExpired && conn.refresh_token) {
    try {
      const newTokens = await refreshAccessToken(conn.refresh_token)

      await admin
        .from('social_connections')
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('platform', 'reddit')

      return { ...conn, access_token: newTokens.access_token }
    } catch (err) {
      console.error('Reddit token refresh failed:', err)
      return null
    }
  }

  return conn
}

function getRedirectUri(): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/api/social/reddit/auth/callback`
}
