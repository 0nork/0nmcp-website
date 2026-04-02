/**
 * 0n Workflow Builder — Natural Language → .0n SWITCH File
 *
 * Agentic workflow creation: user describes what they want,
 * AI generates a valid .0n SWITCH file, saves to Vault.
 *
 * Works in every shell: Telegram, Claude, ChatGPT, WordPress, CLI.
 *
 * Architecture:
 * 1. User describes automation in natural language
 * 2. AI parses intent → trigger + conditions + actions
 * 3. System checks Vault for available services/credentials
 * 4. AI generates .0n SWITCH file with proper schema
 * 5. Saves to user's workflows collection
 * 6. Returns workflow + missing service warnings
 * 7. User activates → workflow is live
 */

import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

// ── Available Triggers ──────────────────────────────────────────────

export const TRIGGERS = {
  // CRM triggers
  'crm.contact.created':      { service: 'crm', name: 'New Contact Created', fields: ['source', 'tag'] },
  'crm.contact.tagged':       { service: 'crm', name: 'Contact Tagged', fields: ['tag'] },
  'crm.opportunity.stage':    { service: 'crm', name: 'Opportunity Stage Changed', fields: ['pipeline', 'stage'] },
  'crm.form.submitted':       { service: 'crm', name: 'Form Submitted', fields: ['form_id'] },
  'crm.appointment.booked':   { service: 'crm', name: 'Appointment Booked', fields: ['calendar_id'] },
  'crm.appointment.noshow':   { service: 'crm', name: 'Appointment No-Show', fields: [] },

  // Stripe triggers
  'stripe.payment.received':  { service: 'stripe', name: 'Payment Received', fields: ['amount_min'] },
  'stripe.subscription.new':  { service: 'stripe', name: 'New Subscription', fields: ['plan'] },
  'stripe.invoice.paid':      { service: 'stripe', name: 'Invoice Paid', fields: [] },

  // Webhook triggers
  'webhook.received':         { service: 'webhook', name: 'Webhook Received', fields: ['url'] },
  'schedule.cron':            { service: 'system', name: 'Scheduled (Cron)', fields: ['schedule'] },

  // Social triggers
  'facebook.lead':            { service: 'facebook', name: 'Facebook Lead Form', fields: ['form_id'] },
  'instagram.message':        { service: 'instagram', name: 'Instagram DM', fields: [] },

  // Email triggers
  'email.received':           { service: 'email', name: 'Email Received', fields: ['from', 'subject_contains'] },

  // Manual
  'manual.trigger':           { service: 'system', name: 'Manual Trigger', fields: [] },
} as const

// ── Available Actions ───────────────────────────────────────────────

export const ACTIONS = {
  // CRM actions
  'crm.contact.create':       { service: 'crm', name: 'Create Contact', fields: ['firstName', 'lastName', 'email', 'phone', 'source'] },
  'crm.contact.tag':          { service: 'crm', name: 'Tag Contact', fields: ['tag'] },
  'crm.contact.untag':        { service: 'crm', name: 'Remove Tag', fields: ['tag'] },
  'crm.contact.note':         { service: 'crm', name: 'Add Note', fields: ['body'] },
  'crm.opportunity.create':   { service: 'crm', name: 'Create Opportunity', fields: ['name', 'pipeline', 'stage', 'value'] },
  'crm.opportunity.move':     { service: 'crm', name: 'Move to Stage', fields: ['stage'] },
  'crm.workflow.enroll':      { service: 'crm', name: 'Enroll in Workflow', fields: ['workflow_id'] },

  // Email actions
  'email.send':               { service: 'email', name: 'Send Email', fields: ['to', 'subject', 'body', 'template'] },
  'email.sequence.start':     { service: 'email', name: 'Start Email Sequence', fields: ['sequence', 'delay'] },

  // Slack actions
  'slack.message.send':       { service: 'slack', name: 'Send Slack Message', fields: ['channel', 'text'] },

  // SMS actions
  'sms.send':                 { service: 'twilio', name: 'Send SMS', fields: ['to', 'body'] },

  // Stripe actions
  'stripe.invoice.create':    { service: 'stripe', name: 'Create Invoice', fields: ['amount', 'description', 'customer'] },

  // Social actions
  'social.post':              { service: 'social', name: 'Post to Social', fields: ['platform', 'content'] },
  'linkedin.post':            { service: 'linkedin', name: 'Post to LinkedIn', fields: ['content'] },

  // Internal actions
  'ai.generate':              { service: 'ai', name: 'AI Generate Content', fields: ['prompt', 'model'] },
  'wait':                     { service: 'system', name: 'Wait / Delay', fields: ['duration', 'unit'] },
  'condition':                { service: 'system', name: 'If/Then Condition', fields: ['field', 'operator', 'value'] },
  'webhook.send':             { service: 'webhook', name: 'Send Webhook', fields: ['url', 'method', 'body'] },
} as const

