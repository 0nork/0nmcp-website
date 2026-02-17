import type { Metadata } from 'next'
import LearnCatalog from './LearnCatalog'

export const metadata: Metadata = {
  title: 'Learn — Master AI Orchestration with 0nMCP',
  description: 'Free courses on 0nMCP, the .0n Standard, workflows, vault, engine, CRM integration, and more. From beginner to enterprise.',
  openGraph: {
    title: 'Learn — 0nMCP',
    description: 'Free courses on AI orchestration. Getting started, workflows, security, integrations.',
    url: 'https://0nmcp.com/learn',
  },
  alternates: { canonical: 'https://0nmcp.com/learn' },
}

export default function LearnPage() {
  return <LearnCatalog />
}
