import type { Metadata } from 'next'
import { Suspense } from 'react'
import SponsorClient from './SponsorClient'

export const metadata: Metadata = {
  title: 'Sponsor 0nMCP -- Fund Open Source AI Orchestration',
  description:
    'Support 0nMCP development. Your sponsorship keeps the universal AI API orchestrator free and open source. 26 services, 550+ tools. Fund the future of AI orchestration.',
  openGraph: {
    title: 'Sponsor 0nMCP -- Fund Open Source AI Orchestration',
    description:
      'Help us keep 0nMCP free and open source. 26 services, 550+ tools, zero config. Your support makes it possible.',
    url: 'https://0nmcp.com/sponsor',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sponsor 0nMCP',
    description:
      'Fund the future of AI orchestration. 26 services, 550+ tools, open source forever.',
  },
  alternates: { canonical: 'https://0nmcp.com/sponsor' },
}

export default function SponsorPage() {
  return (
    <Suspense>
      <SponsorClient />
    </Suspense>
  )
}
