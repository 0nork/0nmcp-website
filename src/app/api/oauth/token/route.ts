import { NextRequest, NextResponse } from 'next/server'
import {
  parseClientCredentials,
  validateClient,
  exchangeAuthCode,
  refreshAccessToken,
} from '@/lib/oauth'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
  'Pragma': 'no-cache',
}

function oauthError(error: string, description: string, status = 400) {
  return NextResponse.json(
    { error, error_description: description },
    { status, headers: NO_STORE_HEADERS }
  )
}

async function parseBody(request: NextRequest): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => { params[key] = String(value) })
    return params
  }
  return await request.json()
}

export async function POST(request: NextRequest) {
  let body: Record<string, string>
  try {
    body = await parseBody(request)
  } catch {
    return oauthError('invalid_request', 'Could not parse request body')
  }

  const grantType = body.grant_type
  if (!grantType) {
    return oauthError('invalid_request', 'Missing grant_type parameter')
  }

  const { clientId, clientSecret } = parseClientCredentials(request, body)
  if (!clientId) {
    return oauthError('invalid_client', 'Missing client_id')
  }

  const client = await validateClient(clientId, clientSecret)
  if (!client) {
    return oauthError('invalid_client', 'Invalid client credentials', 401)
  }

  try {
    switch (grantType) {
      case 'authorization_code': {
        const { code, redirect_uri, code_verifier } = body
        if (!code) return oauthError('invalid_request', 'Missing code parameter')
        if (!redirect_uri) return oauthError('invalid_request', 'Missing redirect_uri parameter')

        const tokenResponse = await exchangeAuthCode(code, clientId, redirect_uri, code_verifier)
        return NextResponse.json(tokenResponse, { headers: NO_STORE_HEADERS })
      }

      case 'refresh_token': {
        const { refresh_token } = body
        if (!refresh_token) return oauthError('invalid_request', 'Missing refresh_token parameter')

        const tokenResponse = await refreshAccessToken(refresh_token, clientId)
        return NextResponse.json(tokenResponse, { headers: NO_STORE_HEADERS })
      }

      default:
        return oauthError('unsupported_grant_type', `Grant type "${grantType}" is not supported`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token exchange failed'
    return oauthError('invalid_grant', message)
  }
}
