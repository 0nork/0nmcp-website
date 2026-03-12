/**
 * CRM Workflow Engine — Serverless Workflow Automation
 *
 * Since CRM doesn't expose workflow creation via API, this engine
 * runs workflow logic server-side. Workflows are defined as code,
 * triggered by webhooks or events, and execute CRM API calls directly.
 *
 * This IS the 0n brain for CRM automation. Natural language → workflow → execution.
 */

const API_BASE = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'

// ==================== TYPES ====================

export interface WorkflowStep {
  id: string
  action: string  // crm_action type: 'upsert_contact', 'add_tags', 'create_opportunity', 'send_email', 'add_note', 'http_request', 'update_opportunity', 'create_invoice'
  params: Record<string, unknown>
  condition?: {
    field: string
    operator: 'eq' | 'neq' | 'contains' | 'exists'
    value: unknown
  }
}

export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  trigger: {
    type: 'webhook' | 'invoice_paid' | 'contact_created' | 'tag_added' | 'opportunity_stage_changed'
    filter?: Record<string, unknown>
  }
  steps: WorkflowStep[]
  locationId: string
  pipelineId?: string
  active: boolean
  createdAt: string
}

export interface WorkflowExecutionResult {
  workflowId: string
  success: boolean
  stepsExecuted: number
  stepResults: Array<{
    stepId: string
    action: string
    success: boolean
    data?: unknown
    error?: string
  }>
  executedAt: string
}

// ==================== CRM API HELPER ====================

async function crmRequest(
  method: string,
  path: string,
  accessToken: string,
  body?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const url = `${API_BASE}${path}`
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Version': API_VERSION,
    },
  }
  if (body && method !== 'GET') options.body = JSON.stringify(body)

  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`CRM ${method} ${path}: ${res.status} — ${err}`)
  }
  return res.json()
}

// ==================== STEP EXECUTORS ====================

type StepExecutor = (
  params: Record<string, unknown>,
  context: ExecutionContext
) => Promise<Record<string, unknown>>

interface ExecutionContext {
  accessToken: string
  locationId: string
  inputData: Record<string, unknown>
  stepOutputs: Record<string, unknown>
}

const EXECUTORS: Record<string, StepExecutor> = {

  async upsert_contact(params, ctx) {
    const result = await crmRequest('POST', '/contacts/upsert', ctx.accessToken, {
      locationId: ctx.locationId,
      email: resolve(params.email, ctx),
      firstName: resolve(params.firstName, ctx),
      lastName: resolve(params.lastName, ctx),
      phone: resolve(params.phone, ctx),
      companyName: resolve(params.companyName, ctx),
      source: resolve(params.source, ctx) || '0n-automation',
      tags: params.tags || [],
    })
    return result.contact as Record<string, unknown> || result
  },

  async add_tags(params, ctx) {
    const contactId = resolve(params.contactId, ctx) as string
    const tags = params.tags as string[]
    await crmRequest('POST', `/contacts/${contactId}/tags`, ctx.accessToken, { tags })
    return { contactId, tagsAdded: tags }
  },

  async add_note(params, ctx) {
    const contactId = resolve(params.contactId, ctx) as string
    const body = resolve(params.body, ctx) as string
    await crmRequest('POST', `/contacts/${contactId}/notes`, ctx.accessToken, { body })
    return { contactId, noteAdded: true }
  },

  async create_opportunity(params, ctx) {
    const result = await crmRequest('POST', '/opportunities/', ctx.accessToken, {
      locationId: ctx.locationId,
      contactId: resolve(params.contactId, ctx),
      pipelineId: resolve(params.pipelineId, ctx),
      pipelineStageId: resolve(params.pipelineStageId, ctx),
      name: resolve(params.name, ctx),
      monetaryValue: params.monetaryValue,
      status: params.status || 'open',
    })
    return result.opportunity as Record<string, unknown> || result
  },

  async update_opportunity(params, ctx) {
    const opportunityId = resolve(params.opportunityId, ctx) as string
    const updates: Record<string, unknown> = {}
    if (params.pipelineStageId) updates.pipelineStageId = resolve(params.pipelineStageId, ctx)
    if (params.status) updates.status = resolve(params.status, ctx)
    if (params.monetaryValue) updates.monetaryValue = params.monetaryValue
    const result = await crmRequest('PUT', `/opportunities/${opportunityId}`, ctx.accessToken, updates)
    return result.opportunity as Record<string, unknown> || result
  },

  async send_email(params, ctx) {
    const result = await crmRequest('POST', '/conversations/messages', ctx.accessToken, {
      type: 'Email',
      contactId: resolve(params.contactId, ctx),
      subject: resolve(params.subject, ctx),
      html: resolve(params.html, ctx),
      emailFrom: resolve(params.emailFrom, ctx) || 'noreply@0nmcp.com',
    })
    return result
  },

  async create_invoice(params, ctx) {
    const result = await crmRequest('POST', '/invoices/', ctx.accessToken, {
      altId: ctx.locationId,
      altType: 'location',
      name: resolve(params.name, ctx),
      contactId: resolve(params.contactId, ctx),
      currency: 'USD',
      items: params.items || [{
        name: resolve(params.itemName, ctx),
        amount: (params.amount as number) * 100,
        qty: 1,
      }],
    })
    return result.invoice as Record<string, unknown> || result
  },

  async search_contacts(params, ctx) {
    const result = await crmRequest('POST', '/contacts/search', ctx.accessToken, {
      locationId: ctx.locationId,
      filters: params.filters || [
        { field: resolve(params.field, ctx), operator: 'eq', value: resolve(params.value, ctx) }
      ],
      pageLimit: params.limit || 10,
    })
    return result
  },

  async http_request(params, _ctx) {
    const res = await fetch(params.url as string, {
      method: (params.method as string) || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(params.headers as Record<string, string> || {}),
      },
      body: params.body ? JSON.stringify(params.body) : undefined,
    })
    const data = await res.json().catch(() => ({ status: res.status }))
    return { status: res.status, data }
  },

  async wait(params, _ctx) {
    const ms = (params.seconds as number || 1) * 1000
    await new Promise(r => setTimeout(r, Math.min(ms, 10000))) // max 10s
    return { waited: ms }
  },
}

