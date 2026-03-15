import { getAllServices } from '@/lib/sxo-helpers'
import { SERVICE_LOGOS } from '@/components/builder/ServicePalette'
import type { ServiceActionGroup } from '../types'

/** Brand colors for services — matches SERVICE_LOGOS palette */
const SERVICE_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  twitter: '#ffffff',
  linkedin: '#0A66C2',
  whatsapp: '#25D366',
  tiktok: '#ffffff',
  slack: '#4A154B',
  discord: '#5865F2',
  gmail: '#EA4335',
  twilio: '#F22F46',
  stripe: '#635BFF',
  shopify: '#7AB55C',
  crm: '#ff6b35',
  hubspot: '#FF7A59',
  google_sheets: '#34A853',
  google_drive: '#4285F4',
  google_calendar: '#4285F4',
  notion: '#ffffff',
  supabase: '#3FCF8E',
  airtable: '#18BFFF',
  mongodb: '#47A248',
  openai: '#ffffff',
  anthropic: '#ffffff',
  github: '#ffffff',
  linear: '#5E6AD2',
  jira: '#0052CC',
  zendesk: '#03363D',
  sendgrid: '#1A82E2',
  mailchimp: '#FFE01B',
  zoom: '#0B5CFF',
  calendly: '#006BFF',
  microsoft: '#ffffff',
  intercom: '#286EFA',
  quickbooks: '#2CA01C',
}

/** Categories to display in the action column — in order */
const DISPLAY_CATEGORIES: { id: string; label: string; serviceIds: string[] }[] = [
  {
    id: 'social',
    label: 'Social Media',
    serviceIds: ['instagram', 'twitter', 'linkedin', 'whatsapp', 'tiktok'],
  },
  {
    id: 'communication',
    label: 'Communication',
    serviceIds: ['slack', 'discord', 'gmail', 'twilio', 'sendgrid'],
  },
  {
    id: 'business',
    label: 'Business',
    serviceIds: ['stripe', 'shopify', 'crm', 'hubspot', 'calendly'],
  },
  {
    id: 'data',
    label: 'Data & Tools',
    serviceIds: ['google_sheets', 'notion', 'supabase', 'airtable', 'mongodb'],
  },
  {
    id: 'ai',
    label: 'AI',
    serviceIds: ['anthropic', 'openai'],
  },
  {
    id: 'dev',
    label: 'Developer',
    serviceIds: ['github', 'linear', 'jira'],
  },
]

let _cached: ServiceActionGroup[] | null = null

export function getServiceActionGroups(): ServiceActionGroup[] {
  if (_cached) return _cached

  const allServices = getAllServices()
  const serviceMap = new Map(allServices.map((s) => [s.id, s]))

  _cached = DISPLAY_CATEGORIES.map((cat) => ({
    category: cat.label,
    services: cat.serviceIds
      .filter((sid) => serviceMap.has(sid) && SERVICE_LOGOS[sid])
      .map((sid) => {
        const svc = serviceMap.get(sid)!
        return {
          id: sid,
          name: svc.name,
          logo: SERVICE_LOGOS[sid],
          color: SERVICE_COLORS[sid] ?? '#7ed957',
          tools: (svc.tools ?? []).map((t: { id: string; name: string }) => ({
            id: t.id,
            name: t.name,
          })),
        }
      })
      .filter((s) => s.tools.length > 0),
  })).filter((g) => g.services.length > 0)

  return _cached
}
