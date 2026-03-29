import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { STATS } from '@/data/stats'
import './globals.css'
import SiteChrome from '@/components/SiteChrome'
import Providers from '@/components/Providers'
import OnCallLoader from '@/components/oncall/OnCallLoader'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const WEB0N_HOSTS = ['web0n.com', 'www.web0n.com']

export const metadata: Metadata = {
  title: '0nMCP — Universal AI API Orchestrator',
  description:
    `${STATS.tools} tools across ${STATS.services} services and ${STATS.capabilities} pre-built capabilities. The universal MCP server that connects AI to everything. Stop building workflows. Start describing outcomes.`,
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
      `${STATS.tools} tools across ${STATS.services} services and ${STATS.capabilities} pre-built capabilities. The universal MCP server that connects AI to everything.`,
    url: 'https://www.0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — Universal AI API Orchestrator',
    description:
      `${STATS.tools} tools across ${STATS.services} services and ${STATS.capabilities} pre-built capabilities. The universal MCP server that connects AI to everything.`,
    creator: '@0nork',
  },
  metadataBase: new URL('https://www.0nmcp.com'),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  alternates: {
    canonical: 'https://www.0nmcp.com',
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
  category: 'technology',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const host = headersList.get('host')?.split(':')[0] || ''
  const isWeb0n = WEB0N_HOSTS.includes(host)

  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
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
        <Providers>
          <SiteChrome isWeb0n={isWeb0n}>{children}</SiteChrome>
          {!isWeb0n && <OnCallLoader />}
        </Providers>
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
        {/* CRM tracking removed — keydown listener was causing backwards text in textareas */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s,i,t){var e=new XMLHttpRequest();e.open('POST','https://www.0nmcp.com/api/t');e.setRequestHeader('Content-Type','application/json');e.send(JSON.stringify({s:s,p:location.href,r:document.referrer,d:navigator.userAgent,t:Date.now()}))})('3ed036f8-6ddc-4317-8fcb-f9692bd6ce79');`,
          }}
        />
        {/* 0nAI Chat Widget — Agent Studio powered, on all public pages */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=document.createElement('script');s.src='https://widgets.leadconnectorhq.com/loader.js';s.setAttribute('data-resources-url','https://widgets.leadconnectorhq.com/chat-widget/loader.js');s.setAttribute('data-widget-id','nphConTwfHcVE1oA0uep');s.async=true;document.body.appendChild(s);})();`,
          }}
        />
      </body>
    </html>
  )
}
