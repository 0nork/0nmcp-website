/**
 * app/api/oauth/revoke/route.ts
 *
 * POST — RFC 7009 token revocation.
 * Accepts access_token or refresh_token. Always returns 200.
 */

import { NextRequest } from 'next/server'
import { validateClientSecret, revokeToken } from '@/lib/oauth'

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? ''
  let params: Record<string, string> = {}

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text()
    params = Object.fromEntries(new URLSearchParams(text))
  } else {
    params = await request.json().catch(() => ({}))
  }

  const token        = params['token']
  const clientId     = params['client_id']
  const clientSecret = params['client_secret']

  // Per RFC 7009: invalid client → 401, but invalid token → 200 (don't reveal token info)
  if (clientId && clientSecret) {
    const isValid = await validateClientSecret(clientId, clientSecret)
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'invalid_client', error_description: 'Invalid client credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  if (token) {
    await revokeToken(token).catch(() => {}) // silently ignore errors per spec
  }

  // Always 200 per RFC 7009
  return new Response(null, { status: 200 })
}
