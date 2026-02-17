import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * POST /api/community/threads/[slug]/posts — Reply to a thread
 * Body: { body, parent_post_id? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { body, parent_post_id } = await request.json()
  if (!body?.trim()) return NextResponse.json({ error: 'Body is required' }, { status: 400 })

  // Get thread
  const { data: thread } = await supabase
    .from('community_threads')
    .select('id, is_locked')
    .eq('slug', slug)
    .single()

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  if (thread.is_locked) return NextResponse.json({ error: 'Thread is locked' }, { status: 403 })

  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      thread_id: thread.id,
      user_id: user.id,
      body: body.trim(),
      parent_post_id: parent_post_id || null,
    })
    .select('*, profiles!community_posts_user_id_fkey(full_name, email)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
