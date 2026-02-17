/**
 * LinkedIn Posting Adapter
 * Uses LinkedIn Share API v2
 *
 * Env vars: LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN
 *
 * To get these:
 * 1. Create LinkedIn app at https://developer.linkedin.com
 * 2. Request w_member_social scope
 * 3. Complete OAuth2 flow to get access token
 * 4. Get person URN from /v2/userinfo endpoint
 */

const API_BASE = 'https://api.linkedin.com/v2'

export interface LinkedInPostResult {
  success: boolean
  url?: string
  id?: string
  error?: string
}

/**
 * Create a share/post on LinkedIn
 */
export async function createPost(body: string): Promise<LinkedInPostResult> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN
  const personUrn = process.env.LINKEDIN_PERSON_URN

  if (!token || !personUrn) {
    throw new Error('LinkedIn not configured (LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN)')
  }

  try {
    const res = await fetch(`${API_BASE}/ugcPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: body },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`LinkedIn API error: ${res.status} — ${err}`)
    }

    const data = await res.json()
    const postId = data.id || ''
    // LinkedIn post URLs follow this pattern
    const url = postId ? `https://www.linkedin.com/feed/update/${postId}` : undefined

    return { success: true, url, id: postId }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Create an article post with a link
 */
export async function createArticlePost(
  body: string,
  articleUrl: string,
  articleTitle: string
): Promise<LinkedInPostResult> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN
  const personUrn = process.env.LINKEDIN_PERSON_URN

  if (!token || !personUrn) {
    throw new Error('LinkedIn not configured')
  }

  try {
    const res = await fetch(`${API_BASE}/ugcPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: body },
            shareMediaCategory: 'ARTICLE',
            media: [{
              status: 'READY',
              originalUrl: articleUrl,
              title: { text: articleTitle },
            }],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`LinkedIn API error: ${res.status} — ${err}`)
    }

    const data = await res.json()
    return { success: true, url: `https://www.linkedin.com/feed/update/${data.id}`, id: data.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
