import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function getUserId(req: NextRequest): Promise<string | null> {
  const cookieHeader = req.headers.get('cookie') || ''
  const res = await fetch(new URL('/api/console/account', req.url).toString(), { headers: { cookie: cookieHeader } })
  if (!res.ok) return null
  const data = await res.json()
  return data.id || data.user_id || null
}

// POST — install an addon
export async function POST(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { addon_id } = await req.json()
  if (!addon_id) return NextResponse.json({ error: 'addon_id required' }, { status: 400 })

  const { error } = await supabase.from('addon_installs').upsert({
    user_id: userId, addon_id, enabled: true,
  }, { onConflict: 'user_id,addon_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ installed: true, addon_id })
}

// DELETE — uninstall an addon
export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { addon_id } = await req.json()
  if (!addon_id) return NextResponse.json({ error: 'addon_id required' }, { status: 400 })

  await supabase.from('addon_installs').delete().eq('user_id', userId).eq('addon_id', addon_id)
  return NextResponse.json({ uninstalled: true, addon_id })
}
