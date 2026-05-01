/**
 * 0nFlow — fire one action immediately, no flow needed.
 *
 *   POST /api/flows/run-now
 *   body: { action, params, contact_email, contact_id?, contact_data? }
 *
 * Useful for "send this email/SMS/Slack one time without creating a flow"
 * or for testing actions before composing a full sequence.
 */

import { NextResponse } from 'next/server'
import { dispatch } from '@/lib/0nflow/dispatcher'
import type { FlowAction, FlowStepRow } from '@/lib/0nflow/types'

export const runtime = 'nodejs'

interface OneShotBody {
  action: FlowAction
  params: Record<string, unknown>
  contact_email: string
  contact_id?: string
  contact_data?: Record<string, unknown>
  provider?: string
  location_id?: string
}

export async function POST(req: Request) {
  let body: OneShotBody
  try {
    body = (await req.json()) as OneShotBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.action || !body.contact_email) {
    return NextResponse.json({ error: 'action + contact_email required' }, { status: 400 })
  }

  const fakeStep: FlowStepRow = {
    id: 'oneshot',
    enrollment_id: 'oneshot',
    flow_id: 'oneshot',
    step_index: 0,
    action: body.action,
    params: body.params ?? {},
    scheduled_at: new Date().toISOString(),
    status: 'running',
    attempts: 0,
  }

  const result = await dispatch(fakeStep, {
    enrollment: {
      id: 'oneshot',
      contact_id: body.contact_id ?? null,
      contact_email: body.contact_email,
      contact_data: body.contact_data ?? {},
    },
    flow: {
      id: 'oneshot',
      slug: 'oneshot',
      default_provider: body.provider ?? 'crm',
      default_location_id: body.location_id ?? null,
    },
  })

  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
