// app/api/hub/session/route.ts
// The vault door's brain. Returns who's here (first name), whether THIS device is
// already trusted, and — if not — an IKY challenge question drawn from the user's
// own profile (something only they'd easily know). VIP/admin bypass all gates.
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { getUserVaultServices } from '@/lib/vault-bridge'
import { hubTrustToken, buildChallenge } from '@/lib/hub-gate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  )
  const user = (await supabase.auth.getSession()).data.session?.user
  if (!user) return NextResponse.json({ authed: false })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const { data: p } = await admin
    .from('profiles')
    .select('full_name, display_name, username, company, business_name, business_type, website, is_vip, is_admin')
    .eq('id', user.id)
    .single()

  const full = p?.full_name || p?.display_name || p?.username || (user.email || '').split('@')[0] || 'there'
  const firstName = String(full).trim().split(/\s+/)[0]

  // VIP / admin bypass every gate (house rule).
  const bypass = !!(p?.is_vip || p?.is_admin)
  const trusted = bypass || cookieStore.get('0n_trusted')?.value === hubTrustToken(user.id)

  let challenge: { id: string; question: string } | null = null
  if (!trusted) {
    const services = await getUserVaultServices(user.id).catch(() => [] as string[])
    challenge = buildChallenge(p || {}, services, user.email || '')
  }

  return NextResponse.json({ authed: true, firstName, deviceKnown: trusted, challenge })
}
