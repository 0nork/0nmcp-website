/**
 * 0n Workflow Automation Engine — API Endpoint
 *
 * POST /api/web0n/automation
 *   { workflow: "web0n-invoice-payment", data: { contactId, invoiceId, amount } }
 *
 * GET /api/web0n/automation
 *   Lists all registered workflows
 *
 * This replaces the need for CRM workflow creation via API.
 * Workflows run server-side with full CRM API access.
 */

import { NextRequest, NextResponse } from 'next/server'
import { executeWorkflow, getWorkflow, listWorkflows } from '@/lib/crm-workflow-engine'

const ACCESS_TOKEN = process.env.CRM_API_KEY || ''

export async function POST(request: NextRequest) {
  // Verify request (webhook secret or auth)
  const signature = request.headers.get('x-webhook-signature') || ''
  const authHeader = request.headers.get('authorization') || ''
  const webhookSecret = process.env.WEB0N_WEBHOOK_SECRET || ''

  const isAuthorized =
    (webhookSecret && signature === webhookSecret) ||
    (authHeader === `Bearer ${webhookSecret}`) ||
    (authHeader === `Bearer ${ACCESS_TOKEN}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { workflow: workflowId, data } = body

    if (!workflowId) {
      return NextResponse.json({ error: 'workflow ID is required' }, { status: 400 })
    }

    const workflow = getWorkflow(workflowId)
    if (!workflow) {
      return NextResponse.json({
        error: `Workflow "${workflowId}" not found`,
        available: listWorkflows().map(w => ({ id: w.id, name: w.name })),
      }, { status: 404 })
    }

    if (!workflow.active) {
      return NextResponse.json({ error: 'Workflow is not active' }, { status: 400 })
    }

    const result = await executeWorkflow(workflow, data || {}, ACCESS_TOKEN)

    return NextResponse.json({
      success: result.success,
      workflow: workflow.name,
      stepsExecuted: result.stepsExecuted,
      results: result.stepResults,
      executedAt: result.executedAt,
    })
  } catch (err) {
    console.error('Workflow execution error:', err)
    return NextResponse.json({ error: 'Workflow execution failed' }, { status: 500 })
  }
}

export async function GET() {
  const workflows = listWorkflows()

  return NextResponse.json({
    engine: '0n Workflow Engine',
    version: '1.0.0',
    workflows: workflows.map(w => ({
      id: w.id,
      name: w.name,
      description: w.description,
      trigger: w.trigger.type,
      steps: w.steps.length,
      active: w.active,
    })),
  })
}
