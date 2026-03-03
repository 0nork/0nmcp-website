import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Rate limiting: 5 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

/** Generate user code: 4 uppercase letters + "-" + 4 digits */
function generateUserCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // no I, O (ambiguous)
  const letterPart = Array.from({ length: 4 }, () =>
    letters[randomBytes(1)[0] % letters.length]
  ).join('')
  const digitPart = String(randomBytes(2).readUInt16BE(0) % 10000).padStart(4, '0')
  return `${letterPart}-${digitPart}`
}

/**
 * POST /api/auth/device — Initiate Device Authorization Grant (RFC 8628)
 * Called by CLI to start the login flow.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Try again in 1 minute.' },
      { status: 429 }
    )
  }

  let body: { device_name?: string; platform?: string } = {}
  try {
    body = await request.json()
  } catch {
    // Empty body is fine — defaults will be used
  }

  const deviceCode = randomUUID()
  const userCode = generateUserCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  const admin = getAdmin()

  const { error } = await admin.from('device_codes').insert({
    device_code: deviceCode,
    user_code: userCode,
    status: 'pending',
    device_name: body.device_name || null,
    platform: body.platform || 'cli',
    ip_address: ip,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to create device code' }, { status: 500 })
  }

  // Log auth event
  await admin.from('auth_events').insert({
    event_type: 'device_code_created',
    platform: body.platform || 'cli',
    device_name: body.device_name || null,
    ip_address: ip,
    metadata: { user_code: userCode },
  })

  return NextResponse.json({
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: 'https://0nmcp.com/connect/device',
    verification_uri_complete: `https://0nmcp.com/connect/device?code=${userCode}`,
    expires_in: 600, // 10 minutes in seconds
    interval: 5,     // poll every 5 seconds
  })
}
