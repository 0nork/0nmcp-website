import type { Metadata } from 'next'
import MaintenancePage from '@/components/maintenance/MaintenancePage'

export const metadata: Metadata = {
  title: '0nMCP — Coming May 1st | The Universal AI Orchestrator',
  description:
    'The universal AI API orchestrator. 900+ tools across 55 services. Pre-order now for Founders access. Official launch May 1, 2026.',
  keywords: [
    '0nMCP', 'MCP server', 'AI orchestrator', 'API integration',
    'workflow automation', 'Model Context Protocol', 'AI tools',
  ],
  openGraph: {
    title: '0nMCP — Coming May 1st',
    description: '900+ tools. 55 services. One command. Pre-order for Founders access.',
    url: 'https://www.0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — Coming May 1st',
    description: '900+ tools. 55 services. One command. Pre-order for Founders access.',
  },
  alternates: { canonical: 'https://www.0nmcp.com' },
}

export default function Home() {
  return <MaintenancePage />
}
