// apps-sdk/server/auth.ts
// Verifies Bearer tokens sent by ChatGPT on every MCP tool call.
// Tokens are JWTs issued by 0nmcp.com's OAuth authorization server.
// Verification: JWKS → signature → issuer → audience → expiry → scopes

import * as jose from 'jose'

export interface AuthInfo {
  userId:  string
  email?:  string
  scopes:  string[]
  token:   string    // raw token — passed through to API calls
}

// JWKS cached in memory — refreshed every 6h
let jwksCache:    ReturnType<typeof jose.createRemoteJWKSet> | null = null
let jwksCachedAt: number = 0
const JWKS_TTL_MS = 6 * 60 * 60 * 1000

function getJWKS() {
  if (!jwksCache || Date.now() - jwksCachedAt > JWKS_TTL_MS) {
    jwksCache    = jose.createRemoteJWKSet(
      new URL(`${process.env.NEXT_PUBLIC_WEB0N_API_BASE}/.well-known/jwks.json`)
    )
    jwksCachedAt = Date.now()
  }
  return jwksCache
}

/**
 * Verifies a Bearer token from ChatGPT.
 * Returns AuthInfo on success, null on failure.
 * 401-worthy errors are swallowed — caller handles the HTTP response.
 */
export async function verifyBearerToken(token: string): Promise<AuthInfo | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJWKS(), {
      issuer:   process.env.NEXT_PUBLIC_WEB0N_API_BASE,
      audience: `${process.env.NEXT_PUBLIC_WEB0N_API_BASE}/chatgpt/mcp`,
    })

    const scopes = typeof payload.scope === 'string'
      ? payload.scope.split(' ')
      : []

    return {
      userId: payload.sub!,
      email:  payload.email as string | undefined,
      scopes,
      token,
    }
  } catch (err) {
    // Token invalid, expired, or key fetch failed
    if (process.env.NODE_ENV === 'development') {
      console.warn('[auth] Token verification failed:', (err as Error).message)
    }
    return null
  }
}
