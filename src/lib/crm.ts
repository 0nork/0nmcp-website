/**
 * CRM API Client for 0nmcp.com
 * Wraps the CRM REST API for contacts, conversations, opportunities
 *
 * Env vars:
 *   CRM_API_KEY       — Sub-account Private Integration Token (PIT)
 *   CRM_LOCATION_ID   — Sub-account location ID
 *   CRM_AGENCY_KEY    — Agency-level API key (for agency operations)
 */

const API_BASE = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'

function getHeaders(useAgencyKey = false): Record<string, string> {
  const key = useAgencyKey
    ? process.env.CRM_AGENCY_KEY
    : process.env.CRM_API_KEY

  if (!key) throw new Error(`CRM ${useAgencyKey ? 'agency' : 'API'} key not configured`)

  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Version': API_VERSION,
  }
}

function getLocationId(): string {
  const id = process.env.CRM_LOCATION_ID
  if (!id) throw new Error('CRM_LOCATION_ID not configured')
  return id
}

async function crmRequest<T = Record<string, unknown>>(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  useAgencyKey = false
): Promise<T> {
  const url = `${API_BASE}${path}`
  const options: RequestInit = {
    method,
    headers: getHeaders(useAgencyKey),
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(url, options)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`CRM API ${method} ${path}: ${res.status} — ${err}`)
  }

  return res.json()
}

// ==================== CONTACTS ====================

export interface CrmContact {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  tags?: string[]
  source?: string
  companyName?: string
  customFields?: Array<{ id: string; value: string }>
}

/**
 * Create or update a contact by email (upsert)
 */
export async function upsertContact(data: {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  tags?: string[]
  source?: string
  companyName?: string
}): Promise<CrmContact> {
  const result = await crmRequest<{ contact: CrmContact }>('POST', '/contacts/upsert', {
    locationId: getLocationId(),
    ...data,
  })
  return result.contact
}

/**
 * Search contacts by email
 */
export async function findContactByEmail(email: string): Promise<CrmContact | null> {
  const result = await crmRequest<{ contacts: CrmContact[] }>('POST', '/contacts/search', {
    locationId: getLocationId(),
    filters: [{ field: 'email', operator: 'eq', value: email }],
    pageLimit: 1,
  })
  return result.contacts?.[0] || null
}

/**
 * Update a contact
 */
export async function updateContact(contactId: string, data: Partial<{
  firstName: string
  lastName: string
  tags: string[]
  source: string
  companyName: string
}>): Promise<CrmContact> {
  const result = await crmRequest<{ contact: CrmContact }>('PUT', `/contacts/${contactId}`, {
    ...data,
  })
  return result.contact
}

/**
 * Add tags to a contact
 */
export async function addContactTags(contactId: string, tags: string[]): Promise<void> {
  await crmRequest('POST', `/contacts/${contactId}/tags`, { tags })
}

/**
 * Remove tags from a contact
 */
export async function removeContactTags(contactId: string, tags: string[]): Promise<void> {
  await crmRequest('DELETE', `/contacts/${contactId}/tags`, { tags })
}

// ==================== CONVERSATIONS / EMAIL ====================

export interface CrmMessage {
  id: string
  conversationId?: string
  messageType?: string
  status?: string
}

/**
 * Send an email to a contact
 */
export async function sendEmail(params: {
  contactId: string
  subject: string
  html: string
  emailFrom?: string
  emailTo?: string
  conversationId?: string
}): Promise<CrmMessage> {
  const result = await crmRequest<CrmMessage>('POST', '/conversations/messages', {
    type: 'Email',
    contactId: params.contactId,
    subject: params.subject,
    html: params.html,
    emailFrom: params.emailFrom || process.env.CRM_FROM_EMAIL || 'noreply@0nmcp.com',
    emailTo: params.emailTo,
    conversationId: params.conversationId,
  })
  return result
}

/**
 * Create a conversation for a contact
 */
export async function createConversation(contactId: string): Promise<{ id: string }> {
  return crmRequest('POST', '/conversations/', {
    locationId: getLocationId(),
    contactId,
  })
}

// ==================== OPPORTUNITIES ====================

export interface CrmOpportunity {
  id: string
  name: string
  status: string
  stageId?: string
  pipelineId?: string
  monetaryValue?: number
  contactId?: string
}

/**
 * Create an opportunity in a pipeline
 */
export async function createOpportunity(data: {
  name: string
  pipelineId: string
  pipelineStageId: string
  contactId: string
  monetaryValue?: number
  status?: string
}): Promise<CrmOpportunity> {
  const result = await crmRequest<{ opportunity: CrmOpportunity }>('POST', '/opportunities/', {
    locationId: getLocationId(),
    ...data,
    status: data.status || 'open',
  })
  return result.opportunity
}

/**
 * Update an opportunity (e.g., move to new stage)
 */
export async function updateOpportunity(
  opportunityId: string,
  data: Partial<{ pipelineStageId: string; status: string; monetaryValue: number; name: string }>
): Promise<CrmOpportunity> {
  const result = await crmRequest<{ opportunity: CrmOpportunity }>('PUT', `/opportunities/${opportunityId}`, data)
  return result.opportunity
}

/**
 * Search opportunities by contact
 */
export async function findOpportunityByContact(
  contactId: string,
  pipelineId: string
): Promise<CrmOpportunity | null> {
  const result = await crmRequest<{ opportunities: CrmOpportunity[] }>(
    'GET',
    `/opportunities/search?locationId=${getLocationId()}&contactId=${contactId}&pipelineId=${pipelineId}`
  )
  return result.opportunities?.[0] || null
}
