import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/community/threads — List threads
 * Query: category, sort (recent|popular|unanswered), limit, offset
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { searchParams } = request.nextUrl
  const category = searchParams.get('category')
  const sort = searchParams.get('sort') || 'recent'
  const limit = parseInt(searchParams.get('limit') || '30')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('community_threads')
    .select('*, profiles!community_threads_user_id_fkey(full_name, email)', { count: 'exact' })

  if (category && category !== 'all') query = query.eq('category', category)

  // Pinned first, then sort
  query = query.order('is_pinned', { ascending: false })

  if (sort === 'popular') {
    query = query.order('reply_count', { ascending: false })
  } else if (sort === 'unanswered') {
    query = query.eq('reply_count', 0).order('created_at', { ascending: false })
  } else {
    query = query.order('last_reply_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ threads: data, total: count })
}

/**
 * POST /api/community/threads — Create a new thread
 * Body: { title, body, category }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { title, body, category } = await request.json()
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
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
      category: category || 'general',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
