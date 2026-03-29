import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { disconnectFigma } from '@/lib/figma/auth'

/**
 * POST /api/figma/disconnect
 * Soft-delete Figma connection for the current user.
 */
export async function POST() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await disconnectFigma(user.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[figma-disconnect] Error:', err)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
