import type { Metadata } from 'next'
import { STATS_DISPLAY } from '@/data/stats'
import { StartClient } from './StartClient'

const title = `Turn It 0n — Install 0nMCP on ${STATS_DISPLAY.services}+ Platforms`
const description = `Install 0nMCP and get ${STATS_DISPLAY.tools} AI tools everywhere you work. Claude, Cursor, VS Code, WordPress, npm, Chrome, and more. $50 Founders Access.`

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    '0nMCP install', 'Turn It 0n', 'MCP install', 'Claude MCP', 'Claude tools',
    'Cursor MCP', 'VS Code MCP', 'WordPress MCP', 'npm 0nmcp', 'AI tools',
    'Model Context Protocol', 'AI orchestration', 'workflow automation',
  ],
  openGraph: {
    title: `Turn It 0n — ${STATS_DISPLAY.tools} AI Tools Everywhere`,
    description: `Install 0nMCP on Claude, Cursor, VS Code, WordPress, npm, and more. $50 Founders Access.`,
    url: 'https://www.0nmcp.com/start',
    siteName: '0nMCP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Turn It 0n — ${STATS_DISPLAY.tools} AI Tools Everywhere`,
    description: 'Install 0nMCP on every platform. $50 Founders Access.',
  },
  alternates: { canonical: 'https://www.0nmcp.com/start' },
}

export default function StartPage() {
  return <StartClient />
}
