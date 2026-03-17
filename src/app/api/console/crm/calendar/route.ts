import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getUserCrmConfig, getCrmHeaders, CRM_BASE } from '@/lib/crm/config'

export const dynamic = 'force-dynamic'

interface CrmCalendar {
  id: string
  name: string
  locationId?: string
  description?: string
  slug?: string
  isActive?: boolean
}

interface CrmAppointment {
  id: string
  calendarId?: string
  contactId?: string
  title?: string
  status?: string
  startTime?: string
  endTime?: string
  appointmentStatus?: string
}

interface CrmCalendarsResponse {
  calendars: CrmCalendar[]
}

interface CrmEventsResponse {
  events: CrmAppointment[]
}

/**
 * GET /api/console/crm/calendar
 * List calendars and appointments.
 * Query params: startTime, endTime (ISO strings for appointment range)
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

  // Default time range: today to 30 days out
  const now = new Date()
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const startTime = searchParams.get('startTime') || now.toISOString()
  const endTime = searchParams.get('endTime') || thirtyDaysOut.toISOString()

  try {
    // Fetch calendars and events in parallel
    const [calendarsRes, eventsRes] = await Promise.all([
      fetch(`${CRM_BASE}/calendars/?locationId=${config.locationId}`, {
        method: 'GET',
        headers: getCrmHeaders(config.pitToken),
        signal: AbortSignal.timeout(15000),
      }),
      fetch(
        `${CRM_BASE}/calendars/events?locationId=${config.locationId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
        {
          method: 'GET',
          headers: getCrmHeaders(config.pitToken),
          signal: AbortSignal.timeout(15000),
        }
      ),
    ])

    if (!calendarsRes.ok) {
      const errText = await calendarsRes.text().catch(() => 'Unknown error')
      return NextResponse.json(
        { error: `CRM calendars API error: ${calendarsRes.status}`, details: errText },
        { status: calendarsRes.status >= 500 ? 502 : calendarsRes.status }
      )
    }

    const calendarsData: CrmCalendarsResponse = await calendarsRes.json()

    let appointments: CrmAppointment[] = []
    if (eventsRes.ok) {
      const eventsData: CrmEventsResponse = await eventsRes.json()
      appointments = eventsData.events || []
    }

    return NextResponse.json({
      calendars: calendarsData.calendars || [],
      appointments,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * POST /api/console/crm/calendar
 * Create an appointment. Body: { calendarId, contactId, startTime, endTime, title, notes? }
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

  const { calendarId, contactId, startTime, endTime, title, notes } = body as {
    calendarId?: string
    contactId?: string
    startTime?: string
    endTime?: string
    title?: string
    notes?: string
  }

  if (!calendarId) {
    return NextResponse.json({ error: 'calendarId is required' }, { status: 400 })
  }

  if (!contactId) {
    return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
  }

  if (!startTime) {
    return NextResponse.json({ error: 'startTime is required' }, { status: 400 })
  }

  if (!endTime) {
    return NextResponse.json({ error: 'endTime is required' }, { status: 400 })
  }

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const payload: Record<string, unknown> = {
    locationId: config.locationId,
    calendarId,
    contactId,
    startTime,
    endTime,
    title,
    ...(notes ? { notes } : {}),
  }

  try {
    const res = await fetch(`${CRM_BASE}/calendars/events/appointments`, {
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

    const data = (await res.json()) as CrmAppointment

    return NextResponse.json({ appointment: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
