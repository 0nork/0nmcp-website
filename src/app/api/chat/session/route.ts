/**
 * POST /api/chat/session — Save/restore chat sessions
 * GET  /api/chat/session — List user's chat sessions
 *
 * Auto-saves chat messages to Supabase for cross-device persistence.
 * Sessions are keyed by session_id (UUID) and tied to the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * POST — Save a chat session (upsert)
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { session_id?: string; messages?: unknown[]; title?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { session_id, messages, title } = body
  if (!session_id || !messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Missing session_id or messages' }, { status: 400 })
  }

  // Auto-generate title from first user message
  const autoTitle = title || (() => {
    const firstUserMsg = messages.find((m: unknown) => (m as { role?: string }).role === 'user') as { text?: string } | undefined
    if (firstUserMsg?.text) {
      return firstUserMsg.text.slice(0, 100) + (firstUserMsg.text.length > 100 ? '...' : '')
    }
    return 'New Conversation'
  })()

  const { error } = await supabase
    .from('chat_sessions')
    .upsert({
      id: session_id,
      user_id: user.id,
      title: autoTitle,
      messages,
      message_count: messages.length,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (error) {
    console.error('[chat/session] Save error:', error.message)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, session_id })
}

/**
 * GET — List chat sessions for the authenticated user
 * Query params: ?limit=20&offset=0
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
  const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('id, title, message_count, last_message_at, created_at')
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }

  return NextResponse.json({ sessions })
}
