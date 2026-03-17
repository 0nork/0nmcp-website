import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const CRM_BASE = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

function getCrmHeaders(): Record<string, string> {
  const token = process.env.CRM_PIT || process.env.CRM_API_KEY
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Version': CRM_VERSION,
  }
}

function getLocationId(): string {
  return process.env.CRM_LOCATION_ID || process.env.CRM_COMMUNITY_LOCATION_ID
}

interface CrmConversation {
  id: string
  contactId?: string
  type?: string
  lastMessageDate?: string
  lastMessageBody?: string
  unreadCount?: number
}

interface CrmConversationsResponse {
  conversations: CrmConversation[]
}

/**
 * GET /api/console/crm/conversations
 * List conversations. Query params: contactId, limit
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
  const contactId = searchParams.get('contactId') || ''
  const limit = searchParams.get('limit') || '20'
  const locationId = getLocationId()

  const params = new URLSearchParams({
    locationId,
    limit,
    ...(contactId ? { contactId } : {}),
  })

  try {
    const res = await fetch(`${CRM_BASE}/conversations/search?${params.toString()}`, {
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

    const data: CrmConversationsResponse = await res.json()

    return NextResponse.json({
      conversations: data.conversations || [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
