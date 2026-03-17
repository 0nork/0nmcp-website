import { NextResponse } from 'next/server'
import * as jose from 'jose'

let cachedJwks: jose.JSONWebKeySet | null = null

export async function GET(): Promise<NextResponse> {
  if (!cachedJwks) {
    const publicKeyPem = process.env.CHATGPT_OAUTH_PUBLIC_KEY!
    const publicKey = await jose.importSPKI(publicKeyPem, 'RS256')
    const jwk = await jose.exportJWK(publicKey)

    cachedJwks = {
      keys: [{
        ...jwk,
        kid: process.env.CHATGPT_OAUTH_KEY_ID!,
        use: 'sig',
        alg: 'RS256',
      }],
    }
  }

  return NextResponse.json(cachedJwks, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
