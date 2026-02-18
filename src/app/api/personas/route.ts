import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPersonaWithProfile } from '@/lib/personas'

const ADMIN_EMAILS = ['mike@rocketopp.com']

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/personas — List all personas
 * Query: active (true/false), limit, offset
 */
export async function GET(request: NextRequest) {
  const { createSupabaseServer } = await import('@/lib/supabase/server')
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const activeOnly = searchParams.get('active') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const admin = getAdmin()
  let query = admin
    .from('community_personas')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result: Record<string, unknown> = { personas: data, total: count }

  // Optionally include seeds
  if (searchParams.get('seeds') === 'true') {
    const { data: seedData } = await admin
      .from('persona_topic_seeds')
      .select('*')
      .order('priority', { ascending: false })
      .order('used_count', { ascending: true })
      .limit(100)
    result.seeds = seedData || []
  }

  // Optionally include activity log
  if (searchParams.get('activity') === 'true') {
    const { data: activityData } = await admin
      .from('persona_conversations')
      .select('*, community_personas(name)')
      .order('created_at', { ascending: false })
      .limit(50)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.activity = (activityData || []).map((a: any) => ({
      ...a,
      persona_name: a.community_personas?.name || null,
      community_personas: undefined,
    }))
  }

  return NextResponse.json(result)
}

/**
 * POST /api/personas — Create a persona manually
 * Body: full persona object (name, slug, bio, role, expertise, personality, etc.)
 */
export async function POST(request: NextRequest) {
  const { createSupabaseServer } = await import('@/lib/supabase/server')
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()

  // Handle topic seed creation
  if (body._action === 'add_seed') {
    if (!body.topic?.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }
    const admin = getAdmin()
    const { data, error } = await admin
      .from('persona_topic_seeds')
      .insert({
        topic: body.topic.trim(),
        category: body.category || null,
        prompt_hint: body.prompt_hint || null,
        priority: body.priority || 5,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ seed: data }, { status: 201 })
  }

  // Handle persona creation
  if (!body.name?.trim() || !body.slug?.trim()) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
  }

  try {
    const persona = await createPersonaWithProfile(body)
    return NextResponse.json({ persona }, { status: 201 })
  } catch (err) {
    console.error('[personas] Create error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Create failed' },
      { status: 500 }
    )
  }
}
