import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { executeAgent } from '@/lib/agent-studio'
import {
  getOrCreateCrmAccount,
  getActiveSession,
  upsertSession,
  incrementExecutionCount,
} from '@/lib/crm-provisioning'
import {
  validateWorkflowServices,
  getSnapshotStats,
  SERVICE_ACTIONS,
} from '@/lib/builder/executable-services'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/console/agent-studio/run-workflow
 *
 * Takes a .0n workflow file, validates every step against the catalog snapshot,
 * then sends it to CRM Agent Studio for execution via MCP Server nodes.
 *
 * The Agent Studio agent has access to all 0nMCP tools via its MCP Server
 * connection. It reads the .0n steps and executes them sequentially,
 * calling the real APIs through 0nMCP.
 *
 * Body: {
 *   workflow: object    — The .0n workflow JSON
 *   inputs?: object     — Runtime input values (for {{inputs.*}} resolution)
 *   dryRun?: boolean    — If true, validate only, don't execute
 * }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    workflow?: Record<string, unknown>
    inputs?: Record<string, string>
    dryRun?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const workflow = body.workflow
  if (!workflow) {
    return NextResponse.json({ error: 'workflow is required' }, { status: 400 })
  }

  // ── Extract workflow metadata ──
  const meta = (workflow.$0n || workflow.meta || {}) as Record<string, string>
  const workflowName = meta.name || 'Unnamed Workflow'
  const steps = (workflow.steps || []) as Array<{
    id: string
    service: string
    action: string
    params?: Record<string, unknown>
    description?: string
  }>

  if (!steps.length) {
    return NextResponse.json({ error: 'Workflow has no steps' }, { status: 400 })
  }

  // ── Step 1: Validate all steps against the catalog snapshot ──
  const errors = validateWorkflowServices(steps)
  const stats = getSnapshotStats()

  if (errors.length > 0) {
    return NextResponse.json({
      valid: false,
      workflowName,
      errors,
      message: `${errors.length} step(s) use services or actions not in the 0nMCP catalog (${stats.services} services, ${stats.totalTools} tools).`,
      availableServices: Object.keys(SERVICE_ACTIONS),
    }, { status: 422 })
  }

  // ── Dry run: validation only ──
  if (body.dryRun) {
    return NextResponse.json({
      valid: true,
      workflowName,
      stepCount: steps.length,
      services: [...new Set(steps.map(s => s.service))],
      message: `All ${steps.length} steps validated against catalog. Ready to execute.`,
    })
  }

  // ── Step 2: Auto-provision CRM account if needed ──
  const account = await getOrCreateCrmAccount(user.id)

  const agentId = account?.default_agent_id || process.env.CRM_AGENT_STUDIO_AGENT_ID || ''
  const locationId = account?.location_id || process.env.CRM_AGENT_STUDIO_LOCATION_ID || ''

  if (!agentId) {
    return NextResponse.json({ error: 'No Agent Studio agent configured' }, { status: 404 })
  }

  // ── Step 3: Build the execution message for Agent Studio ──
  const stepsDescription = steps.map((s, i) =>
    `  Step ${i + 1}: ${s.service}.${s.action}${s.description ? ` — ${s.description}` : ''}`
  ).join('\n')

  const inputsDescription = body.inputs
    ? '\n\nRuntime inputs provided:\n' + Object.entries(body.inputs).map(([k, v]) => `  ${k}: ${v}`).join('\n')
    : ''

  const executionMessage = [
    `EXECUTE WORKFLOW: "${workflowName}"`,
    '',
    `This is a .0n workflow with ${steps.length} steps. Execute each step in order using your MCP tools.`,
    `For each step, call the 0nMCP tool matching the service and action.`,
    '',
    'Steps:',
    stepsDescription,
    inputsDescription,
    '',
    'Full workflow JSON:',
    '```json',
    JSON.stringify(workflow, null, 2),
    '```',
    '',
    'Execute each step sequentially. Report the result of each step.',
    'If a step fails and on_error is "stop", halt execution.',
    'If on_error is "continue", log the error and proceed to the next step.',
  ].join('\n')

  // ── Step 4: Get or create session for multi-turn ──
  let executionId: string | undefined
  const existingSession = await getActiveSession(user.id, agentId).catch(() => null)
  if (existingSession) executionId = existingSession

  // ── Step 5: Execute via Agent Studio ──
  const startTime = Date.now()

  const result = await executeAgent(agentId, {
    message: executionMessage,
    locationId,
    executionId,
    inputVariables: {
      userId: user.id,
      userEmail: user.email || '',
      workflowName,
      ...(body.inputs || {}),
    },
  })

  const durationMs = Date.now() - startTime

  if (result.error) {
    return NextResponse.json({
      status: 'failed',
      workflowName,
      error: result.error,
      durationMs,
    })
  }

  // ── Step 6: Track session + meter execution ──
  if (result.executionId) {
    upsertSession({
      userId: user.id,
      executionId: result.executionId,
      agentId,
      locationId,
    }).catch(() => {})
  }

  incrementExecutionCount(user.id).catch(() => {})

  return NextResponse.json({
    status: 'completed',
    workflowName,
    stepCount: steps.length,
    services: [...new Set(steps.map(s => s.service))],
    text: result.text || result.output || 'Workflow executed.',
    executionId: result.executionId,
    durationMs,
    source: 'agent-studio',
  })
}
