import type { Metadata } from 'next'
import SetupWizard from '@/components/SetupWizard'

export const metadata: Metadata = {
  title: 'Setup 0nMCP — Get Started in 60 Seconds',
  description: 'Install 0nMCP on Claude, Slack, ChatGPT, or WordPress. 1,589 tools across 102 services in under a minute.',
}

export default function SetupPage() {
  return <SetupWizard />
}