// ==================== VARIABLE RESOLUTION ====================

function resolve(value: unknown, ctx: ExecutionContext): unknown {
  if (typeof value !== 'string') return value

  // Replace {{input.field}} with inputData values
  // Replace {{steps.stepId.field}} with previous step output values
  return value.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path: string) => {
    const parts = path.split('.')
    let obj: unknown

    if (parts[0] === 'input') {
      obj = ctx.inputData
      parts.shift()
    } else if (parts[0] === 'steps') {
      obj = ctx.stepOutputs
      parts.shift()
    } else {
      obj = ctx.inputData
    }

    for (const part of parts) {
      if (obj && typeof obj === 'object') {
        obj = (obj as Record<string, unknown>)[part]
      } else {
        return ''
      }
    }

    return String(obj ?? '')
  })
}

// ==================== CONDITION EVALUATOR ====================

function evaluateCondition(
  condition: WorkflowStep['condition'],
  ctx: ExecutionContext
): boolean {
  if (!condition) return true

  const fieldValue = resolve(`{{${condition.field}}}`, ctx)

  switch (condition.operator) {
    case 'eq': return fieldValue === condition.value
    case 'neq': return fieldValue !== condition.value
    case 'contains': return String(fieldValue).includes(String(condition.value))
    case 'exists': return fieldValue !== '' && fieldValue !== undefined && fieldValue !== null
    default: return true
  }
}

// ==================== WORKFLOW EXECUTOR ====================

