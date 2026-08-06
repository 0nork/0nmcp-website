import type { Metadata } from 'next'
import InstallClient from './InstallClient'

export const metadata: Metadata = {
  title: 'Install 0nMCP — One Command, 1,598+ AI Tools | 0nMCP',
  description: 'Install 0nMCP in Claude Desktop, Cursor, VS Code, Windsurf, or any MCP-compatible tool. One command. 1,598+ tools across 106 services. Free.',
  keywords: ['install 0nMCP', 'MCP server', 'Claude Desktop MCP', 'Cursor MCP', 'AI tools', 'API orchestration'],
  openGraph: {
    title: 'Install 0nMCP — 1,598+ AI Tools in One Command',
    description: 'Pick your platform. Paste one config. Get 1,598+ tools across 106 services instantly.',
    url: 'https://0nmcp.com/install',
  },
}

export default function InstallPage() {
  return <InstallClient />
}
