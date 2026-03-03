import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const TOKEN_SECRET = process.env.EXTENSION_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-secret'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/** Verify Bearer token and return user_id, or null */
function verifyBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const parts = decoded.split(':')
    if (parts.length < 4) return null
    const signature = parts.pop()!
    const payload = parts.join(':')
    const expected = createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex')
    if (signature !== expected) return null
    return parts[0] // user_id
  } catch {
    return null
  }
}

/** Authenticate request via Bearer token or Supabase session */
async function authenticateRequest(request: NextRequest): Promise<string | null> {
  // Try Bearer token first (CLI / extension)
  const bearerUserId = verifyBearerToken(request.headers.get('authorization'))
  if (bearerUserId) {
    // Verify token exists in DB and update last_used_at
    const admin = getAdmin()
    const token = request.headers.get('authorization')!.slice(7)
    const tokenHash = createHmac('sha256', TOKEN_SECRET).update(token).digest('hex')
    const { data } = await admin
      .from('api_tokens')
      .select('id')
      .eq('user_id', bearerUserId)
      .eq('token_hash', tokenHash)
      .maybeSingle()

    if (data) {
      await admin.from('api_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', data.id)
      return bearerUserId
    }
  }

  // Try Supabase session (web console)
  try {
    const { createSupabaseServer } = await import('@/lib/supabase/server')
    const supabase = await createSupabaseServer()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) return user.id
    }
  } catch {
    // Not in a Supabase session context
  }

  return null
}

/**
 * GET /api/vault/sync — Fetch all encrypted vault entries for the authenticated user
 */
export async function GET(request: NextRequest) {
  const userId = await authenticateRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = getAdmin()
  const { data: entries, error } = await admin
    .from('vault_sync')
    .select('service_key, encrypted_data, iv, salt, version, updated_at')
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch vault data' }, { status: 500 })
  }

  return NextResponse.json({ entries: entries || [] })
}

/**
 * PUT /api/vault/sync — Upsert an encrypted vault entry
 * Body: { service_key, encrypted_data, iv, salt }
 * All data is E2E encrypted — server only stores ciphertext.
 */
export async function PUT(request: NextRequest) {
  const userId = await authenticateRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { service_key?: string; encrypted_data?: string; iv?: string; salt?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { service_key, encrypted_data, iv, salt } = body
  if (!service_key || !encrypted_data || !iv || !salt) {
    return NextResponse.json({ error: 'Missing required fields: service_key, encrypted_data, iv, salt' }, { status: 400 })
  }

  const admin = getAdmin()

  // Upsert: increment version on conflict
  const { data: existing } = await admin
    .from('vault_sync')
    .select('version')
    .eq('user_id', userId)
    .eq('service_key', service_key)
    .maybeSingle()

  const nextVersion = (existing?.version || 0) + 1

  const { error } = await admin.from('vault_sync').upsert(
    {
      user_id: userId,
      service_key,
      encrypted_data,
      iv,
      salt,
      version: nextVersion,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,service_key' }
  )

  if (error) {
    return NextResponse.json({ error: 'Failed to sync vault entry' }, { status: 500 })
  }

  // Log sync event
  await admin.from('auth_events').insert({
    user_id: userId,
    event_type: 'vault_sync',
    metadata: { service_key, version: nextVersion },
  })

  return NextResponse.json({ success: true, version: nextVersion })
}

/**
 * DELETE /api/vault/sync — Remove a synced entry
 * Body: { service_key: string }
 */
export async function DELETE(request: NextRequest) {
  const userId = await authenticateRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { service_key?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.service_key) {
    return NextResponse.json({ error: 'service_key required' }, { status: 400 })
  }

  const admin = getAdmin()
  await admin
    .from('vault_sync')
    .delete()
    .eq('user_id', userId)
    .eq('service_key', body.service_key)

  return NextResponse.json({ success: true })
}
