import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { getConnection as getRedditConnection } from '@/lib/reddit/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/console/social/post
 * Returns recent social posts for the authenticated user.
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
 * Create a social post using the user's own connected accounts.
 * Each platform uses the user's stored OAuth token or API key.
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

  const admin = getAdmin()
  const results: { platform: string; success: boolean; url?: string; error?: string }[] = []

  // ── LinkedIn — uses linkedin_members table ──
  if (platforms.includes('linkedin')) {
    try {
      const { data: member } = await admin
        .from('linkedin_members')
        .select('id, linkedin_id, linkedin_access_token, token_expires_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!member?.linkedin_access_token) {
        results.push({ platform: 'linkedin', success: false, error: 'LinkedIn not connected. Click Connect to link your account.' })
      } else if (member.token_expires_at && new Date(member.token_expires_at) < new Date()) {
        results.push({ platform: 'linkedin', success: false, error: 'LinkedIn token expired. Reconnect your account.' })
      } else {
        // Post using user's own access token
        const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${member.linkedin_access_token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify({
            author: `urn:li:person:${member.linkedin_id}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: { text: fullContent },
                shareMediaCategory: 'NONE',
              },
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const postId = data.id || ''
          const postUrl = `https://www.linkedin.com/feed/update/${postId}`
          results.push({ platform: 'linkedin', success: true, url: postUrl })

          // Update last_used_at
          await admin
            .from('linkedin_members')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', member.id)
        } else {
          const err = await res.text()
          results.push({ platform: 'linkedin', success: false, error: `LinkedIn API: ${res.status}` })
          console.error('LinkedIn post failed:', err)
        }
      }
    } catch (err) {
      results.push({
        platform: 'linkedin',
        success: false,
        error: err instanceof Error ? err.message : 'LinkedIn posting failed',
      })
    }
  }

  // ── Reddit — uses social_connections table with auto-refresh ──
  if (platforms.includes('reddit')) {
    try {
      // getRedditConnection auto-refreshes expired tokens (1hr expiry)
      const conn = await getRedditConnection(user.id)

      if (!conn?.access_token) {
        results.push({ platform: 'reddit', success: false, error: 'Reddit not connected. Click Connect to link your account.' })
      } else {
        // Pick subreddit from user's metadata or default
        const subreddits = (conn.platform_metadata as { subreddits?: string[] })?.subreddits || ['ClaudeAI', 'LocalLLaMA', 'selfhosted']
        const subreddit = subreddits[Math.floor(Math.random() * subreddits.length)]
        const title = fullContent.split('\n')[0].slice(0, 120)

        const res = await fetch('https://oauth.reddit.com/api/submit', {
          method: 'POST',
          headers: {
            'Authorization': `bearer ${conn.access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': '0nMCP/2.0 (by /u/0nork)',
          },
          body: new URLSearchParams({
            sr: subreddit,
            kind: 'self',
            title,
            text: fullContent,
            resubmit: 'true',
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const postUrl = data?.json?.data?.url || null
          results.push({ platform: 'reddit', success: true, url: postUrl || undefined })

          await admin
            .from('social_connections')
            .update({ last_used_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('platform', 'reddit')
        } else {
          const err = await res.text()
          results.push({ platform: 'reddit', success: false, error: `Reddit API: ${res.status}` })
          console.error('Reddit post failed:', err)
        }
      }
    } catch (err) {
      results.push({
        platform: 'reddit',
        success: false,
        error: err instanceof Error ? err.message : 'Reddit posting failed',
      })
    }
  }

  // ── Dev.to — uses social_connections table (API key) ──
  if (platforms.includes('dev_to')) {
    try {
      const { data: conn } = await admin
        .from('social_connections')
        .select('access_token, platform_username')
        .eq('user_id', user.id)
        .eq('platform', 'dev_to')
        .eq('is_connected', true)
        .maybeSingle()

      if (!conn?.access_token) {
        results.push({ platform: 'dev_to', success: false, error: 'Dev.to not connected. Add your API key to connect.' })
      } else {
        const title = fullContent.split('\n')[0].slice(0, 120) || '0nMCP Update'
        const tags = safeHashtags.slice(0, 4)

        const res = await fetch('https://dev.to/api/articles', {
          method: 'POST',
          headers: {
            'api-key': conn.access_token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            article: {
              title,
              body_markdown: fullContent,
              published: false, // Draft first
              series: '0nMCP',
              ...(tags.length > 0 ? { tags } : {}),
            },
          }),
        })

        if (res.ok) {
          const data = await res.json()
          results.push({ platform: 'dev_to', success: true, url: data.url || undefined })

          await admin
            .from('social_connections')
            .update({ last_used_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('platform', 'dev_to')
        } else {
          const err = await res.text()
          results.push({ platform: 'dev_to', success: false, error: `Dev.to API: ${res.status}` })
          console.error('Dev.to post failed:', err)
        }
      }
    } catch (err) {
      results.push({
        platform: 'dev_to',
        success: false,
        error: err instanceof Error ? err.message : 'Dev.to posting failed',
      })
    }
  }

  // ── Coming soon platforms ──
  for (const platform of platforms) {
    if (!['linkedin', 'reddit', 'dev_to'].includes(platform)) {
      results.push({ platform, success: false, error: `${platform} posting coming soon` })
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
