/**
 * 0nMCP CRM Marketplace App
 *
 * Handles OAuth installations, trigger subscriptions, action execution,
 * and dynamic field definitions for the CRM app store listing.
 *
 * App provides:
 * - Actions: "Execute Tool" (550 tools across 26 services), "Run Workflow"
 * - Triggers: "Tool Executed", "Workflow Completed"
 */

import { createClient } from '@supabase/supabase-js'

// ─── Supabase service client (bypasses RLS) ─────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured for marketplace')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

// ─── CRM OAuth Config ───────────────────────────────────────────────
const CRM_API_BASE = 'https://services.leadconnectorhq.com'
const CRM_AUTH_URL = 'https://marketplace.leadconnectorhq.com/oauth/chooselocation'
const CRM_TOKEN_URL = `${CRM_API_BASE}/oauth/token`
const CLIENT_ID = process.env.CRM_MARKETPLACE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.CRM_MARKETPLACE_CLIENT_SECRET || ''
const REDIRECT_URI = process.env.CRM_MARKETPLACE_REDIRECT_URI || 'https://0nmcp.com/api/marketplace/oauth/callback'

// ─── Service Catalog (for dynamic dropdowns) ────────────────────────
export const SERVICE_CATALOG = [
  { key: 'crm', label: 'CRM', tools: ['create_contact', 'update_contact', 'search_contacts', 'create_opportunity', 'add_tag', 'remove_tag', 'send_sms', 'send_email', 'create_note', 'enroll_workflow', 'list_pipelines', 'list_contacts', 'get_contact', 'create_task'] },
  { key: 'stripe', label: 'Stripe', tools: ['create_customer', 'create_invoice', 'create_payment_link', 'list_payments', 'create_subscription', 'create_product', 'create_price', 'refund_payment'] },
  { key: 'sendgrid', label: 'SendGrid', tools: ['send_email', 'send_template', 'add_contact', 'create_list', 'get_stats'] },
  { key: 'slack', label: 'Slack', tools: ['send_message', 'create_channel', 'upload_file', 'list_channels', 'add_reaction'] },
  { key: 'discord', label: 'Discord', tools: ['send_message', 'create_channel', 'add_role', 'list_members'] },
  { key: 'twilio', label: 'Twilio', tools: ['send_sms', 'make_call', 'send_whatsapp', 'lookup_number'] },
  { key: 'github', label: 'GitHub', tools: ['create_issue', 'create_repo', 'create_pr', 'list_repos', 'add_comment'] },
  { key: 'shopify', label: 'Shopify', tools: ['create_product', 'update_inventory', 'create_order', 'list_products', 'create_discount'] },
  { key: 'openai', label: 'OpenAI', tools: ['chat_completion', 'generate_image', 'create_embedding', 'text_to_speech'] },
  { key: 'anthropic', label: 'Anthropic', tools: ['chat_completion', 'analyze_image', 'generate_content'] },
  { key: 'google_sheets', label: 'Google Sheets', tools: ['read_sheet', 'write_row', 'update_row', 'create_sheet', 'append_row'] },
  { key: 'google_drive', label: 'Google Drive', tools: ['upload_file', 'list_files', 'create_folder', 'share_file'] },
  { key: 'gmail', label: 'Gmail', tools: ['send_email', 'list_emails', 'search_emails', 'create_label'] },
  { key: 'airtable', label: 'Airtable', tools: ['create_record', 'update_record', 'list_records', 'search_records'] },
  { key: 'notion', label: 'Notion', tools: ['create_page', 'update_page', 'query_database', 'create_database'] },
  { key: 'supabase', label: 'Supabase', tools: ['insert_row', 'update_row', 'select_rows', 'delete_row', 'rpc_call'] },
  { key: 'mongodb', label: 'MongoDB', tools: ['insert_document', 'find_documents', 'update_document', 'delete_document'] },
  { key: 'zendesk', label: 'Zendesk', tools: ['create_ticket', 'update_ticket', 'list_tickets', 'add_comment'] },
  { key: 'jira', label: 'Jira', tools: ['create_issue', 'update_issue', 'list_issues', 'add_comment', 'transition_issue'] },
  { key: 'hubspot', label: 'HubSpot', tools: ['create_contact', 'create_deal', 'list_contacts', 'update_contact'] },
  { key: 'mailchimp', label: 'Mailchimp', tools: ['add_subscriber', 'send_campaign', 'list_audiences', 'create_campaign'] },
  { key: 'google_calendar', label: 'Google Calendar', tools: ['create_event', 'list_events', 'update_event', 'delete_event'] },
  { key: 'calendly', label: 'Calendly', tools: ['list_events', 'get_event', 'list_invitees'] },
  { key: 'zoom', label: 'Zoom', tools: ['create_meeting', 'list_meetings', 'get_recording'] },
  { key: 'linear', label: 'Linear', tools: ['create_issue', 'update_issue', 'list_issues', 'create_project'] },
  { key: 'microsoft', label: 'Microsoft', tools: ['send_email', 'create_event', 'list_files', 'upload_file'] },
]

