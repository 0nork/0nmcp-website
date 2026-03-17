import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()

  const redirectUris: string[] = body.redirect_uris ?? []
  const validDomains = ['chatgpt.com', 'openai.com', 'chat.openai.com']

  for (const uri of redirectUris) {
    const host = new URL(uri).hostname
    if (!validDomains.some(d => host === d || host.endsWith(`.${d}`))) {
      return NextResponse.json(
        { error: 'invalid_redirect_uri', error_description: 'Redirect URI domain not allowed' },
        { status: 400 }
      )
    }
  }

  const clientId = `chatgpt_${crypto.randomBytes(16).toString('hex')}`
  const issuedAt = Math.floor(Date.now() / 1000)

  await db().from('chatgpt_oauth_clients').insert({
    client_id: clientId,
    redirect_uris: redirectUris,
    grant_types: body.grant_types ?? ['authorization_code'],
    scope: body.scope ?? '',
    client_name: body.client_name ?? 'ChatGPT',
    client_uri: body.client_uri ?? '',
    issued_at: issuedAt,
    expires_at: issuedAt + 86400 * 30,
  })

  return NextResponse.json({
    client_id: clientId,
    client_id_issued_at: issuedAt,
    client_secret: '',
    redirect_uris: redirectUris,
    grant_types: body.grant_types ?? ['authorization_code'],
    token_endpoint_auth_method: 'none',
    registration_access_token: crypto.randomBytes(16).toString('hex'),
  }, { status: 201 })
}
