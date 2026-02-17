import type { Metadata } from 'next'
import DemoBuilder from './DemoBuilder'

export const metadata: Metadata = {
  title: 'Interactive Demo — Build Your First RUN | 0nMCP',
  description:
    'Experience the power of 0nMCP. Build your first automation RUN in 60 seconds. No signup required.',
}

export default function DemoPage() {
  return <DemoBuilder />
}
