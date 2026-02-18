import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * POST /api/community/votes — Upvote/downvote a thread or post
 * Body: { thread_id?, post_id?, vote: 1 | -1 }
 * Toggle: same vote removes it, opposite vote switches it
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { thread_id, post_id, vote } = await request.json()

  if (!thread_id && !post_id) {
    return NextResponse.json({ error: 'thread_id or post_id required' }, { status: 400 })
  }
  if (vote !== 1 && vote !== -1) {
    return NextResponse.json({ error: 'vote must be 1 or -1' }, { status: 400 })
  }

  // Check for existing vote
  let query = supabase
    .from('community_votes')
    .select('id, vote')
    .eq('user_id', user.id)

  if (thread_id) query = query.eq('thread_id', thread_id)
  if (post_id) query = query.eq('post_id', post_id)

  const { data: existing } = await query.maybeSingle()

  if (existing) {
    if (existing.vote === vote) {
      // Same vote — toggle off (remove)
      const { error } = await supabase
        .from('community_votes')
        .delete()
        .eq('id', existing.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ action: 'removed', vote: 0 })
    } else {
      // Opposite vote — switch
      const { error } = await supabase
        .from('community_votes')
        .update({ vote })
        .eq('id', existing.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ action: 'switched', vote })
    }
  }

  // New vote
  const { error } = await supabase
    .from('community_votes')
    .insert({
      user_id: user.id,
      thread_id: thread_id || null,
      post_id: post_id || null,
      vote,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ action: 'created', vote }, { status: 201 })
}
