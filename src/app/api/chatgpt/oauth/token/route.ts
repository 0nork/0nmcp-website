import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as jose from 'jose'
import crypto from 'crypto'

const API_BASE = process.env.NEXT_PUBLIC_WEB0N_API_BASE ?? 'https://0nmcp.com'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.formData()
  const grantType = body.get('grant_type')?.toString()

  if (grantType === 'authorization_code') return handleCodeExchange(body)
  if (grantType === 'refresh_token') return handleRefresh(body)

  return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 })
}

async function handleCodeExchange(body: FormData): Promise<NextResponse> {
  const code = body.get('code')?.toString()
  const clientId = body.get('client_id')?.toString()
  const codeVerifier = body.get('code_verifier')?.toString()

  if (!code || !clientId || !codeVerifier) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const { data: authReq } = await db()
    .from('chatgpt_auth_requests')
    .select('*')
    .eq('auth_code', code)
    .eq('client_id', clientId)
    .eq('status', 'authorized')
    .single()

  if (!authReq) {
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 })
  }

  // Verify PKCE
  const challenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  if (challenge !== authReq.code_challenge) {
    return NextResponse.json({ error: 'invalid_grant', error_description: 'PKCE mismatch' }, { status: 400 })
  }

  // Mark code used
  await db().from('chatgpt_auth_requests').update({ status: 'used' }).eq('id', authReq.id)

  return issueTokens(authReq.user_id, authReq.scope, clientId)
}

async function handleRefresh(body: FormData): Promise<NextResponse> {
  const refreshToken = body.get('refresh_token')?.toString()
  if (!refreshToken) return NextResponse.json({ error: 'invalid_request' }, { status: 400 })

  const { data: stored } = await db()
    .from('chatgpt_refresh_tokens')
    .select('*')
    .eq('token', refreshToken)
    .eq('is_revoked', false)
    .single()

  if (!stored || new Date(stored.expires_at) < new Date()) {
    return NextResponse.json({ error: 'invalid_grant' }, { status: 400 })
  }

  // Rotate refresh token
  await db().from('chatgpt_refresh_tokens').update({ is_revoked: true }).eq('id', stored.id)

  return issueTokens(stored.user_id, stored.scope, stored.client_id)
}

async function issueTokens(userId: string, scope: string, clientId: string): Promise<NextResponse> {
  const privateKeyPem = process.env.CHATGPT_OAUTH_PRIVATE_KEY!
  const privateKey = await jose.importPKCS8(privateKeyPem, 'RS256')

  const now = Math.floor(Date.now() / 1000)
  const expiresIn = 3600

  const accessToken = await new jose.SignJWT({ scope, client_id: clientId })
    .setProtectedHeader({ alg: 'RS256', kid: process.env.CHATGPT_OAUTH_KEY_ID! })
    .setSubject(userId)
    .setIssuer(API_BASE)
    .setAudience(`${API_BASE}/chatgpt/mcp`)
    .setIssuedAt(now)
    .setExpirationTime(now + expiresIn)
    .setJti(crypto.randomUUID())
    .sign(privateKey)

  const refreshToken = crypto.randomBytes(64).toString('hex')
  await db().from('chatgpt_refresh_tokens').insert({
    token: refreshToken,
    user_id: userId,
    client_id: clientId,
    scope,
    is_revoked: false,
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  })

  return NextResponse.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: expiresIn,
    refresh_token: refreshToken,
    scope,
  })
}
