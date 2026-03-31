/**
 * app/api/onpress/vault/route.ts
 *
 * GET  — Returns list of vault entries (service names + hints) for authenticated user
 * POST — Returns full encrypted vault entries for specified services (for client-side decryption)
 *
 * Requires: Bearer token with vault:read scope
 */

import { NextRequest } from 'next/server'
import { requireScope } from '@/lib/oauth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const JSON_HEADERS = { 'Content-Type': 'application/json' }

// ── GET: List available vault entries ──────────────────────────────────────────
// Returns service names and hints (no encrypted data)
export async function GET(request: NextRequest) {
  const result = await requireScope(request, 'vault:read')
  if (result instanceof Response) return result
  const { tokenInfo } = result

  const { data: entries, error } = await supabase
    .from('user_vaults')
    .select('id, service_name, key_hint, created_at, updated_at')
    .eq('user_id', tokenInfo.userId)
    .order('service_name')

  if (error) {
    return new Response(
      JSON.stringify({ error: 'server_error', message: 'Failed to fetch vault entries' }),
      { status: 500, headers: JSON_HEADERS }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      user_id: tokenInfo.userId,
      entries: entries ?? [],
      count: entries?.length ?? 0,
    }),
    { status: 200, headers: JSON_HEADERS }
  )
}

// ── POST: Fetch full encrypted vault data for specified services ──────────────
// Client will decrypt these with user's vault passphrase
export async function POST(request: NextRequest) {
  const result = await requireScope(request, 'vault:read')
  if (result instanceof Response) return result
  const { tokenInfo } = result

  const body = await request.json() as { services?: string[] }
  const services = body.services

  let query = supabase
    .from('user_vaults')
    .select('id, service_name, encrypted_key, iv, salt, key_hint, created_at')
    .eq('user_id', tokenInfo.userId)

  // If specific services requested, filter
  if (services && services.length > 0) {
    query = query.in('service_name', services)
  }

  const { data: entries, error } = await query.order('service_name')

  if (error) {
    return new Response(
      JSON.stringify({ error: 'server_error', message: 'Failed to fetch vault entries' }),
      { status: 500, headers: JSON_HEADERS }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      user_id: tokenInfo.userId,
      entries: entries ?? [],
      count: entries?.length ?? 0,
    }),
    { status: 200, headers: JSON_HEADERS }
  )
}
