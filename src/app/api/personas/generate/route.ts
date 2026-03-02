import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  generatePersona,
  generatePersonaCohort,
  createPersonaWithProfile,
  type Persona,
} from '@/lib/personas'

const ADMIN_EMAILS = ['mike@rocketopp.com']

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/personas/generate — AI-generate personas
 *
 * Single:  { prompt: string, save?: boolean }
 * Cohort:  { action: 'cohort', count?: number }
 * ModBot:  { action: 'moderator' }
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

  const body = await request.json()
  const { action, prompt, save, count } = body

  try {
    // ============ Moderator Bot ============
    if (action === 'moderator') {
      return await handleCreateModerator()
    }

    // ============ Cohort Generation ============
    if (action === 'cohort') {
      return await handleCohortGeneration(count || 6)
    }

    // ============ Single Persona (existing behavior) ============
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Load existing personas for context
    const admin = getAdmin()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (admin.from('community_personas') as any)
      .select('name, role, expertise, personality, knowledge_level')
      .eq('is_active', true)

    const persona = await generatePersona(prompt.trim(), existing || [])

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

/**
 * Create the 0nMCP Forum Moderator bot
 */
async function handleCreateModerator() {
  const admin = getAdmin()

  // Check if moderator already exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingMod } = await (admin.from('community_personas') as any)
    .select('id, name')
    .eq('role', 'moderator')
    .limit(1)

  if (existingMod?.length > 0) {
    return NextResponse.json({
      error: `Moderator already exists: ${existingMod[0].name}`,
      existing: existingMod[0],
    }, { status: 409 })
  }

  // The moderator is hand-crafted, not AI-generated
  const modData = {
    name: 'Kira Tanaka',
    slug: 'kira-tanaka',
    avatar_url: null,
    bio: 'Community lead at 0nMCP. I keep the lights on and the conversations flowing. Ask me anything about the platform.',
    role: 'moderator',
    expertise: ['community-management', 'api-integration', 'workflows', 'onboarding', 'documentation'],
    personality: {
      tone: 'helpful' as const,
      verbosity: 'moderate' as const,
      emoji_usage: 'minimal' as const,
      asks_followups: true,
      writing_style: 'encouraging-mentor',
      quirks: [
        'references personal anecdotes from past jobs',
        'thanks other posters by name',
        'ends posts asking what others think',
      ],
      sentence_structure: 'varied-complex (mixes long/short, subordinate clauses)',
      vocabulary_level: 'mixed-colloquial (professional with occasional casual)',
      punctuation_style: 'dash-heavy (em dashes everywhere — like this — for asides)',
    },
    knowledge_level: 'expert',
    preferred_groups: ['general', 'help', 'showcase', 'feature-requests', 'tutorials', 'workflows', 'integrations'],
    is_active: true,
    activity_level: 'high',
    is_moderator: true,
  }

  const saved = await createPersonaWithProfile(modData)

  return NextResponse.json({
    action: 'moderator_created',
    persona: saved,
    saved: true,
  }, { status: 201 })
}

/**
 * Generate a cohort of complementary personas and save them all
 */
async function handleCohortGeneration(count: number) {
  const admin = getAdmin()

  // Load existing personas for complementary generation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin.from('community_personas') as any)
    .select('name, role, expertise, personality, knowledge_level')
    .eq('is_active', true)

  const cohort = await generatePersonaCohort(
    Math.min(count, 10),
    (existing || []) as Partial<Persona>[]
  )

  // Save all personas
  const saved: Persona[] = []
  const errors: string[] = []

  for (const personaData of cohort) {
    try {
      const persona = await createPersonaWithProfile(personaData)
      saved.push(persona)
    } catch (err) {
      errors.push(`${personaData.name}: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  return NextResponse.json({
    action: 'cohort_generated',
    count: saved.length,
    personas: saved.map(p => ({ id: p.id, name: p.name, role: p.role, knowledge_level: p.knowledge_level })),
    errors: errors.length > 0 ? errors : undefined,
  }, { status: 201 })
}
