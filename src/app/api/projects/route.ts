import { createSupabaseServer } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const companyId = req.nextUrl.searchParams.get('company_id')

  // Get companies
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get projects (optionally filtered by company)
  let projectQuery = supabase
    .from('projects')
    .select('*, tasks(id, status)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (companyId) projectQuery = projectQuery.eq('company_id', companyId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: projects } = await projectQuery as { data: any[] | null }

  // Get tasks summary
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, status, priority, project_id, due_date')
    .eq('user_id', user.id)

  return NextResponse.json({
    companies: companies || [],
    projects: (projects || []).map(p => ({
      ...p,
      task_count: p.tasks?.length || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      done_count: p.tasks?.filter((t: any) => t.status === 'done').length || 0,
    })),
    stats: {
      total_companies: companies?.length || 0,
      total_projects: projects?.length || 0,
      total_tasks: tasks?.length || 0,
      todo: tasks?.filter(t => t.status === 'todo').length || 0,
      in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
      done: tasks?.filter(t => t.status === 'done').length || 0,
      urgent: tasks?.filter(t => t.priority === 'urgent').length || 0,
    },
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, ...data } = body

  if (type === 'company') {
    const { data: company, error } = await supabase
      .from('companies')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ company })
  }

  if (type === 'project') {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ project })
  }

  if (type === 'task') {
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ task })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { type, id, ...updates } = body

  const table = type === 'company' ? 'companies' : type === 'project' ? 'projects' : 'tasks'

  if (type === 'task' && updates.status === 'done') {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ [type]: data })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: "DB error" }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, id } = await req.json()
  const table = type === 'company' ? 'companies' : type === 'project' ? 'projects' : 'tasks'

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
