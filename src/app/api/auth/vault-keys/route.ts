import { NextResponse } from 'next/server'
import { getServiceCredentials } from '@/lib/vault-bridge'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}



/**
 * GET /api/auth/vault-keys
 * Returns the user's stored API keys from user_vaults.
 * Called by the 0n Chrome extension after login so users
 * don't have to re-enter their keys.
 *
 * Requires Bearer token from login response.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
  }

  const token = authHeader.slice(7)

  // Verify the token and get user
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders })
  }

  // The vault is 0n3 now: ask it, on this user's behalf, for the AI-provider records only.
  const aiProviders = ['openai', 'anthropic', 'gemini', 'xai', 'grok']
  const keys: Record<string, string> = {}
  for (const service of aiProviders) {
    const creds = await getServiceCredentials(user.id, service)
    if (!creds) continue
    const v = creds.apiKey || creds.api_key || creds.access_token || (Object.values(creds)[0] as string) || ''
    if (v) keys[service] = v
  }

  return NextResponse.json({
    keys,
    count: Object.keys(keys).length,
    user_id: user.id,
  })
}
