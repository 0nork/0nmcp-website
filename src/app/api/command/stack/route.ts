import { NextRequest, NextResponse } from 'next/server'
import { getCommandDb } from '@/lib/command-db'

// GET /api/command/stack — list all components and their status
export async function GET(req: NextRequest) {
  const db = getCommandDb()
  const status = req.nextUrl.searchParams.get('status')
  const revenue = req.nextUrl.searchParams.get('revenue_state')

  let query = db.from('onc_stack').select('*').order('priority', { ascending: true, nullsFirst: false })

  if (status) query = query.eq('status', status)
  if (revenue) query = query.eq('revenue_state', revenue)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ components: data, count: data.length })
}

// POST /api/command/stack — register a component
export async function POST(req: NextRequest) {
  const db = getCommandDb()
  const body = await req.json()

  if (!body.component || !body.status || !body.revenue_state) {
    return NextResponse.json({ error: 'component, status, and revenue_state required' }, { status: 400 })
  }

  const { data, error } = await db.from('onc_stack').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ component: data }, { status: 201 })
}

// PATCH /api/command/stack — update component status
export async function PATCH(req: NextRequest) {
  const db = getCommandDb()
  const body = await req.json()
  const { component, ...updates } = body

  if (!component) return NextResponse.json({ error: 'component name required' }, { status: 400 })

  updates.last_verified = new Date().toISOString()

  const { data, error } = await db.from('onc_stack').update(updates).eq('component', component).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ component: data })
}
