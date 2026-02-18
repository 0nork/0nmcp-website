import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/community/threads — List threads (Reddit-style)
 * Query: group, sort (hot|new|top|controversial), limit, offset, timeframe (day|week|month|year|all)
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { searchParams } = request.nextUrl
  const group = searchParams.get('group')
  const sort = searchParams.get('sort') || 'hot'
  const limit = parseInt(searchParams.get('limit') || '30')
  const offset = parseInt(searchParams.get('offset') || '0')
  const timeframe = searchParams.get('timeframe') || 'all'

  let query = supabase
    .from('community_threads')
    .select(`
      *,
      profiles!community_threads_user_id_fkey(full_name, email, karma, reputation_level, avatar_url),
      community_groups!community_threads_group_id_fkey(name, slug, icon, color)
    `, { count: 'exact' })

  // Filter by group
  if (group && group !== 'all') {
    const { data: grp } = await supabase
      .from('community_groups')
      .select('id')
      .eq('slug', group)
      .single()
    if (grp) query = query.eq('group_id', grp.id)
  }

  // Timeframe filter for top/controversial
  if (timeframe !== 'all' && (sort === 'top' || sort === 'controversial')) {
    const now = new Date()
    let since: Date
    switch (timeframe) {
      case 'day': since = new Date(now.getTime() - 86400000); break
      case 'week': since = new Date(now.getTime() - 604800000); break
      case 'month': since = new Date(now.getTime() - 2592000000); break
      case 'year': since = new Date(now.getTime() - 31536000000); break
      default: since = new Date(0)
    }
    query = query.gte('created_at', since.toISOString())
  }

  // Pinned first always
  query = query.order('is_pinned', { ascending: false })

  // Sort
  switch (sort) {
    case 'hot':
      query = query.order('hot_score', { ascending: false })
      break
    case 'top':
      query = query.order('score', { ascending: false })
      break
    case 'new':
      query = query.order('created_at', { ascending: false })
      break
    case 'controversial':
      // Controversial = high activity + score near 0
      query = query.order('reply_count', { ascending: false })
      break
    default:
      query = query.order('hot_score', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get user's votes for these threads (if logged in)
  let userVotes: Record<string, number> = {}
  const { data: { user } } = await supabase.auth.getUser()
  if (user && data?.length) {
    const threadIds = data.map((t: { id: string }) => t.id)
    const { data: votes } = await supabase
      .from('community_votes')
      .select('thread_id, vote')
      .eq('user_id', user.id)
      .in('thread_id', threadIds)
    if (votes) {
      userVotes = Object.fromEntries(votes.map((v: { thread_id: string; vote: number }) => [v.thread_id, v.vote]))
    }
  }

  return NextResponse.json({ threads: data, total: count, userVotes })
}

/**
 * POST /api/community/threads — Create a new thread
 * Body: { title, body, group_slug? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { title, body, group_slug } = await request.json()
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
  }

  // Resolve group
  let groupId: string | null = null
  let category = 'general'
  if (group_slug) {
    const { data: grp } = await supabase
      .from('community_groups')
      .select('id, slug')
      .eq('slug', group_slug)
      .single()
    if (grp) {
      groupId = grp.id
      category = grp.slug
    }
  }

  // Generate slug
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const { data, error } = await supabase
    .from('community_threads')
    .insert({
      user_id: user.id,
      title: title.trim(),
      slug,
      body: body.trim(),
      category,
      group_id: groupId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-upvote own thread
  await supabase.from('community_votes').insert({
    user_id: user.id,
    thread_id: data.id,
    vote: 1,
  })

  return NextResponse.json(data, { status: 201 })
}
