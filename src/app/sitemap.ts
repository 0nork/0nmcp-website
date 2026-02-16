import { MetadataRoute } from 'next'
import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'


export default function sitemap(): MetadataRoute.Sitemap {
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
    '/products/social0n',
    '/products/app0n',
    '/products/web0n',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : path === '/turn-it-on' ? 0.95 : 0.7,
  }))

  // Service hub pages (26)
  const servicePages = servicesData.services.map((s) => ({
    url: `${base}/turn-it-on/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Capability pages (126)
  const capabilityPages = capabilitiesData.capabilities.map((c) => ({
    url: `${base}/turn-it-on/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...servicePages, ...capabilityPages]
}
