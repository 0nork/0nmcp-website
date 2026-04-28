import type { Metadata } from 'next'
import { STATS_DISPLAY } from '@/data/stats'
import Homepage from '@/components/Homepage'

export const metadata: Metadata = {
  title: '0nMCP — The Universal AI API Orchestrator',
  description:
    'The universal AI API orchestrator. 1,183+ tools across 99 services. One install. Zero config. MIT licensed. Powered by 5 patented technologies.',
  keywords: [
    '0nMCP', 'MCP server', 'AI orchestrator', 'API integration',
    'workflow automation', 'Model Context Protocol', 'AI tools',
  ],
  openGraph: {
    title: '0nMCP — The Universal AI API Orchestrator',
    description: `${STATS_DISPLAY.tools} tools. ${STATS_DISPLAY.services} services. One command. MIT licensed.`,
    url: 'https://www.0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — The Universal AI API Orchestrator',
    description: `${STATS_DISPLAY.tools} tools. ${STATS_DISPLAY.services} services. One command. MIT licensed.`,
  },
  alternates: { canonical: 'https://www.0nmcp.com' },
}

export default function Home() {
  return <Homepage />
}
