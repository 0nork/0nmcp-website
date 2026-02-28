import type { Metadata } from 'next'
import BuilderLoader from '@/components/builder/BuilderLoader'

export const metadata: Metadata = {
  title: 'Workflow Builder — 0nMCP',
  description:
    'Visual drag-and-drop editor for .0n workflows. Connect 48 services, configure steps, and export valid .0n files — all in your browser.',
  openGraph: {
    title: 'Workflow Builder — 0nMCP',
    description:
      'Visual drag-and-drop editor for .0n workflows. Connect 48 services, configure steps, and export valid .0n files.',
    url: 'https://0nmcp.com/builder',
    siteName: '0nMCP',
    type: 'website',
  },
}

export default function BuilderPage() {
  return <BuilderLoader />
}
