/**
 * CRM Sub-Account Provisioning
 *
 * Auto-provisions a REAL CRM sub-account (location) for each 0n user on signup.
 *
 * Flow:
 *  1. Create CRM contact in community location
 *  2. Create sub-account (location) under agency using CRM_AGENCY_KEY
 *  3. Fire Agent Studio agent to deploy KB + support agent to new location
 *  4. Store location_id, contact_id, agent_id in user_crm_accounts
 *  5. Update profiles with CRM references
 *
 * Every CRM API call is wrapped in retryWithBackoff (3 attempts, exponential).
 * If provisioning fails entirely, it queues to crm_provision_queue for retry.
 */

import { createClient } from '@supabase/supabase-js'
import * as Sentry from '@sentry/nextjs'

const API_BASE = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'

// ── Retry Wrapper ──

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 500
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxAttempts) throw err
      console.warn(`[CRM Retry] Attempt ${attempt}/${maxAttempts} failed, retrying in ${baseDelayMs * 2 ** (attempt - 1)}ms...`)
      await new Promise(r => setTimeout(r, baseDelayMs * 2 ** (attempt - 1)))
    }
  }
  throw new Error('retryWithBackoff: exhausted')
}

// ── Types ──

export interface ProvisionResult {
  success: boolean
  locationId: string
  contactId: string
  agentId?: string
  error?: string
}

export interface UserCrmAccount {
  id: string
  user_id: string
  location_id: string
  contact_id: string | null
  default_agent_id: string | null
  agent_version_id: string | null
  execution_count: number
  status: string
  metadata?: Record<string, unknown>
}

// ── Admin Client ──

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Key Validation ──

function validateCrmKeys() {
  if (!process.env.CRM_API_KEY && !process.env.CRM_PIT) {
    throw new Error('[CRM] Missing required CRM_API_KEY — check env vars')
  }
}

function validateAgentStudioKeys() {
  if (!process.env.CRM_AGENT_STUDIO_KEY) {
    throw new Error('[CRM] Missing required CRM_AGENT_STUDIO_KEY — check env vars')
  }
}

function getCrmHeaders(useAgencyKey = false): Record<string, string> {
  const key = useAgencyKey
    ? process.env.CRM_AGENCY_KEY
    : (process.env.CRM_API_KEY || process.env.CRM_PIT)

  if (!key) throw new Error(`[CRM] Missing ${useAgencyKey ? 'CRM_AGENCY_KEY' : 'CRM_API_KEY'} — check env vars`)

  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Version': API_VERSION,
  }
}

