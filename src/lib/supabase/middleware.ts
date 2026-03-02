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

  const pathname = request.nextUrl.pathname

  // Admin routes — restricted to admin emails or is_admin flag in DB
  const ADMIN_EMAILS = ['mike@rocketopp.com']
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Check email whitelist first (fast path)
    let isAdmin = ADMIN_EMAILS.includes(user.email || '')

    // If not in email list, check DB is_admin column
    if (!isAdmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      isAdmin = profile?.is_admin === true
    }

    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  // Auth-walled routes — redirect to login if not authenticated
  const authWalledPaths = ['/builder', '/convert']
  const isAuthWalled = authWalledPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (isAuthWalled && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/account', '/vault', '/app', '/store', '/0nboarding', '/oauth', '/console']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login/signup
  const authPaths = ['/login', '/signup']
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p))

  if (isAuthPage && user) {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/account'
    const url = request.nextUrl.clone()
    url.pathname = redirect
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Onboarding gate — authenticated users only
  if (user) {
    // Skip onboarding check for API routes
    if (pathname.startsWith('/api/')) {
      return supabaseResponse
    }

    // Check onboarding status for protected non-API routes
    const skipOnboardingCheck = pathname.startsWith('/0nboarding') || pathname.startsWith('/oauth/consent')

    if (isProtected && !skipOnboardingCheck) {
      // Query onboarding status
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (!profile || profile.onboarding_completed === false) {
        const url = request.nextUrl.clone()
        url.pathname = '/0nboarding'
        url.search = ''
        return NextResponse.redirect(url)
      }
    }

    // If already onboarded and visiting /0nboarding, redirect to /account
    if (pathname.startsWith('/0nboarding')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile && profile.onboarding_completed === true) {
        const url = request.nextUrl.clone()
        url.pathname = '/account'
        url.search = ''
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
