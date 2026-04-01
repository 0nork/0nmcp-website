import type { Metadata } from 'next'
import { STATS_DISPLAY } from '@/data/stats'
import { SubscribeClient } from './SubscribeClient'

const title = 'Subscribe to 0nMCP — Free, Founders, or Builder'
const description = `Get ${STATS_DISPLAY.tools} AI tools, ${STATS_DISPLAY.services} services, encrypted vault, and AI chat. Free tier available. $50 Founders Access with lifetime badge.`

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    '0nMCP pricing', '0nMCP subscribe', 'AI tools pricing', 'MCP subscription',
    'AI orchestration pricing', 'workflow automation pricing', '0nMCP free',
    '0nMCP founders', 'AI API pricing',
  ],
  openGraph: {
    title: 'Subscribe to 0nMCP — Plans Starting Free',
    description: `${STATS_DISPLAY.tools} tools. ${STATS_DISPLAY.services} services. Starting at $0/mo.`,
    url: 'https://www.0nmcp.com/subscribe',
    siteName: '0nMCP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Subscribe to 0nMCP',
    description: `${STATS_DISPLAY.tools} tools starting at $0/mo. $50 Founders Access available.`,
  },
  alternates: { canonical: 'https://www.0nmcp.com/subscribe' },
}

export default function SubscribePage() {
  return <SubscribeClient />
}
