import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getGrantedServices } from '@/lib/google-scopes'

/**
 * GET /api/console/google-status
 * Returns Google OAuth connection status for the authenticated user.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ connected: false })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ connected: false }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('google_oauth_tokens')
    .select('scopes, token_expires_at, updated_at')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ connected: false })
  }

  const services = getGrantedServices(data.scopes || [])
  const expired = new Date(data.token_expires_at) < new Date()

  return NextResponse.json({
    connected: true,
    expired,
    scopes: data.scopes,
    services,
    serviceCount: services.length,
    expiresAt: data.token_expires_at,
    updatedAt: data.updated_at,
  })
}
