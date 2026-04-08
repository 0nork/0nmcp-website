import { NextRequest, NextResponse } from 'next/server'
import { getCommandDb } from '@/lib/command-db'

// GET /api/command/tasks — list tasks, filter by status/priority
export async function GET(req: NextRequest) {
  const db = getCommandDb()
  const status = req.nextUrl.searchParams.get('status')
  const category = req.nextUrl.searchParams.get('category')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')

  let query = db.from('onc_tasks').select('*').order('priority').order('created_at').limit(limit)

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ tasks: data, count: data.length })
}

// POST /api/command/tasks — create a task card
export async function POST(req: NextRequest) {
  const db = getCommandDb()
  const body = await req.json()

  const required = ['task_id', 'title', 'category', 'priority', 'assigned_to', 'task_type', 'success_proof']
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
    }
  }

  const { data, error } = await db.from('onc_tasks').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ task: data }, { status: 201 })
}

// PATCH /api/command/tasks — update a task (by task_id in body)
export async function PATCH(req: NextRequest) {
  const db = getCommandDb()
  const body = await req.json()
  const { task_id, ...updates } = body

  if (!task_id) return NextResponse.json({ error: 'task_id required' }, { status: 400 })

  // If moving to in-progress, the DB constraint enforces one-at-a-time
  const { data, error } = await db.from('onc_tasks').update(updates).eq('task_id', task_id).select().single()

  if (error) {
    // Unique constraint violation = another task already in-progress
    if (error.code === '23505') {
      return NextResponse.json({
        error: 'One task at a time. Another task is already in-progress. Complete or requeue it first.'
      }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ task: data })
}
