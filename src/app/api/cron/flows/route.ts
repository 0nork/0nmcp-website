/**
 * 0nFlow cron drainer — runs every minute (vercel.json).
 *
 * Pulls all pending flow_steps with scheduled_at <= now(), grabs the parent
 * enrollment + flow, dispatches the step, writes the result back. Marks the
 * enrollment as completed when its last step finishes.
 *
 * Auth: Vercel cron sends `x-vercel-cron: 1` header. Manual triggers must
 * send `Authorization: Bearer ${CRON_SECRET}`.
 */

import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { dispatch } from '@/lib/0nflow/dispatcher'
import type { FlowStepRow } from '@/lib/0nflow/types'

export const runtime = 'nodejs'
export const maxDuration = 60

const BATCH_SIZE = 25

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const now = new Date().toISOString()

  // Pull pending steps that are due, oldest first.
  const { data: due, error: pickErr } = await supabase
    .from('flow_steps')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (pickErr) return NextResponse.json({ error: pickErr.message }, { status: 500 })
  if (!due || due.length === 0) return NextResponse.json({ ok: true, processed: 0 })

  const summary: Array<{ id: string; action: string; ok: boolean; error?: string }> = []

  for (const step of due as FlowStepRow[]) {
    // Mark running so a parallel cron tick can't double-fire.
    const { data: claimed, error: claimErr } = await supabase
      .from('flow_steps')
      .update({ status: 'running', attempts: step.attempts + 1 })
      .eq('id', step.id)
      .eq('status', 'pending')
      .select()
      .single()

    if (claimErr || !claimed) {
      summary.push({ id: step.id, action: step.action, ok: false, error: 'claim-failed' })
      continue
    }

    // Hydrate enrollment + flow.
    const { data: enrollment } = await supabase
      .from('flow_enrollments')
      .select('*')
      .eq('id', step.enrollment_id)
      .single()

    if (!enrollment) {
      await supabase.from('flow_steps')
        .update({ status: 'skipped', last_error: 'enrollment missing' })
        .eq('id', step.id)
      summary.push({ id: step.id, action: step.action, ok: false, error: 'enrollment-missing' })
      continue
    }

    if (enrollment.status !== 'active') {
      await supabase.from('flow_steps')
        .update({ status: 'skipped', last_error: `enrollment status: ${enrollment.status}` })
        .eq('id', step.id)
      summary.push({ id: step.id, action: step.action, ok: false, error: 'enrollment-inactive' })
      continue
    }

    const { data: flow } = await supabase
      .from('flows')
      .select('id, slug, default_provider, default_location_id')
      .eq('id', step.flow_id)
      .single()

    if (!flow) {
      await supabase.from('flow_steps')
        .update({ status: 'skipped', last_error: 'flow missing' })
        .eq('id', step.id)
      summary.push({ id: step.id, action: step.action, ok: false, error: 'flow-missing' })
      continue
    }

    // Dispatch.
    const result = await dispatch(step, {
      enrollment: {
        id: enrollment.id,
        contact_id: enrollment.contact_id,
        contact_email: enrollment.contact_email,
        contact_data: (enrollment.contact_data as Record<string, unknown>) || {},
      },
      flow: {
        id: flow.id,
        slug: flow.slug,
        default_provider: flow.default_provider || 'crm',
        default_location_id: flow.default_location_id,
      },
    })

    await supabase
      .from('flow_steps')
      .update({
        status: result.ok ? 'sent' : 'failed',
        last_error: result.ok ? null : result.error || 'unknown',
        result: result.result || null,
        sent_at: result.ok ? new Date().toISOString() : null,
      })
      .eq('id', step.id)

    summary.push({ id: step.id, action: step.action, ok: result.ok, error: result.error })

    // Bump enrollment current_step + check completion.
    const newCurrent = Math.max(enrollment.current_step, step.step_index + 1)
    await supabase
      .from('flow_enrollments')
      .update({ current_step: newCurrent })
      .eq('id', enrollment.id)

    // Has this enrollment finished?
    const { count: remaining } = await supabase
      .from('flow_steps')
      .select('id', { count: 'exact', head: true })
      .eq('enrollment_id', enrollment.id)
      .eq('status', 'pending')

    if ((remaining ?? 0) === 0) {
      await supabase
        .from('flow_enrollments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', enrollment.id)
    }
  }

  return NextResponse.json({
    ok: true,
    processed: summary.length,
    succeeded: summary.filter((s) => s.ok).length,
    failed: summary.filter((s) => !s.ok).length,
    summary,
  })
}

function isAuthorized(req: Request): boolean {
  // Vercel cron header
  if (req.headers.get('x-vercel-cron') === '1') return true
  // Manual trigger via Bearer secret
  const auth = req.headers.get('authorization') || ''
  const secret = process.env.CRON_SECRET || ''
  if (!secret) return false
  return auth === `Bearer ${secret}`
}
