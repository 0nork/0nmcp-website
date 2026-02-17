/**
 * Dev.to Posting Adapter
 * Uses Dev.to Forem API
 *
 * Env vars: DEVTO_API_KEY
 * Get your key at: https://dev.to/settings/extensions
 */

const API_BASE = 'https://dev.to/api'

export interface DevToPostResult {
  success: boolean
  url?: string
  id?: number
  error?: string
}

/**
 * Create an article on Dev.to
 */
export async function createArticle(
  title: string,
  body: string,
  tags?: string[]
): Promise<DevToPostResult> {
  const apiKey = process.env.DEVTO_API_KEY
  if (!apiKey) throw new Error('DEVTO_API_KEY not configured')

  try {
    const res = await fetch(`${API_BASE}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        article: {
          title,
          body_markdown: body,
          published: false, // Create as draft — review before publishing
          tags: (tags || ['mcp', 'ai', 'automation', 'opensource']).slice(0, 4),
          series: '0nMCP',
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Dev.to API error: ${res.status} — ${err}`)
    }

    const data = await res.json()
    return {
      success: true,
      url: data.url,
      id: data.id,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Publish a draft article
 */
export async function publishArticle(articleId: number): Promise<DevToPostResult> {
  const apiKey = process.env.DEVTO_API_KEY
  if (!apiKey) throw new Error('DEVTO_API_KEY not configured')

  try {
    const res = await fetch(`${API_BASE}/articles/${articleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({ article: { published: true } }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Dev.to API error: ${res.status} — ${err}`)
    }

    const data = await res.json()
    return { success: true, url: data.url, id: data.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
