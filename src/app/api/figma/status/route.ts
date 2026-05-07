import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getFigmaConnectionStatus } from '@/lib/figma/auth'

/**
 * GET /api/figma/status
 * Returns Figma connection status for the current user.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = await getFigmaConnectionStatus(user.id)
  return NextResponse.json(status)
}
