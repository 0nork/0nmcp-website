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
  getThreadsNeedingReplies,
  getThreadPosts,
  getThreadPersonaIds,
  type Persona,
} from '@/lib/personas'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/cron/personas — Vercel Cron handler (every 2 hours)
 * 1. Seeds 1-2 new threads from active personas
 * 2. Adds 1-2 replies to recent threads with few replies
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()
  const results: { threads: string[]; replies: string[]; errors: string[] } = {
    threads: [],
    replies: [],
    errors: [],
  }

  try {
    // ==================== Phase 1: Seed new threads ====================
    const threadCount = Math.random() > 0.5 ? 2 : 1

    for (let i = 0; i < threadCount; i++) {
      try {
        // Pick a random active persona (prefer least recently active)
        const { data: personas } = await admin
          .from('community_personas')
          .select('*')
          .eq('is_active', true)
          .order('last_active_at', { ascending: true, nullsFirst: true })
          .limit(5)

        if (!personas?.length) {
          results.errors.push('No active personas available')
          break
        }

        // Respect activity levels — skip low-activity personas sometimes
        const eligible = personas.filter((p: Persona) => {
          if (p.activity_level === 'low') return Math.random() > 0.7
          if (p.activity_level === 'moderate') return Math.random() > 0.3
          return true // high
        })

        if (!eligible.length) continue

        const persona: Persona = eligible[Math.floor(Math.random() * eligible.length)]
        const profileId = await getPersonaProfileId(persona)
        if (!profileId) {
          results.errors.push(`No profile for persona ${persona.name}`)
          continue
        }

        // Pick a topic
        const group = persona.preferred_groups?.[Math.floor(Math.random() * persona.preferred_groups.length)]
        const topicSeed = await pickTopicSeed(group)

        // Generate and insert thread
        const { title, body, group_slug } = await generateThread(persona, topicSeed || undefined)
        const thread = await insertPersonaThread(persona, profileId, title, body, group_slug)

        if (topicSeed) await markTopicUsed(topicSeed.id, topicSeed.used_count)

        results.threads.push(`${persona.name}: "${title}" → /forum/${thread.slug}`)
      } catch (err) {
        results.errors.push(`Thread seed error: ${err instanceof Error ? err.message : 'unknown'}`)
      }
    }

    // ==================== Phase 2: Reply to recent threads ====================
    const threadsToReply = await getThreadsNeedingReplies(3)
    const replyCount = Math.min(threadsToReply.length, Math.random() > 0.5 ? 2 : 1)

    // Shuffle and pick
    const shuffled = threadsToReply.sort(() => Math.random() - 0.5).slice(0, replyCount)

    for (const thread of shuffled) {
      try {
        // Check depth limit
        const canRespond = await shouldRespond(thread.id)
        if (!canRespond) continue

        // Get personas already in this thread
        const excludeIds = await getThreadPersonaIds(thread.id)

        // Select a responding persona
        const persona = await selectRespondingPersona(thread.title, thread.body, excludeIds)
        if (!persona) continue

        const profileId = await getPersonaProfileId(persona)
        if (!profileId) continue

        // Get existing posts for context
        const existingPosts = await getThreadPosts(thread.id)

        // Check last reply wasn't from a persona (prevent back-and-forth)
        if (existingPosts.length > 0) {
          const lastPost = existingPosts[existingPosts.length - 1]
          const { data: isPersonaProfile } = await admin
            .from('profiles')
            .select('is_persona')
            .eq('id', lastPost.user_id)
            .single()

          if (isPersonaProfile?.is_persona) continue // Skip — last reply was AI
        }

        // Generate and insert reply
        const { body } = await generateReply(
          persona,
          { title: thread.title, body: thread.body, slug: thread.slug },
          existingPosts.map(p => ({ body: p.body, author_name: p.author_name }))
        )

        await insertPersonaReply(persona, profileId, thread.id, body)
        results.replies.push(`${persona.name} replied to "${thread.title.slice(0, 50)}"`)
      } catch (err) {
        results.errors.push(`Reply error: ${err instanceof Error ? err.message : 'unknown'}`)
      }
    }

    console.log('[cron/personas] Results:', JSON.stringify(results))
    return NextResponse.json({
      ok: true,
      ...results,
      summary: `${results.threads.length} threads seeded, ${results.replies.length} replies generated`,
    })
  } catch (err) {
    console.error('[cron/personas] Fatal error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
