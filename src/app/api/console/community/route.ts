import { NextResponse } from 'next/server'

const API_BASE = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'

/**
 * GET /api/console/community
 * Fetches community members from CRM via hardcoded .0n connection
 * Uses CRM_API_KEY + CRM_COMMUNITY_LOCATION_ID env vars
 */
export async function GET() {
  const apiKey = process.env.CRM_API_KEY
  const locationId = process.env.CRM_COMMUNITY_LOCATION_ID || 'nphConTwfHcVE1oA0uep'

  if (!apiKey) {
    return NextResponse.json({
      members: [],
      error: 'CRM connection not configured. Set CRM_API_KEY in env.',
    })
  }

  try {
    // Fetch contacts from community sub-location
    const res = await fetch(
      `${API_BASE}/contacts/?locationId=${locationId}&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Version: API_VERSION,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({
        members: [],
        error: `CRM API error: ${res.status}`,
        detail: err,
      })
    }

    const data = await res.json()
    const contacts = data.contacts || []

    const members = contacts.map((c: Record<string, unknown>) => ({
      id: c.id,
      name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown',
      email: c.email || undefined,
      tags: Array.isArray(c.tags) ? c.tags : [],
      last_active: c.dateUpdated || c.dateAdded || undefined,
    }))

    return NextResponse.json({ members, total: data.meta?.total || members.length })
  } catch (err) {
    return NextResponse.json({
      members: [],
      error: 'Failed to connect to CRM',
      detail: String(err),
    })
  }
}
