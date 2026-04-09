/**
 * GET /api/console/contacts
 * Returns contacts from the active CRM sub-location
 * Query params: locationId, search, limit, startAfter
 */

import { NextRequest, NextResponse } from 'next/server'

const CRM_API = 'https://services.leadconnectorhq.com'

// PIT tokens by location
const PITS: Record<string, string> = {
  'nphConTwfHcVE1oA0uep': process.env.CRM_PIT || 'pit-0317b406-8a47-478e-ac28-a88763a9bb3f',
  'F76MNKOMQCMruMrumtdf': process.env.CRM_SPA_PIT || 'pit-bafea751-0228-4db1-a9f7-3d426b33713c',
  '6MSqx0trfxgLxeHBJE1k': process.env.CRM_ROCKETOPP_PIT || '',
}

function getPIT(locationId: string): string {
  return PITS[locationId] || process.env.CRM_AGENCY_PIT || 'pit-e789d87e-bc97-429e-abc3-ff46aa47a316'
}

export async function GET(req: NextRequest) {
  const locationId = req.nextUrl.searchParams.get('locationId') || 'nphConTwfHcVE1oA0uep'
  const search = req.nextUrl.searchParams.get('search') || ''
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')
  const startAfter = req.nextUrl.searchParams.get('startAfter') || ''

  const pit = getPIT(locationId)

  try {
    let url = `${CRM_API}/contacts/?locationId=${locationId}&limit=${limit}`
    if (search) url += `&query=${encodeURIComponent(search)}`
    if (startAfter) url += `&startAfter=${startAfter}&startAfterId=${startAfter}`

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${pit}`,
        'Version': '2021-07-28',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `CRM ${res.status}: ${err}` }, { status: res.status })
    }

    const data = await res.json()
    const contacts = (data.contacts || []).map((c: Record<string, unknown>) => ({
      id: c.id,
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || 'Unknown',
      email: c.email || '',
      phone: c.phone || '',
      tags: c.tags || [],
      source: c.source || '',
      dateAdded: c.dateAdded || c.dateCreated,
      lastActivity: c.lastActivity,
      companyName: c.companyName || '',
    }))

    return NextResponse.json({
      contacts,
      count: contacts.length,
      total: data.meta?.total || contacts.length,
      startAfter: data.meta?.startAfter || data.meta?.nextPageUrl ? contacts[contacts.length - 1]?.id : null,
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
