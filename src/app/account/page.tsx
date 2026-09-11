import { withCro9Meta } from '@/lib/cro9-meta'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export default function AccountRedirect() {
  redirect('/console')
}

export async function generateMetadata(): Promise<Metadata> {
  return withCro9Meta('/account', {})
}
