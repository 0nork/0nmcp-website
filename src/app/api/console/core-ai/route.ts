import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const VALID_PROVIDERS = ['anthropic', 'openai', 'gemini', 'groq', 'openrouter', 'perplexity']

export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ provider: null })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ provider: null }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('core_ai_provider')
    .eq('id', user.id)
    .maybeSingle()

  return NextResponse.json({ provider: data?.core_ai_provider || null })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { provider: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.provider || !VALID_PROVIDERS.includes(body.provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ core_ai_provider: body.provider })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ provider: body.provider })
}
