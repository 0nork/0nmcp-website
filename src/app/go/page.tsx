import type { Metadata } from 'next'
import GoClient from './GoClient'

export const metadata: Metadata = {
  title: '0n Console — Control All Your Business Tools From One Screen',
  description:
    'Stop switching between 15 apps. 0n Console connects your CRM, email, payments, social media, and 44 other services into one AI-powered dashboard. Sign up free.',
  openGraph: {
    title: '0n Console — Control All Your Business Tools From One Screen',
    description:
      'Stop switching between 15 apps. One dashboard controls your CRM, email, payments, and 45 more services.',
    url: 'https://0nmcp.com/go',
    siteName: '0nMCP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '0n Console — One Dashboard For Everything',
    description: 'Connect 48 services. Type what you want. It does it.',
  },
  robots: { index: false, follow: false },
}

export default function GoPage() {
  return <GoClient />
}
