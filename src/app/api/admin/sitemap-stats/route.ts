import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'
import glossaryData from '@/data/glossary.json'
import comparisonsData from '@/data/comparisons.json'

export const dynamic = 'force-dynamic'

const logicServices = ['delay', 'schedule', 'condition', 'loop', 'transform', 'trigger', 'error_handling']

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET() {
  const services = servicesData.services.filter(s => !logicServices.includes(s.id)).length
  const capabilities = capabilitiesData.capabilities.length
  const glossary = glossaryData.terms.length
  const comparisons = comparisonsData.comparisons.length
  const integrations = services

  let threads = 0, profiles = 0, groups = 0, listings = 0, lessons = 0

  const admin = getAdmin()
  if (admin) {
    const [t, p, g, l] = await Promise.all([
      admin.from('community_threads').select('id', { count: 'exact', head: true }),
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('community_groups').select('id', { count: 'exact', head: true }),
      admin.from('store_listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ])
    threads = t.count || 0
    profiles = p.count || 0
    groups = g.count || 0
    listings = l.count || 0
  }

  return NextResponse.json({
    services,
    capabilities,
    integrations,
    glossary,
    comparisons,
    threads,
    profiles,
    groups,
    listings,
    lessons,
  })
}
