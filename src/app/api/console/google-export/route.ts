import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * GET /api/console/google-export
 * Download a .0n connection file for local 0nMCP CLI usage.
 * Places this in ~/.0n/connections/google.0n → all Google tools work locally.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use admin client to reliably read the tokens
  const admin = getAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  const { data, error } = await admin
    .from('google_oauth_tokens')
    .select('refresh_token, scopes')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Google not connected' }, { status: 404 })
  }

  // Build .0n connection file format (compatible with 0n-spec connection schema)
  const connectionFile = {
    '0n': '1.0',
    type: 'connection',
    service: 'google',
    name: 'Google OAuth (from 0nmcp.com)',
    created: new Date().toISOString(),
    credentials: {
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: data.refresh_token,
    },
    scopes: data.scopes,
    meta: {
      source: '0nmcp.com',
      user_id: user.id,
      instructions: 'Place this file at ~/.0n/connections/google.0n to enable all Google tools in 0nMCP CLI.',
    },
  }

  const content = JSON.stringify(connectionFile, null, 2)

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="google.0n"',
    },
  })
}
