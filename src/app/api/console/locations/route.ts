/**
 * GET /api/console/locations
 * Returns all sub-locations linked to the authenticated user
 * Each location has its own brand colors, PIT token, and CRM data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Known locations with their details
const KNOWN_LOCATIONS: Record<string, { name: string; domain?: string; brand?: { primary: string; background: string; accent: string } }> = {
  'nphConTwfHcVE1oA0uep': { name: '0ncore (Master)', domain: '0nmcp.com', brand: { primary: '#487fff', background: '#141414', accent: '#487fff' } },
  '6MSqx0trfxgLxeHBJE1k': { name: 'RocketOpp', domain: 'rocketopp.com', brand: { primary: '#FF6B35', background: '#141414', accent: '#FF6B35' } },
  'F76MNKOMQCMruMrumtdf': { name: 'The Spa In Ligonier', domain: 'spaligonier.com', brand: { primary: '#8B4513', background: '#141414', accent: '#D4A574' } },
  'zLP3sWbdjUIXQD4IXGJz': { name: 'Mike Dev', brand: { primary: '#487fff', background: '#141414', accent: '#487fff' } },
}

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || ''
  const accountRes = await fetch(new URL('/api/console/account', req.url).toString(), { headers: { cookie: cookieHeader } })
  if (!accountRes.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const account = await accountRes.json()
  const userId = account.id || account.user_id
  const email = account.email

  // Get locations from user_crm_accounts
  const { data: crmAccounts } = await supabase
    .from('user_crm_accounts')
    .select('location_id, status, metadata')
    .eq('user_id', userId)

  // Get locations from profiles (legacy field)
  const { data: profile } = await supabase
    .from('profiles')
    .select('crm_location_id')
    .eq('id', userId)
    .single()

  // Build location list
  const locationIds = new Set<string>()
  if (profile?.crm_location_id) locationIds.add(profile.crm_location_id)
  for (const acc of crmAccounts || []) {
    if (acc.location_id) locationIds.add(acc.location_id)
  }

  // For mike@rocketopp.com, add all known locations
  if (email === 'mike@rocketopp.com') {
    Object.keys(KNOWN_LOCATIONS).forEach(id => locationIds.add(id))
  }

  // Always include the master location
  locationIds.add('nphConTwfHcVE1oA0uep')

  // Build response
  const locations = Array.from(locationIds).map(id => {
    const known = KNOWN_LOCATIONS[id]
    const crmAcc = (crmAccounts || []).find(a => a.location_id === id)

    return {
      id,
      name: known?.name || (crmAcc?.metadata as Record<string, string>)?.name || `Location ${id.slice(0, 8)}`,
      domain: known?.domain,
      brand: known?.brand || { primary: '#487fff', background: '#141414', accent: '#487fff' },
      status: crmAcc?.status || 'active',
    }
  })

  return NextResponse.json({
    locations,
    count: locations.length,
    activeId: profile?.crm_location_id || 'nphConTwfHcVE1oA0uep',
  })
}

// POST — set active location
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
