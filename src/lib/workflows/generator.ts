// Dynamic Workflow Generator — AI generates .0n workflow files from intent

import Anthropic from '@anthropic-ai/sdk'
import { ALL_TRIGGERS, ALL_ACTIONS } from './integrationRegistry'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateWorkflow(params: {
  intent: string
  sub_location_id: string
  connected_integrations: string[]
  context?: string
}): Promise<Record<string, unknown>> {
  const triggers = ALL_TRIGGERS.filter(t => params.connected_integrations.includes(t.integration) || t.integration === 'crm' || t.integration === 'email')
  const actions = ALL_ACTIONS.filter(a => params.connected_integrations.includes(a.integration) || a.integration === 'crm' || a.integration === 'email')

  const res = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are the 0nMCP Workflow Generator. Convert user intent into a .0n workflow file.

OUTPUT ONLY VALID JSON. No markdown. No explanation.

AVAILABLE TRIGGERS: ${JSON.stringify(triggers.map(t => ({ id: t.id, label: t.label })))}
AVAILABLE ACTIONS: ${JSON.stringify(actions.map(a => ({ id: a.id, label: a.label, params: a.params })))}

SCHEMA:
{
  "schema": "0n-workflow/v1",
  "generated": "ISO timestamp",
  "sub_location_id": "${params.sub_location_id}",
  "workflow": {
    "name": "string",
    "description": "string",
    "run_immediately": boolean,
    "run_once": boolean,
    "trigger": { "type": "event|manual|schedule", "event_id": "string", "integration": "string" },
    "variables": [{ "name": "string", "value": "string", "description": "string", "source": "static|trigger_data|step_output" }],
    "steps": [{ "id": "step_N", "name": "string", "action_id": "string", "integration": "string", "params": { "key": { "value": "string", "type": "static|variable|contact_field|trigger_data" } } }],
    "error_handling": "stop"
  }
}

Use {{variable_name}} for variables, {{contact.field}} for contact fields, {{trigger.field}} for trigger data.
If intent requires a non-manual trigger, set run_immediately:false and run_once:false.
If intent is an on-demand action, set trigger type to manual and run_immediately:true.`,
    messages: [{ role: 'user', content: `Generate a .0n workflow for: "${params.intent}"\nContext: ${params.context || 'none'}` }],
  })

  const raw = res.content.filter(b => b.type === 'text').map(b => (b as Anthropic.TextBlock).text).join('')
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Generator returned no JSON')

  const workflow = JSON.parse(match[0])
  if (workflow.schema !== '0n-workflow/v1') throw new Error('Invalid workflow schema')

  return workflow
}
