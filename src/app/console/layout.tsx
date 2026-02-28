import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '0n Console | 0nMCP',
  description:
    'Your AI infrastructure dashboard. Manage services, execute workflows, and chat with 0nMCP across 819 tools and 48 services.',
  robots: { index: false, follow: false },
}

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {children}
    </div>
  )
}
