import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || ''
  const res = await fetch(new URL('/api/console/account', req.url).toString(), { headers: { cookie: cookieHeader } })
  if (!res.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const account = await res.json()
  const userId = account.id || account.user_id

  const { data, error } = await supabase
    .from('addon_installs')
    .select('addon_id, enabled, installed_at, addon_catalog(*)')
    .eq('user_id', userId)
    .eq('enabled', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ installed: data, count: data.length })
}
