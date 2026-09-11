import type { Metadata } from 'next'
import { withCro9Meta } from '@/lib/cro9-meta'
import PageClient from './page-client'

/** Server shell so CRO9's approved meta can render; the page itself is unchanged in ./page-client.tsx */
export async function generateMetadata(): Promise<Metadata> {
  return withCro9Meta('/ai', {})
}

export default function Page() {
  return <PageClient />
}
