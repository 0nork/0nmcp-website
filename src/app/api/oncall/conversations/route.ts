import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('oncall_conversations')
    .select('id, messages, summary, page_context, provider_used, message_count, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ conversations: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    id?: string
    messages?: unknown[]
    summary?: string
    page_context?: string
    provider_used?: string
    message_count?: number
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.id) {
    // Update existing
    const { error } = await supabase
      .from('oncall_conversations')
      .update({
        messages: body.messages || [],
        summary: body.summary,
        provider_used: body.provider_used,
        message_count: body.message_count || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, id: body.id })
  }

  // Create new
  const { data, error } = await supabase
    .from('oncall_conversations')
    .insert({
      user_id: user.id,
      messages: body.messages || [],
      summary: body.summary,
      page_context: body.page_context,
      provider_used: body.provider_used,
      message_count: body.message_count || 0,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, id: data?.id })
}
