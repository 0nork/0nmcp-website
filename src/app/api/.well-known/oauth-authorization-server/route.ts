// app/api/.well-known/oauth-authorization-server/route.ts
// OAuth 2.1 Authorization Server metadata — per MCP auth spec.
// ChatGPT fetches this to discover all OAuth endpoints.

import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_WEB0N_API_BASE ?? 'https://0nmcp.com'

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    issuer:                                `${API_BASE}`,
    authorization_endpoint:                `${API_BASE}/chatgpt/oauth/authorize`,
    token_endpoint:                        `${API_BASE}/chatgpt/oauth/token`,
    registration_endpoint:                 `${API_BASE}/chatgpt/oauth/register`,
    revocation_endpoint:                   `${API_BASE}/chatgpt/oauth/revoke`,
    jwks_uri:                              `${API_BASE}/.well-known/jwks.json`,
    response_types_supported:              ['code'],
    grant_types_supported:                 ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported:      ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: [
      'openid', 'profile', 'email',
      '0nmcp:tools:read', '0nmcp:tools:execute',
      '0nmcp:account:read', '0nmcp:sparks:read', '0nmcp:sparks:purchase',
    ],
    subject_types_supported:     ['public'],
    id_token_signing_alg_values: ['RS256'],
    service_documentation:       'https://0nmcp.com/docs/chatgpt-app',
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
