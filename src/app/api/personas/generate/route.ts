import { NextRequest, NextResponse } from 'next/server'
import { generatePersona, createPersonaWithProfile } from '@/lib/personas'

const ADMIN_EMAILS = ['mike@rocketopp.com']

/**
 * POST /api/personas/generate — AI-generate a new persona from a prompt
 * Body: { prompt: string, save?: boolean }
 * Returns the generated persona (preview). If save=true, also persists it.
 */
export async function POST(request: NextRequest) {
  // Admin-only
  const { createSupabaseServer } = await import('@/lib/supabase/server')
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { prompt, save } = await request.json()
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  try {
    const persona = await generatePersona(prompt.trim())

    if (save) {
      const saved = await createPersonaWithProfile(persona)
      return NextResponse.json({ persona: saved, saved: true }, { status: 201 })
    }

    return NextResponse.json({ persona, saved: false })
  } catch (err) {
    console.error('[personas/generate] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
