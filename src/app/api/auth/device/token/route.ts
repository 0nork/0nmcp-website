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

// Rate limiting: 1 request per 5 seconds per device_code
const pollLimitMap = new Map<string, number>()

function checkPollLimit(deviceCode: string): boolean {
  const now = Date.now()
  const lastPoll = pollLimitMap.get(deviceCode) || 0
  if (now - lastPoll < 4500) return false // 4.5s tolerance
  pollLimitMap.set(deviceCode, now)
  return true
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
 * POST /api/auth/device/token — Poll for device authorization
 * CLI calls this every 5 seconds with device_code until approved.
 */
export async function POST(request: NextRequest) {
  let body: { device_code?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { device_code } = body
  if (!device_code) {
    return NextResponse.json({ error: 'device_code required' }, { status: 400 })
  }

  if (!checkPollLimit(device_code)) {
    return NextResponse.json({ error: 'slow_down', message: 'Poll interval is 5 seconds' }, { status: 429 })
  }

  const admin = getAdmin()

  // Look up the device code
  const { data: dc, error } = await admin
    .from('device_codes')
    .select('*')
    .eq('device_code', device_code)
    .maybeSingle()

  if (error || !dc) {
    return NextResponse.json({ error: 'Invalid device code' }, { status: 404 })
  }

  // Check expiration
  if (new Date(dc.expires_at) < new Date()) {
    await admin.from('device_codes').update({ status: 'expired' }).eq('id', dc.id)
    pollLimitMap.delete(device_code)
    return NextResponse.json({ error: 'expired', message: 'Device code expired. Run 0nmcp login again.' }, { status: 410 })
  }

  // Check status
  if (dc.status === 'denied') {
    pollLimitMap.delete(device_code)
    return NextResponse.json({ error: 'access_denied', message: 'Authorization denied by user.' }, { status: 403 })
  }

  if (dc.status === 'pending') {
    return NextResponse.json({ error: 'authorization_pending', message: 'Waiting for user approval...' }, { status: 428 })
  }

  if (dc.status === 'approved' && dc.user_id) {
    // Generate tokens
    const accessToken = generateToken(dc.user_id)
    const refreshToken = generateRefreshToken()

    const tokenHash = createHmac('sha256', TOKEN_SECRET).update(accessToken).digest('hex')
    const refreshHash = createHmac('sha256', TOKEN_SECRET).update(refreshToken).digest('hex')

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    // Insert api_tokens record
    await admin.from('api_tokens').insert({
      user_id: dc.user_id,
      token_hash: tokenHash,
      refresh_token_hash: refreshHash,
      device_name: dc.device_name || 'CLI Device',
      platform: dc.platform || 'cli',
      last_used_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    })

    // Mark device code as consumed (delete it)
    await admin.from('device_codes').delete().eq('id', dc.id)

    // Get user profile
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, email')
      .eq('id', dc.user_id)
      .maybeSingle()

    // Get email from auth.users if not in profile
    let email = profile?.email
    if (!email) {
      const { data: authUser } = await admin.auth.admin.getUserById(dc.user_id)
      email = authUser?.user?.email
    }

    // Log auth event
    await admin.from('auth_events').insert({
      user_id: dc.user_id,
      event_type: 'device_approved',
      platform: dc.platform || 'cli',
      device_name: dc.device_name || 'CLI Device',
      ip_address: ip,
      metadata: {},
    })

    pollLimitMap.delete(device_code)

    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour
      user: {
        id: dc.user_id,
        email: email || null,
        name: profile?.full_name || null,
      },
    })
  }

  return NextResponse.json({ error: 'Unknown status' }, { status: 500 })
}
