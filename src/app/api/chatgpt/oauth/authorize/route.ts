import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const API_BASE = process.env.NEXT_PUBLIC_WEB0N_API_BASE ?? 'https://0nmcp.com'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const p = req.nextUrl.searchParams
  const clientId = p.get('client_id')
  const redirectUri = p.get('redirect_uri')
  const state = p.get('state')
  const codeChallenge = p.get('code_challenge')
  const scope = p.get('scope') ?? ''

  if (!clientId || !redirectUri || !codeChallenge) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Missing required parameters' },
      { status: 400 }
    )
  }

  const { data: client } = await db()
    .from('chatgpt_oauth_clients')
    .select('*')
    .eq('client_id', clientId)
    .single()

  if (!client) {
    return NextResponse.json({ error: 'invalid_client' }, { status: 401 })
  }

  const authCode = crypto.randomBytes(32).toString('hex')
  const authReqId = crypto.randomUUID()

  await db().from('chatgpt_auth_requests').insert({
    id: authReqId,
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    scope,
    auth_code: authCode,
    status: 'pending',
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  })

  const consentUrl = new URL(`${API_BASE}/chatgpt/consent`)
  consentUrl.searchParams.set('auth_req_id', authReqId)
  consentUrl.searchParams.set('scope', scope)
  consentUrl.searchParams.set('client_name', client.client_name ?? 'ChatGPT')

  return NextResponse.redirect(consentUrl.toString())
}
