import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || ''
  const accountRes = await fetch(new URL('/api/console/account', req.url).toString(), { headers: { cookie: cookieHeader } })
  if (!accountRes.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const account = await accountRes.json()
  const userId = account.id || account.user_id

  const { data: locations } = await supabase
    .from('user_locations')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('crm_location_id')
    .eq('id', userId)
    .single()

  const activeId = profile?.crm_location_id || locations?.[0]?.location_id || ''

  return NextResponse.json({
    locations: (locations || []).map(l => ({
      id: l.location_id,
      name: l.location_name,
      domain: l.domain,
      brand: { primary: l.brand_primary, background: l.brand_background || '#141414', accent: l.brand_accent },
      isDefault: l.is_default,
    })),
    count: locations?.length || 0,
    activeId,
  })
}

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || ''
  const accountRes = await fetch(new URL('/api/console/account', req.url).toString(), { headers: { cookie: cookieHeader } })
  if (!accountRes.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const account = await accountRes.json()
  const userId = account.id || account.user_id

  const { locationId } = await req.json()
  if (!locationId) return NextResponse.json({ error: 'locationId required' }, { status: 400 })

  await supabase.from('profiles').update({ crm_location_id: locationId }).eq('id', userId)
  return NextResponse.json({ active: locationId })
}
