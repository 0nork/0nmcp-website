import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '0n Terminal | 0nMCP Console',
  description: 'Browser-native development environment with Node.js, Python, and shell — powered by 0nMCP.',
}

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  return children
}
