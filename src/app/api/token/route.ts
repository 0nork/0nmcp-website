import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import {
  getTokenForUser,
  regenerateToken,
  createScopedToken,
  revokeScopedToken,
  listScopedTokens,
} from '@/lib/token-auth'

const EXPIRY_MAP: Record<string, number | null> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
  'forever': null,
}

async function getUser() {
  const supabase = await createSupabaseServer()
  if (!supabase) return null
  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  return user
}

/**
 * GET /api/token — List all tokens for the authenticated user
 */
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get master token
  const master = await getTokenForUser(user.id)
  const scopedTokens = await listScopedTokens(user.id)

  const tokens = []

  // Master token first
  if (master) {
    tokens.push({
      id: 'master',
      label: 'Master Token',
      permissions: ['all'],
      expires_at: null,
      created_at: master.created_at,
      last_used_at: null,
      is_revoked: false,
      token_preview: `${master.token.slice(0, 6)}...${master.token.slice(-4)}`,
      tokenType: 'master' as const,
    })
  }

  // Scoped tokens
  for (const t of scopedTokens) {
    tokens.push({
      ...t,
      tokenType: 'scoped' as const,
    })
  }

  return NextResponse.json({ tokens })
}

/**
 * POST /api/token — Create a new scoped token OR regenerate master token
 */
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    label?: string
    permissions?: string[]
    expires_in?: string
    type?: 'master' | 'scoped'
  } = {}

  try {
    body = await request.json()
  } catch {
    // Empty body = regenerate master token (backward compat)
  }

  // Regenerate master token
  if (body.type === 'master' || (!body.type && !body.label && !body.permissions && !body.expires_in)) {
    const newToken = await regenerateToken(user.id)
    if (!newToken) return NextResponse.json({ error: 'Failed to regenerate' }, { status: 500 })
    return NextResponse.json({ token: newToken, tokenType: 'master' })
  }

  // Create scoped token
  const expiresIn = body.expires_in || 'forever'
  if (!(expiresIn in EXPIRY_MAP)) {
    return NextResponse.json({ error: 'Invalid expires_in value' }, { status: 400 })
  }

  const expiryMs = EXPIRY_MAP[expiresIn]
  const expiresAt = expiryMs ? new Date(Date.now() + expiryMs).toISOString() : null

  const result = await createScopedToken(user.id, {
    label: body.label || 'My Token',
    permissions: body.permissions || ['all'],
    expiresAt,
  })

  if (!result) return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })

  return NextResponse.json({
    token: result.token,
    id: result.id,
    label: result.label,
    permissions: result.permissions,
    expires_at: result.expires_at,
    tokenType: 'scoped',
  })
}

/**
 * DELETE /api/token — Revoke a scoped token
 */
export async function DELETE(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { id?: string } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
  }

  if (!body.id) {
    return NextResponse.json({ error: 'Missing token id' }, { status: 400 })
  }

  if (body.id === 'master') {
    return NextResponse.json({ error: 'Cannot revoke master token — use regenerate instead' }, { status: 400 })
  }

  const success = await revokeScopedToken(user.id, body.id)
  if (!success) return NextResponse.json({ error: 'Failed to revoke token' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
