import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_WEB0N_API_BASE ?? 'https://0nmcp.com'

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    issuer: `${API_BASE}`,
    authorization_endpoint: `${API_BASE}/api/oauth/authorize`,
    token_endpoint: `${API_BASE}/api/oauth/token`,
    revocation_endpoint: `${API_BASE}/api/oauth/revoke`,
    jwks_uri: `${API_BASE}/.well-known/jwks.json`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: [],
    token_endpoint_auth_methods_supported: ['client_secret_post'],
    scopes_supported: [
      'vault:read', 'vault:write',
      'sparks:read', 'sparks:spend',
      'workflows:execute',
      'brain:read', 'brain:contribute',
    ],
    service_documentation: 'https://0nmcp.com/docs',
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}
