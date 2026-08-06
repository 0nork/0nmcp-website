import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const WEB0N_HOSTS = ['web0n.com', 'www.web0n.com']

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function applySessionCookies(request: NextRequest, response: NextResponse): NextResponse {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return response

  // Refresh Supabase auth session on the rewrite response
  createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  return response
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] || ''

  // web0n.com hostname — rewrite to /web0n/* routes internally
  if (WEB0N_HOSTS.includes(hostname)) {
    const pathname = request.nextUrl.pathname

    // Skip rewrites for Next.js internals
    if (pathname.startsWith('/_next')) {
      return NextResponse.next()
    }

    // Already targeting web0n routes — pass through (prevent double-prefix)
    if (pathname.startsWith('/api/web0n') || pathname.startsWith('/web0n')) {
      return NextResponse.next()
    }

    // API routes: web0n.com/api/* → /api/web0n/*
    if (pathname.startsWith('/api/')) {
      const url = request.nextUrl.clone()
      url.pathname = `/api/web0n${pathname.slice(4)}`
      return NextResponse.rewrite(url)
    }

    // Page routes: web0n.com/* → /web0n/*
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' ? '/web0n' : `/web0n${pathname}`
    const response = NextResponse.rewrite(url)

    // Attach Supabase session cookies to the rewrite response
    return applySessionCookies(request, response)
  }

  // ── Login / Signup — redirect to /dashboard if already authenticated ──
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
    // Refresh first, then read the user it resolved — one fetch, not two.
    const { updateSession, resolvedUser } = await import('@/lib/supabase/middleware')
    const response = await updateSession(request)
    if (resolvedUser(request)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Dashboard — login required
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const { updateSession } = await import('@/lib/supabase/middleware')
    const response = await updateSession(request)

    // The user updateSession already resolved. A second getUser() here
    // would rotate the refresh token a second time on the same request and
    // race the first — the loser returns null and bounces a signed-in user.
    {
      const { resolvedUser } = await import('@/lib/supabase/middleware')
      const user = resolvedUser(request)
      if (!user) {
        return NextResponse.redirect(new URL('/login?redirect=/dashboard', request.url))
      }
    }
    return response
  }

  // Console — login required
  if (request.nextUrl.pathname.startsWith('/console')) {
    const { updateSession } = await import('@/lib/supabase/middleware')
    const response = await updateSession(request)

    // The user updateSession already resolved. A second getUser() here
    // would rotate the refresh token a second time on the same request and
    // race the first — the loser returns null and bounces a signed-in user.
    {
      const { resolvedUser } = await import('@/lib/supabase/middleware')
      const user = resolvedUser(request)
      if (!user) {
        return NextResponse.redirect(new URL(`/login?redirect=${request.nextUrl.pathname}`, request.url))
      }
    }
    return response
  }

  // Grid community — paid subscribers only
  if (request.nextUrl.pathname.startsWith('/grid')) {
    const { updateSession } = await import('@/lib/supabase/middleware')
    const response = await updateSession(request)

    // Check subscription after session refresh. Reuse the user updateSession
    // already resolved — a second getUser() rotates the refresh token again on
    // the same request and races the first.
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const { resolvedUser } = await import('@/lib/supabase/middleware')
      const user = resolvedUser(request)
      if (!user) {
        return NextResponse.redirect(new URL('/login?redirect=/grid', request.url))
      }
      // A client for the profile READ only — no getUser, so no second refresh.
      const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) },
        },
      })
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

      const isPaid = profile?.plan && profile.plan !== 'free'
      if (!isPaid) {
        return NextResponse.redirect(new URL('/console?ref=community', request.url))
      }
    }

    return response
  }

  // Default: 0nmcp.com — use standard Supabase session handler
  const { updateSession } = await import('@/lib/supabase/middleware')
  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!monitoring|_next/static|_next/image|favicon.ico|icon.svg|apple-icon|icons/|downloads/|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
