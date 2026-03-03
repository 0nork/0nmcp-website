import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/community/search?q=query&limit=20
 * Searches community_threads (title, body) and community_posts (body)
 * Returns combined results sorted by created_at desc
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')?.trim()
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
      { status: 400 }
    )
  }

  const pattern = `%${q}%`

  // Search threads: match on title or body
  const threadsQuery = supabase
    .from('community_threads')
    .select(`
      id,
      title,
      slug,
      body,
      created_at,
      reply_count,
      score,
      group_id,
      user_id,
      profiles(full_name, email),
      community_groups(slug, name)
    `)
    .or(`title.ilike.${pattern},body.ilike.${pattern}`)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Search posts/comments: match on body
  const postsQuery = supabase
    .from('community_posts')
    .select(`
      id,
      body,
      created_at,
      user_id,
      thread_id,
      profiles(full_name, email),
      community_threads(title, slug)
    `)
    .ilike('body', pattern)
    .order('created_at', { ascending: false })
    .limit(limit)

  const [threadsResult, postsResult] = await Promise.all([threadsQuery, postsQuery])

  if (threadsResult.error) {
    return NextResponse.json({ error: threadsResult.error.message }, { status: 500 })
  }
  if (postsResult.error) {
    return NextResponse.json({ error: postsResult.error.message }, { status: 500 })
  }

  // Shape thread results
  const threadResults = (threadsResult.data || []).map((t: Record<string, unknown>) => {
    const profile = t.profiles as Record<string, string> | null
    const group = t.community_groups as Record<string, string> | null
    const body = (t.body as string) || ''
    return {
      type: 'thread' as const,
      id: t.id as string,
      title: t.title as string,
      slug: t.slug as string,
      body_preview: body.slice(0, 150) + (body.length > 150 ? '…' : ''),
      author_name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown',
      created_at: t.created_at as string,
      group_slug: group?.slug || null,
      group_name: group?.name || null,
      reply_count: (t.reply_count as number) || 0,
      score: (t.score as number) || 0,
    }
  })

  // Shape post/comment results
  const postResults = (postsResult.data || []).map((p: Record<string, unknown>) => {
    const profile = p.profiles as Record<string, string> | null
    const thread = p.community_threads as Record<string, string> | null
    const body = (p.body as string) || ''
    return {
      type: 'comment' as const,
      id: p.id as string,
      body_preview: body.slice(0, 150) + (body.length > 150 ? '…' : ''),
      author_name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown',
      created_at: p.created_at as string,
      thread_title: thread?.title || 'Unknown thread',
      thread_slug: thread?.slug || '',
    }
  })

  // Combine and sort by created_at descending
  const combined = [...threadResults, ...postResults].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return NextResponse.json({
    results: combined.slice(0, limit),
    total: combined.length,
  })
}
