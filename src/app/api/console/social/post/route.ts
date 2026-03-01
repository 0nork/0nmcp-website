import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { submitPost as redditPost, pickSubreddit } from '@/lib/platforms/reddit'
import { createPost as linkedinPost } from '@/lib/platforms/linkedin'
import { createArticle as devtoArticle } from '@/lib/platforms/devto'

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

  // Map to expected client format
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
 * Create a new social post and persist it to Supabase.
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

  // Post to each platform immediately
  const results: { platform: string; success: boolean; url?: string; error?: string }[] = []

  for (const platform of platforms) {
    try {
      switch (platform) {
        case 'linkedin': {
          const lr = await linkedinPost(fullContent)
          results.push({ platform, success: lr.success, url: lr.url, error: lr.error })
          break
        }
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
          // Platforms without adapters yet (x_twitter, instagram, tiktok)
          results.push({ platform, success: false, error: `${platform} posting not yet configured` })
      }
    } catch (err) {
      results.push({
        platform,
        success: false,
        error: err instanceof Error ? err.message : 'Posting failed',
      })
    }
  }

  const allSuccess = results.every((r) => r.success)
  const anySuccess = results.some((r) => r.success)
  const status = allSuccess ? 'posted' : anySuccess ? 'posted' : 'failed'

  // Persist to Supabase with real results
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
