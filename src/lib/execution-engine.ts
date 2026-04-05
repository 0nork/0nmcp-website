/**
 * 0nAI Execution Engine — The core that ACTUALLY executes API calls.
 *
 * This is NOT a description engine. When you call executeAction(),
 * it makes REAL API calls to CRM, Stripe, Slack, and Supabase FDW.
 *
 * Supported services:
 * - CRM (contacts, email, pipelines, opportunities)
 * - Stripe (revenue, customers, subscriptions, invoices)
 * - Slack (messages, channels)
 * - Supabase FDW (raw queries against connected foreign data wrappers)
 */

import { createClient } from '@supabase/supabase-js'

// ── Credentials ──

const CRM_BASE = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

function getCrmPit(): string {
  return process.env.CRM_SUB_PIT || process.env.CRM_PIT || ''
}

function getCrmAgencyPit(): string {
  return process.env.CRM_PIT || process.env.CRM_AGENCY_PIT || ''
}

function getCrmLocationId(): string {
  return process.env.CRM_LOCATION_ID || ''
}

function getStripeKey(): string {
  return process.env.STRIPE_SECRET_KEY || ''
}

function getSlackToken(): string {
  return process.env.SLACK_BOT_TOKEN || ''
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Types ──

export interface ExecutionResult {
  success: boolean
  action: string
  service: string
  data?: unknown
  error?: string
  executedAt: string
}

export interface ToolDefinition {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

// ── Tool Definitions (for Anthropic tool_use) ──

export const EXECUTION_TOOLS: ToolDefinition[] = [
  // CRM Tools
  {
    name: 'search_crm_contacts',
    description: 'Search CRM contacts by name, email, or phone number. Returns matching contacts with their details.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term — name, email, or phone number' },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_crm_contact',
    description: 'Create a new contact in the CRM system.',
    input_schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags to apply to the contact',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'get_crm_contact',
    description: 'Get a specific CRM contact by their ID. Returns full contact details.',
    input_schema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'The contact ID' },
      },
      required: ['contactId'],
    },
  },
  {
    name: 'send_email',
    description: 'Send an email to a CRM contact. Requires the contact ID, subject, and email body (HTML supported).',
    input_schema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'The CRM contact ID to send to' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Email body (HTML supported)' },
      },
      required: ['contactId', 'subject', 'body'],
    },
  },
  {
    name: 'get_crm_pipelines',
    description: 'Get all sales pipelines and their stages from the CRM.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_crm_opportunity',
    description: 'Create a new opportunity (deal) in the CRM pipeline.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Opportunity name' },
        pipelineId: { type: 'string', description: 'Pipeline ID (get from get_crm_pipelines)' },
        stageId: { type: 'string', description: 'Stage ID within the pipeline' },
        contactId: { type: 'string', description: 'Associated contact ID' },
        monetaryValue: { type: 'number', description: 'Deal value in dollars' },
      },
      required: ['name', 'pipelineId', 'stageId'],
    },
  },
  {
    name: 'list_crm_contacts',
    description: 'List recent contacts from the CRM. Returns up to 20 contacts with basic info.',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of contacts to return (max 100, default 20)' },
        query: { type: 'string', description: 'Optional search filter' },
      },
    },
  },
  {
    name: 'update_crm_contact',
    description: 'Update an existing CRM contact fields.',
    input_schema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'The contact ID to update' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['contactId'],
    },
  },

  // Stripe Tools
  {
    name: 'get_stripe_revenue',
    description: 'Get revenue summary from Stripe. Shows total charges, count, and breakdown by status.',
    input_schema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['today', 'week', 'month', 'year', 'all'],
          description: 'Time period for revenue summary (default: month)',
        },
        limit: { type: 'number', description: 'Max charges to analyze (default 100)' },
      },
    },
  },
  {
    name: 'list_stripe_customers',
    description: 'List Stripe customers with their email, name, and subscription status.',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of customers (max 100, default 20)' },
        email: { type: 'string', description: 'Filter by email address' },
      },
    },
  },
  {
    name: 'list_stripe_subscriptions',
    description: 'List active Stripe subscriptions with pricing and customer info.',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'past_due', 'canceled', 'all'],
          description: 'Filter by subscription status (default: active)',
        },
        limit: { type: 'number', description: 'Number of subscriptions (max 100, default 20)' },
      },
    },
  },
  {
    name: 'create_stripe_invoice',
    description: 'Create and optionally send a Stripe invoice to a customer.',
    input_schema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'Stripe customer ID' },
        amount: { type: 'number', description: 'Amount in dollars (e.g., 99.99)' },
        description: { type: 'string', description: 'Line item description' },
        send: { type: 'boolean', description: 'Send the invoice immediately (default: false)' },
      },
      required: ['customerId', 'amount', 'description'],
    },
  },
  {
    name: 'get_stripe_balance',
    description: 'Get current Stripe account balance (available and pending funds).',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },

  // Slack Tools
  {
    name: 'post_to_slack',
    description: 'Post a message to a Slack channel. Use channel name (e.g., "general") or channel ID.',
    input_schema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel name or ID' },
        text: { type: 'string', description: 'Message text (supports Slack markdown)' },
      },
      required: ['channel', 'text'],
    },
  },
  {
    name: 'list_slack_channels',
    description: 'List Slack channels the bot has access to.',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of channels (default 50)' },
      },
    },
  },
  {
    name: 'get_slack_messages',
    description: 'Get recent messages from a Slack channel.',
    input_schema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel ID' },
        limit: { type: 'number', description: 'Number of messages (default 10)' },
      },
      required: ['channel'],
    },
  },

  // Data Query Tool
  {
    name: 'query_data',
    description: 'Query connected service data via Supabase Foreign Data Wrappers. Available sources: stripe (customers, subscriptions, invoices, charges), slack (channels, messages). Describe what data you want in natural language.',
    input_schema: {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          enum: ['stripe', 'slack', 'supabase'],
          description: 'Data source to query',
        },
        query: {
          type: 'string',
          description: 'Natural language description of the data to retrieve, or a specific SQL query for the FDW tables',
        },
      },
      required: ['source', 'query'],
    },
  },
]

