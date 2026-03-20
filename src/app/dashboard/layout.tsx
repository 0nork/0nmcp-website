import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | 0nMCP',
  description: 'Your AI command center',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
