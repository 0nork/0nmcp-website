import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createSupabaseServer()
  if (supabase) await supabase.auth.signOut()

  // Build redirect response
  const url = new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com')
  const response = NextResponse.redirect(url)

  // Set a cookie that tells the client to clear localStorage on next load
  // This prevents data leakage between accounts on the same browser
  response.cookies.set('0n_clear_storage', '1', {
    path: '/',
    maxAge: 60, // expires in 60 seconds (just needs to survive the redirect)
    httpOnly: false, // client-side JS needs to read this
  })

  return response
}
