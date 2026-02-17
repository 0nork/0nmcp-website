import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/community/threads/[slug] — Thread detail + replies
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  // Get thread
  const { data: thread, error } = await supabase
    .from('community_threads')
    .select('*, profiles!community_threads_user_id_fkey(full_name, email)')
    .eq('slug', slug)
    .single()

  if (error || !thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })

  // Increment view count (fire and forget)
  supabase.rpc('increment_view_count' as string, { thread_id: thread.id }).then()

  // Get replies
  const { data: posts } = await supabase
    .from('community_posts')
    .select('*, profiles!community_posts_user_id_fkey(full_name, email)')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true })

  // Get reaction counts
  const { data: reactions } = await supabase
    .from('community_reactions')
    .select('thread_id, post_id, reaction_type')
    .or(`thread_id.eq.${thread.id},post_id.in.(${(posts || []).map((p: { id: string }) => p.id).join(',')})`)

  return NextResponse.json({ thread, posts: posts || [], reactions: reactions || [] })
}
