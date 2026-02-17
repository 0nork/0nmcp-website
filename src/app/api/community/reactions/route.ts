import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * POST /api/community/reactions — Toggle a reaction
 * Body: { thread_id?, post_id?, reaction_type }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { thread_id, post_id, reaction_type } = await request.json()
  if (!reaction_type) return NextResponse.json({ error: 'reaction_type required' }, { status: 400 })
  if (!thread_id && !post_id) return NextResponse.json({ error: 'thread_id or post_id required' }, { status: 400 })

  // Check if reaction exists
  let existingQuery = supabase
    .from('community_reactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('reaction_type', reaction_type)

  if (thread_id) existingQuery = existingQuery.eq('thread_id', thread_id)
  if (post_id) existingQuery = existingQuery.eq('post_id', post_id)

  const { data: existing } = await existingQuery.single()

  if (existing) {
    // Remove reaction (toggle off)
    await supabase.from('community_reactions').delete().eq('id', existing.id)
    return NextResponse.json({ action: 'removed' })
  }

  // Add reaction
  const { error } = await supabase
    .from('community_reactions')
    .insert({
      user_id: user.id,
      thread_id: thread_id || null,
      post_id: post_id || null,
      reaction_type,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ action: 'added' })
}
