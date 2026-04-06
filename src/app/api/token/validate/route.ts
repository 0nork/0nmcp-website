import { NextRequest, NextResponse } from 'next/server'
import { validateToken, extractToken } from '@/lib/token-auth'
import { getUserVaultServices } from '@/lib/vault-bridge'

/**
 * POST /api/token/validate — External apps call this to validate a token
 *
 * Request: { token: "0n_xxx" } OR Authorization: Bearer 0n_xxx
 * Response: { valid: true, user: { id, email, name, location, services: [...] } }
 */
export async function POST(request: NextRequest) {
  let token = extractToken(request)

  if (!token) {
    try {
      const body = await request.json() as { token?: string }
      token = body.token || null
    } catch { /* no body */ }
  }

  if (!token) {
    return NextResponse.json({ valid: false, error: 'No token provided' }, { status: 400 })
  }

  const identity = await validateToken(token)
  if (!identity) {
    return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 })
  }

  // Get connected services (no decryption — just names)
  const connectedServices = await getUserVaultServices(identity.userId)

  return NextResponse.json({
    valid: true,
    user: {
      id: identity.userId,
      email: identity.email,
      name: identity.fullName,
      locationId: identity.crmLocationId,
      connectedServices,
    },
  })
}
