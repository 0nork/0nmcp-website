import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { callAI } from '@/lib/ai-provider'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* ─── MAIN HANDLER — AI FEDERATION (routes through per-user provider) ── */

export async function POST(request: NextRequest) {
  const { system, user } = await request.json()

  if (!system || !user) {
    return NextResponse.json({ error: 'Missing system or user prompt', text: '[error: missing prompt]' }, { status: 400 })
  }

  // Get authenticated user for per-user AI provider routing
  let userId: string | undefined
  try {
    const supabase = await createSupabaseServer()
    if (supabase) {
      const authUser = (await supabase.auth.getSession()).data.session?.user ?? null
      userId = authUser?.id || undefined
    }
  } catch { /* continue without auth */ }

  const result = await callAI({ system, user, maxTokens: 1000 }, userId)

  if (result) {
    return NextResponse.json({ text: result.text, provider: result.provider })
  }

  return NextResponse.json({
    text: 'I need an AI key to generate responses. Please add an API key (Claude, GPT-4o, or Gemini) in the Console Vault under Credentials. Any one of these will power the entire Council system.',
    provider: 'none',
    fallback: true,
  })
}
