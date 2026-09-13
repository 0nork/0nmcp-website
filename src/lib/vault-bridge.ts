/**
 * 0nVault bridge — a thin client of THE vault (0n3).
 *
 * Until 2026-09-13 this file was its own vault: `user_vaults`, AES keyed by a
 * PBKDF2 of the user's id (so any server could decrypt), plus a Google
 * callback that wrote base64 plaintext with an "oauth" marker. That table was
 * one of five credential stores in the ecosystem. It is now empty and unused.
 *
 * Every function below keeps its signature (23 callers) and speaks to 0n3:
 *   ON3_URL              https://0n3.app
 *   ON3_INTERNAL_SECRET  lets a first-party app read one record's secret for the user it acts for
 * The user is identified by their own 0n_ token (profiles.access_token). If a
 * profile has no token yet, one is minted — same generator as /api/token.
 */
import { createClient } from '@supabase/supabase-js'
import { regenerateToken } from '@/lib/token-auth'

export interface UserCredentials {
  [service: string]: Record<string, string>
}

const base = () => (process.env.ON3_URL || 'https://0n3.app').replace(/\/$/, '')

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

/** The user's own 0n token — the only identity 0n3 accepts. */
export async function userToken(userId: string): Promise<string | null> {
  const { data } = await getAdmin().from('profiles').select('access_token').eq('id', userId).maybeSingle()
  if (data?.access_token) return data.access_token
  try { return await regenerateToken(userId) } catch { return null }
}

async function call(userId: string, path: string, init: RequestInit & { internal?: boolean } = {}): Promise<{ ok: boolean; status: number; body: any }> {
  const token = await userToken(userId)
  if (!token) return { ok: false, status: 401, body: { error: 'no 0n token for this account' } }
  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  if (init.internal) headers['X-0n3-Internal'] = process.env.ON3_INTERNAL_SECRET || ''
  const r = await fetch(`${base()}${path}`, { ...init, headers, cache: 'no-store' })
  const body = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, body }
}

/** Service names this user has connected (never secrets). */
export async function getUserVaultServices(userId: string): Promise<string[]> {
  const r = await call(userId, '/vault')
  if (!r.ok) return []
  return Array.from(new Set(((r.body.records || []) as { service: string }[]).map((x) => x.service).filter(Boolean)))
}

/** Full non-secret records, for UIs that show labels / environments / meta. */
export async function getUserVaultRecords(userId: string): Promise<any[]> {
  const r = await call(userId, '/vault')
  return r.ok ? (r.body.records || []) : []
}

/** One service's credentials for server-side use by THIS app on the user's behalf. */
export async function getServiceCredentials(userId: string, service: string, label?: string): Promise<Record<string, string> | null> {
  const q = label ? `?label=${encodeURIComponent(label)}` : ''
  const r = await call(userId, `/vault/${encodeURIComponent(service)}/secret${q}`, { internal: true })
  if (!r.ok) return null
  const creds = r.body?.record?.auth?.credentials
  return creds && typeof creds === 'object' ? creds : null
}

export async function getServiceCredential(userId: string, service: string, key: string = 'api_key'): Promise<string | null> {
  const creds = await getServiceCredentials(userId, service)
  if (!creds) return null
  // Old callers ask for `api_key`; records written from the vault page use `apiKey`. Answer either.
  return creds[key] ?? creds[key === 'api_key' ? 'apiKey' : key === 'apiKey' ? 'api_key' : key] ?? null
}

/** Every connected service's credentials at once (legacy shape). Prefer getServiceCredentials(). */
export async function getUserCredentials(userId: string): Promise<UserCredentials> {
  const services = await getUserVaultServices(userId)
  const out: UserCredentials = {}
  for (const s of services) {
    const c = await getServiceCredentials(userId, s)
    if (c) out[s] = c
  }
  return out
}

/** Store or replace one service's credentials as a .0n connection record. */
export async function storeUserCredential(userId: string, service: string, creds: Record<string, string>, extra: { name?: string; meta?: Record<string, unknown>; environment?: string } = {}): Promise<void> {
  const now = new Date().toISOString()
  const envelope = {
    $0n: { type: 'connection', version: '2.1.1', name: extra.name || service, created: now, updated: now },
    service,
    environment: extra.environment || 'production',
    auth: { type: authTypeFor(creds), credentials: creds },
    options: {},
    meta: extra.meta || {},
  }
  const r = await call(userId, `/vault/${encodeURIComponent(service)}`, { method: 'PUT', body: JSON.stringify(envelope) })
  if (!r.ok) throw new Error(r.body?.error || `vault put failed (${r.status})`)
}

export async function removeUserCredential(userId: string, service: string, label?: string): Promise<void> {
  const q = label ? `?label=${encodeURIComponent(label)}` : ''
  await call(userId, `/vault/${encodeURIComponent(service)}${q}`, { method: 'DELETE' })
}

function authTypeFor(c: Record<string, string>): string {
  if (c.access_token !== undefined) return 'oauth'
  if (c.apiKey !== undefined || c.api_key !== undefined) return 'api_key'
  if (c.botToken !== undefined) return 'bot_token'
  if (c.token !== undefined) return 'token'
  return 'custom'
}
