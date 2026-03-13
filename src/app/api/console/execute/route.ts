import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getActiveSubscription, reportExecution, isOwnerEmail, getMonthlyExecutionCount, FREE_TIER_MONTHLY_LIMIT } from '@/lib/console/billing'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ONMCP_URL = process.env.ONMCP_URL || 'http://localhost:3001'

/**
 * POST /api/console/execute
 * Execute a task via 0nMCP server.
 * Body: { task: string } or { workflow: object }
 *
 * Billing: requires active metered subscription (owners bypass).
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

  // Owner bypass — no billing check, no execution charges
  let ownerMode = user.email ? isOwnerEmail(user.email) : false

  // Fallback: check profile email if auth email is missing
  if (!ownerMode && !user.email) {
    const { data: p } = await getAdmin().from('profiles').select('email').eq('id', user.id).maybeSingle()
    if (p?.email && isOwnerEmail(p.email)) ownerMode = true
  }

  if (!ownerMode) {
    // Check billing: paid subscription OR free tier (20/month)
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    const stripeCustomerId = profile?.stripe_customer_id || null
    let isPaidUser = false

    if (stripeCustomerId) {
      const subscription = await getActiveSubscription(stripeCustomerId).catch(() => null)
      isPaidUser = !!subscription
    }

    // Free tier check — 20 executions per calendar month
    if (!isPaidUser) {
      const monthlyCount = await getMonthlyExecutionCount(user.id)
      if (monthlyCount >= FREE_TIER_MONTHLY_LIMIT) {
        return NextResponse.json(
          {
            status: 'free_tier_exceeded',
            message: `You've used all ${FREE_TIER_MONTHLY_LIMIT} free executions this month. Upgrade to the Execution Plan for unlimited runs at $0.10 each.`,
            usage: { used: monthlyCount, limit: FREE_TIER_MONTHLY_LIMIT },
          },
          { status: 402 }
        )
      }
    }

    // Execute via 0nMCP
    const startTime = Date.now()
    const result = await executeOnMCP(task, workflow)
    const durationMs = Date.now() - startTime

    // Log execution to DB
    const execData = result.error ? null : await result.response.clone().json().catch(() => null)
    void Promise.resolve(getAdmin().from('console_executions').insert({
      user_id: user.id,
      task: task || undefined,
      workflow_name: typeof workflow === 'object' && workflow && 'name' in workflow ? (workflow as { name: string }).name : undefined,
      status: result.error ? 'failed' : (execData?.status || 'completed'),
      duration_ms: durationMs,
      steps_executed: execData?.steps || 0,
      services_used: execData?.services || [],
      result_summary: execData?.result ? String(execData.result).slice(0, 500) : undefined,
      error_message: result.error ? 'Execution failed' : undefined,
      stripe_customer_id: stripeCustomerId || undefined,
      billed: isPaidUser && !result.error,
      billing_amount_cents: isPaidUser ? 10 : 0,
    })).then(() => {}).catch((err: unknown) => console.error('Failed to log execution:', err))

    if (result.error) return result.response

    // Report to Stripe meter only for paid users
    if (isPaidUser && stripeCustomerId) {
      reportExecution(stripeCustomerId, 1).catch((err) => {
        console.error('Failed to report execution to Stripe:', err)
      })
    }

    return result.response
  }

  // Owner execution — no billing, still log
  const startTime = Date.now()
  const result = await executeOnMCP(task, workflow)
  const durationMs = Date.now() - startTime

  const execData = result.error ? null : await result.response.clone().json().catch(() => null)
  void Promise.resolve(getAdmin().from('console_executions').insert({
    user_id: user.id,
    task: task || undefined,
    workflow_name: typeof workflow === 'object' && workflow && 'name' in workflow ? (workflow as { name: string }).name : undefined,
    status: result.error ? 'failed' : (execData?.status || 'completed'),
    duration_ms: durationMs,
    steps_executed: execData?.steps || 0,
    services_used: execData?.services || [],
    result_summary: execData?.result ? String(execData.result).slice(0, 500) : undefined,
    billed: false,
    billing_amount_cents: 0,
  })).then(() => {}).catch((err: unknown) => console.error('Failed to log execution:', err))

  return result.response
}

async function executeOnMCP(task: string | null, workflow: unknown) {
  try {
    const res = await fetch(`${ONMCP_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow ? { workflow } : { task }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) {
      const err = await res.text()
      return {
        error: true,
        response: NextResponse.json(
          { status: 'failed', message: err || 'Execution failed' },
          { status: 502 }
        ),
      }
    }

    const data = await res.json()
    return {
      error: false,
      response: NextResponse.json({
        status: data.status || 'completed',
        result: data.result || data.output || data.message || 'Task executed.',
        steps: data.steps_executed || data.steps || 0,
        services: data.services_used || data.services || [],
        duration_ms: data.duration_ms || 0,
      }),
    }
  } catch {
    return {
      error: true,
      response: NextResponse.json(
        { status: 'failed', message: '0nMCP server is not reachable. Start it with: npx 0nmcp serve' },
        { status: 502 }
      ),
    }
  }
}
