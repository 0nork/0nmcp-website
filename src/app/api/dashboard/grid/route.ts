/**
 * GET /api/dashboard/grid
 *
 * Returns community data for the native Grid component.
 * Pulls from community_threads, community_posts, community_groups.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const groupSlug = searchParams.get('group') || null
  const threadId = searchParams.get('thread') || null

  const admin = getAdmin()

  // Fetch groups — thread_count is maintained by DB trigger
  const { data: groups } = await admin
    .from('community_groups')
    .select('id, name, slug, description, icon, color, sort_order, thread_count')
    .order('sort_order', { ascending: true })

  const groupsWithCounts = (groups || []).map(g => ({
    ...g,
    threadCount: g.thread_count || 0,
  }))

  // If requesting a specific thread
  if (threadId) {
    const { data: thread } = await admin
      .from('community_threads')
      .select('*, profiles(id, full_name, email, karma, reputation_level, avatar_url)')
      .eq('id', threadId)
      .single()

    const { data: posts } = await admin
      .from('community_posts')
      .select('*, profiles(id, full_name, email, karma, reputation_level, avatar_url)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      groups: groupsWithCounts,
      thread,
      posts: posts || [],
      activeGroup: groupSlug,
    })
  }

  // Fetch threads (optionally filtered by group)
  let threadsQuery = admin
    .from('community_threads')
    .select('id, title, slug, body, score, reply_count, created_at, group_id, is_pinned, profiles(id, full_name, email, karma, reputation_level, avatar_url)')
    .order('is_pinned', { ascending: false })
    .order('hot_score', { ascending: false })
    .limit(30)

  if (groupSlug && groupSlug !== 'all') {
    const group = groupsWithCounts.find(g => g.slug === groupSlug)
    if (group) {
      threadsQuery = threadsQuery.eq('group_id', group.id)
    }
  }

  const { data: threads } = await threadsQuery

  // reply_count is already on the thread record (maintained by DB trigger)
  const threadsWithCounts = (threads || []).map(t => ({
    ...t,
    vote_count: t.score || 0,
    replyCount: t.reply_count || 0,
  }))

  return NextResponse.json({
    groups: groupsWithCounts,
    threads: threadsWithCounts,
    activeGroup: groupSlug || 'all',
    userId: user.id,
  })
}
