import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: '0nMCP — Universal AI API Orchestrator',
  description:
    '545 tools across 59 services and 1,385 capabilities. The universal MCP server that connects AI to everything. Stop building workflows. Start describing outcomes.',
  keywords: [
    '0nMCP',
    'MCP',
    'Model Context Protocol',
    'AI orchestration',
    'API orchestrator',
    'AI tools',
    'workflow automation',
    '0n Standard',
  ],
  authors: [{ name: 'RocketOpp LLC', url: 'https://rocketopp.com' }],
  openGraph: {
    title: '0nMCP — Universal AI API Orchestrator',
    description:
      '545 tools across 59 services and 1,385 capabilities. The universal MCP server that connects AI to everything.',
    url: 'https://0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — Universal AI API Orchestrator',
    description:
      '545 tools across 59 services and 1,385 capabilities. The universal MCP server that connects AI to everything.',
  },
  metadataBase: new URL('https://0nmcp.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Nav />
        <main className="relative z-[1] pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
