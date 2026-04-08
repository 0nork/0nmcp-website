import { NextRequest, NextResponse } from 'next/server'
import { getCommandDb } from '@/lib/command-db'

// GET /api/command/knowledge — search knowledge base
export async function GET(req: NextRequest) {
  const db = getCommandDb()
  const q = req.nextUrl.searchParams.get('q')
  const category = req.nextUrl.searchParams.get('category')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')

  let query = db.from('onc_knowledge').select('*').order('updated_at', { ascending: false }).limit(limit)

  if (category) query = query.eq('category', category)

  // Full-text search via the searchable tsvector column
  if (q) query = query.textSearch('searchable', q, { type: 'websearch' })

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entries: data, count: data.length })
}

// POST /api/command/knowledge — add a knowledge entry
export async function POST(req: NextRequest) {
  const db = getCommandDb()
  const body = await req.json()

  if (!body.title || !body.content || !body.category) {
    return NextResponse.json({ error: 'title, content, and category required' }, { status: 400 })
  }

  const { data, error } = await db.from('onc_knowledge').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entry: data }, { status: 201 })
}

// PATCH /api/command/knowledge — update an entry by id
export async function PATCH(req: NextRequest) {
  const db = getCommandDb()
  const body = await req.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data, error } = await db.from('onc_knowledge').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entry: data })
}
