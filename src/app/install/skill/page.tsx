import type { Metadata } from 'next'
import { SkillInstallClient } from './client'

export const metadata: Metadata = {
  title: 'Add 0nMCP to Claude | 0nMCP',
  description: 'Add 0nMCP to any Claude app in seconds. 850 tools, 53 services — your Vault, workflows, and AI brain, right inside Claude.',
  openGraph: {
    title: 'Add 0nMCP to Claude',
    description: 'Transform Claude into your AI orchestration hub. Works on Desktop, Web, Mobile, and Claude Code.',
    url: 'https://www.0nmcp.com/install/skill',
  },
}

export default function SkillInstallPage() {
  return <SkillInstallClient />
}
