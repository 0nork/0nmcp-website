import { withCro9Meta } from '@/lib/cro9-meta'
import type { Metadata } from 'next'
import InstallClient from '../install/InstallClient'

export default function Install0nPage() {
  return <InstallClient />
}

export async function generateMetadata(): Promise<Metadata> {
  return withCro9Meta('/install0n', {})
}
