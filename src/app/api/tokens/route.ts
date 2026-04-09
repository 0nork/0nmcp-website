import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getUserId(req: NextRequest): Promise<string | null> {
  const res = await fetch(new URL('/api/console/account', req.url).toString(), {
    headers: { cookie: req.headers.get('cookie') || '' },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.id || data.user_id || null
}

// GET — list user's tokens
export async function GET(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('api_tokens')
    .select('id, name, token_prefix, scopes, last_used_at, expires_at, revoked, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ tokens: data || [] })
}

// POST — create new token
export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, scopes, expires_in_days } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  // Generate token: 0n_ prefix + 48 random bytes
  const rawToken = `0n_${crypto.randomBytes(36).toString('base64url')}`
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
  const tokenPrefix = rawToken.slice(0, 8) + '...'

  const expiresAt = expires_in_days
    ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { error } = await supabase.from('api_tokens').insert({
    user_id: userId,
    name,
    token_hash: tokenHash,
    token_prefix: tokenPrefix,
    scopes: scopes || ['read', 'write', 'execute'],
    expires_at: expiresAt,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return the full token ONCE — never stored in plaintext
  return NextResponse.json({
    token: rawToken,
    prefix: tokenPrefix,
    name,
    scopes: scopes || ['read', 'write', 'execute'],
    expires_at: expiresAt,
    warning: 'Copy this token now. It will not be shown again.',
  }, { status: 201 })
}

// DELETE — revoke token
export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token_id } = await req.json()
  if (!token_id) return NextResponse.json({ error: 'token_id required' }, { status: 400 })

  await supabase.from('api_tokens').update({ revoked: true }).eq('id', token_id).eq('user_id', userId)
  return NextResponse.json({ revoked: true })
}
