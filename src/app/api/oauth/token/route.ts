/**
 * app/api/oauth/token/route.ts
 *
 * POST — Token endpoint. Handles two grant types:
 *   - authorization_code: exchange code for access + refresh token
 *   - refresh_token:      rotate refresh token for a fresh pair
 */

import { NextRequest } from 'next/server'
import {
  validateClientSecret,
  getClient,
  validateRedirectUri,
  consumeAuthCode,
  issueTokens,
  rotateRefreshToken,
} from '@/lib/oauth'
import { provisionNewUser } from '@/lib/crm-provision'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

function error(code: string, description: string, status = 400) {
  return new Response(
    JSON.stringify({ error: code, error_description: description }),
    { status, headers: JSON_HEADERS }
  )
}

export async function POST(request: NextRequest) {
  // Accept both application/json and application/x-www-form-urlencoded
  const contentType = request.headers.get('content-type') ?? ''
  let params: Record<string, string> = {}

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text()
    params = Object.fromEntries(new URLSearchParams(text))
  } else {
    params = await request.json()
  }

  const grantType    = params['grant_type']
  const clientId     = params['client_id']
  const clientSecret = params['client_secret']

  // ── Authenticate the client ─────────────────────────────────────────────
  if (!clientId || !clientSecret) {
    return error('invalid_client', 'Missing client_id or client_secret', 401)
  }

  const isValidClient = await validateClientSecret(clientId, clientSecret)
  if (!isValidClient) {
    return error('invalid_client', 'Invalid client credentials', 401)
  }

  // ── Grant: authorization_code ───────────────────────────────────────────
  if (grantType === 'authorization_code') {
    const code        = params['code']
    const redirectUri = params['redirect_uri']

    if (!code || !redirectUri) {
      return error('invalid_request', 'Missing code or redirect_uri')
    }

    // Validate redirect_uri against registered client
    const client = await getClient(clientId)
    if (!client || !validateRedirectUri(client, redirectUri)) {
      return error('invalid_grant', 'redirect_uri mismatch')
    }

    // Consume the one-time auth code
    const codeData = await consumeAuthCode(code, clientId, redirectUri)
    if (!codeData) {
      return error('invalid_grant', 'Code is invalid, expired, or already used')
    }

    try {
      const tokens = await issueTokens(clientId, codeData.userId, codeData.scopes)

      // Fire-and-forget: auto-provision CRM sub-location for new users
      provisionNewUser({
        userId: codeData.userId,
        email: '', // Will be looked up from profile in provisionNewUser
      }).catch(err => console.error('[oauth/token] provisioning error (non-blocking):', err))

      return new Response(JSON.stringify(tokens), {
        status: 200,
        headers: {
          ...JSON_HEADERS,
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
        },
      })
    } catch (err) {
      console.error('[oauth/token] issueTokens error:', err)
      return error('server_error', 'Failed to issue tokens', 500)
    }
  }

  // ── Grant: refresh_token ────────────────────────────────────────────────
  if (grantType === 'refresh_token') {
    const refreshToken = params['refresh_token']
    if (!refreshToken) {
      return error('invalid_request', 'Missing refresh_token')
    }

    const tokens = await rotateRefreshToken(refreshToken, clientId)
    if (!tokens) {
      return error('invalid_grant', 'Refresh token is invalid, expired, or revoked')
    }

    return new Response(JSON.stringify(tokens), {
      status: 200,
      headers: {
        ...JSON_HEADERS,
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
      },
    })
  }

  // ── Unsupported grant ───────────────────────────────────────────────────
  return error('unsupported_grant_type', `Grant type "${grantType}" is not supported`)
}
