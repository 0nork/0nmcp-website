/**
 * app/api/oauth/userinfo/route.ts
 *
 * GET — OIDC-style userinfo. "Login with 0n" clients call this with the bearer
 * access token to learn who the user is. Claims are gated by granted scopes.
 */

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { introspectToken } from '@/lib/oauth'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
  if (!token) {
    return new Response(JSON.stringify({ error: 'invalid_token', error_description: 'Missing bearer token' }), { status: 401, headers: { ...JSON_HEADERS, 'WWW-Authenticate': 'Bearer' } })
  }

  const info = await introspectToken(token)
  if (!info) {
    return new Response(JSON.stringify({ error: 'invalid_token', error_description: 'Token invalid or expired' }), { status: 401, headers: { ...JSON_HEADERS, 'WWW-Authenticate': 'Bearer' } })
  }

  const scopes = info.scopes || []
  const sb = admin()

  // Pull the user's profile + auth record.
  const { data: profile } = await sb.from('profiles').select('email, full_name, avatar_url, company').eq('id', info.userId).single()
  let email = profile?.email as string | undefined
  let name = profile?.full_name as string | undefined
  const picture = profile?.avatar_url as string | undefined
  if (!email) {
    const { data: au } = await sb.auth.admin.getUserById(info.userId)
    email = au?.user?.email || undefined
    name = name || (au?.user?.user_metadata?.full_name as string | undefined)
  }

  // Build claims gated by scope (OIDC semantics).
  const claims: Record<string, unknown> = { sub: info.userId }
  if (scopes.includes('email') && email) {
    claims.email = email
    claims.email_verified = true
  }
  if (scopes.includes('profile')) {
    if (name) claims.name = name
    if (picture) claims.picture = picture
    if (profile?.company) claims.company = profile.company
  }

  return new Response(JSON.stringify(claims), { status: 200, headers: JSON_HEADERS })
}