// ── .0n SWITCH File Schema ──────────────────────────────────────────

export interface SwitchFile {
  $0n: {
    type: 'workflow'
    name: string
    version: '1.0.0'
    created: string
    description?: string
  }
  trigger: {
    event: string
    conditions?: Record<string, unknown>
  }
  steps: Array<{
    action: string
    params: Record<string, unknown>
    condition?: {
      field: string
      operator: 'equals' | 'contains' | 'gt' | 'lt' | 'exists'
      value: unknown
    }
    delay?: {
      duration: number
      unit: 'seconds' | 'minutes' | 'hours' | 'days'
    }
  }>
  metadata?: {
    created_by: string
    source: string // 'agentic' | 'manual' | 'import'
    vault_services_required: string[]
  }
}

// ── AI System Prompt for Workflow Generation ─────────────────────────

export function buildWorkflowPrompt(connectedServices: string[]) {
  const availableTriggers = Object.entries(TRIGGERS)
    .filter(([, t]) => t.service === 'system' || connectedServices.includes(t.service))
    .map(([key, t]) => `  ${key}: ${t.name} (fields: ${t.fields.join(', ') || 'none'})`)
    .join('\n')

  const availableActions = Object.entries(ACTIONS)
    .filter(([, a]) => a.service === 'system' || connectedServices.includes(a.service))
    .map(([key, a]) => `  ${key}: ${a.name} (fields: ${a.fields.join(', ') || 'none'})`)
    .join('\n')

  const unavailableTriggers = Object.entries(TRIGGERS)
    .filter(([, t]) => t.service !== 'system' && !connectedServices.includes(t.service))
    .map(([key, t]) => `  ${key}: ${t.name} (REQUIRES: ${t.service})`)
    .join('\n')

  const unavailableActions = Object.entries(ACTIONS)
    .filter(([, a]) => a.service !== 'system' && !connectedServices.includes(a.service))
    .map(([key, a]) => `  ${key}: ${a.name} (REQUIRES: ${a.service})`)
    .join('\n')

  return `## Workflow Builder

You can create automated workflows from natural language. When the user describes an automation they want, generate a valid .0n SWITCH file.

Connected services: ${connectedServices.join(', ') || 'none yet'}

AVAILABLE triggers (user has these services):
${availableTriggers || '  (none — user needs to connect services first)'}

AVAILABLE actions:
${availableActions || '  (none)'}

${unavailableTriggers ? `UNAVAILABLE triggers (service not connected):
${unavailableTriggers}` : ''}

${unavailableActions ? `UNAVAILABLE actions (service not connected):
${unavailableActions}` : ''}

When the user asks to create a workflow:
1. Parse their intent into trigger + steps
2. Check if all required services are connected
3. If a required service is missing, tell them: "I'd need [service] access for that. Want to connect it?"
4. Generate the .0n SWITCH file as a JSON code block
5. Wrap it in: [WORKFLOW:{json}]
6. Confirm with the user before saving

Example output:
[WORKFLOW:{"$0n":{"type":"workflow","name":"New Lead Nurture","version":"1.0.0","created":"2026-04-01","description":"Tags new FB leads and notifies Slack"},"trigger":{"event":"crm.contact.created","conditions":{"source":"facebook"}},"steps":[{"action":"crm.contact.tag","params":{"tag":"facebook-lead"}},{"action":"slack.message.send","params":{"channel":"#leads","text":"New lead from Facebook: {{contact.firstName}} {{contact.lastName}}"}}],"metadata":{"created_by":"agentic","source":"agentic","vault_services_required":["crm","slack"]}}]

Variable syntax: {{contact.firstName}}, {{contact.email}}, {{trigger.data.*}}
`
}

