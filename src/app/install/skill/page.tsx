import type { Metadata } from 'next'
import { STATS_DISPLAY } from '@/data/stats'
import { SkillInstallClient } from './client'

export const metadata: Metadata = {
  title: 'Add 0nMCP to Claude | 0nMCP',
  description: `Add 0nMCP to any Claude app in seconds. ${STATS_DISPLAY.tools} tools, ${STATS_DISPLAY.services} services — your Vault, workflows, and AI brain, right inside Claude.`,
  openGraph: {
    title: 'Add 0nMCP to Claude',
    description: 'Transform Claude into your AI orchestration hub. Works on Desktop, Web, Mobile, and Claude Code.',
    url: 'https://www.0nmcp.com/install/skill',
  },
}

export default function SkillInstallPage() {
  return <SkillInstallClient />
}
