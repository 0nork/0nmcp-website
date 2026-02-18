import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['mike@rocketopp.com']

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/personas/[id] — Get a single persona
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { createSupabaseServer } = await import('@/lib/supabase/server')
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const admin = getAdmin()
  const { data, error } = await admin
    .from('community_personas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

/**
 * PATCH /api/personas/[id] — Update a persona
 * Body: partial persona fields to update
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { createSupabaseServer } = await import('@/lib/supabase/server')
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  // Only allow safe fields
  const allowed = [
    'name', 'slug', 'avatar_url', 'bio', 'role', 'expertise',
    'personality', 'knowledge_level', 'preferred_groups',
    'is_active', 'activity_level',
  ]
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const admin = getAdmin()
  const { data, error } = await admin
    .from('community_personas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

/**
 * DELETE /api/personas/[id] — Delete a persona
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { createSupabaseServer } = await import('@/lib/supabase/server')
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const admin = getAdmin()

  // Get persona to find associated profile
  const { data: persona } = await admin
    .from('community_personas')
    .select('slug')
    .eq('id', id)
    .single()

  // Delete persona
  const { error } = await admin
    .from('community_personas')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Clean up the profile row
  if (persona) {
    await admin
      .from('profiles')
      .delete()
      .eq('email', `persona-${persona.slug}@0nmcp.internal`)
      .eq('is_persona', true)
  }

  return NextResponse.json({ deleted: true })
}
