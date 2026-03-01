import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/console/social/schedule
 * Schedule a social post for future publishing.
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

  let body: {
    content?: string
    platforms?: string[]
    hashtags?: string[]
    scheduled_for?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { content, platforms, hashtags, scheduled_for } = body

  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return NextResponse.json({ error: 'At least one platform is required' }, { status: 400 })
  }
  if (!scheduled_for) {
    return NextResponse.json({ error: 'scheduled_for timestamp is required' }, { status: 400 })
  }

  const scheduleDate = new Date(scheduled_for)
  if (isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) {
    return NextResponse.json({ error: 'scheduled_for must be a valid future date' }, { status: 400 })
  }

  const safeHashtags = Array.isArray(hashtags) ? hashtags : []
  const fullContent =
    content.trim() +
    (safeHashtags.length > 0
      ? '\n\n' + safeHashtags.map((t: string) => `#${t}`).join(' ')
      : '')

  // Save as scheduled social post
  const { error: postError } = await supabase
    .from('social_posts')
    .insert({
      user_id: user.id,
      content: fullContent,
      platforms,
      hashtags: safeHashtags,
      status: 'scheduled',
      results: [],
    })

  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 })
  }

  // Queue each platform into content_queue with scheduled_for
  const queueInserts = platforms.map((platform: string) => ({
    user_id: user.id,
    platform,
    content_type: 'social_post',
    title: null,
    body: fullContent,
    metadata: { hashtags: safeHashtags, source: 'console_scheduled' },
    status: 'scheduled',
    scheduled_for: scheduleDate.toISOString(),
    generated_by: 'user',
  }))

  const { error: queueError } = await supabase.from('content_queue').insert(queueInserts)
  if (queueError) {
    return NextResponse.json({ error: queueError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, scheduled_for: scheduleDate.toISOString() })
}
