/**
 * CRM Social Media Posting API
 * Posts through connected CRM social accounts (LinkedIn, Facebook, Instagram, Twitter/X, Google)
 *
 * CRM Social API: /social-media-posting/
 * Requires accounts connected via OAuth in the CRM dashboard
 */

const API_BASE = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'

function getHeaders(): Record<string, string> {
  const key = process.env.CRM_API_KEY
  if (!key) throw new Error('CRM_API_KEY not configured')
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Version': API_VERSION,
  }
}

function getLocationId(): string {
  const id = process.env.CRM_LOCATION_ID
  if (!id) throw new Error('CRM_LOCATION_ID not configured')
  return id
}

// ─── Types ───────────────────────────────────────────────────────

export interface CrmSocialAccount {
  id: string
  name: string
  platform: string // facebook, instagram, google, twitter, linkedin
  avatar?: string
  type?: string
  isConnected?: boolean
}

export interface CrmSocialPost {
  id: string
  content?: string
  status?: string
  type?: string
  accountIds?: string[]
  scheduledDate?: string
  publishedDate?: string
  url?: string
}

// Map our platform IDs to CRM platform types
const PLATFORM_TO_CRM: Record<string, string> = {
  linkedin: 'linkedin',
  facebook: 'facebook',
  instagram: 'instagram',
  x_twitter: 'twitter',
  google: 'google',
}

// CRM-native platforms (posted through CRM social API)
export const CRM_PLATFORMS = new Set(['linkedin', 'facebook', 'instagram', 'x_twitter', 'google'])

// Direct-adapter platforms (posted through our own API adapters)
export const DIRECT_PLATFORMS = new Set(['reddit', 'dev_to'])

// ─── API Functions ───────────────────────────────────────────────

/**
 * List all connected social accounts from CRM
 */
export async function listSocialAccounts(): Promise<CrmSocialAccount[]> {
  const locationId = getLocationId()
  const res = await fetch(
    `${API_BASE}/social-media-posting/accounts?locationId=${locationId}`,
    { method: 'GET', headers: getHeaders() }
  )
  if (!res.ok) {
    const err = await res.text()
    console.error('CRM list social accounts failed:', res.status, err)
    return []
  }
  const data = await res.json()
  return data.accounts || data || []
}

/**
 * Create and publish a social post through the CRM
 * Posts to one or more connected social accounts in a single API call
 */
export async function createSocialPost(params: {
  accountIds: string[]
  content: string
  mediaUrls?: string[]
  tags?: string[]
  publishMode?: 'publish' | 'draft' | 'schedule'
  scheduledDate?: string
}): Promise<{ success: boolean; postId?: string; error?: string }> {
  const locationId = getLocationId()

  const body: Record<string, unknown> = {
    locationId,
    accountIds: params.accountIds,
    content: params.content,
    publishMode: params.publishMode || 'publish',
  }

  if (params.mediaUrls?.length) body.mediaUrls = params.mediaUrls
  if (params.tags?.length) body.tags = params.tags
  if (params.scheduledDate) body.scheduledDate = params.scheduledDate

  const res = await fetch(`${API_BASE}/social-media-posting/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('CRM create social post failed:', res.status, err)
    return { success: false, error: `CRM API error: ${res.status}` }
  }

  const data = await res.json()
  return {
    success: true,
    postId: data.id || data.postId,
  }
}

/**
 * Get a social post by ID (to check status and get live URL)
 */
export async function getSocialPost(postId: string): Promise<CrmSocialPost | null> {
  const locationId = getLocationId()
  const res = await fetch(
    `${API_BASE}/social-media-posting/${postId}?locationId=${locationId}`,
    { method: 'GET', headers: getHeaders() }
  )
  if (!res.ok) return null
  return res.json()
}

/**
 * List recent social posts from CRM
 */
export async function listSocialPosts(params?: {
  limit?: number
  offset?: number
  status?: string
}): Promise<CrmSocialPost[]> {
  const locationId = getLocationId()
  const query = new URLSearchParams({ locationId })
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.offset) query.set('offset', String(params.offset))
  if (params?.status) query.set('status', params.status)

  const res = await fetch(
    `${API_BASE}/social-media-posting/?${query}`,
    { method: 'GET', headers: getHeaders() }
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.posts || data || []
}

/**
 * Find CRM account IDs for given platform identifiers
 * Maps our platform IDs (linkedin, facebook, etc.) to CRM account IDs
 */
export async function resolveAccountIds(
  platformIds: string[],
  accounts?: CrmSocialAccount[]
): Promise<Map<string, string[]>> {
  const allAccounts = accounts || await listSocialAccounts()
  const result = new Map<string, string[]>()

  for (const platId of platformIds) {
    if (!CRM_PLATFORMS.has(platId)) continue
    const crmPlatform = PLATFORM_TO_CRM[platId]
    if (!crmPlatform) continue

    const matching = allAccounts.filter(
      (a) => a.platform?.toLowerCase() === crmPlatform
    )
    if (matching.length > 0) {
      result.set(platId, matching.map((a) => a.id))
    }
  }

  return result
}
