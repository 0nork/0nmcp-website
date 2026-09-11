import { withCro9Meta } from '@/lib/cro9-meta'
import type { Metadata } from 'next'
import DemoBuilder from './DemoBuilder'

const metadataBase: Metadata = {
  title: 'Interactive Demo — Build Your First RUN | 0nMCP',
  description:
    'Experience the power of 0nMCP. Build your first automation RUN in 60 seconds. No signup required.',
}

export default function DemoPage() {
  return <DemoBuilder />
}

export async function generateMetadata(): Promise<Metadata> {
  return withCro9Meta('/demo', metadataBase)
}
