import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/auth/devices — List all active devices/tokens for the authenticated user
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = getAdmin()

  const { data: devices, error } = await admin
    .from('api_tokens')
    .select('id, device_name, platform, last_used_at, created_at, expires_at')
    .eq('user_id', user.id)
    .order('last_used_at', { ascending: false, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 })
  }

  return NextResponse.json({ devices: devices || [] })
}

/**
 * DELETE /api/auth/devices — Revoke a specific device token
 * Body: { device_id: string }
 */
export async function DELETE(request: Request) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: { device_id?: string; revoke_all?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const admin = getAdmin()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (body.revoke_all) {
    await admin.from('api_tokens').delete().eq('user_id', user.id)

    await admin.from('auth_events').insert({
      user_id: user.id,
      event_type: 'all_tokens_revoked',
      ip_address: ip,
    })

    return NextResponse.json({ success: true, message: 'All devices revoked' })
  }

  if (!body.device_id) {
    return NextResponse.json({ error: 'device_id required' }, { status: 400 })
  }

  // Verify the token belongs to this user before deleting
  const { data: token } = await admin
    .from('api_tokens')
    .select('id, device_name, platform')
    .eq('id', body.device_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!token) {
    return NextResponse.json({ error: 'Device not found' }, { status: 404 })
  }

  await admin.from('api_tokens').delete().eq('id', body.device_id)

  await admin.from('auth_events').insert({
    user_id: user.id,
    event_type: 'token_revoked',
    platform: token.platform,
    device_name: token.device_name,
    ip_address: ip,
  })

  return NextResponse.json({ success: true })
}
