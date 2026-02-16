import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: '0nMCP App',
  description: 'Universal AI API Orchestrator — manage add0ns, execute tasks, build workflows.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '0nMCP',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#00ff88',
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="pwa-root">
      {children}
    </div>
  )
}
