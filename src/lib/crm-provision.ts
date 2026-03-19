/**
 * lib/crm-provision.ts
 * Auto-provision a CRM sub-location for new 0nMCP users
 *
 * Flow:
 * 1. Create user in the 0nMCP CRM sub-account
 * 2. Trigger the auto-provisioning workflow (creates sub-location)
 * 3. Store sub-location ID on the user's profile
 */

import { createClient } from '@supabase/supabase-js'

const CRM_BASE = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

// 0nMCP sub-location (parent account for all users)
const ONMCP_LOCATION_ID = process.env.CRM_ONMCP_LOCATION_ID || 'nphConTwfHcVE1oA0uep'

function getCrmToken(): string {
  const token = process.env.CRM_AGENCY_PIT
  if (!token) throw new Error('CRM_AGENCY_PIT is not configured')
  return token
}

function crmHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Version': CRM_VERSION,
  }
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ── Step 1: Create or find user in the 0nMCP CRM location ───────────────────

interface CrmContactResult {
  contactId: string
  isNew: boolean
}

export async function upsertCrmContact(data: {
  email: string
  firstName?: string
  lastName?: string
  name?: string
}): Promise<CrmContactResult | null> {
  const token = getCrmToken()

  // Parse name if provided
  let firstName = data.firstName
  let lastName = data.lastName
  if (!firstName && data.name) {
    const parts = data.name.split(' ')
    firstName = parts[0]
    lastName = parts.slice(1).join(' ') || undefined
  }

  try {
    const res = await fetch(`${CRM_BASE}/contacts/upsert`, {
      method: 'POST',
      headers: crmHeaders(token),
      body: JSON.stringify({
        locationId: ONMCP_LOCATION_ID,
        email: data.email,
        firstName,
        lastName,
        tags: ['0nmcp-user', '0nmcp-oauth'],
        source: '0nmcp.com',
      }),
    })

    if (!res.ok) {
      console.error('[crm-provision] upsert contact failed:', res.status, await res.text())
      return null
    }

    const json = await res.json()
    const contact = json.contact || json
    return {
      contactId: contact.id,
      isNew: json.new === true || json.isNew === true,
    }
  } catch (err) {
    console.error('[crm-provision] upsert error:', err)
    return null
  }
}

// ── Step 2: Trigger auto-provisioning workflow ──────────────────────────────

export async function triggerProvisioningWorkflow(contactId: string, email: string): Promise<boolean> {
  const token = getCrmToken()
  const workflowId = process.env.CRM_PROVISION_WORKFLOW_ID

  if (!workflowId) {
    console.warn('[crm-provision] CRM_PROVISION_WORKFLOW_ID not set — skipping workflow trigger')
    // Still return true — the contact was created, workflow can be triggered manually
    return true
  }

  try {
    // Add the provisioning tag to trigger the CRM workflow
    const res = await fetch(`${CRM_BASE}/contacts/${contactId}/tags`, {
      method: 'POST',
      headers: crmHeaders(token),
      body: JSON.stringify({
        tags: ['0nmcp-provision-requested'],
      }),
    })

    if (!res.ok) {
      console.error('[crm-provision] trigger workflow failed:', res.status, await res.text())
      return false
    }

    console.log(`[crm-provision] Provisioning triggered for ${email} (contact: ${contactId})`)
    return true
  } catch (err) {
    console.error('[crm-provision] trigger error:', err)
    return false
  }
}

// ── Step 3: Store CRM data on user profile ──────────────────────────────────

export async function storeCrmDataOnProfile(userId: string, data: {
  crmContactId: string
  crmLocationId?: string
}): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('profiles')
    .update({
      crm_contact_id: data.crmContactId,
      crm_location_id: data.crmLocationId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('[crm-provision] profile update failed:', error)
    return false
  }

  return true
}

// ── Master provisioning function ────────────────────────────────────────────

export async function provisionNewUser(data: {
  userId: string
  email?: string
  name?: string
}): Promise<{ contactId: string | null; provisioned: boolean }> {
  // Look up email from profile if not provided
  let email = data.email
  let name = data.name
  if (!email) {
    const supabase = getSupabaseAdmin()
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', data.userId)
      .single()
    if (!profile?.email) {
      // Try auth.users
      const { data: authUser } = await supabase.auth.admin.getUserById(data.userId)
      email = authUser?.user?.email || ''
      name = name || authUser?.user?.user_metadata?.full_name || ''
    } else {
      email = profile.email
      name = name || profile.full_name || ''
    }
  }

  if (!email) {
    console.error('[crm-provision] No email found for user', data.userId)
    return { contactId: null, provisioned: false }
  }

  console.log(`[crm-provision] Starting provisioning for ${email}...`)

  // 1. Create/find CRM contact
  const contact = await upsertCrmContact({
    email: email!,
    name: name || data.name,
  })

  if (!contact) {
    console.error('[crm-provision] Failed to create CRM contact')
    return { contactId: null, provisioned: false }
  }

  // 2. Store contact ID on profile
  await storeCrmDataOnProfile(data.userId, {
    crmContactId: contact.contactId,
  })

  // 3. Trigger provisioning workflow (creates sub-location)
  const triggered = await triggerProvisioningWorkflow(contact.contactId, email!)

  console.log(`[crm-provision] Done: contact=${contact.contactId}, isNew=${contact.isNew}, workflowTriggered=${triggered}`)

  return {
    contactId: contact.contactId,
    provisioned: triggered,
  }
}
