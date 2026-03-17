// app/api/crm/oauth/sso/route.ts
// Called by the iframe on load. Decrypts the CRM SSO token,
// identifies the location, returns purchase state + listing catalog.

import { NextRequest, NextResponse } from 'next/server'
import { decryptSSO }                from '@/lib/crm/sso'
import { createClient }              from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { encryptedData, iv } = await req.json()

  if (!encryptedData) {
    return NextResponse.json({ error: 'Missing SSO payload' }, { status: 400 })
  }

  let sso
  try {
    sso = decryptSSO(encryptedData, iv)
  } catch {
    return NextResponse.json({ error: 'SSO decryption failed' }, { status: 401 })
  }

  const supabase = db()

  // Upsert location record + update last_seen
  await supabase
    .from('add0n_locations')
    .upsert(
      { location_id: sso.locationId, company_id: sso.companyId, last_seen_at: new Date().toISOString() },
      { onConflict: 'location_id' }
    )

  // Load all active listings
  const { data: listings } = await supabase
    .from('add0n_listings')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Load this location's purchases
  const { data: purchases } = await supabase
    .from('add0n_purchases')
    .select('listing_id, status, purchased_at')
    .eq('location_id', sso.locationId)
    .eq('status', 'complete')

  // Load recent build history (last 10)
  const { data: history } = await supabase
    .from('add0n_build_history')
    .select('*')
    .eq('location_id', sso.locationId)
    .order('triggered_at', { ascending: false })
    .limit(10)

  const purchasedIds = new Set((purchases ?? []).map(p => p.listing_id))

  return NextResponse.json({
    location: {
      locationId: sso.locationId,
      companyId:  sso.companyId,
      userId:     sso.userId,
    },
    listings:  (listings ?? []).map(l => ({
      ...l,
      purchased: purchasedIds.has(l.id),
    })),
    history:   history ?? [],
  })
}
