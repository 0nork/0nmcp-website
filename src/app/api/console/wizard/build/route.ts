import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* ──────────────────────────────────────────── */
/*  Types                                      */
/* ──────────────────────────────────────────── */

interface TemplateInfo {
  id: string
  name: string
  description: string
  services: string[]
}

interface TriggerInfo {
  id: string
  label: string
  service?: string
}

interface RequestBody {
  template: TemplateInfo | null
  trigger: TriggerInfo
  selectedServices: string[]
  description: string
  notifications: string[]
  frequency: { type: string; cron?: string } | null
  customCron: string | null
}

/* ──────────────────────────────────────────── */
/*  Build Steps Generator                      */
/* ──────────────────────────────────────────── */

function generateBuildSteps(selectedServices: string[], notifications: string[]): string[] {
  const steps: string[] = ['Analyzing trigger configuration...']

  const uniqueServices = [...new Set(selectedServices)]
  for (const service of uniqueServices) {
    const displayName = service
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    steps.push(`Connecting to ${displayName}...`)
  }

  steps.push('Mapping data flows between services...')

  if (notifications.length > 0) {
    steps.push('Setting up notification channels...')
  }

  steps.push(
    'Validating workflow logic...',
    'Generating .0n SWITCH file...',
    'Finalizing workflow package...',
  )

  return steps
}

/* ──────────────────────────────────────────── */
/*  Credential Queue Builder                   */
/* ──────────────────────────────────────────── */

function buildCredentialQueue(selectedServices: string[], notifications: string[]): string[] {
  // All services that need credentials -- both action services and notification services
  const allServices = new Set([...selectedServices])

  // Add notification services that are actual services (not generic "webhook")
  for (const notif of notifications) {
    if (notif !== 'webhook' && notif !== 'email') {
      allServices.add(notif)
    }
  }

  // Some services share credentials or don't need them
  const noCredNeeded = new Set(['webhook', 'manual'])

  return [...allServices].filter((s) => !noCredNeeded.has(s))
}

/* ──────────────────────────────────────────── */
/*  Fallback Workflow Generator                */
/* ──────────────────────────────────────────── */

function generateFallbackWorkflow(body: RequestBody): Record<string, unknown> {
  const { template, trigger, selectedServices, description, notifications, frequency, customCron } = body

  const workflowName = template
    ? template.id
    : `custom-${trigger.id}-workflow`

  const workflowDescription = template
    ? template.description
    : description || `Custom workflow triggered by ${trigger.label}`

  const env: Record<string, string> = {}
  const steps: Array<{
    id: string
    name: string
    service: string
    action: string
    inputs: Record<string, string>
    depends_on?: string[]
  }> = []

  // Tool mapping for common services
  const toolMap: Record<string, string> = {
    anthropic: 'chat_completion',
    openai: 'chat_completion',
    slack: 'send_message',
    discord: 'send_message',
    sendgrid: 'send_email',
    crm: 'contacts_create',
    stripe: 'payment_intents_list',
    github: 'repos_list',
    supabase: 'query',
    airtable: 'records_create',
    notion: 'pages_create',
    twilio: 'messages_create',
    gmail: 'messages_send',
    google_sheets: 'append_row',
    google_drive: 'files_list',
    mongodb: 'insert_one',
    zendesk: 'tickets_create',
    jira: 'issues_create',
    hubspot: 'contacts_create',
    mailchimp: 'lists_members_create',
    google_calendar: 'events_create',
    calendly: 'events_list',
    zoom: 'meetings_create',
    linear: 'issues_create',
    microsoft: 'graph_users_get',
    shopify: 'products_list',
  }

  // Build action steps
  for (let i = 0; i < selectedServices.length; i++) {
    const service = selectedServices[i]
    const prevId = i === 0 ? undefined : `step-${i}`
    const displayName = service
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

    env[`${service.toUpperCase()}_API_KEY`] = `{{env.${service.toUpperCase()}_API_KEY}}`

    const step: {
      id: string
      name: string
      service: string
      action: string
      inputs: Record<string, string>
      depends_on?: string[]
    } = {
      id: `step-${i + 1}`,
      name: `${displayName} Action`,
      service,
      action: toolMap[service] || 'execute',
      inputs: {
        data: i === 0
          ? '{{trigger.payload}}'
          : `{{step.step-${i}.output}}`,
      },
    }

    if (prevId) {
      step.depends_on = [prevId]
    }

    steps.push(step)
  }

  // Notification steps
  const notifToolMap: Record<string, string> = {
    slack: 'send_message',
    discord: 'send_message',
    sendgrid: 'send_email',
    twilio: 'messages_create',
    webhook: 'http_post',
  }

  for (const notif of notifications) {
    const lastStepId = steps.length > 0 ? steps[steps.length - 1].id : undefined
    const notifStep: {
      id: string
      name: string
      service: string
      action: string
      inputs: Record<string, string>
      depends_on?: string[]
    } = {
      id: `notify-${notif}`,
      name: `Notify via ${notif.charAt(0).toUpperCase() + notif.slice(1)}`,
      service: notif === 'webhook' ? 'crm' : notif,
      action: notifToolMap[notif] || 'send',
      inputs: {
        message: `Workflow "${workflowName}" completed successfully.`,
      },
    }
    if (lastStepId) {
      notifStep.depends_on = [lastStepId]
    }
    steps.push(notifStep)
  }

  const workflow: Record<string, unknown> = {
    '0n': '1.0',
    name: workflowName,
    description: workflowDescription,
    trigger: {
      type: trigger.id,
      config: trigger.service ? { service: trigger.service } : {},
    },
    steps,
    notifications: notifications.length > 0 ? notifications : undefined,
    frequency: frequency?.type || 'event-driven',
  }

  // Add cron schedule if provided
  const cronValue = customCron || frequency?.cron
  if (cronValue) {
    workflow.schedule = { cron: cronValue }
  }

  return workflow
}

