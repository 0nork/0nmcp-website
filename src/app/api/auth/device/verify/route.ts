import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/auth/device/verify — Verify a user_code exists and is pending
 * Called by the device approval page before showing the confirm dialog.
 */
export async function POST(request: NextRequest) {
  let body: { user_code?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { user_code } = body
  if (!user_code) {
    return NextResponse.json({ error: 'user_code required' }, { status: 400 })
  }

  const admin = getAdmin()

  const { data: dc, error } = await admin
    .from('device_codes')
    .select('id, platform, device_name, ip_address, expires_at, status')
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

  return NextResponse.json({
    valid: true,
    device: {
      platform: dc.platform,
      device_name: dc.device_name,
      ip_address: dc.ip_address,
    },
  })
}
