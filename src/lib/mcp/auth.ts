import * as jose from 'jose'

export interface AuthInfo {
  userId: string
  email?: string
  scopes: string[]
  token: string
}

let jwksCache: ReturnType<typeof jose.createRemoteJWKSet> | null = null
let jwksCachedAt: number = 0
const JWKS_TTL_MS = 6 * 60 * 60 * 1000

function getJWKS() {
  if (!jwksCache || Date.now() - jwksCachedAt > JWKS_TTL_MS) {
    jwksCache = jose.createRemoteJWKSet(
      new URL(`${process.env.NEXT_PUBLIC_WEB0N_API_BASE}/.well-known/jwks.json`)
    )
    jwksCachedAt = Date.now()
  }
  return jwksCache
}

export async function verifyBearerToken(token: string): Promise<AuthInfo | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJWKS(), {
      issuer: process.env.NEXT_PUBLIC_WEB0N_API_BASE,
      audience: `${process.env.NEXT_PUBLIC_WEB0N_API_BASE}/chatgpt/mcp`,
    })

    const scopes = typeof payload.scope === 'string'
      ? payload.scope.split(' ')
      : []

    return {
      userId: payload.sub!,
      email: payload.email as string | undefined,
      scopes,
      token,
    }
  } catch {
    return null
  }
}
