'use client'

import { usePathname } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import OnorkWidget from '@/components/onork-mini/OnorkWidget'

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPWA = pathname.startsWith('/app')

  if (isPWA) {
    return <>{children}</>
  }

  return (
    <>
      <TopBar />
      <Nav />
      <main className="relative z-[1] pt-[calc(2rem+64px)]">{children}</main>
      <Footer />
      <OnorkWidget />
    </>
  )
}
