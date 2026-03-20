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

  // Fetch groups with thread counts
  const { data: groups } = await admin
    .from('community_groups')
    .select('id, name, slug, description, icon, sort_order')
    .order('sort_order', { ascending: true })

  // Count threads per group
  const groupsWithCounts = await Promise.all(
    (groups || []).map(async (g) => {
      const { count } = await admin
        .from('community_threads')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', g.id)
      return { ...g, threadCount: count || 0 }
    })
  )

  // If requesting a specific thread
  if (threadId) {
    const { data: thread } = await admin
      .from('community_threads')
      .select('*, profiles!community_threads_author_id_fkey(id, full_name, handle, avatar_url, role)')
      .eq('id', threadId)
      .single()

    const { data: posts } = await admin
      .from('community_posts')
      .select('*, profiles!community_posts_author_id_fkey(id, full_name, handle, avatar_url, role)')
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
    .select('id, title, slug, body, vote_count, created_at, group_id, profiles!community_threads_author_id_fkey(id, full_name, handle, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(30)

  if (groupSlug && groupSlug !== 'all') {
    const group = groupsWithCounts.find(g => g.slug === groupSlug)
    if (group) {
      threadsQuery = threadsQuery.eq('group_id', group.id)
    }
  }

  const { data: threads } = await threadsQuery

  // Count posts per thread
  const threadsWithCounts = await Promise.all(
    (threads || []).map(async (t) => {
      const { count } = await admin
        .from('community_posts')
        .select('id', { count: 'exact', head: true })
        .eq('thread_id', t.id)
      return { ...t, replyCount: count || 0 }
    })
  )

  return NextResponse.json({
    groups: groupsWithCounts,
    threads: threadsWithCounts,
    activeGroup: groupSlug || 'all',
    userId: user.id,
  })
}
