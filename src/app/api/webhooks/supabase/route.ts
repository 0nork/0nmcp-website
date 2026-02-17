import { NextRequest, NextResponse } from 'next/server'
import { syncNewUser, syncTierChange, syncEnrollment, sendWelcomeEmail } from '@/lib/crm-sync'
import { findContactByEmail, addContactTags } from '@/lib/crm'

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
      case 'profiles':
        if (type === 'INSERT' && record) {
          // New user → sync to CRM + send welcome email
          await syncNewUser(record)
          const email = record.email as string
          const name = record.full_name as string | undefined
          if (email) await sendWelcomeEmail(email, name)
        }
        if (type === 'UPDATE' && record && old_record) {
          // Check for tier change
          if (record.sponsor_tier !== old_record.sponsor_tier) {
            await syncTierChange(record, old_record)
          }
        }
        break

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

      case 'community_threads':
        if (type === 'INSERT' && record) {
          await handleNewThread(record)
        }
        break

      case 'community_posts':
        if (type === 'INSERT' && record) {
          await handleNewReply(record)
        }
        break

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

// --- Event Handlers ---

async function handleNewEnrollment(record: Record<string, unknown>) {
  console.log(`[webhook] New enrollment: user=${record.user_id} course=${record.course_id}`)
  // Tag contact in CRM with course enrollment
  try {
    // Look up user email from enrollment user_id — we'd need a DB query here
    // For now, just tag if we have the contact
    const userId = record.user_id as string
    if (userId) {
      // The enrollment webhook doesn't include email, so we log it
      // The full sync happens in syncEnrollment which can be enhanced
      console.log(`[webhook] Enrollment logged for CRM sync: ${userId}`)
    }
  } catch {
    // Non-critical
  }
}

async function handleLessonComplete(record: Record<string, unknown>) {
  if (!record.completed) return
  console.log(`[webhook] Lesson completed: user=${record.user_id} lesson=${record.lesson_id}`)
}

async function handleNewThread(record: Record<string, unknown>) {
  console.log(`[webhook] New thread: "${record.title}" by user=${record.user_id}`)
  // Tag the CRM contact as community-active
  try {
    // We don't have email from thread record, but we could look it up
    // For now, log for monitoring
  } catch {
    // Non-critical
  }
}

async function handleNewReply(record: Record<string, unknown>) {
  console.log(`[webhook] New reply in thread=${record.thread_id} by user=${record.user_id}`)
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
    } catch {
      // Non-critical
    }
  }
}
