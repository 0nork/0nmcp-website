import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function GET() {
  const { data, error } = await db()
    .from('intel_alerts')
    .select('*, intel_findings(*)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const unreadCount = (data || []).filter(a => !a.read).length
  return NextResponse.json({ alerts: data || [], unread_count: unreadCount })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()

  if (body.mark_all_read) {
    await db().from('intel_alerts').update({ read: true, read_at: new Date().toISOString() }).eq('read', false)
    return NextResponse.json({ success: true })
  }

  if (body.id) {
    await db().from('intel_alerts').update({ read: true, read_at: new Date().toISOString() }).eq('id', body.id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
