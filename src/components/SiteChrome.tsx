'use client'

import { usePathname } from 'next/navigation'
import MegaNav from '@/components/MegaNav'
import Footer from '@/components/Footer'

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isChromeless = pathname.startsWith('/app') || pathname.startsWith('/0nboarding') || pathname.startsWith('/oauth') || pathname.startsWith('/console')

  if (isChromeless) {
    return <>{children}</>
  }

  return (
    <>
      <MegaNav />
      <main className="relative z-[1] pt-[72px]">{children}</main>
      <Footer />
    </>
  )
}
