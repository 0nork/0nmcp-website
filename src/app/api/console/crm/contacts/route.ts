import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const CRM_BASE = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

function getCrmHeaders(): Record<string, string> {
  const token = process.env.CRM_PIT || process.env.CRM_API_KEY || 'pit-0317b406-8a47-478e-ac28-a88763a9bb3f'
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Version': CRM_VERSION,
  }
}

function getLocationId(): string {
  return process.env.CRM_LOCATION_ID || process.env.CRM_COMMUNITY_LOCATION_ID || 'nphConTwfHcVE1oA0uep'
}

interface CrmContact {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  tags?: string[]
  companyName?: string
  dateAdded?: string
  source?: string
}

interface CrmContactsResponse {
  contacts: CrmContact[]
  meta?: { total?: number; currentPage?: number; nextPage?: number }
}

/**
 * GET /api/console/crm/contacts
 * Search/list contacts. Query params: query, limit, page
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const query = searchParams.get('query') || ''
  const limit = searchParams.get('limit') || '20'
  const page = searchParams.get('page') || '1'
  const locationId = getLocationId()

  const params = new URLSearchParams({
    locationId,
    limit,
    ...(query ? { query } : {}),
  })

  // CRM uses startAfterId for pagination, but we expose page number
  // For page > 1, we'd need the last contact ID from previous page
  // For simplicity, offset = (page - 1) * limit via startAfter param
  if (Number(page) > 1) {
    params.set('startAfter', String((Number(page) - 1) * Number(limit)))
  }

  try {
    const res = await fetch(`${CRM_BASE}/contacts/?${params.toString()}`, {
      method: 'GET',
      headers: getCrmHeaders(),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: `CRM API error: ${res.status}`, details: errText },
        { status: res.status >= 500 ? 502 : res.status }
      )
    }

    const data: CrmContactsResponse = await res.json()

    return NextResponse.json({
      contacts: data.contacts || [],
      total: data.meta?.total || data.contacts?.length || 0,
      page: Number(page),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * POST /api/console/crm/contacts
 * Create a new contact. Body: { firstName, lastName, email, phone, tags }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { firstName, lastName, email, phone, tags } = body as {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    tags?: string[]
  }

  if (!firstName && !email && !phone) {
    return NextResponse.json(
      { error: 'At least one of firstName, email, or phone is required' },
      { status: 400 }
    )
  }

  const payload: Record<string, unknown> = {
    locationId: getLocationId(),
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(tags && tags.length > 0 ? { tags } : {}),
  }

  try {
    const res = await fetch(`${CRM_BASE}/contacts/`, {
      method: 'POST',
      headers: getCrmHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: `CRM API error: ${res.status}`, details: errText },
        { status: res.status >= 500 ? 502 : res.status }
      )
    }

    const data = await res.json() as { contact: CrmContact }

    return NextResponse.json({ contact: data.contact })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
