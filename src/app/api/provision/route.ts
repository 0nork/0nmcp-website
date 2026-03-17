// app/api/provision/route.ts
// Called by rocketclients.com signup webhook when a new client account is created.
// Auth: x-provision-secret header matching PROVISION_SECRET env var.
//
// Body:
// {
//   "clientName":  "Acme Roofing",
//   "email":       "owner@acme.com",
//   "phone":       "+1 555 000 0000",
//   "address":     "123 Main St",
//   "city":        "Pittsburgh",
//   "state":       "PA",
//   "zip":         "15222",
//   "website":     "https://acme.com",
//   "brandColor":  "#6EE05A",
//   "plan":        "standard"
// }

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'

const API_BASE    = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function agencyHeaders() {
  return {
    Authorization:  `Bearer ${process.env.CRM_AGENCY_KEY!}`,
    Version:        API_VERSION,
    'Content-Type': 'application/json',
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth
  const secret = req.headers.get('x-provision-secret')
  if (secret !== process.env.PROVISION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { clientName, email, phone, address, city, state, zip, website, brandColor, plan } = body

  if (!clientName || !email) {
    return NextResponse.json({ error: 'clientName and email required' }, { status: 400 })
  }

  try {
    // Step 1 — Create sub-location
    const locationRes = await fetch(`${API_BASE}/locations/`, {
      method:  'POST',
      headers: agencyHeaders(),
      body:    JSON.stringify({
        name:        clientName,
        email,
        phone,
        address,
        city,
        state,
        postalCode:  zip,
        website,
        country:     'US',
        timezone:    'America/New_York',
        companyId:   process.env.CRM_COMPANY_ID!,
        snapshotId:  process.env.CRM_BASE_SNAPSHOT_ID,  // optional — base config snapshot
      }),
    })

    if (!locationRes.ok) {
      const err = await locationRes.text()
      throw new Error(`Location create failed HTTP ${locationRes.status}: ${err}`)
    }

    const locationData = await locationRes.json()
    const locationId   = locationData?.location?.id
    const companyId    = locationData?.location?.companyId ?? process.env.CRM_COMPANY_ID!

    if (!locationId) throw new Error('No locationId in location create response')

    // Step 2 — Register in add0n_locations
    await db().from('add0n_locations').upsert({
      location_id: locationId,
      company_id:  companyId,
      agency_name: clientName,
      plan:        plan ?? 'standard',
      is_active:   true,
    }, { onConflict: 'location_id' })

    // Step 3 — Create a contact record for the business owner in the new location
    const contactRes = await fetch(`${API_BASE}/contacts/`, {
      method:  'POST',
      headers: agencyHeaders(),
      body: JSON.stringify({
        locationId,
        name:         clientName,
        email,
        phone,
        address1:     address,
        city, state,
        postalCode:   zip,
        website,
        tags:         ['rocketclients-signup', 'add0n-installed'],
        customFields: [
          { key: 'brand_color',  value: brandColor ?? '#6EE05A' },
          { key: 'client_plan',  value: plan ?? 'standard' },
        ],
      }),
    })

    const contactData = await contactRes.json()
    const contactId   = contactData?.contact?.id

    // Step 4 — Trigger initial website build if web0n is included in plan
    // (Only fires if plan includes web0n access — extend this logic per plan tier)
    if (plan === 'pro' || plan === 'enterprise') {
      const apiBase = process.env.NEXT_PUBLIC_WEB0N_API_BASE || 'https://0nmcp.com'
      await fetch(`${apiBase}/api/crm-agent/trigger`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${process.env.WEB0N_INTERNAL_API_KEY!}`,
        },
        body: JSON.stringify({
          businessName: clientName,
          email, phone, address, city, state,
          zip, website,
          brandColor:  brandColor ?? '#6EE05A',
          locationId,
          contactId,
          action:      'build_website',
        }),
      })
    }

    return NextResponse.json({
      success:    true,
      locationId,
      companyId,
      contactId:  contactId ?? null,
      plan:       plan ?? 'standard',
      message:    `Add0n provisioned for ${clientName}`,
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Provision failed'
    console.error('[provision]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// Required env vars:
// CRM_AGENCY_KEY           — agency-level API key (not location-scoped)
// CRM_COMPANY_ID           — your agency's company ID
// CRM_BASE_SNAPSHOT_ID     — snapshot ID to apply to new locations (optional)
// PROVISION_SECRET         — shared secret for rocketclients.com -> this endpoint
// WEB0N_INTERNAL_API_KEY   — for triggering the initial build on pro/enterprise
// NEXT_PUBLIC_WEB0N_API_BASE
// NEXT_PUBLIC_SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY
