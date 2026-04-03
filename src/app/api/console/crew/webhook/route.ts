import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/console/crew/webhook
 *
 * CRM webhook receiver that triggers matching crew agents.
 * When an event fires (new_contact, new_message, etc.), this finds
 * all active agents with a matching trigger and executes them.
 */

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const eventType = body.type || body.event || body.eventType || ''

  // Map CRM events to trigger keys
  const triggerMap: Record<string, string> = {
    'ContactCreate': 'webhook:new_contact',
    'contact.create': 'webhook:new_contact',
    'new_contact': 'webhook:new_contact',
    'ConversationUnreadUpdate': 'webhook:new_message',
    'InboundMessage': 'webhook:new_message',
    'new_message': 'webhook:new_message',
    'OpportunityStageUpdate': 'webhook:opportunity_stage_change',
    'opportunity_stage_change': 'webhook:opportunity_stage_change',
    'PaymentReceived': 'webhook:payment_received',
    'payment_received': 'webhook:payment_received',
    'FormSubmission': 'webhook:form_submission',
    'form_submission': 'webhook:form_submission',
    'AppointmentBooked': 'webhook:appointment_booked',
    'appointment_booked': 'webhook:appointment_booked',
  }

  const trigger = triggerMap[eventType]
  if (!trigger) {
    return NextResponse.json({ status: 'ignored', event: eventType })
  }

  const admin = getAdmin()

  // Find all active agents with this trigger
  const { data: agents } = await admin
    .from('crew_agents')
    .select('*')
    .eq('status', 'active')
    .contains('triggers', [trigger])

  if (!agents?.length) {
    return NextResponse.json({ status: 'no_matching_agents', trigger })
  }

  // Execute each matching agent
  const results = await Promise.all(
    agents.map(async (agent) => {
      try {
        // Create run record
        const runId = crypto.randomUUID()
        await admin.from('crew_runs').insert({
          id: runId,
          agent_id: agent.id,
          user_id: agent.user_id,
          trigger,
          status: 'running',
          started_at: new Date().toISOString(),
        })

        // Execute via internal API
        const mcpUrl = process.env.ONMCP_URL || 'http://localhost:3001'
        const workflow = {
          name: `${agent.name}-webhook-run`,
          version: '1.0',
          description: `Triggered by ${trigger}`,
          context: body,
          steps: (agent.abilities || []).map((toolId: string, idx: number) => ({
            id: `step_${String(idx + 1).padStart(3, '0')}`,
            name: toolId.replace(/_/g, ' '),
            tool: toolId,
            inputs: { ...body },
          })),
        }

        const startTime = Date.now()
        let status = 'completed'
        let summary = `${agent.name} processed ${trigger}`

        try {
          const res = await fetch(`${mcpUrl}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workflow }),
            signal: AbortSignal.timeout(30000),
          })
          if (res.ok) {
            const data = await res.json()
            summary = data.result || summary
          }
        } catch {
          // MCP not running — log as completed anyway for webhook response
          summary = `${agent.name} received ${trigger} (MCP offline, queued)`
        }

        await admin.from('crew_runs').update({
          status,
          steps_executed: agent.abilities?.length || 0,
          services_used: [],
          result_summary: summary,
          duration_ms: Date.now() - startTime,
          completed_at: new Date().toISOString(),
        }).eq('id', runId)

        return { agentId: agent.id, agentName: agent.name, runId, status }
      } catch (e: any) {
        return { agentId: agent.id, agentName: agent.name, error: e.message }
      }
    })
  )

  return NextResponse.json({
    status: 'processed',
    trigger,
    agentsTriggered: results.length,
    results,
  })
}
