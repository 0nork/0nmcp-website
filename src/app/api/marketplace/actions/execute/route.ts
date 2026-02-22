/**
 * Action Execution Endpoint
 * POST /api/marketplace/actions/execute
 *
 * Called by the CRM workflow engine when a 0nMCP action fires.
 * Receives field values + context, executes the tool, returns result.
 *
 * Payload format from CRM:
 * {
 *   "data": { service: "stripe", tool: "stripe_create_customer", ... },
 *   "extras": { "locationId": "xxx", "contactId": "yyy", "workflowId": "zzz" },
 *   "meta": { "key": "execute_tool", "version": "1.0" }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getInstallation, logExecution, fireTrigger } from '@/lib/marketplace'

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { data = {}, extras = {}, meta = {} } = body
    const { locationId, contactId, workflowId } = extras
    const actionKey = meta.key || 'execute_tool'

    // Verify installation exists
    if (locationId) {
      const installation = await getInstallation(locationId).catch(() => null)
      if (!installation) {
        return NextResponse.json(
          { error: 'Location not installed. Please install 0nMCP from the marketplace.' },
          { status: 401 }
        )
      }
    }

    let result: Record<string, unknown> = {}
    let status = 'success'
    let errorMessage: string | undefined

    try {
      if (actionKey === 'execute_tool') {
        result = await executeToolAction(data, extras)
      } else if (actionKey === 'run_workflow') {
        result = await executeWorkflowAction(data, extras)
      } else if (actionKey === 'ai_generate') {
        result = await executeAIAction(data, extras)
      } else {
        throw new Error(`Unknown action: ${actionKey}`)
      }
    } catch (err) {
      status = 'error'
      errorMessage = err instanceof Error ? err.message : 'Execution failed'
      result = { error: errorMessage }
    }

    const durationMs = Date.now() - startTime

    // Log the execution
    await logExecution({
      locationId: locationId || 'unknown',
      actionKey,
      contactId,
      workflowId,
      inputData: data,
      outputData: result,
      status,
      durationMs,
      errorMessage,
    }).catch(() => {})

    // Fire the tool_executed trigger if successful
    if (status === 'success' && locationId) {
      await fireTrigger('tool_executed', locationId, {
        actionKey,
        service: data.service,
        tool: data.tool,
        result,
        contactId,
        executedAt: new Date().toISOString(),
      }).catch(() => {})
    }

    // Return result with optional branch routing
    return NextResponse.json({
      ...result,
      _status: status,
      _duration_ms: durationMs,
      // Branch routing: CRM uses branchId to route to different branches
      ...(status === 'success' ? { branchId: 'success' } : { branchId: 'error' }),
    })
  } catch (error) {
    console.error('Action execution error:', error)
    return NextResponse.json(
      { error: 'Action execution failed', branchId: 'error' },
      { status: 500 }
    )
  }
}

// ─── Tool Execution ─────────────────────────────────────────────────

async function executeToolAction(
  data: Record<string, unknown>,
  extras: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { service, tool, ...params } = data

  if (!service || !tool) {
    throw new Error('Service and tool are required')
  }

  // Call 0nMCP HTTP server if available, otherwise execute directly
  const mcpUrl = process.env.ONMCP_HTTP_URL || 'http://localhost:3001'

  const res = await fetch(`${mcpUrl}/api/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.ONMCP_API_KEY ? { Authorization: `Bearer ${process.env.ONMCP_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      tool: String(tool),
      params: {
        ...params,
        // Inject CRM context
        locationId: extras.locationId,
        contactId: extras.contactId,
      },
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`Tool execution failed: ${text}`)
  }

  return res.json()
}

// ─── Workflow Execution ─────────────────────────────────────────────

async function executeWorkflowAction(
  data: Record<string, unknown>,
  extras: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { workflow_name, ...inputs } = data

  if (!workflow_name) {
    throw new Error('Workflow name is required')
  }

  const mcpUrl = process.env.ONMCP_HTTP_URL || 'http://localhost:3001'

  const res = await fetch(`${mcpUrl}/api/workflow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.ONMCP_API_KEY ? { Authorization: `Bearer ${process.env.ONMCP_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      workflow: String(workflow_name),
      inputs: { ...inputs, locationId: extras.locationId, contactId: extras.contactId },
    }),
    signal: AbortSignal.timeout(60000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`Workflow execution failed: ${text}`)
  }

  return res.json()
}

// ─── AI Content Generation ──────────────────────────────────────────

async function executeAIAction(
  data: Record<string, unknown>,
  extras: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { prompt, model, max_tokens, content_type } = data

  if (!prompt) {
    throw new Error('Prompt is required')
  }

  const mcpUrl = process.env.ONMCP_HTTP_URL || 'http://localhost:3001'

  const res = await fetch(`${mcpUrl}/api/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.ONMCP_API_KEY ? { Authorization: `Bearer ${process.env.ONMCP_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      tool: `${model === 'openai' ? 'openai' : 'anthropic'}_chat_completion`,
      params: {
        prompt: String(prompt),
        max_tokens: Number(max_tokens) || 1024,
        system: `You are a helpful assistant generating ${content_type || 'content'} for a business. Contact ID: ${extras.contactId || 'N/A'}`,
      },
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) throw new Error('AI generation failed')
  return res.json()
}
