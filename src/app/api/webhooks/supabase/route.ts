import { NextRequest, NextResponse } from 'next/server'
import { syncNewUser, syncTierChange, syncEnrollment, syncOnboardingComplete, sendWelcomeEmail } from '@/lib/crm-sync'
import { findContactByEmail, addContactTags } from '@/lib/crm'
import {
  syncCommunityMember,
  syncThreadCreated,
  syncReplyCreated,
  syncVoteActivity,
  syncEngagementLevel,
  syncBadgeAwarded,
  syncGroupJoined,
  syncGroupLeft,
} from '@/lib/crm-community-sync'
import { createSupabaseServer } from '@/lib/supabase/server'

const WEBHOOK_SECRET = process.env.SUPABASE_DB_WEBHOOK_SECRET || ''

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: Record<string, unknown> | null
  old_record: Record<string, unknown> | null
}

/**
 * POST /api/webhooks/supabase — Receives database webhook events
 * Syncs to CRM: new users, tier changes, enrollments, community activity
 */
export async function POST(request: NextRequest) {
  // Verify webhook secret
  const signature = request.headers.get('x-supabase-event-signature')
  if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload: WebhookPayload = await request.json()
  const { type, table, record, old_record } = payload

  try {
    switch (table) {
      // ==================== USER EVENTS ====================
      case 'profiles':
        if (type === 'INSERT' && record) {
          // Sync to main CRM location
          await syncNewUser(record)
          const email = record.email as string
          const name = record.full_name as string | undefined
          if (email) {
            await sendWelcomeEmail(email, name)
            // Also register in community sub-location
            await syncCommunityMember({
              email,
              fullName: name,
              company: record.company as string | undefined,
              userId: record.id as string,
            })
          }
        }
        if (type === 'UPDATE' && record && old_record) {
          // Tier change → main CRM
          if (record.sponsor_tier !== old_record.sponsor_tier) {
            await syncTierChange(record, old_record)
          }
          // Onboarding completed → CRM tags with role + interests
          if (record.onboarding_completed === true && old_record.onboarding_completed === false) {
            await syncOnboardingComplete(record)
          }
          // Reputation level change → community CRM
          if (record.reputation_level !== old_record.reputation_level) {
            await syncEngagementLevel({
              email: record.email as string,
              fullName: record.full_name as string | undefined,
              newLevel: record.reputation_level as string,
              oldLevel: (old_record.reputation_level as string) || 'newcomer',
              karma: (record.karma as number) || 0,
            })
          }
        }
        break

      // ==================== ENROLLMENT EVENTS ====================
      case 'enrollments':
        if (type === 'INSERT' && record) {
          await handleNewEnrollment(record)
          await syncEnrollment(record)
        }
        break

      case 'lesson_progress':
        if ((type === 'INSERT' || type === 'UPDATE') && record) {
          await handleLessonComplete(record)
        }
        break

      // ==================== COMMUNITY EVENTS ====================
      case 'community_threads':
        if (type === 'INSERT' && record) {
          await handleNewThread(record)
        }
        break

      case 'community_posts':
        if (type === 'INSERT' && record) {
          await handleNewReply(record)
          // Persona reply chain — queue AI follow-up if thread has persona activity
          await handlePersonaReplyChain(record).catch(err =>
            console.error('[webhook] persona chain error:', err)
          )
        }
        break

      case 'community_votes':
        if (type === 'INSERT' && record) {
          await handleNewVote(record)
        }
        break

      case 'community_user_badges':
        if (type === 'INSERT' && record) {
          await handleBadgeAwarded(record)
        }
        break

      case 'community_memberships':
        if (type === 'INSERT' && record) {
          await handleGroupJoin(record)
        }
        if (type === 'DELETE' && old_record) {
          await handleGroupLeave(old_record)
        }
        break

      // ==================== SPONSOR EVENTS ====================
      case 'sponsor_subscriptions':
        if (type === 'INSERT' && record) {
          await handleNewSponsor(record)
        }
        break
    }

    return NextResponse.json({ received: true, table, type })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }
}

// ==================== HELPER: Look up user email from user_id ====================

async function lookupUserEmail(userId: string): Promise<{ email: string; fullName?: string } | null> {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return null
    const { data } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()
    return data ? { email: data.email, fullName: data.full_name || undefined } : null
  } catch {
    return null
  }
}

// ==================== EVENT HANDLERS ====================

async function handleNewEnrollment(record: Record<string, unknown>) {
  const userId = record.user_id as string
  const courseId = record.course_id as string
  console.log(`[webhook] New enrollment: user=${userId} course=${courseId}`)
  try {
    const user = await lookupUserEmail(userId)
    if (user) {
      await addContactTags(
        (await findContactByEmail(user.email))?.id || '',
        [`enrolled-${courseId}`, 'learner'],
      )
    }
  } catch { /* non-critical */ }
}

async function handleLessonComplete(record: Record<string, unknown>) {
  if (!record.completed) return
  console.log(`[webhook] Lesson completed: user=${record.user_id} lesson=${record.lesson_id}`)
}

