import type { Metadata } from 'next'
import { Suspense } from 'react'
import NDAClient from './NDAClient'

export const metadata: Metadata = {
  title: 'Investor Portal — 0nMCP',
  description:
    'Access confidential investor materials for 0nMCP / RocketOpp LLC. NDA required.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Investor Portal — 0nMCP',
    description:
      'Access confidential investor materials for 0nMCP / RocketOpp LLC.',
    url: 'https://www.0nmcp.com/investors',
    type: 'website',
  },
  alternates: { canonical: 'https://www.0nmcp.com/investors' },
}

export default function InvestorsPage() {
  return (
    <Suspense>
      <NDAClient />
    </Suspense>
  )
}