// ── Parse Workflow from AI Response ─────────────────────────────────

export function parseWorkflowFromResponse(text: string): SwitchFile | null {
  const match = text.match(/\[WORKFLOW:([\s\S]*?)\]/)
  if (!match) return null

  try {
    const parsed = JSON.parse(match[1])
    // Validate basic structure
    if (!parsed.$0n || !parsed.trigger || !parsed.steps) return null
    if (parsed.$0n.type !== 'workflow') return null
    return parsed as SwitchFile
  } catch {
    return null
  }
}

// ── Save Workflow to Vault ──────────────────────────────────────────

export async function saveWorkflow(
  locationId: string,
  workflow: SwitchFile,
  userId?: string
): Promise<{ id: string; success: boolean }> {
  const supabase = db()

  // Create workflows table entry
  const { data, error } = await supabase
    .from('vault_workflows')
    .insert({
      location_id: locationId,
      name: workflow.$0n.name,
      description: workflow.$0n.description || '',
      trigger_event: workflow.trigger.event,
      steps_count: workflow.steps.length,
      switch_file: workflow,
      status: 'draft', // draft until user activates
      created_by: userId || 'agentic',
      source: workflow.metadata?.source || 'agentic',
      services_required: workflow.metadata?.vault_services_required || [],
    })
    .select('id')
    .single()

  if (error) {
    console.error('[WorkflowBuilder] Save error:', error)
    return { id: '', success: false }
  }

  return { id: data.id, success: true }
}

// ── Activate Workflow ───────────────────────────────────────────────

export async function activateWorkflow(workflowId: string): Promise<boolean> {
  const supabase = db()
  const { error } = await supabase
    .from('vault_workflows')
    .update({ status: 'active', activated_at: new Date().toISOString() })
    .eq('id', workflowId)

  return !error
}

// ── List User Workflows ─────────────────────────────────────────────

export async function listWorkflows(locationId: string) {
  const supabase = db()
  const { data } = await supabase
    .from('vault_workflows')
    .select('id, name, description, trigger_event, steps_count, status, created_at, source')
    .eq('location_id', locationId)
    .order('created_at', { ascending: false })

  return data || []
}

// ── Get Connected Services from Vault ───────────────────────────────

export async function getConnectedServices(locationId: string): Promise<string[]> {
  const supabase = db()
  const services: string[] = ['system'] // Always available

  // Check vault_tracking for connected tracking services
  const { data: tracking } = await supabase
    .from('vault_tracking')
    .select('*')
    .eq('location_id', locationId)
    .single()

  if (tracking?.meta_pixel_id) services.push('facebook')
  if (tracking?.ga4_measurement_id) services.push('google')

  // Check user_vaults for API keys
  const { data: location } = await supabase
    .from('user_locations')
    .select('crm_pit, crm_location_id')
    .eq('id', locationId)
    .single()

  if (location?.crm_pit) services.push('crm')

  // Check profiles for connected services (from 0nmcp.com vault)
  const { data: vaults } = await supabase
    .from('user_vaults')
    .select('service')
    .eq('location_id', locationId)

  if (vaults) {
    for (const v of vaults) {
      if (v.service && !services.includes(v.service)) {
        services.push(v.service)
      }
    }
  }

  // Common services to check
  // These would come from the integrations page connections
  const commonChecks = [
    { key: 'stripe', field: 'stripe' },
    { key: 'slack', field: 'slack' },
    { key: 'twilio', field: 'twilio' },
    { key: 'sendgrid', field: 'email' },
    { key: 'linkedin', field: 'linkedin' },
    { key: 'github', field: 'github' },
  ]

  // Add email/ai as always available (via Groq free tier)
  services.push('ai')
  services.push('webhook')

  return [...new Set(services)]
}
