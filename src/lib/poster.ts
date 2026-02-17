/**
 * Content Poster — Routes approved content to platform adapters
 * Handles posting, status updates, and analytics tracking
 */

import { getAdmin } from './content-engine'
import { submitPost as redditPost, pickSubreddit } from './platforms/reddit'
import { createPost as linkedinPost, createArticlePost as linkedinArticle } from './platforms/linkedin'
import { createArticle as devtoArticle } from './platforms/devto'

export interface PostResult {
  success: boolean
  platform: string
  url?: string
  id?: string
  error?: string
}

/**
 * Post a content item to its target platform
 */
export async function postContent(contentId: string): Promise<PostResult> {
  const admin = getAdmin()

  // Fetch the content item
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item, error } = await (admin.from('content_queue') as any)
    .select('*, content_topics(*)')
    .eq('id', contentId)
    .single()

  if (error || !item) {
    return { success: false, platform: 'unknown', error: error?.message || 'Content not found' }
  }

  // Only post approved or scheduled content
  if (!['approved', 'scheduled'].includes(item.status)) {
    return { success: false, platform: item.platform, error: `Cannot post content with status "${item.status}" — must be approved or scheduled` }
  }

  let result: PostResult

  try {
    switch (item.platform) {
      case 'reddit':
        result = await postToReddit(item)
        break
      case 'linkedin':
        result = await postToLinkedIn(item)
        break
      case 'dev_to':
        result = await postToDevTo(item)
        break
      default:
        result = { success: false, platform: item.platform, error: `Platform "${item.platform}" not yet supported for auto-posting` }
    }
  } catch (err) {
    result = {
      success: false,
      platform: item.platform,
      error: err instanceof Error ? err.message : 'Unknown posting error',
    }
  }

  // Update content_queue with result
  if (result.success) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('content_queue') as any)
      .update({
        status: 'posted',
        posted_at: new Date().toISOString(),
        posted_url: result.url || null,
        metadata: {
          ...((item.metadata as Record<string, unknown>) || {}),
          post_id: result.id,
          posted_platform: result.platform,
        },
      })
      .eq('id', contentId)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('content_queue') as any)
      .update({
        status: 'failed',
        metadata: {
          ...((item.metadata as Record<string, unknown>) || {}),
          last_error: result.error,
          last_attempt: new Date().toISOString(),
        },
      })
      .eq('id', contentId)
  }

  // Log to analytics
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('content_analytics') as any).insert({
      content_id: contentId,
      platform: item.platform,
      event_type: result.success ? 'posted' : 'post_failed',
      event_data: {
        url: result.url,
        id: result.id,
        error: result.error,
      },
    })
  } catch {
    // Analytics logging is non-critical
  }

  return result
}

// --- Platform-specific posting ---

interface ContentRow {
  title: string | null
  body: string
  content_type: string
  metadata?: Record<string, unknown>
  content_topics?: { category?: string } | null
}

async function postToReddit(item: ContentRow): Promise<PostResult> {
  const category = item.content_topics?.category
  const subreddit = pickSubreddit(category)

  const title = item.title || item.body.slice(0, 120)
  const result = await redditPost(subreddit, title, item.body)

  return {
    success: result.success,
    platform: 'reddit',
    url: result.url,
    id: result.id,
    error: result.error,
  }
}

async function postToLinkedIn(item: ContentRow): Promise<PostResult> {
  // If there's a link in the content, post as article
  const urlMatch = item.body.match(/https?:\/\/[^\s)]+/)

  let result
  if (urlMatch && item.title) {
    result = await linkedinArticle(item.body, urlMatch[0], item.title)
  } else {
    result = await linkedinPost(item.body)
  }

  return {
    success: result.success,
    platform: 'linkedin',
    url: result.url,
    id: result.id,
    error: result.error,
  }
}

async function postToDevTo(item: ContentRow): Promise<PostResult> {
  const tags = (item.metadata as Record<string, unknown>)?.topic_keywords as string[] | undefined

  const result = await devtoArticle(
    item.title || 'Untitled',
    item.body,
    tags
  )

  return {
    success: result.success,
    platform: 'dev_to',
    url: result.url,
    id: result.id ? String(result.id) : undefined,
    error: result.error,
  }
}