async function handleNewThread(record: Record<string, unknown>) {
  const userId = record.user_id as string
  const title = record.title as string
  const slug = record.slug as string
  console.log(`[webhook] New thread: "${title}" by user=${userId}`)

  try {
    const user = await lookupUserEmail(userId)
    if (!user) return

    // Look up group name
    let groupSlug = 'general'
    if (record.group_id) {
      try {
        const supabase = await createSupabaseServer()
        if (supabase) {
          const { data } = await supabase
            .from('community_groups')
            .select('slug')
            .eq('id', record.group_id)
            .single()
          if (data) groupSlug = data.slug
        }
      } catch { /* use default */ }
    }

    await syncThreadCreated({
      email: user.email,
      fullName: user.fullName,
      threadTitle: title,
      threadSlug: slug,
      group: groupSlug,
    })
  } catch (err) {
    console.error('[webhook] handleNewThread error:', err)
  }
}

async function handleNewReply(record: Record<string, unknown>) {
  const userId = record.user_id as string
  const threadId = record.thread_id as string
  console.log(`[webhook] New reply in thread=${threadId} by user=${userId}`)

  try {
    const user = await lookupUserEmail(userId)
    if (!user) return

    // Look up thread info
    const supabase = await createSupabaseServer()
    if (!supabase) return
    const { data: thread } = await supabase
      .from('community_threads')
      .select('title, slug')
      .eq('id', threadId)
      .single()

    if (!thread) return

    await syncReplyCreated({
      email: user.email,
      fullName: user.fullName,
      threadTitle: thread.title,
      threadSlug: thread.slug,
      replyPreview: (record.body as string) || '',
    })
  } catch (err) {
    console.error('[webhook] handleNewReply error:', err)
  }
}

async function handleNewVote(record: Record<string, unknown>) {
  const userId = record.user_id as string
  try {
    const user = await lookupUserEmail(userId)
    if (!user) return
    await syncVoteActivity({ voterEmail: user.email, voterName: user.fullName })
  } catch { /* non-critical */ }
}

async function handleBadgeAwarded(record: Record<string, unknown>) {
  const userId = record.user_id as string
  const badgeId = record.badge_id as string

  try {
    const user = await lookupUserEmail(userId)
    if (!user) return

    const supabase = await createSupabaseServer()
    if (!supabase) return
    const { data: badge } = await supabase
      .from('community_badges')
      .select('name, slug, tier')
      .eq('id', badgeId)
      .single()

    if (!badge) return

    await syncBadgeAwarded({
      email: user.email,
      fullName: user.fullName,
      badgeName: badge.name,
      badgeSlug: badge.slug,
      badgeTier: badge.tier,
    })
  } catch (err) {
    console.error('[webhook] handleBadgeAwarded error:', err)
  }
}

async function handleGroupJoin(record: Record<string, unknown>) {
  const userId = record.user_id as string
  const groupId = record.group_id as string

  try {
    const user = await lookupUserEmail(userId)
    if (!user) return

    const supabase = await createSupabaseServer()
    if (!supabase) return
    const { data: group } = await supabase
      .from('community_groups')
      .select('slug, name')
      .eq('id', groupId)
      .single()

    if (!group) return

    await syncGroupJoined({
      email: user.email,
      fullName: user.fullName,
      groupSlug: group.slug,
      groupName: group.name,
    })
  } catch { /* non-critical */ }
}

async function handleGroupLeave(record: Record<string, unknown>) {
  const userId = record.user_id as string
  const groupId = record.group_id as string

  try {
    const user = await lookupUserEmail(userId)
    if (!user) return

    const supabase = await createSupabaseServer()
    if (!supabase) return
    const { data: group } = await supabase
      .from('community_groups')
      .select('slug')
      .eq('id', groupId)
      .single()

    if (!group) return
    await syncGroupLeft({ email: user.email, groupSlug: group.slug })
  } catch { /* non-critical */ }
}

async function handlePersonaReplyChain(record: Record<string, unknown>) {
  const threadId = record.thread_id as string
  const userId = record.user_id as string
  if (!threadId) return

  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return

    // Check if this thread has any persona activity
    const { count: personaActivity } = await supabase
      .from('persona_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('thread_id', threadId)

    if (!personaActivity || personaActivity === 0) return // Not an AI thread — skip

    // Check depth limit (max 5 AI replies per thread)
    if (personaActivity >= 5) return

    // Check if the person who just posted is a persona
    const { data: poster } = await supabase
      .from('profiles')
      .select('is_persona')
      .eq('id', userId)
      .single()

    if (poster?.is_persona) return // Last reply was a persona — don't chain immediately

    // Thread has persona activity + last reply was a real user → trigger async persona reply
    // We call the converse endpoint to generate a reply (fire-and-forget)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    fetch(`${baseUrl}/api/personas/converse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reply', thread_id: threadId }),
    }).catch(() => { /* fire and forget */ })

    console.log(`[webhook] Queued persona reply for thread=${threadId}`)
  } catch (err) {
    console.error('[webhook] handlePersonaReplyChain error:', err)
  }
}

async function handleNewSponsor(record: Record<string, unknown>) {
  const email = record.email as string
  const tier = record.tier as string
  console.log(`[webhook] New sponsor: ${email} → ${tier}`)

  if (email) {
    try {
      const contact = await findContactByEmail(email)
      if (contact) {
        await addContactTags(contact.id, [`sponsor`, `${tier}-tier`, 'paying-customer'])
      }
    } catch { /* non-critical */ }
  }
}
