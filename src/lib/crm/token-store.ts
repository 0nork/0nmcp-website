// lib/crm/token-store.ts
// Supabase CRUD for crm_tokens.
// Encrypts access_token and refresh_token at this layer before every write.
// Auto-refreshes tokens expiring within 5 minutes on read.

import { createClient } from '@supabase/supabase-js'
import { encryptToken, decryptToken } from './crypto'

// ─── Supabase (service role — bypasses RLS) ───────────────────────────────────

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CRMTokenRecord {
  id:                string
  location_id:       string
  company_id:        string
  access_token:      string   // decrypted plaintext on read
  refresh_token:     string   // decrypted plaintext on read
  token_type:        string
  expires_at:        string
  scopes:            string[]
  app_version:       string
  installed_by_user: string | null
  is_active:         boolean
  created_at:        string
  updated_at:        string
}

export interface UpsertTokenInput {
  location_id:        string
  company_id:         string
  access_token:       string
  refresh_token:      string
  token_type?:        string
  expires_in:         number  // seconds from now
  scopes:             string[]
  installed_by_user?: string
  app_version?:       string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const expiresAt = (seconds: number) =>
  new Date(Date.now() + seconds * 1000).toISOString()

const isExpiringSoon = (iso: string, buffer = 300) =>
  new Date(iso).getTime() - Date.now() < buffer * 1000

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Upsert a token record for a location.
 * Encrypts both tokens before writing. Logs an install event.
 */
export async function upsertToken(input: UpsertTokenInput): Promise<void> {
  const [encAccess, encRefresh] = await Promise.all([
    encryptToken(input.access_token),
    encryptToken(input.refresh_token),
  ])

  const { error } = await db()
    .from('crm_tokens')
    .upsert({
      location_id:       input.location_id,
      company_id:        input.company_id,
      access_token:      encAccess,
      refresh_token:     encRefresh,
      token_type:        input.token_type ?? 'Bearer',
      expires_at:        expiresAt(input.expires_in),
      scopes:            input.scopes,
      installed_by_user: input.installed_by_user ?? null,
      app_version:       input.app_version ?? '1.0',
      is_active:         true,
    }, { onConflict: 'location_id' })

  if (error) throw new Error(`[crm/token-store] upsert failed: ${error.message}`)

  await logEvent(input.location_id, input.company_id, 'install', {
    scopes:      input.scopes,
    app_version: input.app_version ?? '1.0',
    installed_by: input.installed_by_user,
  })
}

/**
 * Fetch and decrypt a token for a location.
 * Auto-refreshes if expiring within 5 minutes.
 * Returns null if no active record exists.
 */
export async function getToken(locationId: string): Promise<CRMTokenRecord | null> {
  const { data, error } = await db()
    .from('crm_tokens')
    .select('*')
    .eq('location_id', locationId)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  if (isExpiringSoon(data.expires_at)) {
    const refreshed = await refreshToken(data.location_id, data.refresh_token)
    if (refreshed) return refreshed
    // Fall through with existing token — may still be valid briefly
  }

  return {
    ...data,
    access_token:  await decryptToken(data.access_token),
    refresh_token: await decryptToken(data.refresh_token),
  }
}

/**
 * Exchange a refresh token for a new access token.
 * Updates the DB record and returns the new decrypted record.
 */
export async function refreshToken(
  locationId:       string,
  encryptedRefresh: string
): Promise<CRMTokenRecord | null> {
  let plainRefresh: string
  try {
    plainRefresh = await decryptToken(encryptedRefresh)
  } catch {
    await logEvent(locationId, '', 'install_error', null, 'Failed to decrypt refresh token')
    return null
  }

  try {
    const res = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        grant_type:    'refresh_token',
        client_id:     process.env.CRM_APP_CLIENT_ID!,
        client_secret: process.env.CRM_APP_CLIENT_SECRET!,
        refresh_token: plainRefresh,
      }),
    })

    if (!res.ok) throw new Error(`Token refresh HTTP ${res.status}: ${await res.text()}`)

    const json = await res.json()
    const [encAccess, encRefresh] = await Promise.all([
      encryptToken(json.access_token),
      encryptToken(json.refresh_token),
    ])

    const { data, error } = await db()
      .from('crm_tokens')
      .update({
        access_token:  encAccess,
        refresh_token: encRefresh,
        expires_at:    expiresAt(json.expires_in ?? 86400),
      })
      .eq('location_id', locationId)
      .select()
      .single()

    if (error || !data) throw new Error('DB update after token refresh failed')

    await logEvent(locationId, data.company_id, 'token_refresh', {})

    return {
      ...data,
      access_token:  json.access_token,
      refresh_token: json.refresh_token,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    await logEvent(locationId, '', 'install_error', null, msg)
    return null
  }
}

/**
 * Deactivate a location's token (uninstall or billing pause).
 */
export async function deactivateToken(locationId: string): Promise<void> {
  await db()
    .from('crm_tokens')
    .update({ is_active: false })
    .eq('location_id', locationId)

  await logEvent(locationId, '', 'uninstall', {})
}

/**
 * Reactivate a location's token (billing resumed).
 */
export async function reactivateToken(locationId: string): Promise<void> {
  await db()
    .from('crm_tokens')
    .update({ is_active: true })
    .eq('location_id', locationId)

  await logEvent(locationId, '', 'install', { reason: 'reactivated' })
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function logEvent(
  locationId: string,
  companyId:  string,
  eventType:  string,
  payload:    Record<string, unknown> | null,
  error?:     string
): Promise<void> {
  await db()
    .from('crm_install_events')
    .insert({ location_id: locationId, company_id: companyId, event_type: eventType, payload, error })
    .then(() => {})
}
