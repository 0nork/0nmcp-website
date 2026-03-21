import { NextRequest, NextResponse } from 'next/server'
import { parseClientCredentials, validateClient, revokeToken } from '@/lib/oauth'

export async function POST(request: NextRequest) {
  let body: Record<string, string>
  try {
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      body = {} as Record<string, string>
      formData.forEach((value, key) => { body[key] = String(value) })
    } else {
      body = await request.json()
    }
  } catch {
    return NextResponse.json({}, { status: 200 })
  }

  const { clientId, clientSecret } = parseClientCredentials(request, body)
  if (!clientId) {
    return NextResponse.json(
      { error: 'invalid_client' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const client = await validateClient(clientId, clientSecret)
  if (!client) {
    return NextResponse.json(
      { error: 'invalid_client' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const token = body.token
  if (token) {
    const hint = body.token_type_hint as 'access_token' | 'refresh_token' | undefined
    await revokeToken(token, hint)
  }

  // RFC 7009: always 200, even if token was invalid
  return NextResponse.json({}, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
