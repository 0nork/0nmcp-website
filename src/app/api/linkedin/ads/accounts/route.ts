import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getAdAccounts } from '@/lib/linkedin/ads'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: member } = await admin
    .from('linkedin_members')
    .select('linkedin_access_token, token_expires_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member?.linkedin_access_token) {
    return NextResponse.json({ error: 'LinkedIn not connected' }, { status: 400 })
  }

  if (member.token_expires_at && new Date(member.token_expires_at) < new Date()) {
    return NextResponse.json({ error: 'LinkedIn token expired — please reconnect' }, { status: 401 })
  }

  try {
    const accounts = await getAdAccounts(member.linkedin_access_token)
    return NextResponse.json({ accounts })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Failed to fetch ad accounts',
    }, { status: 502 })
  }
}
