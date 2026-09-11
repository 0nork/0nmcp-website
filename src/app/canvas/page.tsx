import { withCro9Meta } from '@/lib/cro9-meta'
import type { Metadata } from 'next'
import CanvasClient from './CanvasClient'

const metadataBase: Metadata = {
  title: '0n Canvas — Interactive Site Architecture Viewer',
  description: 'Visualize any website structure as an interactive flowchart. Scan URLs, explore connections, and export as .0n files.',
}

export default function CanvasPage() {
  return <CanvasClient />
}

export async function generateMetadata(): Promise<Metadata> {
  return withCro9Meta('/canvas', metadataBase)
}
