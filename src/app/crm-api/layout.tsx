import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CRM API Integration — 245 Tools, AI-Powered | 0nMCP',
  description:
    'Unlock every CRM API endpoint through one platform. 245 tools across contacts, pipelines, conversations, invoices, social media, and more. Works with Claude, GPT, and any MCP client.',
  keywords: [
    'CRM API',
    'CRM integration',
    'CRM automation',
    'MCP server',
    'AI CRM',
    'contact management API',
    'CRM pipeline API',
    'CRM conversations API',
    'CRM social media API',
    'CRM invoices API',
    '0nMCP',
  ],
  openGraph: {
    title: 'CRM API Integration — 245 Tools, AI-Powered | 0nMCP',
    description:
      'Unlock every CRM API endpoint through one platform. 245 tools across contacts, pipelines, conversations, invoices, social media, and more.',
    url: 'https://www.0nmcp.com/crm-api',
    siteName: '0nMCP',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CRM API Integration — 245 Tools, AI-Powered | 0nMCP',
    description:
      'Unlock every CRM API endpoint through one platform. 245 tools across 12 categories. Works with Claude, GPT, and any MCP client.',
    creator: '@0nork',
  },
  alternates: {
    canonical: 'https://www.0nmcp.com/crm-api',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function CrmApiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
