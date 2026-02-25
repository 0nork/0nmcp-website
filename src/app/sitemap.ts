import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'
import glossaryData from '@/data/glossary.json'
import comparisonsData from '@/data/comparisons.json'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const logicServices = ['delay', 'schedule', 'condition', 'loop', 'transform', 'trigger', 'error_handling']

function getAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://0nmcp.com'

  // Static pages
  const staticPages = [
    '',
    '/0n-standard',
    '/community',
    '/sponsor',
    '/legal',
    '/report',
    '/examples',
    '/builder',
    '/downloads',
    '/app',
    '/turn-it-on',
    '/login',
    '/signup',
    '/store/onork-mini',
    '/partners',
    '/learn',
    '/forum',
    '/products/social0n',
    '/products/app0n',
    '/products/web0n',
    '/convert',
    '/convert/openai',
    '/convert/gemini',
    '/convert/openclaw',
    '/glossary',
    '/compare',
    '/integrations',
    '/security',
    '/security/vault',
    '/security/layers',
    '/security/escrow',
    '/security/seal-of-truth',
    '/security/transfer',
    '/security/patent',
    '/connect',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : path === '/turn-it-on' ? 0.95 : path.startsWith('/convert') ? 0.9 : 0.7,
  }))

  // Service hub pages (26)
  const servicePages = servicesData.services.map((s) => ({
    url: `${base}/turn-it-on/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Capability pages (80+)
  const capabilityPages = capabilitiesData.capabilities.map((c) => ({
    url: `${base}/turn-it-on/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Glossary term pages (80)
  const glossaryPages = glossaryData.terms.map((t) => ({
    url: `${base}/glossary/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Comparison pages (12)
  const comparisonPages = comparisonsData.comparisons.map((c) => ({
    url: `${base}/compare/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  // Integration pages (26)
  const integrationPages = servicesData.services
    .filter((s) => !logicServices.includes(s.id))
    .map((s) => ({
      url: `${base}/integrations/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))

  // Dynamic forum threads + profiles + groups
  let threadPages: MetadataRoute.Sitemap = []
  let profilePages: MetadataRoute.Sitemap = []
  let groupPages: MetadataRoute.Sitemap = []

  const admin = getAdmin()
  if (admin) {
    const [threadsResult, profilesResult, groupsResult] = await Promise.all([
      admin
        .from('community_threads')
        .select('slug, last_reply_at, created_at')
        .order('created_at', { ascending: false })
        .limit(5000),
      admin
        .from('profiles')
        .select('id, created_at')
        .eq('onboarding_completed', true)
        .limit(5000),
      admin
        .from('community_groups')
        .select('slug')
        .order('thread_count', { ascending: false }),
    ])

    if (threadsResult.data) {
      threadPages = threadsResult.data.map((t) => ({
        url: `${base}/forum/${t.slug}`,
        lastModified: t.last_reply_at ? new Date(t.last_reply_at) : new Date(t.created_at),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }))
    }

    if (profilesResult.data) {
      profilePages = profilesResult.data.map((p) => ({
        url: `${base}/u/${p.id}`,
        lastModified: new Date(p.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }))
    }

    if (groupsResult.data) {
      groupPages = groupsResult.data.map((g) => ({
        url: `${base}/forum/c/${g.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }))
    }
  }

  return [
    ...staticPages,
    ...servicePages,
    ...capabilityPages,
    ...glossaryPages,
    ...comparisonPages,
    ...integrationPages,
    ...groupPages,
    ...threadPages,
    ...profilePages,
  ]
}
