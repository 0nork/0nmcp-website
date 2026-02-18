import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/community/threads/[slug] — Thread detail + nested replies + votes
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  // Get thread with author profile and group
  const { data: thread, error } = await supabase
    .from('community_threads')
    .select(`
      *,
      profiles!community_threads_user_id_fkey(full_name, email, karma, reputation_level, avatar_url),
      community_groups!community_threads_group_id_fkey(name, slug, icon, color)
    `)
    .eq('slug', slug)
    .single()

  if (error || !thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })

  // Increment view count (fire and forget)
  supabase.rpc('increment_view_count' as string, { thread_id: thread.id }).then()

  // Get replies with author profiles
  const { data: posts } = await supabase
    .from('community_posts')
    .select('*, profiles!community_posts_user_id_fkey(full_name, email, karma, reputation_level, avatar_url)')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true })

  // Get user's votes (if logged in)
  let userThreadVote = 0
  let userPostVotes: Record<string, number> = {}

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // Thread vote
    const { data: tv } = await supabase
      .from('community_votes')
      .select('vote')
      .eq('user_id', user.id)
      .eq('thread_id', thread.id)
      .maybeSingle()
    if (tv) userThreadVote = tv.vote

    // Post votes
    if (posts?.length) {
      const postIds = posts.map((p: { id: string }) => p.id)
      const { data: pvs } = await supabase
        .from('community_votes')
        .select('post_id, vote')
        .eq('user_id', user.id)
        .in('post_id', postIds)
      if (pvs) {
        userPostVotes = Object.fromEntries(pvs.map((v: { post_id: string; vote: number }) => [v.post_id, v.vote]))
      }
    }
  }

  return NextResponse.json({
    thread,
    posts: posts || [],
    userThreadVote,
    userPostVotes,
  })
}
