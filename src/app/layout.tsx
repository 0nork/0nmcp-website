import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import SiteChrome from '@/components/SiteChrome'

export const metadata: Metadata = {
  title: '0nMCP — Universal AI API Orchestrator',
  description:
    '819 tools across 48 services and 80 pre-built automations. The universal MCP server that connects AI to everything. Stop building workflows. Start describing outcomes.',
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
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon',
  },
  openGraph: {
    title: '0nMCP — Universal AI API Orchestrator',
    description:
      '819 tools across 48 services and 80 pre-built automations. The universal MCP server that connects AI to everything.',
    url: 'https://0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — Universal AI API Orchestrator',
    description:
      '819 tools across 48 services and 80 pre-built automations. The universal MCP server that connects AI to everything.',
    creator: '@0nork',
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
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
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
        <SiteChrome>{children}</SiteChrome>
        <Analytics />
        <SpeedInsights />
        <script
          src="https://api.rocketclients.com/js/external-tracking.js"
          data-tracking-id="tk_f9c5376df66c45e69941dd3f3bbe22a2"
          async
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s,i,t){var e=new XMLHttpRequest();e.open('POST','https://0nmcp.com/api/t');e.setRequestHeader('Content-Type','application/json');e.send(JSON.stringify({s:s,p:location.href,r:document.referrer,d:navigator.userAgent,t:Date.now()}))})('8028a660-0194-4077-b084-ca551a110f10');`,
          }}
        />
      </body>
    </html>
  )
}
