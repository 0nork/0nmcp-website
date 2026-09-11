import { withCro9Meta } from '@/lib/cro9-meta'
import type { Metadata } from 'next'
import ConsoleIntegrationsPage from '@/app/(dashboard)/console/integrations/page'

export default function DashboardConnectPage() {
  return <ConsoleIntegrationsPage />
}

export async function generateMetadata(): Promise<Metadata> {
  return withCro9Meta('/dashboard/connect', {})
}
