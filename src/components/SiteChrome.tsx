'use client'

import { usePathname } from 'next/navigation'
import MegaNav from '@/components/MegaNav'
import Footer from '@/components/Footer'
import FooterSimple from '@/components/FooterSimple'
import ConsoleCTA from '@/components/ConsoleCTA'

export default function SiteChrome({ children, isWeb0n }: { children: React.ReactNode; isWeb0n?: boolean }) {
  const pathname = usePathname()

  // Chromeless — no nav, no footer (dashboard, console, builder, auth pages)
  const isChromeless = isWeb0n || [
    '/app', '/0nboarding', '/oauth', '/go',
    '/builder', '/admin', '/web0n', '/0nengine',
    '/login', '/signup', '/grid', '/maintenance',
    '/start', '/activate', '/checkout', '/canvas',
  ].some(p => pathname.startsWith(p))

  if (isChromeless) {
    return <>{children}</>
  }

  // Landing pages — simple footer, no ConsoleCTA
  const isLandingPage = [
    '/demo', '/connect', '/security', '/technology',
    '/sponsor', '/partners', '/compare', '/audit', '/forum',
  ].some(p => pathname.startsWith(p))

  // Pages that show the ConsoleCTA (only homepage + a few key pages)
  const showCTA = pathname === '/' || pathname === '/integrations' || pathname === '/turn-it-on'

  // Full footer pages — everything else (blog, learn, glossary, etc.)
  return (
    <>
      <MegaNav />
      <main className="relative z-[1] pt-[72px]">{children}</main>
      {showCTA && <ConsoleCTA />}
      {isLandingPage ? <FooterSimple /> : <Footer />}
    </>
  )
}
