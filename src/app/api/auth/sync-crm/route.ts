/**
 * POST /api/auth/sync-crm
 * Safety net: ensures the logged-in user has a CRM contact in the 0ncore location
 * Called after login/signup to guarantee the user exists in CRM with all fields
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CRM_API = 'https://services.leadconnectorhq.com'
const LOCATION_ID = 'nphConTwfHcVE1oA0uep'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || ''
  const accountRes = await fetch(new URL('/api/console/account', req.url).toString(), {
    headers: { cookie: cookieHeader },
  })

  if (!accountRes.ok) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const account = await accountRes.json()
  const userId = account.id || account.user_id
  const email = account.email
  const name = account.name || account.full_name || ''

  if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })

  // Check if already synced
  const { data: profile } = await supabase
    .from('profiles')
    .select('crm_contact_id')
    .eq('id', userId)
    .single()

  if (profile?.crm_contact_id) {
    return NextResponse.json({ synced: true, existing: true, contactId: profile.crm_contact_id })
  }

  // Upsert contact in CRM
  const pit = process.env.CRM_PIT || process.env.CRM_API_KEY || 'pit-0317b406-8a47-478e-ac28-a88763a9bb3f'

  const nameParts = name.split(' ')
  const firstName = nameParts[0] || email.split('@')[0]
  const lastName = nameParts.slice(1).join(' ') || ''

  try {
    const res = await fetch(`${CRM_API}/contacts/upsert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pit}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: LOCATION_ID,
        email,
        firstName,
        lastName: lastName || undefined,
        source: '0nmcp.com',
        tags: ['0n-user', '0nmcp-signup'],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `CRM ${res.status}: ${err}` }, { status: 502 })
    }

    const data = await res.json()
    const contactId = data.contact?.id

    // Save contact ID to profile
    if (contactId) {
      await supabase
        .from('profiles')
        .update({ crm_contact_id: contactId })
        .eq('id', userId)
    }

    return NextResponse.json({ synced: true, contactId })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
