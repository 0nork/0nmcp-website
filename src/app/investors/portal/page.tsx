import type { Metadata } from 'next'
import { Suspense } from 'react'
import PortalClient from './PortalClient'

export const metadata: Metadata = {
  title: 'Confidential Materials — 0nMCP Investor Portal',
  description: 'NDA-protected investor materials for 0nMCP / RocketOpp LLC.',
  robots: { index: false, follow: false },
}

export default function PortalPage() {
  return (
    <Suspense>
      <PortalClient />
    </Suspense>
  )
}
