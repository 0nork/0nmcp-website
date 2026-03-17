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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const locationId = getLocationId()

  // Default time range: today to 30 days out
  const now = new Date()
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const startTime = searchParams.get('startTime') || now.toISOString()
  const endTime = searchParams.get('endTime') || thirtyDaysOut.toISOString()

  try {
    // Fetch calendars and events in parallel
    const [calendarsRes, eventsRes] = await Promise.all([
      fetch(`${CRM_BASE}/calendars/?locationId=${locationId}`, {
        method: 'GET',
        headers: getCrmHeaders(),
        signal: AbortSignal.timeout(15000),
      }),
      fetch(
        `${CRM_BASE}/calendars/events?locationId=${locationId}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
        {
          method: 'GET',
          headers: getCrmHeaders(),
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
