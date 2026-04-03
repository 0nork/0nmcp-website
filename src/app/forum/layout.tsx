import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    types: {
      'application/rss+xml': 'https://www.0nmcp.com/api/feed/forum',
      'application/atom+xml': 'https://www.0nmcp.com/api/feed/forum?format=atom',
    },
  },
}

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
