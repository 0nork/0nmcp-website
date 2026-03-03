import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('oncall_brain')
    .select('context_key, context_value')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const brain: Record<string, unknown> = {}
  for (const row of data || []) {
    brain[row.context_key] = row.context_value
  }

  return NextResponse.json({ brain })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { key?: string; value?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.key || typeof body.key !== 'string') {
    return NextResponse.json({ error: 'key is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('oncall_brain')
    .upsert(
      {
        user_id: user.id,
        context_key: body.key,
        context_value: body.value || {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,context_key' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
