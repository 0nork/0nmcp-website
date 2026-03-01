import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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

  // Build results per platform (actual posting will happen via cron/content pipeline)
  const results = platforms.map((platform: string) => ({
    platform,
    success: true,
    queued: true,
  }))

  // Persist to Supabase
  const { data: post, error } = await supabase
    .from('social_posts')
    .insert({
      user_id: user.id,
      content: fullContent,
      platforms,
      hashtags: safeHashtags,
      status: 'pending',
      results,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Also queue each platform into content_queue for the poster pipeline
  const queueInserts = platforms.map((platform: string) => ({
    user_id: user.id,
    platform,
    content_type: 'social_post',
    title: null,
    body: fullContent,
    metadata: { hashtags: safeHashtags, source: 'console', social_post_id: post.id },
    status: 'approved',
    generated_by: 'user',
  }))

  await supabase.from('content_queue').insert(queueInserts)

  return NextResponse.json({ success: true, results })
}