// ── Execution Functions ──

async function crmFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  const pit = getCrmPit()
  if (!pit) throw new Error('CRM credentials not configured (CRM_PIT missing)')

  const url = `${CRM_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${pit}`,
      'Version': CRM_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`CRM API ${res.status}: ${body.slice(0, 500)}`)
  }

  return res.json()
}

async function stripeFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  const key = getStripeKey()
  if (!key) throw new Error('Stripe credentials not configured (STRIPE_SECRET_KEY missing)')

  const url = `https://api.stripe.com/v1${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${key}`,
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Stripe API ${res.status}: ${body.slice(0, 500)}`)
  }

  return res.json()
}

async function slackFetch(method: string, body?: Record<string, unknown>): Promise<unknown> {
  const token = getSlackToken()
  if (!token) throw new Error('Slack credentials not configured (SLACK_BOT_TOKEN missing)')

  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  })

  const data = await res.json() as { ok?: boolean; error?: string }
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error || 'Unknown error'}`)
  }

  return data
}

// ── Individual Action Executors ──

async function searchCrmContacts(params: { query: string }): Promise<unknown> {
  const locationId = getCrmLocationId()
  // Try search by email first
  const emailMatch = params.query.match(/[\w.-]+@[\w.-]+/)
  if (emailMatch) {
    return crmFetch(`/contacts/search/duplicate?locationId=${locationId}&email=${encodeURIComponent(emailMatch[0])}`)
  }
  // Try search by phone
  const phoneMatch = params.query.match(/[\d+()-]{7,}/)
  if (phoneMatch) {
    return crmFetch(`/contacts/search/duplicate?locationId=${locationId}&phone=${encodeURIComponent(phoneMatch[0])}`)
  }
  // General search via contacts list with query param
  return crmFetch(`/contacts/?locationId=${locationId}&query=${encodeURIComponent(params.query)}&limit=10`)
}

async function createCrmContact(params: { firstName?: string; lastName?: string; email: string; phone?: string; tags?: string[] }): Promise<unknown> {
  const locationId = getCrmLocationId()
  return crmFetch('/contacts/', {
    method: 'POST',
    body: JSON.stringify({
      firstName: params.firstName || '',
      lastName: params.lastName || '',
      email: params.email,
      phone: params.phone || '',
      tags: params.tags || [],
      locationId,
    }),
  })
}

async function getCrmContact(params: { contactId: string }): Promise<unknown> {
  return crmFetch(`/contacts/${params.contactId}`)
}

