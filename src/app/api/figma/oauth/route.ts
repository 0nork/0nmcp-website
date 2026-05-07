import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { initiateFigmaOAuth } from '@/lib/figma/auth'

/**
 * GET /api/figma/oauth
 * Redirects authenticated user to Figma consent screen.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.redirect(
      new URL('/login?redirect=/console/onpress', process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com')
    )
  }

  try {
    const url = await initiateFigmaOAuth(user.id)
    return NextResponse.redirect(url)
  } catch (err) {
    console.error('[figma-oauth] Initiate error:', err)
    return NextResponse.json({ error: 'Failed to initiate OAuth' }, { status: 500 })
  }
}
