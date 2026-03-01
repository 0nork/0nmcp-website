/**
 * Content Poster — Routes approved content to platform adapters
 *
 * CRM-native platforms (linkedin, facebook, instagram, x_twitter, google)
 * are posted through the CRM Social API.
 *
 * Direct-adapter platforms (reddit, dev_to) use their own API adapters.
 */

import { getAdmin } from './content-engine'
import { submitPost as redditPost, pickSubreddit } from './platforms/reddit'
import { createArticle as devtoArticle } from './platforms/devto'
import {
  createSocialPost,
  resolveAccountIds,
  CRM_PLATFORMS,
} from './crm-social'

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
    if (CRM_PLATFORMS.has(item.platform)) {
      // Route through CRM Social API
      result = await postViaCrm(item)
    } else {
      // Use direct platform adapters
      switch (item.platform) {
        case 'reddit':
          result = await postToReddit(item)
          break
        case 'dev_to':
          result = await postToDevTo(item)
          break
        default:
          result = { success: false, platform: item.platform, error: `Platform "${item.platform}" not supported` }
      }
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
  platform: string
  content_type: string
  metadata?: Record<string, unknown>
  content_topics?: { category?: string } | null
}

/**
 * Post through CRM Social API (LinkedIn, Facebook, Instagram, Twitter/X, Google)
 */
async function postViaCrm(item: ContentRow): Promise<PostResult> {
  // Resolve platform to CRM account IDs
  const accountMap = await resolveAccountIds([item.platform])
  const accountIds = accountMap.get(item.platform)

  if (!accountIds || accountIds.length === 0) {
    return {
      success: false,
      platform: item.platform,
      error: `No ${item.platform} account connected in CRM. Connect it in the CRM Social Planner.`,
    }
  }

  const tags = (item.metadata as Record<string, unknown>)?.topic_keywords as string[] | undefined

  const result = await createSocialPost({
    accountIds,
    content: item.body,
    tags,
  })

  return {
    success: result.success,
    platform: item.platform,
    id: result.postId,
    error: result.error,
  }
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
