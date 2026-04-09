import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  // Resolve user from cookie session
  const cookieHeader = req.headers.get('cookie') || ''
  const accountRes = await fetch(new URL('/api/console/account', req.url).toString(), {
    headers: { cookie: cookieHeader },
  })

  if (!accountRes.ok) {
    return NextResponse.json({ connected: false })
  }

  const account = await accountRes.json()
  const userId = account.id || account.user_id

  if (!userId) {
    return NextResponse.json({ connected: false })
  }

  const { data } = await supabase
    .from('canva_tokens')
    .select('canva_display_name, expires_at, scope')
    .eq('user_id', userId)
    .single()

  if (!data) {
    return NextResponse.json({ connected: false })
  }

  const expired = new Date(data.expires_at).getTime() < Date.now()

  return NextResponse.json({
    connected: !expired,
    display_name: data.canva_display_name,
    expires_at: data.expires_at,
    scope: data.scope,
    needs_reauth: expired,
  })
}
