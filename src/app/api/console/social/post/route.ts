import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { submitPost as redditPost, pickSubreddit } from '@/lib/platforms/reddit'
import { createArticle as devtoArticle } from '@/lib/platforms/devto'
import {
  createSocialPost,
  resolveAccountIds,
  CRM_PLATFORMS,
} from '@/lib/crm-social'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/console/social/post
 * Returns recent social posts for the authenticated user from Supabase.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ posts: [] })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ posts: [] })
  }

  const { data: posts } = await supabase
    .from('social_posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const mapped = (posts || []).map((p) => ({
    id: p.id,
    content: p.content,
    platforms: p.platforms || [],
    hashtags: p.hashtags || [],
    status: p.status,
    createdAt: p.created_at,
    results: p.results || [],
  }))

  return NextResponse.json({ posts: mapped })
}

/**
 * POST /api/console/social/post
 * Create a social post — routes through CRM Social API for native platforms
 * (LinkedIn, Facebook, Instagram, Twitter/X, Google) and direct adapters
 * for Reddit and Dev.to.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { content?: string; platforms?: string[]; hashtags?: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { content, platforms, hashtags } = body

  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return NextResponse.json({ error: 'At least one platform is required' }, { status: 400 })
  }

  const safeHashtags = Array.isArray(hashtags) ? hashtags : []

  // Build full content with hashtags
  const fullContent =
    content.trim() +
    (safeHashtags.length > 0
      ? '\n\n' + safeHashtags.map((t: string) => `#${t}`).join(' ')
      : '')

  const results: { platform: string; success: boolean; url?: string; error?: string }[] = []

  // ── CRM-native platforms (LinkedIn, Facebook, Instagram, Twitter/X, Google) ──
  const crmPlatforms = platforms.filter((p) => CRM_PLATFORMS.has(p))
  if (crmPlatforms.length > 0) {
    try {
      // Resolve platform IDs → CRM account IDs
      const accountMap = await resolveAccountIds(crmPlatforms)

      // Collect all account IDs for a single CRM post (multi-platform)
      const allAccountIds: string[] = []
      const mappedPlatforms: string[] = []
      const unmappedPlatforms: string[] = []

      for (const plat of crmPlatforms) {
        const ids = accountMap.get(plat)
        if (ids && ids.length > 0) {
          allAccountIds.push(...ids)
          mappedPlatforms.push(plat)
        } else {
          unmappedPlatforms.push(plat)
        }
      }

      // Post to all connected CRM accounts in one call
      if (allAccountIds.length > 0) {
        const crmResult = await createSocialPost({
          accountIds: allAccountIds,
          content: fullContent,
          tags: safeHashtags.length > 0 ? safeHashtags : undefined,
        })

        for (const plat of mappedPlatforms) {
          results.push({
            platform: plat,
            success: crmResult.success,
            url: crmResult.postId ? undefined : undefined,
            error: crmResult.error,
          })
        }
      }

      // Report unmapped platforms as not connected
      for (const plat of unmappedPlatforms) {
        results.push({
          platform: plat,
          success: false,
          error: `No ${plat} account connected in CRM. Connect it in the CRM Social Planner.`,
        })
      }
    } catch (err) {
      // If CRM call fails, report all CRM platforms as failed
      for (const plat of crmPlatforms) {
        results.push({
          platform: plat,
          success: false,
          error: err instanceof Error ? err.message : 'CRM social posting failed',
        })
      }
    }
  }

  // ── Direct-adapter platforms (Reddit, Dev.to) ──
  const directPlatforms = platforms.filter((p) => !CRM_PLATFORMS.has(p))
  for (const platform of directPlatforms) {
    try {
      switch (platform) {
        case 'reddit': {
          const title = fullContent.split('\n')[0].slice(0, 120)
          const subreddit = pickSubreddit()
          const rr = await redditPost(subreddit, title, fullContent)
          results.push({ platform, success: rr.success, url: rr.url, error: rr.error })
          break
        }
        case 'dev_to': {
          const title = fullContent.split('\n')[0].slice(0, 120) || '0nMCP Update'
          const tags = safeHashtags.slice(0, 4)
          const dr = await devtoArticle(title, fullContent, tags.length > 0 ? tags : undefined)
          results.push({ platform, success: dr.success, url: dr.url, error: dr.error })
          break
        }
        default:
          results.push({ platform, success: false, error: `${platform} posting not supported` })
      }
    } catch (err) {
      results.push({
        platform,
        success: false,
        error: err instanceof Error ? err.message : 'Posting failed',
      })
    }
  }

  const anySuccess = results.some((r) => r.success)
  const allSuccess = results.every((r) => r.success)
  const status = allSuccess ? 'posted' : anySuccess ? 'posted' : 'failed'

  // Persist to Supabase
  const { error } = await supabase
    .from('social_posts')
    .insert({
      user_id: user.id,
      content: fullContent,
      platforms,
      hashtags: safeHashtags,
      status,
      results,
    })

  if (error) {
    console.error('Failed to save social post:', error)
  }

  return NextResponse.json({ success: anySuccess, results })
}
