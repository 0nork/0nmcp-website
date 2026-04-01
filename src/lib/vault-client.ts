/**
 * 0nVault Client — Universal location switcher + vault data access
 *
 * This is the client-side library that ANY 0n interface uses to:
 * 1. Get/set the active location
 * 2. Read vault data for the current location
 * 3. Update vault fields
 * 4. Get progressive collection prompts
 * 5. Switch environments without losing anything
 *
 * Used by: 0nmcp.com console, 0nCore dashboard, WordPress admin,
 * ChatGPT widget, Claude Code, Slack bot, and any future shell.
 */

const VAULT_API = '/api/vault'
const LOCATION_STORAGE_KEY = '0n_active_location'

export interface VaultLocation {
  id: string
  name: string
  slug?: string
  domain?: string
  crm_location_id?: string
  is_default?: boolean
  is_active?: boolean
}

export interface VaultBusiness {
  business_name?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  website?: string
  hours?: Record<string, string>
  timezone?: string
  industry?: string
  description?: string
  logo_url?: string
  social_links?: Record<string, string>
  google_places_id?: string
  booking_url?: string
}

export interface VaultCompletion {
  total_fields: number
  filled_fields: number
  completion_pct: number
  missing_fields: string[]
}

export interface VaultPrompt {
  field: string
  question: string
}

export interface VaultData {
  business: VaultBusiness | null
  tracking: Record<string, string> | null
  ai: Record<string, unknown> | null
  services: Array<Record<string, unknown>>
  completion: VaultCompletion | null
}

// ── Active Location ────────────────────────────────────────────────

export function getActiveLocationId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LOCATION_STORAGE_KEY)
}

export function setActiveLocationId(id: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCATION_STORAGE_KEY, id)
  // Dispatch event so all components update
  window.dispatchEvent(new CustomEvent('0n:location-changed', { detail: { locationId: id } }))
}

// ── Vault Data ─────────────────────────────────────────────────────

export async function getVaultData(locationId?: string): Promise<VaultData | null> {
  const id = locationId || getActiveLocationId()
  if (!id) return null

  try {
    const res = await fetch(`${VAULT_API}?locationId=${id}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function getVaultCompletion(locationId?: string): Promise<VaultCompletion | null> {
  const data = await getVaultData(locationId)
  return data?.completion ?? null
}

// ── Progressive Collection ─────────────────────────────────────────

export async function getNextPrompt(locationId?: string): Promise<VaultPrompt | null> {
  const id = locationId || getActiveLocationId()
  if (!id) return null

  try {
    const res = await fetch(`${VAULT_API}?locationId=${id}&prompt=true`)
    if (!res.ok) return null
    const data = await res.json()
    return data.prompt ?? null
  } catch {
    return null
  }
}

// ── Update Vault ───────────────────────────────────────────────────

export async function updateVaultField(
  table: 'vault_business_info' | 'vault_tracking' | 'vault_ai_preferences',
  field: string,
  value: unknown,
  locationId?: string
): Promise<VaultCompletion | null> {
  const id = locationId || getActiveLocationId()
  if (!id) return null

  try {
    const res = await fetch(VAULT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_field', locationId: id, table, field, value }),
    })
    const data = await res.json()
    return data.completion ?? null
  } catch {
    return null
  }
}

export async function addService(
  service: { name: string; description?: string; category?: string; price?: string; duration?: string; booking_url?: string },
  locationId?: string
): Promise<unknown> {
  const id = locationId || getActiveLocationId()
  if (!id) return null

  const res = await fetch(VAULT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'add_service', locationId: id, ...service }),
  })
  return await res.json()
}

// ── Deploy Snapshot ────────────────────────────────────────────────

export async function deploySnapshot(
  locationId: string,
  crmPit: string,
  crmLocationId: string
): Promise<unknown> {
  const res = await fetch(VAULT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'deploy_snapshot', locationId, crmPit, crmLocationId }),
  })
  return await res.json()
}

// ── Location List ──────────────────────────────────────────────────

export async function getUserLocations(userId: string): Promise<VaultLocation[]> {
  try {
    const res = await fetch(`/api/locations?userId=${userId}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.locations ?? []
  } catch {
    return []
  }
}

// ── Vault Context for AI ───────────────────────────────────────────

/**
 * Generate a context string for AI system prompts.
 * Any AI that connects to 0n gets this injected automatically.
 */
export async function getVaultContextForAI(locationId?: string): Promise<string> {
  const data = await getVaultData(locationId)
  if (!data) return 'No vault data available. Ask the user to connect their 0nMCP account.'

  const biz = data.business
  const completion = data.completion

  let context = '## 0nVault — Business Context\n\n'

  if (biz?.business_name) context += `Business: ${biz.business_name}\n`
  if (biz?.industry) context += `Industry: ${biz.industry}\n`
  if (biz?.description) context += `Description: ${biz.description}\n`
  if (biz?.phone) context += `Phone: ${biz.phone}\n`
  if (biz?.email) context += `Email: ${biz.email}\n`
  if (biz?.address) context += `Address: ${biz.address}, ${biz.city || ''} ${biz.state || ''} ${biz.zip || ''}\n`
  if (biz?.website) context += `Website: ${biz.website}\n`
  if (biz?.booking_url) context += `Booking: ${biz.booking_url}\n`

  if (biz?.hours) {
    context += `Hours: ${JSON.stringify(biz.hours)}\n`
  }

  if (data.services?.length) {
    context += '\nServices:\n'
    for (const svc of data.services) {
      context += `- ${svc.name}${svc.price ? ` (${svc.price})` : ''}${svc.duration ? ` — ${svc.duration}` : ''}\n`
    }
  }

  if (completion && completion.completion_pct < 100) {
    context += `\nVault Completion: ${completion.completion_pct}% (${completion.filled_fields}/${completion.total_fields} fields)`
    context += `\nMissing: ${(completion.missing_fields || []).join(', ')}`
    context += '\n\nWhen appropriate, ask the user about missing vault data to expand their capabilities.'
  }

  return context
}
