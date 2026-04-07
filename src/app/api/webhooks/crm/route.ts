/**
 * POST /api/webhooks/crm — CRM Webhook Runner
 *
 * Receives ALL CRM webhook events (appointment changes, contact created,
 * tag added, etc.) and routes them to matching AI agent workflows.
 *
 * Flow:
 * 1. Receive webhook payload from CRM
 * 2. Determine event type from payload
 * 3. Query crm_agent_workflows for matching trigger_event
 * 4. Execute each matching workflow's steps via execution engine
 * 5. Log results to crm_workflow_runs + crm_webhook_inbound
 *
 * No n8n. No external orchestration. All native.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { executeAction, type ExecutionResult } from '@/lib/execution-engine'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Map CRM webhook payload to our trigger_event format
function resolveEventType(payload: Record<string, unknown>): string {
  const type = payload.type as string || ''
  const status = (payload.appointment as Record<string, unknown>)?.status as string || ''

  // Appointment events
  if (type === 'AppointmentUpdate' || type === 'appointment' || status) {
    if (status === 'no_show' || status === 'noshow') return 'contact.no_show'
    return 'appointment.status_changed'
  }
  // Contact events
  if (type === 'ContactCreate' || type === 'contact.create') return 'contact.created'
  if (type === 'ContactTagUpdate' || type === 'contact.tag.update') return 'contact.tag.added'
  // Conversation events
  if (type === 'InboundMessage' || type === 'conversation.message') return 'conversation.message.inbound'
  // Campaign events
  if (type === 'CampaignStatusUpdate') return 'campaign.completed'
  // Stripe (forwarded from Stripe webhook)
  if (type === 'invoice.paid') return 'stripe.invoice.paid'
  // Generic
  return type || 'unknown'
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let payload: Record<string, unknown>

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = resolveEventType(payload)
  const contactId = (payload.contactId || payload.contact_id || (payload.contact as Record<string, unknown>)?.id || '') as string
  const locationId = (payload.locationId || payload.location_id || '') as string

  const admin = getAdmin()

  // Log inbound webhook
  await admin.from('crm_webhook_inbound').insert({
    event_type: eventType,
    location_id: locationId,
    contact_id: contactId,
    payload,
    processed: false,
  })

  // Find matching workflows
  const { data: workflows } = await admin
    .from('crm_agent_workflows')
    .select('*')
    .eq('trigger_event', eventType)
    .eq('status', 'active')

  if (!workflows || workflows.length === 0) {
    // Also mark webhook as processed (no matching workflow)
    return NextResponse.json({ ok: true, matched: 0, event: eventType })
  }

  const results: Array<{ workflow: string; status: string; steps: number; duration: number }> = []

  for (const workflow of workflows) {
    const runStart = Date.now()
    const steps = workflow.steps as Array<{ step: number; service: string; action: string; description: string }>
    const stepResults: Array<{ step: number; action: string; result: ExecutionResult }> = []
    let runStatus = 'completed'
    let runError: string | null = null

    // Check location filter if workflow has one
    const conditions = workflow.trigger_conditions as Record<string, unknown> || {}
    const locationFilter = conditions.locations || conditions.location_id
    if (locationFilter) {
      const allowedLocations = Array.isArray(locationFilter) ? locationFilter : [locationFilter]
      if (locationId && !allowedLocations.includes(locationId)) {
        continue // Skip — this workflow isn't for this location
      }
    }

    // Check cooldown
    if (workflow.cooldown_seconds > 0 && workflow.last_executed_at) {
      const lastRun = new Date(workflow.last_executed_at).getTime()
      const cooldownMs = workflow.cooldown_seconds * 1000
      if (Date.now() - lastRun < cooldownMs) continue
    }

    // Check daily limit
    if (workflow.max_executions_per_day && workflow.executions_today >= workflow.max_executions_per_day) {
      continue
    }

    // Execute steps
    for (const step of steps) {
      try {
        const result = await executeAction(step.action, {
          ...payload,
          contactId,
          locationId,
          service: step.service,
          workflowSlug: workflow.slug,
        })
        stepResults.push({ step: step.step, action: step.action, result })

        if (!result.success) {
          runStatus = 'failed'
          runError = `Step ${step.step} (${step.action}) failed: ${result.error}`
          break // Stop on first failure
        }
      } catch (err) {
        runStatus = 'failed'
        runError = `Step ${step.step} (${step.action}) threw: ${(err as Error).message}`
        break
      }
    }

    const duration = Date.now() - runStart

    // Log the run
    await admin.from('crm_workflow_runs').insert({
      workflow_id: workflow.id,
      trigger_event: eventType,
      trigger_payload: payload,
      contact_id: contactId,
      location_id: locationId,
      status: runStatus,
      steps_completed: stepResults.length,
      steps_total: steps.length,
      results: stepResults,
      error: runError,
      duration_ms: duration,
      services_called: [...new Set(stepResults.map(r => r.action))],
    })

    // Update workflow stats
    await admin.from('crm_agent_workflows')
      .update({
        total_executions: (workflow.total_executions || 0) + 1,
        executions_today: (workflow.executions_today || 0) + 1,
        last_executed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflow.id)

    results.push({
      workflow: workflow.slug,
      status: runStatus,
      steps: stepResults.length,
      duration,
    })
  }

  // Mark webhook as processed
  await admin.from('crm_webhook_inbound')
    .update({ processed: true, processed_at: new Date().toISOString(), matched_workflows: workflows.map((w: { id: string }) => w.id) })
    .eq('event_type', eventType)
    .eq('processed', false)
    .order('received_at', { ascending: false })
    .limit(1)

  return NextResponse.json({
    ok: true,
    event: eventType,
    matched: results.length,
    results,
    duration_ms: Date.now() - startTime,
  })
}

// Respond to CRM verification pings
export async function GET() {
  return NextResponse.json({ status: 'active', service: '0nMCP Webhook Runner', workflows: 22 })
}
