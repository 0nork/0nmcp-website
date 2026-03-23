import { NextResponse } from 'next/server'
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

  // Fetch vault keys using service role (bypasses RLS)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: vaults } = await admin
    .from('user_vaults')
    .select('service_name, key_hint, encrypted_key')
    .eq('user_id', user.id)

  // Build key map — only return keys the extension needs for AI providers
  const aiProviders = ['openai', 'anthropic', 'gemini', 'xai', 'grok']
  const keys: Record<string, string> = {}

  for (const vault of vaults || []) {
    const service = vault.service_name?.toLowerCase()
    if (aiProviders.includes(service)) {
      try {
        // encrypted_key stores the JSON credentials
        const creds = JSON.parse(vault.encrypted_key)
        keys[service] = creds.apiKey || creds.api_key || creds.access_token || Object.values(creds)[0] as string || ''
      } catch {
        // Not JSON — raw key
        keys[service] = vault.encrypted_key || ''
      }
    }
  }

  return NextResponse.json({
    keys,
    count: Object.keys(keys).length,
    user_id: user.id,
  })
}
