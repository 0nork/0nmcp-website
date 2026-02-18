/**
 * CRM API Client for 0nmcp.com
 * Multi-location support: main account + community sub-location
 * Same PIT serves both — differentiated by location ID only
 *
 * Env vars:
 *   CRM_API_KEY                — PIT (serves all locations)
 *   CRM_LOCATION_ID            — Main sub-account location ID
 *   CRM_COMMUNITY_LOCATION_ID  — Community sub-location ID (nphConTwfHcVE1oA0uep)
 *   CRM_AGENCY_KEY             — Agency-level API key (for agency operations)
 */

const API_BASE = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'

// ==================== LOCATION TYPES ====================

export type CrmLocation = 'main' | 'community'

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

export function getLocationId(location: CrmLocation = 'main'): string {
  const id = location === 'community'
    ? (process.env.CRM_COMMUNITY_LOCATION_ID || 'nphConTwfHcVE1oA0uep')
    : process.env.CRM_LOCATION_ID

  if (!id) throw new Error(`CRM location ID not configured for ${location}`)
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
}, location: CrmLocation = 'main'): Promise<CrmContact> {
  const result = await crmRequest<{ contact: CrmContact }>('POST', '/contacts/upsert', {
    locationId: getLocationId(location),
    ...data,
  })
  return result.contact
}

/**
 * Search contacts by email
 */
export async function findContactByEmail(email: string, location: CrmLocation = 'main'): Promise<CrmContact | null> {
  const result = await crmRequest<{ contacts: CrmContact[] }>('POST', '/contacts/search', {
    locationId: getLocationId(location),
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

/**
 * Add a note to a contact
 */
export async function addContactNote(contactId: string, body: string): Promise<void> {
  await crmRequest('POST', `/contacts/${contactId}/notes`, {
    body,
    userId: contactId,
  })
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
export async function createConversation(contactId: string, location: CrmLocation = 'main'): Promise<{ id: string }> {
  return crmRequest('POST', '/conversations/', {
    locationId: getLocationId(location),
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
}, location: CrmLocation = 'main'): Promise<CrmOpportunity> {
  const result = await crmRequest<{ opportunity: CrmOpportunity }>('POST', '/opportunities/', {
    locationId: getLocationId(location),
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
  pipelineId: string,
  location: CrmLocation = 'main'
): Promise<CrmOpportunity | null> {
  const result = await crmRequest<{ opportunities: CrmOpportunity[] }>(
    'GET',
    `/opportunities/search?locationId=${getLocationId(location)}&contactId=${contactId}&pipelineId=${pipelineId}`
  )
  return result.opportunities?.[0] || null
}

// ==================== COURSES (Read-only) ====================

export interface CrmCourse {
  id: string
  title: string
  description?: string
  status?: string
}

export interface CrmCourseProgress {
  contactId: string
  courseId: string
  completionPercentage: number
  completedAt?: string
}

/**
 * List courses available in the community sub-location
 */
export async function listCourses(location: CrmLocation = 'community'): Promise<CrmCourse[]> {
  const result = await crmRequest<{ courses: CrmCourse[] }>(
    'GET',
    `/courses/?locationId=${getLocationId(location)}`
  )
  return result.courses || []
}

// ==================== TAGS ====================

/**
 * List all tags in a location
 */
export async function listTags(location: CrmLocation = 'main'): Promise<Array<{ id: string; name: string }>> {
  const result = await crmRequest<{ tags: Array<{ id: string; name: string }> }>(
    'GET',
    `/locations/${getLocationId(location)}/tags`
  )
  return result.tags || []
}

/**
 * Create a tag in a location
 */
export async function createTag(name: string, location: CrmLocation = 'main'): Promise<{ id: string; name: string }> {
  const result = await crmRequest<{ tag: { id: string; name: string } }>(
    'POST',
    `/locations/${getLocationId(location)}/tags`,
    { name }
  )
  return result.tag
}

// ==================== CUSTOM FIELDS ====================

/**
 * List custom fields for a location
 */
export async function listCustomFields(location: CrmLocation = 'main'): Promise<Array<{ id: string; name: string; fieldKey: string }>> {
  const result = await crmRequest<{ customFields: Array<{ id: string; name: string; fieldKey: string }> }>(
    'GET',
    `/locations/${getLocationId(location)}/customFields`
  )
  return result.customFields || []
}
