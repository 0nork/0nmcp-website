'use client'

import { usePathname } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPWA = pathname.startsWith('/app')

  if (isPWA) {
    return <>{children}</>
  }

  return (
    <>
      <Nav />
      <main className="relative z-[1] pt-16">{children}</main>
      <Footer />
    </>
  )
}
