import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * POST /api/community/groups/[slug]/join — Join a group
 * DELETE /api/community/groups/[slug]/join — Leave a group
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  // Find group
  const { data: group } = await supabase
    .from('community_groups')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const { error } = await supabase.from('community_memberships').insert({
    user_id: user.id,
    group_id: group.id,
    role: 'member',
  })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ message: 'Already a member' })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ joined: true }, { status: 201 })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { data: group } = await supabase
    .from('community_groups')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  await supabase
    .from('community_memberships')
    .delete()
    .eq('user_id', user.id)
    .eq('group_id', group.id)

  return NextResponse.json({ left: true })
}
