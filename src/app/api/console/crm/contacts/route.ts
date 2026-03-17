import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getUserCrmConfig, getCrmHeaders, CRM_BASE } from '@/lib/crm/config'

export const dynamic = 'force-dynamic'

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

  const config = await getUserCrmConfig(supabase)
  if (!config) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const query = searchParams.get('query') || ''
  const limit = searchParams.get('limit') || '20'
  const page = searchParams.get('page') || '1'

  const params = new URLSearchParams({
    locationId: config.locationId,
    limit,
    ...(query ? { query } : {}),
  })

  if (Number(page) > 1) {
    params.set('startAfter', String((Number(page) - 1) * Number(limit)))
  }

  try {
    const res = await fetch(`${CRM_BASE}/contacts/?${params.toString()}`, {
      method: 'GET',
      headers: getCrmHeaders(config.pitToken),
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

  const config = await getUserCrmConfig(supabase)
  if (!config) {
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
    locationId: config.locationId,
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(tags && tags.length > 0 ? { tags } : {}),
  }

  try {
    const res = await fetch(`${CRM_BASE}/contacts/`, {
      method: 'POST',
      headers: getCrmHeaders(config.pitToken),
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

    const data = (await res.json()) as { contact: CrmContact }

    return NextResponse.json({ contact: data.contact })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * PUT /api/console/crm/contacts
 * Update a contact. Body: { contactId, firstName?, lastName?, email?, phone?, tags?, customFields? }
 */
export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const config = await getUserCrmConfig(supabase)
  if (!config) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { contactId, firstName, lastName, email, phone, tags, customFields } = body as {
    contactId?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    tags?: string[]
    customFields?: Record<string, unknown>[]
  }

  if (!contactId) {
    return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
  }

  const payload: Record<string, unknown> = {
    ...(firstName !== undefined ? { firstName } : {}),
    ...(lastName !== undefined ? { lastName } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(tags !== undefined ? { tags } : {}),
    ...(customFields !== undefined ? { customFields } : {}),
  }

  try {
    const res = await fetch(`${CRM_BASE}/contacts/${contactId}`, {
      method: 'PUT',
      headers: getCrmHeaders(config.pitToken),
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

    const data = (await res.json()) as { contact: CrmContact }

    return NextResponse.json({ contact: data.contact })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * DELETE /api/console/crm/contacts
 * Delete a contact. Query param: contactId
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const config = await getUserCrmConfig(supabase)
  if (!config) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const contactId = searchParams.get('contactId')

  if (!contactId) {
    return NextResponse.json({ error: 'contactId query param is required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${CRM_BASE}/contacts/${contactId}`, {
      method: 'DELETE',
      headers: getCrmHeaders(config.pitToken),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: `CRM API error: ${res.status}`, details: errText },
        { status: res.status >= 500 ? 502 : res.status }
      )
    }

    return NextResponse.json({ success: true, contactId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
