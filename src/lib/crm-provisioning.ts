/**
 * CRM Sub-Account Provisioning
 *
 * Auto-provisions a CRM sub-account for each 0n user.
 * Following the web0n pattern: create contact → set up location → deploy agents.
 *
 * Each user gets:
 *  - CRM contact in the 0nMCP community location
 *  - Their own agent(s) deployed to the community location
 *  - Knowledge base access for personalized AI
 *  - Session tracking for multi-turn conversations
 */

import { createClient } from '@supabase/supabase-js'
import { upsertContact, addContactTags } from './crm'
import type { CrmContact } from './crm'

const API_BASE = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'

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
}

// ── Admin Client ──

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getAgentStudioHeaders(): Record<string, string> {
  const key = process.env.CRM_AGENT_STUDIO_KEY
  if (!key) throw new Error('CRM_AGENT_STUDIO_KEY not configured')
  return {
    'Authorization': `Bearer ${key}`,
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

  // Get user profile
  const admin = getAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('email, full_name, company')
    .eq('id', userId)
    .maybeSingle()

  if (!profile?.email) return null

  // Provision a new account
  const result = await provisionUser({
    userId,
    email: profile.email,
    fullName: profile.full_name || '',
    company: profile.company || '',
  })

  if (!result.success) return null

  return getUserCrmAccount(userId)
}

// ── Provision a new user ──

export async function provisionUser(params: {
  userId: string
  email: string
  fullName: string
  company: string
}): Promise<ProvisionResult> {
  const admin = getAdmin()
  const locationId = process.env.CRM_AGENT_STUDIO_LOCATION_ID || process.env.CRM_COMMUNITY_LOCATION_ID || ''

  if (!locationId) {
    return { success: false, locationId: '', contactId: '', error: 'No location ID configured' }
  }

  try {
    // 1. Create CRM contact in the 0nMCP community location
    const nameParts = params.fullName.split(' ')
    const contact: CrmContact = await upsertContact({
      email: params.email,
      firstName: nameParts[0] || params.email.split('@')[0],
      lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
      companyName: params.company || undefined,
      source: '0n-console',
      tags: ['0n-user', 'agent-studio', 'auto-provisioned'],
    }, 'community')

    // Add tags
    if (contact.id) {
      await addContactTags(contact.id, ['0n-user', 'agent-studio']).catch(() => {})
    }

    // 2. Set up default agent reference (using the platform KB agent)
    const defaultAgentId = process.env.CRM_AGENT_STUDIO_AGENT_ID || ''
    const defaultVersionId = process.env.CRM_AGENT_STUDIO_VERSION_ID || ''

    // 3. Store in Supabase
    const { error: insertErr } = await admin
      .from('user_crm_accounts')
      .insert({
        user_id: params.userId,
        location_id: locationId,
        contact_id: contact.id,
        default_agent_id: defaultAgentId,
        agent_version_id: defaultVersionId,
        agents: defaultAgentId ? [{ id: defaultAgentId, name: 'KB Support Agent', type: 'knowledge-base' }] : [],
        status: 'active',
        metadata: {
          email: params.email,
          provisioned_via: 'auto',
          plan: 'free',
        },
      })

    if (insertErr) {
      // Might be duplicate — fetch existing
      if (insertErr.code === '23505') {
        return { success: true, locationId, contactId: contact.id || '', agentId: defaultAgentId }
      }
      return { success: false, locationId, contactId: contact.id || '', error: insertErr.message }
    }

    // 4. Update profile with CRM references for quick access
    await admin
      .from('profiles')
      .update({
        crm_location_id: locationId,
        crm_contact_id: contact.id,
      })
      .eq('id', params.userId)

    return {
      success: true,
      locationId,
      contactId: contact.id || '',
      agentId: defaultAgentId,
    }
  } catch (err) {
    return {
      success: false,
      locationId,
      contactId: '',
      error: err instanceof Error ? err.message : 'Provisioning failed',
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

  // Try update first
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

// ── List agents for a location ──

export async function listLocationAgents(locationId?: string): Promise<Array<{ id: string; name: string }>> {
  const locId = locationId || process.env.CRM_AGENT_STUDIO_LOCATION_ID || ''
  try {
    const res = await fetch(
      `${API_BASE}/agent-studio/agent?locationId=${locId}&isPublished=true`,
      { method: 'GET', headers: getAgentStudioHeaders() }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.agents || []).map((a: { id: string; name: string }) => ({ id: a.id, name: a.name }))
  } catch {
    return []
  }
}
