import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Generate a human-friendly user code (8 chars, uppercase, no ambiguous chars)
 */
function generateUserCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I, O, 0, 1
  let code = ''
  const bytes = randomBytes(8)
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return `${code.slice(0, 4)}-${code.slice(4)}` // XXXX-XXXX format
}

/**
 * POST /api/auth/device/code — RFC 8628 Device Authorization Request
 *
 * Called by: `npx 0nmcp install`
 * Returns: device_code, user_code, verification_uri, expires_in, interval
 *
 * The CLI displays the user_code and opens verification_uri in the browser.
 * User enters the code at /activate, signs up or logs in.
 * CLI polls /api/auth/device/token with device_code until authorized.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const clientId = body.client_id || '0nmcp-cli'
    const scope = body.scope || 'full'

    const admin = getAdmin()
    const deviceCode = randomBytes(32).toString('hex')
    const userCode = generateUserCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min expiry

    const { error } = await admin.from('device_codes').insert({
      device_code: deviceCode,
      user_code: userCode,
      client_id: clientId,
      scope,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      interval_seconds: 5,
      verification_uri: 'https://www.0nmcp.com/activate',
    })

    if (error) {
      console.error('[device-auth] Insert error:', error)
      return NextResponse.json({ error: 'Failed to create device code' }, { status: 500 })
    }

    return NextResponse.json({
      device_code: deviceCode,
      user_code: userCode,
      verification_uri: 'https://www.0nmcp.com/activate',
      verification_uri_complete: `https://www.0nmcp.com/activate?code=${userCode}`,
      expires_in: 900, // 15 minutes
      interval: 5,
    })
  } catch (err) {
    console.error('[device-auth] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
