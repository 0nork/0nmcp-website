import { withCro9Meta } from '@/lib/cro9-meta'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import PortalClient from './PortalClient'

const metadataBase: Metadata = {
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

export async function generateMetadata(): Promise<Metadata> {
  return withCro9Meta('/investors/portal', metadataBase)
}
