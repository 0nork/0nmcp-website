import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * The user resolved during the LAST updateSession call, per request.
 *
 * WHY THIS EXISTS. updateSession already calls supabase.auth.getUser(), which
 * makes a network call that rotates the refresh token. Callers were then
 * building a SECOND client and calling getUser() again on the same request —
 * two rotations racing each other. The loser sees an already-used refresh token
 * and returns null, the route decides the user is signed out, and bounces to
 * /login. Because /login redirects an authenticated user to /dashboard, and
 * /dashboard redirects to /console, the visible symptom is "every click throws
 * me back to the console" rather than anything that looks like a logout.
 *
 * Keyed by the request object so concurrent requests cannot read each other's
 * user, and weak so nothing is retained after the request is collected.
 */
type SessionUser = { id: string; email?: string | null } | null
const userByRequest = new WeakMap<NextRequest, { user: SessionUser }>()

/** The user updateSession already fetched. Never triggers a second refresh. */
export function resolvedUser(request: NextRequest): SessionUser {
  return userByRequest.get(request)?.user ?? null
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Skip auth when Supabase isn't configured
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const pathname = request.nextUrl.pathname

  // Intercept auth codes on non-callback routes (magic links, email confirmations)
  // Supabase redirects to site root with ?code=xxx — route it to the auth callback
  const code = request.nextUrl.searchParams.get('code')
  if (code && pathname !== '/api/auth/callback') {
    const url = request.nextUrl.clone()
    url.pathname = '/api/auth/callback'
    // Preserve all query params (code, type, etc.)
    return NextResponse.redirect(url)
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

  // Hand this to the caller instead of letting it fetch again.
  userByRequest.set(request, { user: (user as SessionUser) ?? null })

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
  const authWalledPaths = ['/builder']
  const isAuthWalled = authWalledPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (isAuthWalled && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Grid community — paid subscribers only
  if (pathname.startsWith('/grid')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    // plan column: free, creator, operator, agency, enterprise, owner
    const isPaid = profile?.plan && profile.plan !== 'free'

    if (!isPaid) {
      const url = request.nextUrl.clone()
      url.pathname = '/console'
      url.searchParams.set('ref', 'community')
      return NextResponse.redirect(url)
    }
  }

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/account', '/vault', '/app', '/store', '/0nboarding', '/oauth', '/console', '/connect', '/grid']
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
