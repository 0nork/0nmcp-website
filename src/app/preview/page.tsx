import { withCro9Meta } from '@/lib/cro9-meta'
import type { Metadata } from 'next'
import HomeRedesign from '../HomeRedesign'

const metadataBase = {
  title: '0nMCP — Homepage Preview',
  robots: { index: false },
}

export default function PreviewPage() {
  return <HomeRedesign />
}

export async function generateMetadata(): Promise<Metadata> {
  return withCro9Meta('/preview', metadataBase)
}
