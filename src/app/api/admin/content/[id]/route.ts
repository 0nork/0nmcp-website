import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getAdmin } from '@/lib/content-engine'

const ADMIN_EMAILS = ['mike@rocketopp.com']

async function requireAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase!.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) return null
  return user
}

/**
 * GET /api/admin/content/[id] — Get single content item
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = getAdmin()
  const { data, error } = await admin
    .from('content_queue')
    .select('*, content_topics(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

/**
 * PATCH /api/admin/content/[id] — Update content (edit, approve, reject, schedule)
 * Body: { status?, title?, body?, scheduled_for?, rejection_reason? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const updates = await request.json()
  const admin = getAdmin()

  // Track edits
  const allowed = ['status', 'title', 'body', 'scheduled_for', 'rejection_reason']
  const patch: Record<string, unknown> = {}

  for (const key of allowed) {
    if (updates[key] !== undefined) patch[key] = updates[key]
  }

  // If approving or rejecting, record reviewer
  if (updates.status === 'approved' || updates.status === 'rejected') {
    patch.reviewed_by = user.email
    patch.reviewed_at = new Date().toISOString()
  }

  // If editing body, increment edit count
  if (updates.body) {
    const { data: current } = await admin
      .from('content_queue')
      .select('edit_count')
      .eq('id', id)
      .single()
    const row = current as Record<string, unknown> | null
    patch.edit_count = ((row?.edit_count as number) || 0) + 1
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin.from('content_queue') as any)
    .update(patch)
    .eq('id', id)
    .select('*, content_topics(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

/**
 * DELETE /api/admin/content/[id] — Delete content item
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const admin = getAdmin()
  const { error } = await admin.from('content_queue').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