function getAgentStudioHeaders(): Record<string, string> {
  validateAgentStudioKeys()
  return {
    'Authorization': `Bearer ${process.env.CRM_AGENT_STUDIO_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Version': API_VERSION,
  }
}

// ── Check if user already has a CRM account ──

export async function getUserCrmAccount(userId: string): Promise<UserCrmAccount | null> {
  const admin = getAdmin()
  const { data } = await admin
    .from('user_crm_accounts')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

// ── Get or create user's CRM account ──

export async function getOrCreateCrmAccount(userId: string): Promise<UserCrmAccount | null> {
  const existing = await getUserCrmAccount(userId)
  if (existing) return existing

  const admin = getAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('email, full_name, company')
    .eq('id', userId)
    .maybeSingle()

  if (!profile?.email) return null

  const result = await provisionUser({
    userId,
    email: profile.email,
    fullName: profile.full_name || '',
    company: profile.company || '',
  })

  if (!result.success) return null
  return getUserCrmAccount(userId)
}

// ── Provision a new user — creates REAL sub-account ──

export async function provisionUser(params: {
  userId: string
  email: string
  fullName: string
  company: string
}): Promise<ProvisionResult> {
  const admin = getAdmin()
  const communityLocationId = process.env.CRM_AGENT_STUDIO_LOCATION_ID || process.env.CRM_COMMUNITY_LOCATION_ID || ''

  try {
    validateCrmKeys()

    // ── Step 1: Create CRM contact in community location ──
    const nameParts = params.fullName.split(' ')
    const firstName = nameParts[0] || params.email.split('@')[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

    const contact = await retryWithBackoff(async () => {
      const res = await fetch(`${API_BASE}/contacts/upsert`, {
        method: 'POST',
        headers: getCrmHeaders(),
        body: JSON.stringify({
          locationId: communityLocationId,
          email: params.email,
          firstName,
          lastName: lastName || undefined,
          companyName: params.company || undefined,
          source: '0n-console',
          tags: ['0n-user', 'agent-studio', 'auto-provisioned'],
        }),
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Contact upsert ${res.status}: ${err}`)
      }
      const data = await res.json()
      return data.contact as { id: string }
    })

    console.log(`[provision] Contact created: ${contact.id} for ${params.email}`)

    // Tag the contact (non-fatal)
    await retryWithBackoff(async () => {
      const res = await fetch(`${API_BASE}/contacts/${contact.id}/tags`, {
        method: 'POST',
        headers: getCrmHeaders(),
        body: JSON.stringify({ tags: ['0n-user', 'agent-studio', 'auto-provisioned'] }),
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) throw new Error(`Tag failed: ${res.status}`)
    }).catch(err => console.warn('[provision] Tagging failed (non-fatal):', err.message))

    // ── Step 2: Create sub-account (location) under agency ──
    let newLocationId = communityLocationId // fallback to community if sub-account creation fails

    if (process.env.CRM_AGENCY_KEY) {
      try {
        const locationName = params.company
          ? `${params.company} — 0n`
          : `${firstName} ${lastName} — 0n`.trim()

        const location = await retryWithBackoff(async () => {
          const res = await fetch(`${API_BASE}/locations/`, {
            method: 'POST',
            headers: getCrmHeaders(true), // agency key
            body: JSON.stringify({
              companyId: process.env.CRM_COMPANY_ID || process.env.CRM_AGENCY_COMPANY_ID || '',
              name: locationName,
              email: params.email,
              timezone: 'America/New_York',
              country: 'US',
              settings: {
                allowDuplicateContact: false,
                allowDuplicateOpportunity: false,
              },
            }),
            signal: AbortSignal.timeout(20000),
          })
          if (!res.ok) {
            const err = await res.text()
            throw new Error(`Location create ${res.status}: ${err}`)
          }
          const data = await res.json()
          return data.location || data
        })

        newLocationId = location.id || newLocationId
        console.log(`[provision] Sub-account created: ${newLocationId} for ${params.email}`)

        // ── Step 2b: Apply snapshot to new sub-location ──
        // This loads ALL agents, KB, workflows, funnels, chat widget, pipeline, templates
        const snapshotId = process.env.CRM_SNAPSHOT_ID || 'oaxVyPtc7dYQ2v1oizWQ'
        try {
          await retryWithBackoff(async () => {
            const snapRes = await fetch(`${API_BASE}/locations/${newLocationId}`, {
              method: 'PUT',
              headers: getCrmHeaders(true), // agency key
              body: JSON.stringify({
                snapshotId,
              }),
              signal: AbortSignal.timeout(30000),
            })
            if (!snapRes.ok) {
              const err = await snapRes.text()
              throw new Error(`Snapshot apply ${snapRes.status}: ${err}`)
            }
            return snapRes.json()
          })
          console.log(`[provision] Snapshot ${snapshotId} applied to ${newLocationId}`)
        } catch (snapErr) {
          console.error('[provision] Snapshot apply failed (non-fatal):', snapErr instanceof Error ? snapErr.message : snapErr)
          // Non-fatal — location still works, just without pre-loaded assets
        }

      } catch (err) {
        console.error('[provision] Sub-account creation failed, using community location:', err instanceof Error ? err.message : err)
        // Continue with community location as fallback
      }
    } else {
      console.log('[provision] No CRM_AGENCY_KEY — using community location')
    }

    // ── Step 3: Fire Agent Studio agent to deploy KB + agent ──
    const defaultAgentId = process.env.CRM_AGENT_STUDIO_AGENT_ID || ''
    const defaultVersionId = process.env.CRM_AGENT_STUDIO_VERSION_ID || ''

    let agentExecutionId: string | undefined
    try {
      validateAgentStudioKeys()
      const agentResult = await fireNewUserAgent({
        contactId: contact.id,
        email: params.email,
        fullName: params.fullName,
        company: params.company,
        locationId: newLocationId,
      })
      agentExecutionId = agentResult.executionId
      console.log('[provision] Agent fired for', params.email, '→', agentResult.response?.substring(0, 200))
    } catch (err) {
      console.error('[provision] Agent fire failed (non-fatal):', err instanceof Error ? err.message : err)
    }

    // ── Step 4: Store in Supabase ──
    const { error: insertErr } = await admin
      .from('user_crm_accounts')
      .insert({
        user_id: params.userId,
        location_id: newLocationId,
        contact_id: contact.id,
        default_agent_id: defaultAgentId,
        agent_version_id: defaultVersionId,
        agents: defaultAgentId ? [{ id: defaultAgentId, name: 'KB Support Agent', type: 'knowledge-base' }] : [],
        status: 'active',
        metadata: {
          email: params.email,
          provisioned_via: 'auto',
          plan: 'free',
          agent_execution_id: agentExecutionId || null,
          is_own_location: newLocationId !== communityLocationId,
          company: params.company || null,
        },
      })

    if (insertErr) {
      if (insertErr.code === '23505') {
        return { success: true, locationId: newLocationId, contactId: contact.id, agentId: defaultAgentId }
      }
      return { success: false, locationId: newLocationId, contactId: contact.id, error: insertErr.message }
    }

    // ── Step 5: Update profile with CRM references ──
    await admin
      .from('profiles')
      .update({
        crm_location_id: newLocationId,
        crm_contact_id: contact.id,
      })
      .eq('id', params.userId)

    return {
      success: true,
      locationId: newLocationId,
      contactId: contact.id,
      agentId: defaultAgentId,
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Provisioning failed'
    console.error('[CRM Provision Failed]', params.email, errorMsg)

    Sentry.captureException(err, {
      tags: { area: 'crm-provisioning' },
      extra: { userId: params.userId, email: params.email, company: params.company },
    })

    // Queue for retry
    await admin
      .from('crm_provision_queue')
      .insert({
        user_id: params.userId,
        email: params.email,
        last_error: errorMsg,
        retry_count: 0,
      })
      .then(() => { console.log('[provision] Queued for retry:', params.email) })
      .then(undefined, (qErr: unknown) => { console.error('[provision] Queue insert failed:', qErr) })

    return {
      success: false,
      locationId: '',
      contactId: '',
      error: errorMsg,
    }
  }
}

