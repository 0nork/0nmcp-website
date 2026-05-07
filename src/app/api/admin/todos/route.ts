import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = ['mike@rocketopp.com']
const CRM_BASE = 'https://services.leadconnectorhq.com'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAdmin(supabase: any) {
  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) return null
  return user
}

/**
 * GET /api/admin/todos — list all todos
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  const user = await checkAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const admin = getAdmin()
  const { data: todos } = await admin
    .from('admin_todos')
    .select('*')
    .eq('user_id', user.id)
    .order('completed', { ascending: true })
    .order('urgency', { ascending: false })
    .order('due_date', { ascending: true, nullsFirst: false })

  const { data: notifications } = await admin
    .from('admin_notifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ todos: todos || [], notifications: notifications || [] })
}

/**
 * POST /api/admin/todos — create a new todo
 * Body: { title, urgency, dueDate?, fileName?, fileUrl? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  const user = await checkAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  let body: { title?: string; urgency?: number; dueDate?: string; fileName?: string; fileUrl?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const admin = getAdmin()

  // Create in Supabase
  const { data: todo, error } = await admin
    .from('admin_todos')
    .insert({
      user_id: user.id,
      title: body.title.trim(),
      urgency: body.urgency ?? 0,
      due_date: body.dueDate || null,
      file_name: body.fileName || null,
      file_url: body.fileUrl || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sync to CRM as a task (non-blocking)
  syncToCrm(todo, user.email!).catch(err =>
    console.error('[todo] CRM sync failed:', err.message)
  )

  return NextResponse.json({ todo })
}

/**
 * PATCH /api/admin/todos — update a todo (complete, edit, etc.)
 * Body: { id, completed?, title?, urgency?, dueDate? }
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  const user = await checkAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  let body: { id?: string; completed?: boolean; title?: string; urgency?: number; dueDate?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const admin = getAdmin()
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.completed !== undefined) {
    update.completed = body.completed
    update.completed_at = body.completed ? new Date().toISOString() : null
  }
  if (body.title !== undefined) update.title = body.title
  if (body.urgency !== undefined) update.urgency = body.urgency
  if (body.dueDate !== undefined) update.due_date = body.dueDate

  const { data, error } = await admin
    .from('admin_todos')
    .update(update)
    .eq('id', body.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ todo: data })
}

/**
 * DELETE /api/admin/todos — delete a todo
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  const user = await checkAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const admin = getAdmin()
  await admin.from('admin_todos').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}

// ── Sync todo to CRM as a task ──
async function syncToCrm(
  todo: { id: string; title: string; urgency: number; due_date: string | null },
  email: string
) {
  const agencyKey = process.env.CRM_AGENCY_KEY || process.env.CRM_AGENT_STUDIO_KEY
  const locationId = process.env.CRM_AGENT_STUDIO_LOCATION_ID || process.env.CRM_COMMUNITY_LOCATION_ID
  if (!agencyKey || !locationId) return

  // Find contact
  const searchRes = await fetch(`${CRM_BASE}/contacts/?locationId=${locationId}&query=${encodeURIComponent(email)}&limit=1`, {
    headers: { 'Authorization': `Bearer ${agencyKey}`, 'Version': '2021-07-28' },
  })
  if (!searchRes.ok) return
  const searchData = await searchRes.json()
  const contactId = searchData.contacts?.[0]?.id
  if (!contactId) return

  // Create task
  const urgencyLabel = todo.urgency >= 0.8 ? 'HOT' : todo.urgency >= 0.5 ? 'WARM' : 'COOL'
  const taskRes = await fetch(`${CRM_BASE}/contacts/${contactId}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${agencyKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28',
    },
    body: JSON.stringify({
      title: `[${urgencyLabel}] ${todo.title}`,
      body: `Created from 0n Console to-do list.\nUrgency: ${urgencyLabel} (${Math.round(todo.urgency * 100)}%)`,
      dueDate: todo.due_date || undefined,
      completed: false,
    }),
  })

  if (taskRes.ok) {
    const taskData = await taskRes.json()
    const admin = getAdmin()
    await admin.from('admin_todos').update({ crm_task_id: taskData.task?.id }).eq('id', todo.id)
  }
}
