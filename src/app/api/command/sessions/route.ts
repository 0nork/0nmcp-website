import { NextRequest, NextResponse } from 'next/server'
import { getCommandDb } from '@/lib/command-db'

// GET /api/command/sessions — list session logs
export async function GET(req: NextRequest) {
  const db = getCommandDb()
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10')

  const { data, error } = await db
    .from('onc_sessions')
    .select('*')
    .order('session_date', { ascending: false })
    .order('session_number', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ sessions: data, count: data.length })
}

// POST /api/command/sessions — log a session
export async function POST(req: NextRequest) {
  const db = getCommandDb()
  const body = await req.json()

  if (!body.summary) {
    return NextResponse.json({ error: 'summary required' }, { status: 400 })
  }

  const { data, error } = await db.from('onc_sessions').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ session: data }, { status: 201 })
}
