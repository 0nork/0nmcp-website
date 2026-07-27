// Store one app's credentials in the user's 0nVault (encrypted). Session-gated.
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { storeUserCredential } from '@/lib/vault-bridge'

async function getUser() {
  const supabase = await createSupabaseServer()
  if (!supabase) return null
  return (await supabase.auth.getSession()).data.session?.user ?? null
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const service = String(body.service || '').trim()
  const creds = body.credentials || {}
  if (!service || typeof creds !== 'object' || !Object.keys(creds).length) {
    return NextResponse.json({ error: 'service and credentials required' }, { status: 400 })
  }
  try {
    await storeUserCredential(user.id, service, creds)
    return NextResponse.json({ ok: true, service })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
