import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getUserCrmConfig, getCrmHeaders, CRM_BASE } from '@/lib/crm/config'

export const dynamic = 'force-dynamic'

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

  const config = await getUserCrmConfig(supabase)
  if (!config) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const contactId = searchParams.get('contactId') || ''
  const limit = searchParams.get('limit') || '20'

  const params = new URLSearchParams({
    locationId: config.locationId,
    limit,
    ...(contactId ? { contactId } : {}),
  })

  try {
    const res = await fetch(`${CRM_BASE}/conversations/search?${params.toString()}`, {
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

    const data: CrmConversationsResponse = await res.json()

    return NextResponse.json({
      conversations: data.conversations || [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * POST /api/console/crm/conversations
 * Create a conversation or send a message.
 * Body: { contactId, type: "Email"|"SMS"|"WhatsApp", message, subject? }
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

  const { contactId, type, message, subject } = body as {
    contactId?: string
    type?: string
    message?: string
    subject?: string
  }

  if (!contactId) {
    return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
  }

  if (!type) {
    return NextResponse.json(
      { error: 'type is required (Email, SMS, or WhatsApp)' },
      { status: 400 }
    )
  }

  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  const payload: Record<string, unknown> = {
    type,
    contactId,
    message,
    ...(subject ? { subject } : {}),
  }

  try {
    const res = await fetch(`${CRM_BASE}/conversations/messages`, {
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

    const data = await res.json()

    return NextResponse.json({ conversation: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
