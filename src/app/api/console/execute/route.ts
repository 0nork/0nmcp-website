import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getActiveSubscription, reportExecution } from '@/lib/console/billing'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ONMCP_URL = process.env.ONMCP_URL || 'http://localhost:3001'

/**
 * POST /api/console/execute
 * Execute a task via 0nMCP server.
 * Body: { task: string } or { workflow: object }
 *
 * Billing: requires active metered subscription.
 * Each successful execution reports 1 credit ($0.10) to Stripe.
 */
export async function POST(request: NextRequest) {
  // Verify auth
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { task?: string; workflow?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const task = typeof body.task === 'string' ? body.task.trim() : null
  const workflow = body.workflow
  if (!task && !workflow) {
    return NextResponse.json({ error: 'Task or workflow is required' }, { status: 400 })
  }

  // Check billing: user must have stripe_customer_id + active metered subscription
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      {
        status: 'billing_required',
        message: 'Activate your Execution Plan to run workflows. $0.10 per execution, billed monthly.',
      },
      { status: 402 }
    )
  }

  const subscription = await getActiveSubscription(profile.stripe_customer_id).catch(() => null)
  if (!subscription) {
    return NextResponse.json(
      {
        status: 'billing_required',
        message: 'Activate your Execution Plan to run workflows. $0.10 per execution, billed monthly.',
      },
      { status: 402 }
    )
  }

  // Execute via 0nMCP
  try {
    const res = await fetch(`${ONMCP_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow ? { workflow } : { task }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json(
        { status: 'failed', message: err || 'Execution failed' },
        { status: 502 }
      )
    }

    const data = await res.json()

    // Report successful execution to Stripe meter (fire and forget)
    reportExecution(profile.stripe_customer_id, 1).catch((err) => {
      console.error('Failed to report execution to Stripe:', err)
    })

    return NextResponse.json({
      status: data.status || 'completed',
      result: data.result || data.output || data.message || 'Task executed.',
      steps: data.steps_executed || data.steps || 0,
      services: data.services_used || data.services || [],
      duration_ms: data.duration_ms || 0,
    })
  } catch {
    return NextResponse.json(
      { status: 'failed', message: '0nMCP server is not reachable. Start it with: npx 0nmcp serve' },
      { status: 502 }
    )
  }
}
