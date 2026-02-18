import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/community/groups — List all community groups (subreddits)
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data, error } = await supabase
    .from('community_groups')
    .select('*')
    .order('is_default', { ascending: false })
    .order('member_count', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ groups: data })
}

/**
 * POST /api/community/groups — Create a new group
 * Body: { name, description, icon?, color? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { name, description, icon, color } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)

  const { data, error } = await supabase
    .from('community_groups')
    .insert({
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      icon: icon || null,
      color: color || '#00ff88',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Group name already taken' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Auto-join creator
  await supabase.from('community_memberships').insert({
    user_id: user.id,
    group_id: data.id,
    role: 'admin',
  })

  return NextResponse.json(data, { status: 201 })
}
