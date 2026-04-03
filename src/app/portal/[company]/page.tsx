import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import PortalShell from './PortalShell'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function getVipAccount(slug: string) {
  if (!supabaseUrl || !serviceRoleKey) return null
  const admin = createClient(supabaseUrl, serviceRoleKey)
  const { data } = await admin
    .from('vip_accounts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ company: string }> }): Promise<Metadata> {
  const { company } = await params
  const account = await getVipAccount(company)
  return {
    title: account ? `${account.company_name} — Portal` : 'VIP Portal — 0nMCP',
    robots: { index: false, follow: false },
  }
}

export default async function VipPortalPage({ params }: { params: Promise<{ company: string }> }) {
  const { company } = await params
  const account = await getVipAccount(company)
  if (!account) notFound()

  return <PortalShell account={JSON.parse(JSON.stringify(account))} />
}
