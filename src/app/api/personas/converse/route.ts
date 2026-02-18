import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  generateThread,
  generateReply,
  selectRespondingPersona,
  shouldRespond,
  insertPersonaThread,
  insertPersonaReply,
  getPersonaProfileId,
  pickTopicSeed,
  markTopicUsed,
  getThreadPosts,
  getThreadPersonaIds,
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
 * POST /api/personas/converse — Trigger one conversation round
 * Body: { action: 'seed_thread' | 'reply', thread_id?: string, persona_id?: string }
 */
export async function POST(request: NextRequest) {
  const { createSupabaseServer } = await import('@/lib/supabase/server')
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { action, thread_id, persona_id } = await request.json()

  try {
    if (action === 'seed_thread') {
      return await handleSeedThread(persona_id)
    } else if (action === 'reply') {
      return await handleReply(thread_id, persona_id)
    } else {
      return NextResponse.json({ error: 'Invalid action. Use seed_thread or reply' }, { status: 400 })
    }
  } catch (err) {
    console.error('[personas/converse] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Conversation failed' },
      { status: 500 }
    )
  }
}

async function handleSeedThread(personaId?: string) {
  const admin = getAdmin()

  // Pick a persona (or use the specified one)
  let persona: Persona
  if (personaId) {
    const { data } = await admin.from('community_personas').select('*').eq('id', personaId).single()
    if (!data) return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
    persona = data
  } else {
    const { data: personas } = await admin
      .from('community_personas')
      .select('*')
      .eq('is_active', true)
      .order('last_active_at', { ascending: true, nullsFirst: true })
      .limit(5)

    if (!personas?.length) {
      return NextResponse.json({ error: 'No active personas' }, { status: 404 })
    }
    persona = personas[Math.floor(Math.random() * personas.length)]
  }

  // Get profile ID
  const profileId = await getPersonaProfileId(persona)
  if (!profileId) {
    return NextResponse.json({ error: 'Persona has no profile row' }, { status: 500 })
  }

  // Pick a topic seed
  const group = persona.preferred_groups?.[Math.floor(Math.random() * persona.preferred_groups.length)]
  const topicSeed = await pickTopicSeed(group)

  // Generate the thread
  const { title, body, group_slug } = await generateThread(persona, topicSeed || undefined)

  // Insert it
  const thread = await insertPersonaThread(persona, profileId, title, body, group_slug)

  // Mark topic as used
  if (topicSeed) {
    await markTopicUsed(topicSeed.id, topicSeed.used_count)
  }

  return NextResponse.json({
    action: 'seed_thread',
    persona: persona.name,
    thread: { id: thread.id, slug: thread.slug, title },
  }, { status: 201 })
}

async function handleReply(threadId?: string, personaId?: string) {
  const admin = getAdmin()

  // Get the thread
  if (!threadId) {
    return NextResponse.json({ error: 'thread_id required for reply action' }, { status: 400 })
  }

  const { data: thread } = await admin
    .from('community_threads')
    .select('id, title, body, slug, is_locked')
    .eq('id', threadId)
    .single()

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  if (thread.is_locked) return NextResponse.json({ error: 'Thread is locked' }, { status: 403 })

  // Check conversation depth
  const canRespond = await shouldRespond(threadId)
  if (!canRespond) {
    return NextResponse.json({ error: 'Max conversation depth reached' }, { status: 429 })
  }

  // Get existing thread persona IDs to exclude
  const excludeIds = await getThreadPersonaIds(threadId)

  // Pick a responding persona
  let persona: Persona
  if (personaId) {
    const { data } = await admin.from('community_personas').select('*').eq('id', personaId).single()
    if (!data) return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
    persona = data
  } else {
    const selected = await selectRespondingPersona(thread.title, thread.body, excludeIds)
    if (!selected) return NextResponse.json({ error: 'No suitable persona found' }, { status: 404 })
    persona = selected
  }

  // Get profile ID
  const profileId = await getPersonaProfileId(persona)
  if (!profileId) {
    return NextResponse.json({ error: 'Persona has no profile row' }, { status: 500 })
  }

  // Get existing posts for context
  const existingPosts = await getThreadPosts(threadId)

  // Generate the reply
  const { body } = await generateReply(
    persona,
    { title: thread.title, body: thread.body, slug: thread.slug },
    existingPosts.map(p => ({ body: p.body, author_name: p.author_name }))
  )

  // Insert it
  const post = await insertPersonaReply(persona, profileId, threadId, body)

  return NextResponse.json({
    action: 'reply',
    persona: persona.name,
    thread_id: threadId,
    post_id: post.id,
    preview: body.slice(0, 200),
  }, { status: 201 })
}
