import type { Metadata } from 'next'
import CanvasClient from './CanvasClient'

export const metadata: Metadata = {
  title: '0n Canvas — Interactive Site Architecture Viewer',
  description: 'Visualize any website structure as an interactive flowchart. Scan URLs, explore connections, and export as .0n files.',
}

export default function CanvasPage() {
  return <CanvasClient />
}