// ── Get user's active agent session ──

export async function getActiveSession(userId: string, agentId?: string): Promise<string | null> {
  const admin = getAdmin()
  const query = admin
    .from('agent_sessions')
    .select('execution_id')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false })
    .limit(1)

  if (agentId) query.eq('agent_id', agentId)

  const { data } = await query.maybeSingle()
  return data?.execution_id || null
}

// ── Save/update agent session ──

export async function upsertSession(params: {
  userId: string
  executionId: string
  agentId: string
  locationId: string
}): Promise<void> {
  const admin = getAdmin()

  const { data: existing } = await admin
    .from('agent_sessions')
    .select('id, message_count')
    .eq('user_id', params.userId)
    .eq('agent_id', params.agentId)
    .order('last_message_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    await admin
      .from('agent_sessions')
      .update({
        execution_id: params.executionId,
        message_count: (existing.message_count || 0) + 1,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
  } else {
    await admin
      .from('agent_sessions')
      .insert({
        user_id: params.userId,
        execution_id: params.executionId,
        agent_id: params.agentId,
        location_id: params.locationId,
        message_count: 1,
      })
  }
}

// ── Increment execution count ──

export async function incrementExecutionCount(userId: string): Promise<void> {
  const admin = getAdmin()
  const account = await getUserCrmAccount(userId)
  if (!account) return

  await admin
    .from('user_crm_accounts')
    .update({
      execution_count: (account.execution_count || 0) + 1,
      last_execution_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
}

// ── Execute Agent Studio Agent ──

export async function executeAgent(params: {
  message: string
  agentId?: string
  versionId?: string
  locationId?: string
  executionId?: string
}): Promise<{ executionId?: string; response?: string; error?: string }> {
  const agentId = params.agentId || process.env.CRM_AGENT_STUDIO_AGENT_ID
  const versionId = params.versionId || process.env.CRM_AGENT_STUDIO_VERSION_ID
  const locationId = params.locationId || process.env.CRM_AGENT_STUDIO_LOCATION_ID || ''

  if (!agentId) return { error: 'No agent ID configured' }

  try {
    validateAgentStudioKeys()

    const body: Record<string, unknown> = {
      message: params.message,
      locationId,
    }
    if (versionId) body.versionId = versionId
    if (params.executionId) body.executionId = params.executionId

    const res = await retryWithBackoff(() =>
      fetch(
        `${API_BASE}/agent-studio/agent/${agentId}/execute`,
        {
          method: 'POST',
          headers: getAgentStudioHeaders(),
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(60000),
        }
      )
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[provision] Agent execute failed:', res.status, err)
      return { error: `Agent execute failed: ${res.status}` }
    }

    const data = await res.json()
    return {
      executionId: data.executionId || data.id,
      response: data.output || data.message || data.response || JSON.stringify(data),
    }
  } catch (err) {
    console.error('[provision] Agent execute error:', err)
    return { error: err instanceof Error ? err.message : 'Agent execution failed' }
  }
}

/**
 * Fire the Agent Studio "New User Workflow" agent to set up a user's CRM sub-account.
 * The agent has MCP Server access and can create locations, deploy agents, set up KB, etc.
 */
export async function fireNewUserAgent(params: {
  contactId: string
  email: string
  fullName: string
  company: string
  locationId?: string
}): Promise<{ executionId?: string; response?: string; error?: string }> {
  const message = [
    `NEW USER SIGNUP — Deploy to CRM sub-account.`,
    ``,
    `Contact ID: ${params.contactId}`,
    `Name: ${params.fullName}`,
    `Email: ${params.email}`,
    `Company: ${params.company || 'N/A'}`,
    `Location ID: ${params.locationId || 'pending'}`,
    ``,
    `Instructions:`,
    `1. Set up the knowledge base with 0nMCP documentation in this location`,
    `2. Deploy the default support agent to this location`,
    `3. Tag the contact with "sub-account-created"`,
    `4. Confirm setup is complete`,
  ].join('\n')

  return executeAgent({ message, locationId: params.locationId })
}

// ── List agents for a location ──

export async function listLocationAgents(locationId?: string): Promise<Array<{ id: string; name: string }>> {
  const locId = locationId || process.env.CRM_AGENT_STUDIO_LOCATION_ID || ''
  try {
    validateAgentStudioKeys()

    const res = await retryWithBackoff(() =>
      fetch(
        `${API_BASE}/agent-studio/agent?locationId=${locId}&isPublished=true`,
        { method: 'GET', headers: getAgentStudioHeaders(), signal: AbortSignal.timeout(10000) }
      )
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.agents || []).map((a: { id: string; name: string }) => ({ id: a.id, name: a.name }))
  } catch {
    return []
  }
}
