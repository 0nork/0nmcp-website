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

interface CrmMessage {
  id: string
  conversationId?: string
  body?: string
  type?: number
  messageType?: string
  direction?: string
  status?: string
  dateAdded?: string
  contactId?: string
}

interface CrmMessagesResponse {
  messages: CrmMessage[]
  nextPage?: string
}

/**
 * GET /api/console/crm/conversations/messages
 * Get messages for a conversation. Query param: conversationId (required)
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
  const conversationId = searchParams.get('conversationId')

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${CRM_BASE}/conversations/${conversationId}/messages`, {
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

    const data: CrmMessagesResponse = await res.json()

    return NextResponse.json({
      messages: data.messages || [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

/**
 * POST /api/console/crm/conversations/messages
 * Send a message. Body: { conversationId, type, message, contactId }
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

  const { conversationId, type, message, contactId } = body as {
    conversationId?: string
    type?: string
    message?: string
    contactId?: string
  }

  if (!contactId) {
    return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
  }

  if (!type) {
    return NextResponse.json({ error: 'type is required (e.g. SMS, Email, WhatsApp)' }, { status: 400 })
  }

  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  const payload: Record<string, unknown> = {
    type,
    contactId,
    message,
    ...(conversationId ? { conversationId } : {}),
  }

  try {
    const res = await fetch(`${CRM_BASE}/conversations/messages`, {
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

    const data = await res.json() as CrmMessage

    return NextResponse.json({ message: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'CRM request failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
