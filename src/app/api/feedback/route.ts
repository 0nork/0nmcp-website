import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { question, response, timestamp } = body

    // Log feedback (could also store in Supabase)
    console.log('[FEEDBACK]', { question, response, timestamp, date: new Date(timestamp).toISOString() })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