/* ──────────────────────────────────────────── */
/*  POST Handler                               */
/* ──────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  // Optional auth check
  const supabase = await createSupabaseServer()
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    template,
    trigger,
    selectedServices,
    description,
    notifications,
    frequency,
    customCron,
  } = body

  if (!trigger || !trigger.id) {
    return NextResponse.json({ error: 'Trigger is required' }, { status: 400 })
  }

  if (!selectedServices || !Array.isArray(selectedServices) || selectedServices.length === 0) {
    return NextResponse.json({ error: 'At least one service is required' }, { status: 400 })
  }

  // Generate build steps for the front-end animation
  const buildSteps = generateBuildSteps(selectedServices, notifications || [])

  // Determine which services need credentials
  const credentialQueue = buildCredentialQueue(selectedServices, notifications || [])

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Template-based fallback when no AI key available
    const workflow = generateFallbackWorkflow(body)
    return NextResponse.json({
      workflow,
      buildSteps,
      credentialQueue,
    })
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    const triggerContext = `Trigger: "${trigger.label}" (id: ${trigger.id})${trigger.service ? `, service: ${trigger.service}` : ''}`
    const servicesContext = `Selected services: ${selectedServices.join(', ')}`
    const notifContext = notifications && notifications.length > 0
      ? `Notifications via: ${notifications.join(', ')}`
      : 'No notifications configured'
    const freqContext = frequency
      ? `Frequency: ${frequency.type}${frequency.cron ? ` (cron: ${frequency.cron})` : ''}${customCron ? ` (custom cron: ${customCron})` : ''}`
      : 'Frequency: event-driven (no schedule)'
    const templateContext = template
      ? `Based on template: "${template.name}" -- ${template.description}. Template services: ${template.services.join(', ')}.`
      : 'Custom workflow (no template selected).'
    const descContext = description
      ? `User description: "${description}"`
      : ''

    const systemPrompt = [
      'Generate a .0n workflow definition as valid JSON. The format is:',
      '',
      '```json',
      '{',
      '  "0n": "1.0",',
      '  "name": "kebab-case-name",',
      '  "description": "What this workflow does",',
      '  "trigger": { "type": "webhook", "config": {} },',
      '  "steps": [',
      '    {',
      '      "id": "step-1",',
      '      "service": "openai",',
      '      "action": "chat_completion",',
      '      "inputs": { "prompt": "{{trigger.payload.text}}" }',
      '    },',
      '    {',
      '      "id": "step-2",',
      '      "service": "slack",',
      '      "action": "send_message",',
      '      "inputs": { "channel": "#general", "text": "{{step.step-1.output}}" },',
      '      "depends_on": ["step-1"]',
      '    }',
      '  ],',
      '  "notifications": ["email"],',
      '  "frequency": "daily"',
      '}',
      '```',
      '',
      '## Configuration',
      triggerContext,
      servicesContext,
      notifContext,
      freqContext,
      templateContext,
      descContext,
      '',
      '## Rules',
      '1. Output ONLY the JSON object inside a ```json code fence. No other text.',
      '2. Use REAL service IDs from the selected services list.',
      '3. Create proper depends_on chains -- no orphaned steps except the first.',
      '4. Include between 3-12 steps depending on complexity.',
      '5. Use meaningful step IDs (step-1, step-2, etc.).',
      '6. Each step MUST have: id, service, action, inputs.',
      '7. Never say "GHL" or "Go High Level" -- always say "CRM".',
      '8. Include trigger.config with relevant defaults for the trigger type.',
      '9. Set frequency to the actual frequency type or "event-driven".',
    ].join('\n')

    const userPrompt = [
      'Generate the .0n workflow JSON for this configuration:',
      '',
      triggerContext,
      servicesContext,
      notifContext,
      freqContext,
      templateContext,
      descContext || 'No additional description provided.',
    ].join('\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText =
      response.content[0]?.type === 'text'
        ? response.content[0].text
        : ''

    // Extract JSON from the response
    let workflow: Record<string, unknown> | null = null

    // Try ```json ... ``` fences first
    const jsonFenceMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (jsonFenceMatch) {
      try {
        workflow = JSON.parse(jsonFenceMatch[1].trim())
      } catch {
        // Parse failed, try next method
      }
    }

    // Try parsing entire response as JSON
    if (!workflow) {
      try {
        workflow = JSON.parse(rawText.trim())
      } catch {
        // Also failed
      }
    }

    // Try finding any JSON object in the text
    if (!workflow) {
      const braceMatch = rawText.match(/\{[\s\S]*\}/)
      if (braceMatch) {
        try {
          workflow = JSON.parse(braceMatch[0])
        } catch {
          // Give up on AI output
        }
      }
    }

    // Fall back to template-based generation
    if (!workflow) {
      workflow = generateFallbackWorkflow(body)
    }

    return NextResponse.json({
      workflow,
      buildSteps,
      credentialQueue,
    })
  } catch (err) {
    console.error('[wizard/build] Anthropic error:', err)

    // Fallback on error
    const workflow = generateFallbackWorkflow(body)
    return NextResponse.json({
      workflow,
      buildSteps,
      credentialQueue,
    })
  }
}
