/**
 * 0nFlow — enroll a contact into a flow.
 *
 *   POST /api/flows/<id-or-slug>/enroll
 *   body: { contact_email, contact_id?, contact_data? }
 *
 * Materializes ALL steps as flow_steps rows with computed scheduled_at,
 * each adding its delay_seconds to the previous (cumulative).
 *
 * v0.1 is linear. v0.2 will move to next-step-only materialization for
 * branching support.
 */

import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { isFlowAuthorized } from '@/lib/0nflow/auth'
import type { EnrollmentInput, StepTemplate } from '@/lib/0nflow/types'

export const runtime = 'nodejs'

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = isFlowAuthorized(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized', reason: auth.reason }, { status: 401 })

  const supabase = createSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { id: idOrSlug } = await ctx.params
  let body: EnrollmentInput
  try {
    body = (await req.json()) as EnrollmentInput
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.contact_email) {
    return NextResponse.json({ error: 'contact_email required' }, { status: 400 })
  }

  // Look up flow by id OR slug.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(idOrSlug)
  const flowQuery = supabase.from('flows').select('*')
  const { data: flow, error: flowErr } = await (isUuid
    ? flowQuery.eq('id', idOrSlug)
    : flowQuery.eq('slug', idOrSlug)
  ).single()

  if (flowErr || !flow) return NextResponse.json({ error: 'Flow not found' }, { status: 404 })
  if (!flow.active) return NextResponse.json({ error: 'Flow is not active' }, { status: 400 })

  const steps = (flow.steps as StepTemplate[]) || []
  if (steps.length === 0) {
    return NextResponse.json({ error: 'Flow has no steps' }, { status: 400 })
  }

  // 1. Create enrollment row.
  const { data: enrollment, error: enrErr } = await supabase
    .from('flow_enrollments')
    .insert({
      flow_id: flow.id,
      contact_id: body.contact_id ?? null,
      contact_email: body.contact_email,
      contact_data: body.contact_data ?? {},
    })
    .select()
    .single()

  if (enrErr || !enrollment) {
    return NextResponse.json({ error: enrErr?.message || 'Enrollment failed' }, { status: 500 })
  }

  // 2. Materialize steps with cumulative delays.
  const now = Date.now()
  let cumulativeMs = 0
  const stepRows = steps.map((s, idx) => {
    cumulativeMs += (s.delay_seconds ?? 0) * 1000
    return {
      enrollment_id: enrollment.id,
      flow_id: flow.id,
      step_index: idx,
      action: s.action,
      params: s.params ?? {},
      scheduled_at: new Date(now + cumulativeMs).toISOString(),
    }
  })

  const { error: stepsErr } = await supabase.from('flow_steps').insert(stepRows)
  if (stepsErr) {
    return NextResponse.json({ error: `Steps: ${stepsErr.message}` }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    enrollment_id: enrollment.id,
    flow: { id: flow.id, slug: flow.slug, name: flow.name },
    steps_scheduled: stepRows.length,
    first_step_at: stepRows[0]?.scheduled_at,
    last_step_at: stepRows[stepRows.length - 1]?.scheduled_at,
  })
}