export async function executeWorkflow(
  workflow: WorkflowDefinition,
  inputData: Record<string, unknown>,
  accessToken: string
): Promise<WorkflowExecutionResult> {
  const ctx: ExecutionContext = {
    accessToken,
    locationId: workflow.locationId,
    inputData,
    stepOutputs: {},
  }

  const result: WorkflowExecutionResult = {
    workflowId: workflow.id,
    success: true,
    stepsExecuted: 0,
    stepResults: [],
    executedAt: new Date().toISOString(),
  }

  for (const step of workflow.steps) {
    // Check condition
    if (!evaluateCondition(step.condition, ctx)) {
      result.stepResults.push({
        stepId: step.id,
        action: step.action,
        success: true,
        data: { skipped: true, reason: 'condition not met' },
      })
      continue
    }

    // Execute step
    const executor = EXECUTORS[step.action]
    if (!executor) {
      result.stepResults.push({
        stepId: step.id,
        action: step.action,
        success: false,
        error: `Unknown action: ${step.action}`,
      })
      result.success = false
      continue
    }

    try {
      const stepOutput = await executor(step.params, ctx)
      ctx.stepOutputs[step.id] = stepOutput
      result.stepsExecuted++
      result.stepResults.push({
        stepId: step.id,
        action: step.action,
        success: true,
        data: stepOutput,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      result.stepResults.push({
        stepId: step.id,
        action: step.action,
        success: false,
        error: errorMsg,
      })
      result.success = false
      // Continue executing remaining steps (non-blocking)
    }
  }

  return result
}

// ==================== PRESET WORKFLOWS ====================

export const PRESET_WORKFLOWS: Record<string, Omit<WorkflowDefinition, 'id' | 'createdAt'>> = {
  'web0n-invoice-payment': {
    name: 'web0n Invoice Payment',
    description: 'Handles web0n invoice payments — updates project status, moves pipeline, notifies admin',
    trigger: { type: 'invoice_paid', filter: { tags: ['web0n'] } },
    locationId: 'nphConTwfHcVE1oA0uep',
    pipelineId: 'r9MYmF2xQKOe0rOcVAQH',
    active: true,
    steps: [
      {
        id: 'check_contact',
        action: 'search_contacts',
        params: {
          field: 'id',
          value: '{{input.contactId}}',
        },
      },
      {
        id: 'notify_webhook',
        action: 'http_request',
        params: {
          url: 'https://web0n.com/api/web0n/webhooks',
          method: 'POST',
          headers: { 'x-webhook-signature': process.env.WEB0N_WEBHOOK_SECRET || '' },
          body: {
            type: 'InvoicePaymentReceived',
            invoiceId: '{{input.invoiceId}}',
            contactId: '{{input.contactId}}',
          },
        },
      },
      {
        id: 'add_note',
        action: 'add_note',
        params: {
          contactId: '{{input.contactId}}',
          body: '[web0n Payment Received]\nInvoice: {{input.invoiceId}}\nAmount: ${{input.amount}}',
        },
      },
    ],
  },

  'web0n-new-signup': {
    name: 'web0n New Signup',
    description: 'Onboards a new web0n customer — creates contact, tags, opportunity, deposit invoice',
    trigger: { type: 'webhook' },
    locationId: 'nphConTwfHcVE1oA0uep',
    pipelineId: 'r9MYmF2xQKOe0rOcVAQH',
    active: true,
    steps: [
      {
        id: 'create_contact',
        action: 'upsert_contact',
        params: {
          email: '{{input.email}}',
          firstName: '{{input.firstName}}',
          lastName: '{{input.lastName}}',
          phone: '{{input.phone}}',
          companyName: '{{input.businessName}}',
          source: 'web0n',
          tags: ['web0n', 'website-client'],
        },
      },
      {
        id: 'tag_contact',
        action: 'add_tags',
        params: {
          contactId: '{{steps.create_contact.id}}',
          tags: ['web0n', 'website-client', 'deposit-pending'],
        },
      },
      {
        id: 'create_opp',
        action: 'create_opportunity',
        params: {
          contactId: '{{steps.create_contact.id}}',
          pipelineId: 'r9MYmF2xQKOe0rOcVAQH',
          pipelineStageId: '2ed0f5ae-22a7-40b5-bbe5-c525c0ce75c4',
          name: 'web0n: {{input.businessName}}',
          monetaryValue: 1997,
        },
      },
      {
        id: 'deposit_invoice',
        action: 'create_invoice',
        params: {
          contactId: '{{steps.create_contact.id}}',
          name: 'web0n Deposit — {{input.businessName}}',
          itemName: 'web0n Website Build — 50% Deposit',
          amount: 998.50,
        },
      },
      {
        id: 'enrollment_note',
        action: 'add_note',
        params: {
          contactId: '{{steps.create_contact.id}}',
          body: '[web0n Project Created]\nBusiness: {{input.businessName}}\nEmail: {{input.email}}\nType: {{input.businessType}}\nServices: {{input.services}}',
        },
      },
    ],
  },
}

// ==================== WORKFLOW REGISTRY ====================

const registeredWorkflows: Map<string, WorkflowDefinition> = new Map()

export function registerWorkflow(workflow: WorkflowDefinition): void {
  registeredWorkflows.set(workflow.id, workflow)
}

export function getWorkflow(id: string): WorkflowDefinition | undefined {
  return registeredWorkflows.get(id)
}

export function listWorkflows(): WorkflowDefinition[] {
  return Array.from(registeredWorkflows.values())
}

// Initialize preset workflows
for (const [key, preset] of Object.entries(PRESET_WORKFLOWS)) {
  registerWorkflow({
    ...preset,
    id: key,
    createdAt: new Date().toISOString(),
  })
}
