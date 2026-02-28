import { createClient } from '@supabase/supabase-js'
import type { LinkedInProfile, LinkedInTokens } from '@/lib/linkedin/types'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const LINKEDIN_PROFILE_URL = 'https://api.linkedin.com/v2/userinfo'

const SCOPES = ['openid', 'profile', 'email', 'w_member_social']

/**
 * Build the LinkedIn OAuth authorization URL.
 */
export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID || '',
    redirect_uri: getRedirectUri(),
    state,
    scope: SCOPES.join(' '),
  })
  return `${LINKEDIN_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for tokens.
 */
export async function exchangeCode(code: string): Promise<LinkedInTokens> {
  const res = await fetch(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getRedirectUri(),
      client_id: process.env.LINKEDIN_CLIENT_ID || '',
      client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LinkedIn token exchange failed: ${res.status} — ${err}`)
  }

  return res.json()
}

/**
 * Fetch the LinkedIn user profile using an access token.
 * Uses the OpenID Connect userinfo endpoint.
 */
export async function fetchProfile(accessToken: string): Promise<LinkedInProfile> {
  const res = await fetch(LINKEDIN_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LinkedIn profile fetch failed: ${res.status} — ${err}`)
  }

  const data = await res.json()

  return {
    id: data.sub,
    localizedFirstName: data.given_name || '',
    localizedLastName: data.family_name || '',
    headline: data.headline,
    industry: data.industry,
    profilePicture: data.picture,
    vanityName: data.vanity_name,
  }
}

/**
 * Create or update a linkedin_members record after OAuth.
 */
export async function upsertMember(
  userId: string,
  profile: LinkedInProfile,
  tokens: LinkedInTokens
): Promise<string> {
  const admin = getAdmin()

  const memberData = {
    user_id: userId,
    linkedin_id: profile.id,
    linkedin_access_token: tokens.access_token,
    linkedin_refresh_token: tokens.refresh_token || null,
    token_expires_at: tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null,
    linkedin_name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
    linkedin_headline: profile.headline || null,
    linkedin_industry: profile.industry || null,
    linkedin_profile_url: profile.vanityName
      ? `https://linkedin.com/in/${profile.vanityName}`
      : null,
    linkedin_avatar_url: profile.profilePicture || null,
  }

  // Try update first, then insert
  const { data: existing } = await admin
    .from('linkedin_members')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    await admin
      .from('linkedin_members')
      .update(memberData)
      .eq('id', existing.id)
    return existing.id
  }

  const { data: inserted, error } = await admin
    .from('linkedin_members')
    .insert(memberData)
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create member: ${error.message}`)
  return inserted.id
}

/**
 * Get member by user ID.
 */
export async function getMemberByUserId(userId: string) {
  const admin = getAdmin()
  const { data } = await admin
    .from('linkedin_members')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

/**
 * Get member by member ID.
 */
export async function getMember(memberId: string) {
  const admin = getAdmin()
  const { data } = await admin
    .from('linkedin_members')
    .select('*')
    .eq('id', memberId)
    .maybeSingle()
  return data
}

function getRedirectUri(): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/api/linkedin/auth/callback`
}
