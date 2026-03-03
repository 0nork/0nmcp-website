import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const TOKEN_SECRET = process.env.EXTENSION_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback-secret'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function generateToken(userId: string): string {
  const payload = `${userId}:${Date.now()}:${randomBytes(16).toString('hex')}`
  const signature = createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${signature}`).toString('base64url')
}

function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url')
}

/**
 * POST /api/auth/refresh — Exchange refresh_token for new access_token
 * Implements refresh token rotation: old refresh token is invalidated.
 */
export async function POST(request: NextRequest) {
  let body: { refresh_token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { refresh_token } = body
  if (!refresh_token) {
    return NextResponse.json({ error: 'refresh_token required' }, { status: 400 })
  }

  const admin = getAdmin()
  const refreshHash = createHmac('sha256', TOKEN_SECRET).update(refresh_token).digest('hex')

  // Find token record by refresh_token_hash
  const { data: tokenRecord, error } = await admin
    .from('api_tokens')
    .select('id, user_id, platform, device_name')
    .eq('refresh_token_hash', refreshHash)
    .maybeSingle()

  if (error || !tokenRecord) {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }

  // Generate new tokens (rotation)
  const newAccessToken = generateToken(tokenRecord.user_id)
  const newRefreshToken = generateRefreshToken()

  const newTokenHash = createHmac('sha256', TOKEN_SECRET).update(newAccessToken).digest('hex')
  const newRefreshHash = createHmac('sha256', TOKEN_SECRET).update(newRefreshToken).digest('hex')

  // Update the token record with new hashes
  await admin.from('api_tokens').update({
    token_hash: newTokenHash,
    refresh_token_hash: newRefreshHash,
    last_used_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
  }).eq('id', tokenRecord.id)

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  // Log auth event
  await admin.from('auth_events').insert({
    user_id: tokenRecord.user_id,
    event_type: 'token_refresh',
    platform: tokenRecord.platform,
    device_name: tokenRecord.device_name,
    ip_address: ip,
  })

  return NextResponse.json({
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    token_type: 'Bearer',
    expires_in: 3600,
  })
}
