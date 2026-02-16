import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Skip auth when Supabase isn't configured
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/account', '/vault']
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login/signup
  const authPaths = ['/login', '/signup']
  const isAuthPage = authPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isAuthPage && user) {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/account'
    const url = request.nextUrl.clone()
    url.pathname = redirect
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
