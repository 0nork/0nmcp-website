import type { Metadata } from 'next'
import { Suspense } from 'react'
import ForumShell from './ForumShell'

export const metadata: Metadata = {
  alternates: {
    types: {
      'application/rss+xml': 'https://www.0nmcp.com/api/feed/forum',
      'application/atom+xml': 'https://www.0nmcp.com/api/feed/forum?format=atom',
    },
  },
}

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '2rem', fontWeight: 900 }}>0n</div>
      </div>
    }>
      <ForumShell>{children}</ForumShell>
    </Suspense>
  )
}
