import { NextRequest, NextResponse } from 'next/server'
import { getCommandDb } from '@/lib/command-db'

// GET /api/command/directives — list active directives
export async function GET(req: NextRequest) {
  const db = getCommandDb()
  const active = req.nextUrl.searchParams.get('active') !== 'false'
  const category = req.nextUrl.searchParams.get('category')

  let query = db.from('onc_directives').select('*').order('directive_id')

  if (active) query = query.eq('active', true)
  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ directives: data, count: data.length })
}

// POST /api/command/directives — add a directive
export async function POST(req: NextRequest) {
  const db = getCommandDb()
  const body = await req.json()

  if (!body.directive_id || !body.title || !body.body || !body.category) {
    return NextResponse.json({ error: 'directive_id, title, body, and category required' }, { status: 400 })
  }

  const { data, error } = await db.from('onc_directives').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ directive: data }, { status: 201 })
}

// PATCH /api/command/directives — update a directive by directive_id
export async function PATCH(req: NextRequest) {
  const db = getCommandDb()
  const body = await req.json()
  const { directive_id, ...updates } = body

  if (!directive_id) return NextResponse.json({ error: 'directive_id required' }, { status: 400 })

  const { data, error } = await db.from('onc_directives').update(updates).eq('directive_id', directive_id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ directive: data })
}
