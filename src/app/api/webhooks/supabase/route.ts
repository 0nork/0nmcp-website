import { NextRequest, NextResponse } from 'next/server'

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
 * Handles: new enrollments, course completions, new threads, etc.
 */
export async function POST(request: NextRequest) {
  // Verify webhook secret
  const signature = request.headers.get('x-supabase-event-signature')
  if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload: WebhookPayload = await request.json()
  const { type, table, record } = payload

  try {
    switch (table) {
      case 'enrollments':
        if (type === 'INSERT') {
          await handleNewEnrollment(record)
        }
        break

      case 'lesson_progress':
        if (type === 'INSERT' || type === 'UPDATE') {
          await handleLessonComplete(record)
        }
        break

      case 'community_threads':
        if (type === 'INSERT') {
          await handleNewThread(record)
        }
        break

      case 'community_posts':
        if (type === 'INSERT') {
          await handleNewReply(record)
        }
        break

      case 'profiles':
        if (type === 'INSERT') {
          await handleNewUser(record)
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
// These are stubs — wire up real notifications (email, Slack, etc.) as needed

async function handleNewEnrollment(record: Record<string, unknown> | null) {
  if (!record) return
  console.log(`[webhook] New enrollment: user=${record.user_id} course=${record.course_id}`)
  // Future: send welcome email, Slack notification
}

async function handleLessonComplete(record: Record<string, unknown> | null) {
  if (!record || !record.completed) return
  console.log(`[webhook] Lesson completed: user=${record.user_id} lesson=${record.lesson_id}`)
  // Future: check if course completed → send certificate, Slack notification
}

async function handleNewThread(record: Record<string, unknown> | null) {
  if (!record) return
  console.log(`[webhook] New thread: "${record.title}" by user=${record.user_id}`)
  // Future: Slack notification in #community channel
}

async function handleNewReply(record: Record<string, unknown> | null) {
  if (!record) return
  console.log(`[webhook] New reply in thread=${record.thread_id} by user=${record.user_id}`)
  // Future: email notification to thread author
}

async function handleNewUser(record: Record<string, unknown> | null) {
  if (!record) return
  console.log(`[webhook] New user: ${record.email}`)
  // Future: welcome email, Slack notification
}
