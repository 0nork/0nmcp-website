import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createSupabaseServer()
  if (supabase) await supabase.auth.signOut()

  // Return JSON — client handles redirect (fetch doesn't follow 3xx from POST)
  const response = NextResponse.json({ ok: true })

  // Clear auth cookies server-side
  response.cookies.set('0n_clear_storage', '1', {
    path: '/',
    maxAge: 60,
    httpOnly: false,
  })

  return response
}
