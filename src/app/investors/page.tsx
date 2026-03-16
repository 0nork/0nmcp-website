import type { Metadata } from 'next'
import { Suspense } from 'react'
import InvestorsClient from './InvestorsClient'

export const metadata: Metadata = {
  title: 'Investors -- 0nMCP',
  description:
    'Investment opportunities with 0nMCP — the universal AI API orchestrator. Review our vision, sign the NDA, and explore partnership.',
  openGraph: {
    title: 'Investors -- 0nMCP',
    description:
      'Investment opportunities with 0nMCP — the universal AI API orchestrator powering 870+ tools across 54 services.',
    url: 'https://www.0nmcp.com/investors',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Investors -- 0nMCP',
    description: 'Investment opportunities with 0nMCP — the universal AI API orchestrator.',
  },
  alternates: { canonical: 'https://www.0nmcp.com/investors' },
}

export default function InvestorsPage() {
  return (
    <Suspense>
      <InvestorsClient />
    </Suspense>
  )
}
