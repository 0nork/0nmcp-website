'use client'

import { usePathname } from 'next/navigation'
import MegaNav from '@/components/MegaNav'
import Footer from '@/components/Footer'
import ConsoleCTA from '@/components/ConsoleCTA'

export default function SiteChrome({ children, isWeb0n }: { children: React.ReactNode; isWeb0n?: boolean }) {
  const pathname = usePathname()
  const isChromeless = isWeb0n || pathname.startsWith('/app') || pathname.startsWith('/0nboarding') || pathname.startsWith('/oauth') || pathname.startsWith('/console') || pathname.startsWith('/go') || pathname.startsWith('/forum') || pathname.startsWith('/builder') || pathname.startsWith('/admin') || pathname.startsWith('/web0n') || pathname.startsWith('/0nengine') || pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/dashboard') || pathname.startsWith('/grid') || pathname.startsWith('/maintenance')

  if (isChromeless) {
    return <>{children}</>
  }

  return (
    <>
      <MegaNav />
      <main className="relative z-[1] pt-[72px]">{children}</main>
      <ConsoleCTA />
      <Footer />
    </>
  )
}
