import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

const WEB0N_HOSTS = ['web0n.com', 'www.web0n.com']

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] || ''

  // web0n.com hostname → rewrite to /web0n/* routes internally
  if (WEB0N_HOSTS.includes(hostname)) {
    const pathname = request.nextUrl.pathname

    // Skip rewrites for Next.js internals and static files
    if (pathname.startsWith('/_next') || pathname.startsWith('/api/web0n')) {
      return updateSession(request)
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

    // Still process Supabase session on rewritten request
    return updateSession(request)
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon|icons/|downloads/|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
