import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Verify project access
  const { data: project } = await supabase
    .from('web0n_projects')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  if (project.user_id !== user.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
  }

  const { data: revisions, error } = await supabase
    .from('web0n_revisions')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 })
  }

  return NextResponse.json({ revisions: revisions || [] })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('web0n_projects')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { message } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const { data: revision, error } = await supabase
      .from('web0n_revisions')
      .insert({
        project_id: id,
        user_id: user.id,
        message: message.trim(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create revision' }, { status: 500 })
    }

    return NextResponse.json({ revision })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Admin only
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { revisionId, adminResponse, status } = body

    if (!revisionId) {
      return NextResponse.json({ error: 'Revision ID is required' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (adminResponse !== undefined) updates.admin_response = adminResponse
    if (status) updates.status = status

    const { data: revision, error } = await supabase
      .from('web0n_revisions')
      .update(updates)
      .eq('id', revisionId)
      .eq('project_id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update revision' }, { status: 500 })
    }

    return NextResponse.json({ revision })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
