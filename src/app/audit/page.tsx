import { withCro9Meta } from '@/lib/cro9-meta'
import type { Metadata } from 'next'
import AuditClient from './AuditClient'

const metadataBase: Metadata = {
  title: 'Free AI Website Audit — SXO Score in 5 Seconds | 0nMCP',
  description: 'Instant website audit: speed, SEO, security, mobile, schema, Open Graph. Get your SXO score with actionable fixes. Free, no signup required.',
  keywords: ['website audit', 'SEO audit', 'site speed test', 'SXO audit', 'free website checker', 'security headers check', 'schema validation', 'Open Graph checker'],
  openGraph: {
    title: 'Free AI Website Audit — Get Your SXO Score',
    description: 'Speed, SEO, security, mobile, schema — 10 checks in 5 seconds. Free.',
    url: 'https://www.0nmcp.com/audit',
  },
  alternates: { canonical: 'https://www.0nmcp.com/audit' },
}

export default function AuditPage() {
  return <AuditClient />
}

export async function generateMetadata(): Promise<Metadata> {
  return withCro9Meta('/audit', metadataBase)
}
