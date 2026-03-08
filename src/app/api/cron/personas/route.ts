import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  insertPersonaThread,
  insertPersonaReply,
  getPersonaProfileId,
  shouldRespond,
  crossPostToCommunity,
  injectBacklinks,
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
 * Pulls pre-generated content from persona_content_queue.
 * Zero API calls — all content generated offline in Claude Code.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()
  const results: { threads: string[]; replies: string[]; errors: string[]; skipped: string[] } = {
    threads: [],
    replies: [],
    errors: [],
    skipped: [],
  }

  try {
    // Pull up to 3 queued items whose scheduled_at has passed
    const { data: queueItems, error: qErr } = await admin
      .from('persona_content_queue')
      .select('*')
      .eq('status', 'queued')
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5)

    if (qErr) {
      console.error('[cron/personas] Queue fetch error:', qErr)
      return NextResponse.json({ error: 'Queue fetch failed' }, { status: 500 })
    }

    if (!queueItems?.length) {
      return NextResponse.json({
        ok: true,
        ...results,
        summary: 'No queued content ready to post',
      })
    }

    for (const item of queueItems) {
      try {
        // Look up the persona
        const { data: persona } = await admin
          .from('community_personas')
          .select('*')
          .eq('slug', item.persona_slug)
          .eq('is_active', true)
          .single()

        if (!persona) {
          await markQueue(admin, item.id, 'skipped', `Persona "${item.persona_slug}" not found or inactive`)
          results.skipped.push(`${item.persona_slug}: persona not found`)
          continue
        }

        const profileId = await getPersonaProfileId(persona as Persona)
        if (!profileId) {
          await markQueue(admin, item.id, 'skipped', `No profile for persona "${item.persona_slug}"`)
          results.skipped.push(`${item.persona_slug}: no profile`)
          continue
        }

        if (item.content_type === 'thread') {
          // ==================== Insert Thread ====================
          const bodyWithBacklinks = injectBacklinks(item.body, Date.now())

          const thread = await insertPersonaThread(
            persona as Persona,
            profileId,
            item.title || 'Untitled',
            bodyWithBacklinks,
            item.group_slug || 'general'
          )

          // Auto-upvote from 2 other personas
          await autoUpvoteFromPersonas(admin, thread.id, persona.slug)

          await crossPostToCommunity({
            title: item.title || 'Untitled',
            content: bodyWithBacklinks,
            author: persona.name,
            group: item.group_slug || 'general',
            forumUrl: thread.slug,
          })

          await markQueue(admin, item.id, 'posted')
          results.threads.push(`${persona.name}: "${item.title}" → /forum/${thread.slug}`)

        } else if (item.content_type === 'reply') {
          // ==================== Insert Reply ====================
          if (!item.target_thread_slug) {
            await markQueue(admin, item.id, 'skipped', 'Reply has no target_thread_slug')
            results.skipped.push(`${item.persona_slug}: reply missing target_thread_slug`)
            continue
          }

          // Find the target thread
          const { data: thread } = await admin
            .from('community_threads')
            .select('id, title, body, slug')
            .eq('slug', item.target_thread_slug)
            .single()

          if (!thread) {
            await markQueue(admin, item.id, 'skipped', `Thread "${item.target_thread_slug}" not found`)
            results.skipped.push(`${item.persona_slug}: thread not found`)
            continue
          }

          // Check depth limit
          const canRespond = await shouldRespond(thread.id)
          if (!canRespond) {
            await markQueue(admin, item.id, 'skipped', 'Thread at max reply depth')
            results.skipped.push(`${item.persona_slug}: thread at max depth`)
            continue
          }

          const replyWithBacklinks = injectBacklinks(item.body, Date.now() + 7)

          await insertPersonaReply(persona as Persona, profileId, thread.id, replyWithBacklinks)

          await crossPostToCommunity({
            title: `Re: ${thread.title}`,
            content: replyWithBacklinks,
            author: persona.name,
            forumUrl: thread.slug,
          })

          await markQueue(admin, item.id, 'posted')
          results.replies.push(`${persona.name} replied to "${thread.title.slice(0, 50)}"`)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown'
        await markQueue(admin, item.id, 'failed', msg)
        results.errors.push(`${item.persona_slug} (${item.content_type}): ${msg}`)
      }
    }

    console.log('[cron/personas] Results:', JSON.stringify(results))
    return NextResponse.json({
      ok: true,
      ...results,
      summary: `${results.threads.length} threads, ${results.replies.length} replies, ${results.skipped.length} skipped`,
    })
  } catch (err) {
    console.error('[cron/personas] Fatal error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function markQueue(
  admin: any,
  id: string,
  status: 'posted' | 'failed' | 'skipped',
  error?: string
) {
  await admin
    .from('persona_content_queue')
    .update({
      status,
      posted_at: status === 'posted' ? new Date().toISOString() : null,
      error: error || null,
    })
    .eq('id', id)
}

/**
 * Auto-upvote a thread from 2 random other persona profiles.
 * Gives new threads initial traction in the feed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function autoUpvoteFromPersonas(admin: any, threadId: string, excludeSlug: string) {
  try {
    // Get 2 other active persona profiles
    const { data: personas } = await admin
      .from('community_personas')
      .select('slug')
      .eq('is_active', true)
      .neq('slug', excludeSlug)
      .limit(10)

    if (!personas || personas.length < 2) return

    // Pick 2 random
    const shuffled = personas.sort(() => Math.random() - 0.5).slice(0, 2)

    for (const p of shuffled) {
      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('email', `persona-${p.slug}@0nmcp.internal`)
        .eq('is_persona', true)
        .single()

      if (!profile) continue

      // Insert upvote
      await admin.from('community_votes').upsert({
        user_id: profile.id,
        thread_id: threadId,
        vote: 1,
      }, { onConflict: 'user_id,thread_id' })
    }

    // Update thread score
    const { data: votes } = await admin
      .from('community_votes')
      .select('vote')
      .eq('thread_id', threadId)

    if (votes) {
      const score = votes.reduce((sum: number, v: { vote: number }) => sum + v.vote, 0)
      await admin.from('community_threads').update({ score }).eq('id', threadId)
    }
  } catch (err) {
    console.error('[cron/personas] autoUpvote error:', err)
  }
}
