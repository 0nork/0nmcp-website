import type { Metadata } from 'next'
import ForumHome from './ForumHome'

export const metadata: Metadata = {
  title: 'Forum — 0nMCP Community Discussions',
  description: 'Ask questions, share automations, discuss AI orchestration. The 0nMCP community forum.',
  openGraph: {
    title: 'Forum — 0nMCP Community',
    description: 'Ask questions, share automations, discuss AI orchestration.',
    url: 'https://0nmcp.com/forum',
  },
  alternates: { canonical: 'https://0nmcp.com/forum' },
}

export default function ForumPage() {
  return <ForumHome />
}
