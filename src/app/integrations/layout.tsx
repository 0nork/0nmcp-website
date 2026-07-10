import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Connections — Connect 111 Services with AI | 0nMCP',
  description: 'Browse all 0nMCP integrations. Connect Gmail, Slack, Stripe, CRM, Shopify, and more services with AI-powered orchestration. 1,400+ pre-built automations.',
  openGraph: {
    title: 'Connections — Connect 111 Services with AI | 0nMCP',
    description: '1,400+ pre-built automations across 111 services. AI-native API orchestration.',
    url: 'https://www.0nmcp.com/integrations',
  },
  alternates: { canonical: 'https://www.0nmcp.com/integrations' },
}

export default function IntegrationsLayout({ children }: { children: ReactNode }) {
  return children
}
