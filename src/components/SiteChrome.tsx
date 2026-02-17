'use client'

import { usePathname } from 'next/navigation'
import MegaNav from '@/components/MegaNav'
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
      <MegaNav />
      <main className="relative z-[1] pt-[72px]">{children}</main>
      <Footer />
      <OnorkWidget />
    </>
  )
}
