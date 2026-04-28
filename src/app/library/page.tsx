import type { Metadata } from 'next'
import LibraryClient from './LibraryClient'

export const metadata: Metadata = {
  title: 'The 0n Component Library — every building block in the system',
  description:
    'Browse every building block in the 0n design system. Curated names, live previews, one consistent surface across every 0n product.',
  alternates: { canonical: 'https://www.0nmcp.com/library' },
  openGraph: {
    title: 'The 0n Component Library',
    description: 'Every building block in the 0n design system. Curated. Live. Consistent.',
    url: 'https://www.0nmcp.com/library',
    type: 'website',
  },
}

export default function LibraryPage() {
  return <LibraryClient />
}
