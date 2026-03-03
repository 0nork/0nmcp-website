import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/auth/device/approve — Approve or deny a device code
 * Called by the device approval page when user clicks Allow/Deny.
 * Requires authenticated Supabase session.
 */
export async function POST(request: NextRequest) {
  // Authenticate via Supabase session
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { user_code?: string; action?: 'approve' | 'deny' }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { user_code, action } = body
  if (!user_code || !action) {
    return NextResponse.json({ error: 'user_code and action required' }, { status: 400 })
  }

  if (action !== 'approve' && action !== 'deny') {
    return NextResponse.json({ error: 'action must be "approve" or "deny"' }, { status: 400 })
  }

  const admin = getAdmin()

  // Find the pending device code
  const { data: dc, error } = await admin
    .from('device_codes')
    .select('id, expires_at, status, device_name, platform')
    .eq('user_code', user_code)
    .eq('status', 'pending')
    .maybeSingle()

  if (error || !dc) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 })
  }

  // Check expiration
  if (new Date(dc.expires_at) < new Date()) {
    await admin.from('device_codes').update({ status: 'expired' }).eq('id', dc.id)
    return NextResponse.json({ error: 'Code expired' }, { status: 410 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (action === 'deny') {
    await admin.from('device_codes').update({ status: 'denied' }).eq('id', dc.id)

    await admin.from('auth_events').insert({
      user_id: user.id,
      event_type: 'device_denied',
      platform: dc.platform,
      device_name: dc.device_name,
      ip_address: ip,
    })

    return NextResponse.json({ success: true, status: 'denied' })
  }

  // Approve: set user_id and status
  await admin.from('device_codes').update({
    status: 'approved',
    user_id: user.id,
    approved_at: new Date().toISOString(),
  }).eq('id', dc.id)

  await admin.from('auth_events').insert({
    user_id: user.id,
    event_type: 'device_approve',
    platform: dc.platform,
    device_name: dc.device_name,
    ip_address: ip,
  })

  return NextResponse.json({ success: true, status: 'approved' })
}