async function updateCrmContact(params: { contactId: string; firstName?: string; lastName?: string; email?: string; phone?: string; tags?: string[] }): Promise<unknown> {
  const { contactId, ...fields } = params
  // Filter out undefined fields
  const body: Record<string, unknown> = {}
  if (fields.firstName !== undefined) body.firstName = fields.firstName
  if (fields.lastName !== undefined) body.lastName = fields.lastName
  if (fields.email !== undefined) body.email = fields.email
  if (fields.phone !== undefined) body.phone = fields.phone
  if (fields.tags !== undefined) body.tags = fields.tags

  return crmFetch(`/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

async function sendEmail(params: { contactId: string; subject: string; body: string }): Promise<unknown> {
  // Use sub-location PIT for sending emails (has conversation permissions)
  const pit = process.env.CRM_SUB_PIT || getCrmPit()
  if (!pit) throw new Error('CRM credentials not configured for email sending')

  const res = await fetch(`${CRM_BASE}/conversations/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${pit}`,
      'Version': CRM_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'Email',
      contactId: params.contactId,
      subject: params.subject,
      message: params.body,
      emailFrom: process.env.CRM_EMAIL_FROM || 'mike@rocketopp.com',
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`CRM Email API ${res.status}: ${text.slice(0, 500)}`)
  }

  return res.json()
}

async function getCrmPipelines(): Promise<unknown> {
  const locationId = getCrmLocationId()
  return crmFetch(`/opportunities/pipelines?locationId=${locationId}`)
}

async function createCrmOpportunity(params: {
  name: string
  pipelineId: string
  stageId: string
  contactId?: string
  monetaryValue?: number
}): Promise<unknown> {
  const locationId = getCrmLocationId()
  return crmFetch('/opportunities/', {
    method: 'POST',
    body: JSON.stringify({
      name: params.name,
      pipelineId: params.pipelineId,
      pipelineStageId: params.stageId,
      contactId: params.contactId || '',
      monetaryValue: params.monetaryValue || 0,
      locationId,
    }),
  })
}

async function listCrmContacts(params: { limit?: number; query?: string }): Promise<unknown> {
  const locationId = getCrmLocationId()
  const limit = Math.min(params.limit || 20, 100)
  let url = `/contacts/?locationId=${locationId}&limit=${limit}`
  if (params.query) url += `&query=${encodeURIComponent(params.query)}`
  return crmFetch(url)
}

async function getStripeRevenue(params: { period?: string; limit?: number }): Promise<unknown> {
  const limit = Math.min(params.limit || 100, 100)

  // Calculate created[gte] based on period
  let createdGte = ''
  const now = Math.floor(Date.now() / 1000)
  switch (params.period) {
    case 'today':
      createdGte = `&created[gte]=${now - 86400}`
      break
    case 'week':
      createdGte = `&created[gte]=${now - 604800}`
      break
    case 'month':
      createdGte = `&created[gte]=${now - 2592000}`
      break
    case 'year':
      createdGte = `&created[gte]=${now - 31536000}`
      break
    // 'all' = no filter
  }

  const data = await stripeFetch(`/charges?limit=${limit}${createdGte}`) as {
    data?: Array<{ amount: number; status: string; currency: string; created: number }>
  }

  const charges = data.data || []
  const succeeded = charges.filter(c => c.status === 'succeeded')
  const totalCents = succeeded.reduce((sum, c) => sum + c.amount, 0)
  const failedCount = charges.filter(c => c.status === 'failed').length

  return {
    period: params.period || 'month',
    total_revenue: `$${(totalCents / 100).toFixed(2)}`,
    total_cents: totalCents,
    successful_charges: succeeded.length,
    failed_charges: failedCount,
    total_charges: charges.length,
    currency: 'USD',
    charges: succeeded.slice(0, 10).map(c => ({
      amount: `$${(c.amount / 100).toFixed(2)}`,
      created: new Date(c.created * 1000).toISOString(),
    })),
  }
}

async function listStripeCustomers(params: { limit?: number; email?: string }): Promise<unknown> {
  const limit = Math.min(params.limit || 20, 100)
  let url = `/customers?limit=${limit}`
  if (params.email) url += `&email=${encodeURIComponent(params.email)}`
  return stripeFetch(url)
}

async function listStripeSubscriptions(params: { status?: string; limit?: number }): Promise<unknown> {
  const limit = Math.min(params.limit || 20, 100)
  const status = params.status === 'all' ? '' : `&status=${params.status || 'active'}`
  return stripeFetch(`/subscriptions?limit=${limit}${status}`)
}

async function createStripeInvoice(params: {
  customerId: string
  amount: number
  description: string
  send?: boolean
}): Promise<unknown> {
  // Create invoice
  const invoice = await stripeFetch('/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `customer=${params.customerId}&auto_advance=${params.send ? 'true' : 'false'}`,
  }) as { id: string }

  // Add line item
  const amountCents = Math.round(params.amount * 100)
  await stripeFetch('/invoiceitems', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `customer=${params.customerId}&amount=${amountCents}&currency=usd&description=${encodeURIComponent(params.description)}&invoice=${invoice.id}`,
  })

  // Finalize
  const finalized = await stripeFetch(`/invoices/${invoice.id}/finalize`, {
    method: 'POST',
  })

  // Optionally send
  if (params.send) {
    await stripeFetch(`/invoices/${invoice.id}/send`, {
      method: 'POST',
    })
  }

  return finalized
}

async function getStripeBalance(): Promise<unknown> {
  const data = await stripeFetch('/balance') as {
    available?: Array<{ amount: number; currency: string }>
    pending?: Array<{ amount: number; currency: string }>
  }

  return {
    available: data.available?.map(b => ({
      amount: `$${(b.amount / 100).toFixed(2)}`,
      currency: b.currency,
    })) || [],
    pending: data.pending?.map(b => ({
      amount: `$${(b.amount / 100).toFixed(2)}`,
      currency: b.currency,
    })) || [],
  }
}

async function postToSlack(params: { channel: string; text: string }): Promise<unknown> {
  return slackFetch('chat.postMessage', {
    channel: params.channel,
    text: params.text,
  })
}

async function listSlackChannels(params: { limit?: number }): Promise<unknown> {
  const limit = params.limit || 50
  return slackFetch('conversations.list', {
    types: 'public_channel,private_channel',
    limit,
  })
}

async function getSlackMessages(params: { channel: string; limit?: number }): Promise<unknown> {
  return slackFetch('conversations.history', {
    channel: params.channel,
    limit: params.limit || 10,
  })
}

async function queryData(params: { source: string; query: string }): Promise<unknown> {
  const admin = getAdmin()
  const { source, query } = params

  // Use Supabase PostgREST for direct table queries, or raw SQL for FDW
  switch (source) {
    case 'stripe': {
      // Try to infer what Stripe data they want
      const lower = query.toLowerCase()
      if (lower.includes('customer')) {
        const { data, error } = await admin.from('stripe_customers' as string).select('*').limit(20)
        if (error) {
          // FDW table might have different name — try via Stripe API
          return listStripeCustomers({ limit: 20 })
        }
        return { source: 'stripe_fdw', table: 'stripe_customers', data }
      }
      if (lower.includes('subscription')) {
        const { data, error } = await admin.from('stripe_subscriptions' as string).select('*').limit(20)
        if (error) return listStripeSubscriptions({ limit: 20 })
        return { source: 'stripe_fdw', table: 'stripe_subscriptions', data }
      }
      if (lower.includes('invoice')) {
        const { data, error } = await admin.from('stripe_invoices' as string).select('*').limit(20)
        if (error) {
          // Fall back to Stripe API
          return stripeFetch('/invoices?limit=20')
        }
        return { source: 'stripe_fdw', table: 'stripe_invoices', data }
      }
      if (lower.includes('charge') || lower.includes('revenue') || lower.includes('payment')) {
        return getStripeRevenue({ period: 'month' })
      }
      // Generic Stripe query via API
      return getStripeRevenue({ period: 'all', limit: 50 })
    }

    case 'slack': {
      const lower = query.toLowerCase()
      if (lower.includes('channel')) {
        return listSlackChannels({ limit: 50 })
      }
      if (lower.includes('message')) {
        // Need a channel ID — try to extract or list channels first
        return listSlackChannels({ limit: 20 })
      }
      return listSlackChannels({ limit: 20 })
    }

    case 'supabase': {
      // Query internal Supabase tables
      const lower = query.toLowerCase()
      if (lower.includes('profile') || lower.includes('user')) {
        const { data, error } = await admin.from('profiles').select('id, full_name, email, plan, labels, created_at').limit(20)
        if (error) throw new Error(`Supabase query failed: ${error.message}`)
        return { source: 'supabase', table: 'profiles', data }
      }
      if (lower.includes('execution') || lower.includes('run')) {
        const { data, error } = await admin.from('console_executions').select('*').order('created_at', { ascending: false }).limit(20)
        if (error) throw new Error(`Supabase query failed: ${error.message}`)
        return { source: 'supabase', table: 'console_executions', data }
      }
      if (lower.includes('thread') || lower.includes('forum') || lower.includes('community')) {
        const { data, error } = await admin.from('community_threads').select('*').order('created_at', { ascending: false }).limit(20)
        if (error) throw new Error(`Supabase query failed: ${error.message}`)
        return { source: 'supabase', table: 'community_threads', data }
      }
      return { error: 'Specify what data you want: profiles, executions, threads, etc.' }
    }

    default:
      return { error: `Unknown data source: ${source}. Available: stripe, slack, supabase` }
  }
}

// ── Master Executor ──

export async function executeAction(
  actionName: string,
  params: Record<string, unknown>,
  userId?: string
): Promise<ExecutionResult> {
  const startTime = Date.now()

  try {
    let data: unknown
    let service: string

    switch (actionName) {
      // CRM
      case 'search_crm_contacts':
        service = 'crm'
        data = await searchCrmContacts(params as { query: string })
        break
      case 'create_crm_contact':
        service = 'crm'
        data = await createCrmContact(params as { firstName?: string; lastName?: string; email: string; phone?: string; tags?: string[] })
        break
      case 'get_crm_contact':
        service = 'crm'
        data = await getCrmContact(params as { contactId: string })
        break
      case 'update_crm_contact':
        service = 'crm'
        data = await updateCrmContact(params as { contactId: string; firstName?: string; lastName?: string; email?: string; phone?: string; tags?: string[] })
        break
      case 'send_email':
        service = 'crm'
        data = await sendEmail(params as { contactId: string; subject: string; body: string })
        break
      case 'get_crm_pipelines':
        service = 'crm'
        data = await getCrmPipelines()
        break
      case 'create_crm_opportunity':
        service = 'crm'
        data = await createCrmOpportunity(params as { name: string; pipelineId: string; stageId: string; contactId?: string; monetaryValue?: number })
        break
      case 'list_crm_contacts':
        service = 'crm'
        data = await listCrmContacts(params as { limit?: number; query?: string })
        break

      // Stripe
      case 'get_stripe_revenue':
        service = 'stripe'
        data = await getStripeRevenue(params as { period?: string; limit?: number })
        break
      case 'list_stripe_customers':
        service = 'stripe'
        data = await listStripeCustomers(params as { limit?: number; email?: string })
        break
      case 'list_stripe_subscriptions':
        service = 'stripe'
        data = await listStripeSubscriptions(params as { status?: string; limit?: number })
        break
      case 'create_stripe_invoice':
        service = 'stripe'
        data = await createStripeInvoice(params as { customerId: string; amount: number; description: string; send?: boolean })
        break
      case 'get_stripe_balance':
        service = 'stripe'
        data = await getStripeBalance()
        break

      // Slack
      case 'post_to_slack':
        service = 'slack'
        data = await postToSlack(params as { channel: string; text: string })
        break
      case 'list_slack_channels':
        service = 'slack'
        data = await listSlackChannels(params as { limit?: number })
        break
      case 'get_slack_messages':
        service = 'slack'
        data = await getSlackMessages(params as { channel: string; limit?: number })
        break

      // Data queries
      case 'query_data':
        service = 'data'
        data = await queryData(params as { source: string; query: string })
        break

      default:
        return {
          success: false,
          action: actionName,
          service: 'unknown',
          error: `Unknown action: ${actionName}. Available actions: ${EXECUTION_TOOLS.map(t => t.name).join(', ')}`,
          executedAt: new Date().toISOString(),
        }
    }

    const durationMs = Date.now() - startTime

    // Log execution to Supabase (non-blocking)
    if (userId) {
      logExecution(userId, actionName, service!, params, data, null, durationMs).catch(err =>
        console.error('[execution-engine] Failed to log:', err)
      )
    }

    return {
      success: true,
      action: actionName,
      service: service!,
      data,
      executedAt: new Date().toISOString(),
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    const durationMs = Date.now() - startTime

    // Log failed execution
    if (userId) {
      logExecution(userId, actionName, 'unknown', params, null, errorMsg, durationMs).catch(e =>
        console.error('[execution-engine] Failed to log error:', e)
      )
    }

    return {
      success: false,
      action: actionName,
      service: 'unknown',
      error: errorMsg,
      executedAt: new Date().toISOString(),
    }
  }
}

// ── Execution Logging ──

async function logExecution(
  userId: string,
  action: string,
  service: string,
  params: Record<string, unknown>,
  result: unknown,
  error: string | null,
  durationMs: number
): Promise<void> {
  try {
    const admin = getAdmin()
    await admin.from('ai_executions').insert({
      user_id: userId,
      action,
      service,
      params: JSON.stringify(params).slice(0, 2000),
      result_summary: result ? JSON.stringify(result).slice(0, 2000) : null,
      error_message: error,
      duration_ms: durationMs,
      status: error ? 'failed' : 'completed',
      created_at: new Date().toISOString(),
    })
  } catch {
    // Non-critical — just log
    console.error('[execution-engine] DB log insert failed')
  }
}
