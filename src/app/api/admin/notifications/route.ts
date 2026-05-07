import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

/**
 * GET /api/admin/notifications — get unread notifications + check due todos
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ notifications: [] })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ notifications: [] })

  const admin = getAdmin()

  // Check for todos that are due and haven't been notified
  const now = new Date().toISOString()
  const { data: dueTodos } = await admin
    .from('admin_todos')
    .select('id, title, urgency, due_date')
    .eq('user_id', user.id)
    .eq('completed', false)
    .eq('notified', false)
    .lte('due_date', now)

  // Create notifications for newly due todos
  if (dueTodos && dueTodos.length > 0) {
    for (const todo of dueTodos) {
      const urgencyLabel = todo.urgency >= 0.8 ? 'HOT' : todo.urgency >= 0.5 ? 'WARM' : 'COOL'
      await admin.from('admin_notifications').insert({
        user_id: user.id,
        type: 'todo_due',
        title: `[${urgencyLabel}] Task Due: ${todo.title}`,
        body: `This task was due ${new Date(todo.due_date).toLocaleDateString()}`,
        todo_id: todo.id,
      })
      await admin.from('admin_todos').update({ notified: true }).eq('id', todo.id)
    }
  }

  // Return all unread notifications
  const { data: notifications } = await admin
    .from('admin_notifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ notifications: notifications || [], newDue: dueTodos?.length || 0 })
}

/**
 * PATCH /api/admin/notifications — mark as read
 * Body: { id: string } or { readAll: true }
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { id?: string; readAll?: boolean }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const admin = getAdmin()

  if (body.readAll) {
    await admin.from('admin_notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
  } else if (body.id) {
    await admin.from('admin_notifications').update({ read: true }).eq('id', body.id).eq('user_id', user.id)
  }

  return NextResponse.json({ success: true })
}