// ─── Action Definitions ─────────────────────────────────────────────
export const ACTIONS = {
  execute_tool: {
    key: 'execute_tool',
    name: 'Execute 0nMCP Tool',
    description: 'Execute any of 550+ tools across 26 integrated services. Select a service and tool, provide the inputs, and 0nMCP handles the rest.',
    version: '1.0',
  },
  run_workflow: {
    key: 'run_workflow',
    name: 'Run 0n Workflow',
    description: 'Execute a saved .0n workflow file with custom inputs. Chain multiple tools together in a single action.',
    version: '1.0',
  },
  ai_generate: {
    key: 'ai_generate',
    name: 'AI Generate Content',
    description: 'Generate text, emails, social posts, or any content using AI (Claude or GPT) with context from the contact.',
    version: '1.0',
  },
}

// ─── Trigger Definitions ────────────────────────────────────────────
export const TRIGGERS = {
  tool_executed: {
    key: 'tool_executed',
    name: 'Tool Execution Completed',
    description: 'Fires when an 0nMCP tool finishes executing. Filter by service or tool name.',
  },
  workflow_completed: {
    key: 'workflow_completed',
    name: 'Workflow Completed',
    description: 'Fires when an 0n workflow finishes. Filter by workflow name or status.',
  },
}

// ─── OAuth Functions ────────────────────────────────────────────────

export function getOAuthInstallUrl(state?: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'contacts.readonly contacts.write workflows.readonly opportunities.write locations.readonly',
    ...(state ? { state } : {}),
  })
  return `${CRM_AUTH_URL}?${params}`
}

export async function exchangeOAuthCode(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  locationId: string
  companyId: string
  userId: string
  userType: string
}> {
  const res = await fetch(CRM_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OAuth token exchange failed: ${res.status} — ${text}`)
  }

  return res.json()
}

export async function refreshOAuthToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const res = await fetch(CRM_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`)
  return res.json()
}

// ─── Installation Management ────────────────────────────────────────

export async function saveInstallation(data: {
  locationId: string
  companyId: string
  accessToken: string
  refreshToken: string
  expiresIn: number
  installedBy?: string
}): Promise<void> {
  const db = getServiceClient()
  const expiresAt = new Date(Date.now() + data.expiresIn * 1000).toISOString()

  await db.from('marketplace_installations').upsert({
    location_id: data.locationId,
    company_id: data.companyId,
    access_token: data.accessToken,
    refresh_token: data.refreshToken,
    expires_at: expiresAt,
    installed_by: data.installedBy,
    active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'location_id' })
}

export async function getInstallation(locationId: string) {
  const db = getServiceClient()
  const { data } = await db
    .from('marketplace_installations')
    .select('*')
    .eq('location_id', locationId)
    .eq('active', true)
    .single()

  if (!data) return null

  // Check if token is expired and refresh
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    try {
      const refreshed = await refreshOAuthToken(data.refresh_token)
      await saveInstallation({
        locationId: data.location_id,
        companyId: data.company_id,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
        expiresIn: refreshed.expires_in,
      })
      return { ...data, access_token: refreshed.access_token }
    } catch {
      return null
    }
  }

  return data
}

// ─── Trigger Management ─────────────────────────────────────────────

export async function saveTriggerSubscription(data: {
  triggerId: string
  triggerKey: string
  locationId: string
  workflowId: string
  companyId?: string
  targetUrl: string
  filters?: unknown[]
  eventType: string
}): Promise<void> {
  const db = getServiceClient()

  if (data.eventType === 'DELETED') {
    await db.from('marketplace_triggers').delete().eq('trigger_id', data.triggerId)
    return
  }

  await db.from('marketplace_triggers').upsert({
    trigger_id: data.triggerId,
    trigger_key: data.triggerKey,
    location_id: data.locationId,
    workflow_id: data.workflowId,
    company_id: data.companyId,
    target_url: data.targetUrl,
    filters: data.filters || [],
    event_type: data.eventType,
    active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'trigger_id' })
}

export async function fireTrigger(triggerKey: string, locationId: string, payload: Record<string, unknown>): Promise<void> {
  const db = getServiceClient()
  const { data: triggers } = await db
    .from('marketplace_triggers')
    .select('*')
    .eq('trigger_key', triggerKey)
    .eq('location_id', locationId)
    .eq('active', true)

  if (!triggers?.length) return

  for (const trigger of triggers) {
    await fetch(trigger.target_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.error(`Failed to fire trigger ${trigger.trigger_id}:`, err))
  }
}

// ─── Execution Logging ──────────────────────────────────────────────

export async function logExecution(data: {
  locationId: string
  actionKey: string
  contactId?: string
  workflowId?: string
  inputData: Record<string, unknown>
  outputData: Record<string, unknown>
  status: string
  durationMs: number
  errorMessage?: string
}): Promise<void> {
  const db = getServiceClient()
  await db.from('marketplace_executions').insert({
    location_id: data.locationId,
    action_key: data.actionKey,
    contact_id: data.contactId,
    workflow_id: data.workflowId,
    input_data: data.inputData,
    output_data: data.outputData,
    status: data.status,
    duration_ms: data.durationMs,
    error_message: data.errorMessage,
  })
}

// ─── Dynamic Fields (dropdown options) ──────────────────────────────

export function getServiceOptions() {
  return SERVICE_CATALOG.map((s) => ({
    value: s.key,
    label: s.label,
  }))
}

export function getToolOptions(serviceKey: string) {
  const service = SERVICE_CATALOG.find((s) => s.key === serviceKey)
  if (!service) return []
  return service.tools.map((t) => ({
    value: `${serviceKey}_${t}`,
    label: t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  }))
}
