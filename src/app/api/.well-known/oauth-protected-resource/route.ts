// app/api/.well-known/oauth-protected-resource/route.ts
// Required OAuth 2.1 discovery endpoint — MCP auth spec.
// ChatGPT queries this first to find the authorization server.
// Reachable at: https://0nmcp.com/.well-known/oauth-protected-resource

import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_WEB0N_API_BASE ?? 'https://0nmcp.com'

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    resource: `${API_BASE}/chatgpt/mcp`,
    authorization_servers: [`${API_BASE}`],
    scopes_supported: [
      'openid',
      'profile',
      'email',
      '0nmcp:tools:read',
      '0nmcp:tools:execute',
      '0nmcp:account:read',
      '0nmcp:sparks:read',
      '0nmcp:sparks:purchase',
    ],
    bearer_methods_supported: ['header'],
    resource_signing_alg_values: ['RS256'],
    resource_documentation: 'https://0nmcp.com/docs/chatgpt-app',
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  })
}
