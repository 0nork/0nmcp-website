import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { STATS } from '@/data/stats'
import './globals.css'
import SiteChrome from '@/components/SiteChrome'
import Providers from '@/components/Providers'
import { VoiceAIFloatingButton } from '@/components/voice-ai-floating'
// ExitIntentPopup and SignupGate permanently removed — never show popups on the backend
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
        <meta name="slack-app-id" content="A0AQHLXC3FD" />
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Nunito+Sans:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://api.rocketclients.com/js/external-tracking.js" data-tracking-id="tk_f9c5376df66c45e69941dd3f3bbe22a2" async />
        {/*
          CRO9 embed — captures pageview / scroll / click / conversion / exit-
          intent signals back to 0ncore for the adaptive scoring engine. Domain-
          locked server-side to 0nmcp.com — pasted on any other domain it
          no-ops. NEXT_PUBLIC_CRO9_SITE_ID env var lets us swap the slug
          without a redeploy if we move sites.
        */}
        <script
          src={`https://www.0ncore.com/api/cro9/script/${process.env.NEXT_PUBLIC_CRO9_SITE_ID || '0nmcp_com'}.js`}
          async
        />
        {/*
          Detect & Refine tracker — Phase 1 baseline. Captures click → session
          → engagement signals, ships to dr_clicks/dr_sessions/dr_ai_scores
          in pwujhhmlrtxjmjzyttwn for the Groq grader. Separate product from
          the CRO9 script above (different schema, different cron).
        */}
        <script
          src="https://detect-and-refine-cryptogoatz.vercel.app/cro9.js"
          data-account-id="0nmcp_com"
          async
        />
      </head>
      <body className="antialiased">
        <Providers>
          <SiteChrome isWeb0n={isWeb0n}>{children}</SiteChrome>
          {/* Jaxx — same Voice AI widget that runs on 0ncore.com */}
          {!isWeb0n && <VoiceAIFloatingButton />}
        </Providers>
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s,i,t){var e=new XMLHttpRequest();e.open('POST','https://www.0nmcp.com/api/t');e.setRequestHeader('Content-Type','application/json');e.send(JSON.stringify({s:s,p:location.href,r:document.referrer,d:navigator.userAgent,t:Date.now()}))})('3ed036f8-6ddc-4317-8fcb-f9692bd6ce79');`,
          }}
        />
      </body>
    </html>
  )
}
