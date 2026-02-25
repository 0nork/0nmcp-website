// =============================================================================
// QA Distribution Engine — Reddit Client
// =============================================================================
// Reddit OAuth2 API wrapper with rate limiting, monitoring, and tracking
// =============================================================================

import { RELEVANT_SUBREDDITS, RedditCredentials, RedditPost, RedditComment, MonitoringConfig } from './types'

// ---------------------------------------------------------------------------
// Reddit Client (API Wrapper)
// ---------------------------------------------------------------------------

export class RedditClient {
  private credentials: RedditCredentials
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(credentials?: RedditCredentials) {
    this.credentials = credentials || {
      clientId: process.env.REDDIT_CLIENT_ID || '',
      clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
      username: process.env.REDDIT_USERNAME || '',
      password: process.env.REDDIT_PASSWORD || '',
      userAgent: '0nMCP-QA-Engine/1.0.0',
    }
  }

  private async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const auth = Buffer.from(
      `${this.credentials.clientId}:${this.credentials.clientSecret}`
    ).toString('base64')

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.credentials.userAgent,
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: this.credentials.username,
        password: this.credentials.password,
      }),
    })

    if (!response.ok) {
      throw new Error(`Reddit auth failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60000 // 1 min buffer

    return this.accessToken!
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<Record<string, unknown>> {
    const token = await this.authenticate()

    const response = await fetch(`https://oauth.reddit.com${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': this.credentials.userAgent,
        ...options.headers,
      },
    })

    if (response.status === 429) {
      // Rate limited - wait and retry
      const retryAfter = parseInt(response.headers.get('retry-after') || '60')
      await this.delay(retryAfter * 1000)
      return this.request(endpoint, options)
    }

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // -----------------------------------------------------------------------
  // Read Operations
  // -----------------------------------------------------------------------

  async searchPosts(
    query: string,
    options: {
      subreddit?: string
      sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments'
      time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
      limit?: number
    } = {}
  ): Promise<RedditPost[]> {
    const subredditPath = options.subreddit ? `/r/${options.subreddit}` : ''
    const params = new URLSearchParams({
      q: query,
      sort: options.sort || 'relevance',
      t: options.time || 'week',
      limit: String(options.limit || 25),
    })

    const data = await this.request(`${subredditPath}/search?${params}`) as {
      data: { children: Array<{ data: Record<string, unknown> }> }
    }

    return data.data.children.map((child) => ({
      id: child.data.id as string,
      title: child.data.title as string,
      selftext: child.data.selftext as string,
      subreddit: child.data.subreddit as string,
      author: child.data.author as string,
      url: child.data.url as string,
      permalink: `https://reddit.com${child.data.permalink}`,
      score: child.data.score as number,
      num_comments: child.data.num_comments as number,
      created_utc: child.data.created_utc as number,
      link_flair_text: child.data.link_flair_text as string | undefined,
    }))
  }

  async getNewPosts(subreddit: string, limit: number = 25): Promise<RedditPost[]> {
    const data = await this.request(`/r/${subreddit}/new?limit=${limit}`) as {
      data: { children: Array<{ data: Record<string, unknown> }> }
    }

    return data.data.children.map((child) => ({
      id: child.data.id as string,
      title: child.data.title as string,
      selftext: child.data.selftext as string,
      subreddit: child.data.subreddit as string,
      author: child.data.author as string,
      url: child.data.url as string,
      permalink: `https://reddit.com${child.data.permalink}`,
      score: child.data.score as number,
      num_comments: child.data.num_comments as number,
      created_utc: child.data.created_utc as number,
      link_flair_text: child.data.link_flair_text as string | undefined,
    }))
  }

  async getPostComments(postId: string): Promise<RedditComment[]> {
    const rawData = await this.request(`/comments/${postId}`)
    const data = rawData as unknown as Array<{
      data?: { children: Array<{ kind: string; data: Record<string, unknown> }> }
    }>

    const comments: RedditComment[] = []
    const extractComments = (children: Array<{ kind: string; data: Record<string, unknown> }>) => {
      for (const child of children) {
        if (child.kind === 't1') {
          comments.push({
            id: child.data.id as string,
            body: child.data.body as string,
            author: child.data.author as string,
            score: child.data.score as number,
            permalink: `https://reddit.com${child.data.permalink}`,
            parent_id: child.data.parent_id as string,
            created_utc: child.data.created_utc as number,
          })

          const replies = child.data.replies as { data?: { children?: Array<{ kind: string; data: Record<string, unknown> }> } } | undefined
          if (replies?.data?.children) {
            extractComments(replies.data.children)
          }
        }
      }
    }

    if (data[1]?.data?.children) {
      extractComments(data[1].data.children)
    }

    return comments
  }

  // -----------------------------------------------------------------------
  // Write Operations
  // -----------------------------------------------------------------------

  async submitComment(
    postId: string,
    text: string
  ): Promise<{ id: string; permalink: string }> {
    const data = await this.request('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        thing_id: `t3_${postId}`,
        text: text,
        api_type: 'json',
      }),
    }) as { json: { data: { things: Array<{ data: { id: string; permalink: string } }> } } }

    const comment = data.json.data.things[0].data
    return {
      id: comment.id,
      permalink: `https://reddit.com${comment.permalink}`,
    }
  }

  async submitPost(
    subreddit: string,
    title: string,
    options: { text?: string; url?: string; flair?: string }
  ): Promise<{ id: string; url: string }> {
    const body: Record<string, string> = {
      sr: subreddit,
      title: title,
      kind: options.url ? 'link' : 'self',
      api_type: 'json',
    }

    if (options.text) body.text = options.text
    if (options.url) body.url = options.url
    if (options.flair) body.flair_id = options.flair

    const data = await this.request('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    }) as { json: { data: { id: string; url: string } } }

    return {
      id: data.json.data.id,
      url: data.json.data.url,
    }
  }

  // -----------------------------------------------------------------------
  // Utilities
  // -----------------------------------------------------------------------

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// ---------------------------------------------------------------------------
// Reddit Monitor
// ---------------------------------------------------------------------------

export class RedditMonitor {
  private client: RedditClient
  private config: MonitoringConfig
  private seenPosts: Set<string> = new Set()

  constructor(client: RedditClient, config: MonitoringConfig) {
    this.client = client
    this.config = config
  }

  async findRelevantPosts(): Promise<RedditPost[]> {
    const relevantPosts: RedditPost[] = []
    const maxAgeSeconds = this.config.maxAgeHours * 3600
    const now = Date.now() / 1000

    for (const subreddit of this.config.subreddits) {
      try {
        // Search by keywords
        for (const keyword of this.config.keywords) {
          const posts = await this.client.searchPosts(keyword, {
            subreddit,
            sort: 'new',
            time: 'day',
            limit: 10,
          })

          for (const post of posts) {
            if (this.seenPosts.has(post.id)) continue
            if (post.score < this.config.minScore) continue
            if (now - post.created_utc > maxAgeSeconds) continue
            if (this.config.excludeAuthors.includes(post.author)) continue

            if (this.isRelevant(post)) {
              relevantPosts.push(post)
              this.seenPosts.add(post.id)
            }
          }
        }

        // Also check new posts in subreddit
        const newPosts = await this.client.getNewPosts(subreddit, 25)
        for (const post of newPosts) {
          if (this.seenPosts.has(post.id)) continue
          if (post.score < this.config.minScore) continue
          if (now - post.created_utc > maxAgeSeconds) continue
          if (this.config.excludeAuthors.includes(post.author)) continue

          if (this.isRelevant(post)) {
            relevantPosts.push(post)
            this.seenPosts.add(post.id)
          }
        }

        // Rate limiting between subreddits
        await this.delay(2000)
      } catch (error) {
        console.error(`Error monitoring r/${subreddit}:`, error)
      }
    }

    return relevantPosts
  }

  private isRelevant(post: RedditPost): boolean {
    const text = `${post.title} ${post.selftext}`.toLowerCase()

    for (const keyword of this.config.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return true
      }
    }

    return false
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// ---------------------------------------------------------------------------
// Engagement Tracker
// ---------------------------------------------------------------------------

export interface EngagementRecord {
  postId: string
  subreddit: string
  commentId?: string
  commentText: string
  commentedAt: string
  postUrl: string
  score?: number
  replies?: number
  lastChecked?: string
}

export class EngagementTracker {
  private records: Map<string, EngagementRecord> = new Map()
  private dailyCount: Map<string, number> = new Map()

  constructor(existingRecords?: EngagementRecord[]) {
    if (existingRecords) {
      for (const record of existingRecords) {
        this.records.set(record.postId, record)
      }
    }
  }

  hasEngaged(postId: string): boolean {
    return this.records.has(postId)
  }

  canEngageToday(subreddit: string, maxPerDay: number): boolean {
    const today = new Date().toISOString().split('T')[0]
    const key = `${today}:${subreddit}`
    const count = this.dailyCount.get(key) || 0
    return count < maxPerDay
  }

  recordEngagement(record: EngagementRecord): void {
    this.records.set(record.postId, record)

    const today = new Date().toISOString().split('T')[0]
    const key = `${today}:${record.subreddit}`
    const count = this.dailyCount.get(key) || 0
    this.dailyCount.set(key, count + 1)
  }

  getAllRecords(): EngagementRecord[] {
    return Array.from(this.records.values())
  }

  getStats(): {
    totalEngagements: number
    bySubreddit: Record<string, number>
    avgScore: number
    totalReplies: number
  } {
    const records = this.getAllRecords()
    const bySubreddit: Record<string, number> = {}
    let totalScore = 0
    let totalReplies = 0
    let scoredCount = 0

    for (const record of records) {
      bySubreddit[record.subreddit] = (bySubreddit[record.subreddit] || 0) + 1
      if (record.score !== undefined) {
        totalScore += record.score
        scoredCount++
      }
      if (record.replies !== undefined) {
        totalReplies += record.replies
      }
    }

    return {
      totalEngagements: records.length,
      bySubreddit,
      avgScore: scoredCount > 0 ? Math.round((totalScore / scoredCount) * 10) / 10 : 0,
      totalReplies,
    }
  }
}

// ---------------------------------------------------------------------------
// Default Config for 0nMCP
// ---------------------------------------------------------------------------

export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  subreddits: RELEVANT_SUBREDDITS.map((s) => s.name.replace('r/', '')),
  keywords: [
    'MCP server',
    'model context protocol',
    'AI orchestration',
    'API connector',
    'workflow automation',
    'Claude tools',
    'AI tools integration',
    'multi-service AI',
    'LLM tools',
    'AI API wrapper',
    'n8n alternative',
    'Zapier alternative',
    'AI agent tools',
    'MCP protocol',
  ],
  checkIntervalMinutes: 30,
  minScore: 1,
  maxAgeHours: 48,
  excludeAuthors: ['AutoModerator', '[deleted]'],
}

export default RedditClient
