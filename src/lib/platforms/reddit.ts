/**
 * Reddit Posting Adapter
 * Uses Reddit's OAuth2 API (script app type)
 *
 * Env vars: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD
 */

const TOKEN_URL = 'https://www.reddit.com/api/v1/access_token'
const API_BASE = 'https://oauth.reddit.com'

let cachedToken: { token: string; expires: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token

  const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD } = process.env
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USERNAME || !REDDIT_PASSWORD) {
    throw new Error('Reddit credentials not configured (REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD)')
  }

  const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': '0nMCP-ContentBot/1.0 (by /u/' + REDDIT_USERNAME + ')',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username: REDDIT_USERNAME,
      password: REDDIT_PASSWORD,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Reddit auth failed: ${res.status} — ${err}`)
  }

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  }
  return cachedToken.token
}

async function redditRequest(path: string, body: Record<string, string>): Promise<Record<string, unknown>> {
  const token = await getAccessToken()

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': '0nMCP-ContentBot/1.0',
    },
    body: new URLSearchParams(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Reddit API error: ${res.status} — ${err}`)
  }

  return res.json()
}

export interface RedditPostResult {
  success: boolean
  url?: string
  id?: string
  error?: string
}

/**
 * Submit a self-post to a subreddit
 */
export async function submitPost(
  subreddit: string,
  title: string,
  body: string
): Promise<RedditPostResult> {
  try {
    const result = await redditRequest('/api/submit', {
      api_type: 'json',
      kind: 'self',
      sr: subreddit,
      title,
      text: body,
      sendreplies: 'true',
    })

    const json = (result as Record<string, unknown>).json as Record<string, unknown> | undefined
    const data = json?.data as Record<string, unknown> | undefined
    const errors = json?.errors as string[][] | undefined

    if (errors && errors.length > 0) {
      return { success: false, error: errors.map(e => e.join(': ')).join('; ') }
    }

    return {
      success: true,
      url: data?.url as string,
      id: data?.name as string,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Submit a comment/reply
 */
export async function submitComment(
  parentId: string,
  body: string
): Promise<RedditPostResult> {
  try {
    const result = await redditRequest('/api/comment', {
      api_type: 'json',
      thing_id: parentId,
      text: body,
    })

    const json = (result as Record<string, unknown>).json as Record<string, unknown> | undefined
    const data = json?.data as Record<string, unknown> | undefined
    const things = (data?.things as Record<string, unknown>[]) || []

    return {
      success: true,
      id: (things[0]?.data as Record<string, unknown>)?.name as string || undefined,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Default subreddits for 0nMCP content
 */
export const TARGET_SUBREDDITS = [
  'ClaudeAI',
  'LocalLLaMA',
  'selfhosted',
  'programming',
  'webdev',
  'node',
  'opensource',
]

/**
 * Pick the best subreddit based on content category
 */
export function pickSubreddit(category?: string): string {
  const mapping: Record<string, string[]> = {
    mcp_education: ['ClaudeAI', 'LocalLLaMA', 'programming'],
    feature_highlight: ['ClaudeAI', 'selfhosted', 'node'],
    tutorial: ['webdev', 'node', 'programming'],
    comparison: ['selfhosted', 'programming', 'ClaudeAI'],
    community: ['ClaudeAI', 'opensource'],
    on_standard: ['programming', 'node', 'ClaudeAI'],
    roadmap: ['ClaudeAI', 'opensource'],
    use_case: ['webdev', 'selfhosted', 'ClaudeAI'],
    release: ['ClaudeAI', 'node', 'programming'],
    thought_leadership: ['ClaudeAI', 'programming'],
  }

  const options = mapping[category || ''] || TARGET_SUBREDDITS
  return options[Math.floor(Math.random() * options.length)]
}
