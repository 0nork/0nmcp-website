'use client'

import { useState, useEffect, useMemo } from 'react'
import { SVC } from '@/lib/console/services'
import ServicePaletteItem from './ServicePaletteItem'

// ─── Service type compatible with ServicePaletteItem ──────────────────────
export interface BuilderService {
  id: string
  name: string
  icon: string
  slug: string
  category_id: string
  display_order: number
  status: string
  tool_count: number
  tools: Array<{ id: string; name: string; description: string }>
  logo: string
  brandColor: string
  description_short: string
}

// ─── SVG data URI helper ──────────────────────────────────────────────────
const svg = (paths: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`)}`

// ─── Category icon SVGs ───────────────────────────────────────────────────
const CAT_ICONS = {
  triggers: svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', '%23f97316'),
  actions: svg('<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>', '%2310b981'),
  notifications: svg('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>', '%233b82f6'),
  ai: svg('<circle cx="12" cy="12" r="3"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/>', '%23a855f7'),
  crm_sales: svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', '%23f97316'),
  database: svg('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>', '%2310b981'),
  dev_tools: svg('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', '%2300d4ff'),
  marketing: svg('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>', '%23ec4899'),
  finance: svg('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', '%23eab308'),
  social: svg('<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>', '%233b82f6'),
  productivity: svg('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>', '%2314b8a6'),
  ecommerce: svg('<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>', '%2310b981'),
  cloud: svg('<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>', '%23e2e2e2'),
  logic: svg('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>', '%23a855f7'),
}

// ─── SERVICE_LOGOS ────────────────────────────────────────────────────────
const SERVICE_LOGOS: Record<string, string> = {
  // ─── Real brand logos ───────────────────────────────────────
  stripe: 'https://cdn.simpleicons.org/stripe/635BFF',
  slack: 'https://cdn.simpleicons.org/slack/4A154B',
  discord: 'https://cdn.simpleicons.org/discord/5865F2',
  github: 'https://cdn.simpleicons.org/github/white',
  gmail: 'https://cdn.simpleicons.org/gmail/EA4335',
  google_sheets: 'https://cdn.simpleicons.org/googlesheets/34A853',
  google_drive: 'https://cdn.simpleicons.org/googledrive/4285F4',
  google_calendar: 'https://cdn.simpleicons.org/googlecalendar/4285F4',
  notion: 'https://cdn.simpleicons.org/notion/white',
  airtable: 'https://cdn.simpleicons.org/airtable/18BFFF',
  shopify: 'https://cdn.simpleicons.org/shopify/7AB55C',
  twilio: 'https://cdn.simpleicons.org/twilio/F22F46',
  sendgrid: 'https://cdn.simpleicons.org/sendgrid/1A82E2',
  resend: 'https://cdn.simpleicons.org/resend/white',
  jira: 'https://cdn.simpleicons.org/jira/0052CC',
  hubspot: 'https://cdn.simpleicons.org/hubspot/FF7A59',
  zendesk: 'https://cdn.simpleicons.org/zendesk/03363D',
  mailchimp: 'https://cdn.simpleicons.org/mailchimp/FFE01B',
  zoom: 'https://cdn.simpleicons.org/zoom/0B5CFF',
  linear: 'https://cdn.simpleicons.org/linear/5E6AD2',
  mongodb: 'https://cdn.simpleicons.org/mongodb/47A248',
  openai: 'https://cdn.simpleicons.org/openai/white',
  anthropic: 'https://cdn.simpleicons.org/anthropic/white',
  supabase: 'https://cdn.simpleicons.org/supabase/3FCF8E',
  calendly: 'https://cdn.simpleicons.org/calendly/006BFF',
  microsoft: 'https://cdn.simpleicons.org/microsoft/white',
  crm: 'https://cdn.simpleicons.org/rocket/ff6b35',
  whatsapp: 'https://cdn.simpleicons.org/whatsapp/25D366',
  linkedin: 'https://cdn.simpleicons.org/linkedin/0A66C2',
  instagram: 'https://cdn.simpleicons.org/instagram/E4405F',
  twitter: 'https://cdn.simpleicons.org/x/white',
  tiktok: 'https://cdn.simpleicons.org/tiktok/white',
  clickup: 'https://cdn.simpleicons.org/clickup/7B68EE',
  asana: 'https://cdn.simpleicons.org/asana/F06A6A',
  square: 'https://cdn.simpleicons.org/square/006AFF',
  plaid: 'https://cdn.simpleicons.org/plaid/white',
  quickbooks: 'https://cdn.simpleicons.org/quickbooks/2CA01C',
  outlook: 'https://cdn.simpleicons.org/microsoftoutlook/0078D4',
  dropbox: 'https://cdn.simpleicons.org/dropbox/0061FF',
  gemini: 'https://cdn.simpleicons.org/googlegemini/4285F4',
  perplexity: 'https://cdn.simpleicons.org/perplexity/20B8CD',
  salesforce: 'https://cdn.simpleicons.org/salesforce/00A1E0',
  pipedrive: 'https://cdn.simpleicons.org/pipedrive/017737',
  intercom: 'https://cdn.simpleicons.org/intercom/286EFA',

  // ─── New service logos ──────────────────────────────────────
  gohighlevel: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#38b2ac"/><text x="20" y="25" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="white">GHL</text></svg>`)}`,
  cohere: 'https://cdn.simpleicons.org/cohere/39594D',
  mistral: 'https://cdn.simpleicons.org/mistral/F97316',
  replicate: 'https://cdn.simpleicons.org/replicate/white',
  stability: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9" fill="#a855f7"/></svg>`)}`,
  elevenlabs: 'https://cdn.simpleicons.org/elevenlabs/white',
  deepgram: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#13ef93" stroke-width="2" stroke-linecap="round"><line x1="4" y1="12" x2="4" y2="12"/><line x1="8" y1="8" x2="8" y2="16"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="16" y1="9" x2="16" y2="15"/><line x1="20" y1="11" x2="20" y2="13"/></svg>`)}`,
  groq: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f55036" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`)}`,
  planetscale: 'https://cdn.simpleicons.org/planetscale/white',
  neon: 'https://cdn.simpleicons.org/neon/00E599',
  turso: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#4ff8d2"/></svg>`)}`,
  cockroachdb: 'https://cdn.simpleicons.org/cockroachlabs/6933FF',
  telegram: 'https://cdn.simpleicons.org/telegram/26A5E4',
  postmark: 'https://cdn.simpleicons.org/postmark/FFDE00',
  mailgun: 'https://cdn.simpleicons.org/mailgun/F06B54',
  convertkit: 'https://cdn.simpleicons.org/convertkit/FB6970',
  brevo: 'https://cdn.simpleicons.org/brevo/0B996E',
  activecampaign: 'https://cdn.simpleicons.org/activecampaign/004CFF',
  lemlist: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`)}`,
  smartlead: 'https://cdn.simpleicons.org/maildotru/3B82F6',
  cloudflare: 'https://cdn.simpleicons.org/cloudflare/F38020',
  netlify: 'https://cdn.simpleicons.org/netlify/00C7B7',
  railway: 'https://cdn.simpleicons.org/railway/white',
  render: 'https://cdn.simpleicons.org/render/46E3B7',
  aws: 'https://cdn.simpleicons.org/amazonaws/FF9900',
  gcloud: 'https://cdn.simpleicons.org/googlecloud/4285F4',
  webflow: 'https://cdn.simpleicons.org/webflow/4353FF',
  pinterest: 'https://cdn.simpleicons.org/pinterest/E60023',
  youtube: 'https://cdn.simpleicons.org/youtube/FF0000',
  twitch: 'https://cdn.simpleicons.org/twitch/9146FF',
  xero: 'https://cdn.simpleicons.org/xero/13B5EA',
  wave: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1c6dd0" stroke-width="2" stroke-linecap="round"><path d="M2 12c2-3 4-6 6-3s4 6 6 3 4-6 6-3"/></svg>`)}`,
  monday: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#FF3D57"/></svg>`)}`,
  figma: 'https://cdn.simpleicons.org/figma/F24E1E',
  typeform: 'https://cdn.simpleicons.org/typeform/262627',
  loom: 'https://cdn.simpleicons.org/loom/625DF5',
  freshdesk: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#25C16F"/></svg>`)}`,
  woocommerce: 'https://cdn.simpleicons.org/woocommerce/96588A',
  bigcommerce: 'https://cdn.simpleicons.org/bigcommerce/121118',
  wordpress: 'https://cdn.simpleicons.org/wordpress/21759B',
  docusign: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#463688" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`)}`,
  trello: 'https://cdn.simpleicons.org/trello/0079BF',
  make: 'https://cdn.simpleicons.org/make/6D00CC',
  vercel: 'https://cdn.simpleicons.org/vercel/white',
  whimsical: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#a855f7"/></svg>`)}`,
  mcpfed: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#7c3aed"/><text x="20" y="25" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="white">MCP</text></svg>`)}`,

  // ─── Logic / Control Flow nodes (SVG data URIs) ─────────────
  delay: svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', '%23f59e0b'),
  schedule: svg('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', '%234285F4'),
  condition: svg('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>', '%2322d3ee'),
  loop: svg('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>', '%23a855f7'),
  transform: svg('<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>', '%2310b981'),
  trigger: svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', '%23f97316'),
  error_handling: svg('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', '%23ef4444'),
}

// ─── 14 Builder Categories ────────────────────────────────────────────────
interface BuilderCategory {
  id: string
  label: string
  icon: string
  color: string
  serviceIds: string[]
}

const BUILDER_CATEGORIES: BuilderCategory[] = [
  {
    id: 'triggers',
    label: 'Triggers',
    icon: CAT_ICONS.triggers,
    color: '#f97316',
    serviceIds: ['trigger', 'schedule'],
  },
  {
    id: 'actions',
    label: 'Actions',
    icon: CAT_ICONS.actions,
    color: '#10b981',
    serviceIds: ['transform'],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: CAT_ICONS.notifications,
    color: '#3b82f6',
    serviceIds: ['slack', 'discord', 'twilio', 'whatsapp', 'telegram'],
  },
  {
    id: 'ai',
    label: 'AI',
    icon: CAT_ICONS.ai,
    color: '#a855f7',
    serviceIds: ['anthropic', 'openai', 'gemini', 'perplexity', 'cohere', 'mistral', 'replicate', 'stability', 'elevenlabs', 'deepgram', 'groq'],
  },
  {
    id: 'crm_sales',
    label: 'CRM & Sales',
    icon: CAT_ICONS.crm_sales,
    color: '#f97316',
    serviceIds: ['crm', 'gohighlevel', 'hubspot', 'salesforce', 'pipedrive', 'intercom', 'freshdesk', 'zendesk'],
  },
  {
    id: 'database',
    label: 'Database',
    icon: CAT_ICONS.database,
    color: '#10b981',
    serviceIds: ['supabase', 'mongodb', 'airtable', 'planetscale', 'neon', 'turso', 'cockroachdb'],
  },
  {
    id: 'dev_tools',
    label: 'Dev Tools',
    icon: CAT_ICONS.dev_tools,
    color: '#00d4ff',
    serviceIds: ['github', 'linear', 'jira', 'webflow', 'mcpfed'],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: CAT_ICONS.marketing,
    color: '#ec4899',
    serviceIds: ['mailchimp', 'sendgrid', 'resend', 'gmail', 'outlook', 'postmark', 'mailgun', 'convertkit', 'brevo', 'activecampaign', 'lemlist', 'smartlead'],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: CAT_ICONS.finance,
    color: '#eab308',
    serviceIds: ['stripe', 'square', 'plaid', 'quickbooks', 'xero', 'wave'],
  },
  {
    id: 'social',
    label: 'Social',
    icon: CAT_ICONS.social,
    color: '#3b82f6',
    serviceIds: ['linkedin', 'instagram', 'twitter', 'tiktok', 'pinterest', 'youtube', 'twitch'],
  },
  {
    id: 'productivity',
    label: 'Productivity',
    icon: CAT_ICONS.productivity,
    color: '#14b8a6',
    serviceIds: ['notion', 'clickup', 'asana', 'whimsical', 'monday', 'figma', 'typeform', 'loom', 'docusign', 'trello', 'google_sheets', 'google_calendar', 'calendly'],
  },
  {
    id: 'ecommerce',
    label: 'Ecommerce',
    icon: CAT_ICONS.ecommerce,
    color: '#10b981',
    serviceIds: ['shopify', 'woocommerce', 'bigcommerce', 'wordpress'],
  },
  {
    id: 'cloud',
    label: 'Cloud',
    icon: CAT_ICONS.cloud,
    color: '#e2e2e2',
    serviceIds: ['vercel', 'cloudflare', 'netlify', 'railway', 'render', 'aws', 'gcloud', 'azure', 'microsoft', 'dropbox', 'google_drive'],
  },
  {
    id: 'logic',
    label: 'Logic',
    icon: CAT_ICONS.logic,
    color: '#a855f7',
    serviceIds: ['delay', 'condition', 'loop', 'error_handling'],
  },
]

// ─── Logic/control flow service definitions (not in SVC) ──────────────────
const LOGIC_SERVICES: Record<string, { name: string; description: string; color: string }> = {
  trigger: { name: 'Trigger', description: 'Start a workflow from an event', color: '#f97316' },
  schedule: { name: 'Schedule', description: 'Run on a timed schedule', color: '#4285F4' },
  transform: { name: 'Transform', description: 'Transform and reshape data', color: '#10b981' },
  delay: { name: 'Delay', description: 'Wait for a specified duration', color: '#f59e0b' },
  condition: { name: 'Condition', description: 'Branch based on conditions', color: '#22d3ee' },
  loop: { name: 'Loop', description: 'Iterate over items', color: '#a855f7' },
  error_handling: { name: 'Error Handler', description: 'Catch and handle errors', color: '#ef4444' },
}

// ─── Build a BuilderService from SVC data or logic definitions ────────────
function buildService(id: string): BuilderService {
  const svcEntry = SVC[id]
  if (svcEntry) {
    return {
      id,
      name: svcEntry.l,
      icon: '',
      slug: id,
      category_id: svcEntry.cat,
      display_order: svcEntry.pri,
      status: 'live',
      tool_count: svcEntry.cap.length || 8,
      tools: svcEntry.cap.map((c, i) => ({ id: `${id}_${i}`, name: c, description: c })),
      logo: SERVICE_LOGOS[id] || '',
      brandColor: svcEntry.c,
      description_short: svcEntry.d,
    }
  }

  const logic = LOGIC_SERVICES[id]
  if (logic) {
    return {
      id,
      name: logic.name,
      icon: '',
      slug: id,
      category_id: 'logic',
      display_order: 0,
      status: 'live',
      tool_count: 1,
      tools: [{ id: `${id}_run`, name: logic.name, description: logic.description }],
      logo: SERVICE_LOGOS[id] || '',
      brandColor: logic.color,
      description_short: logic.description,
    }
  }

  // Fallback for unknown services
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    icon: '',
    slug: id,
    category_id: 'unknown',
    display_order: 999,
    status: 'live',
    tool_count: 8,
    tools: [],
    logo: SERVICE_LOGOS[id] || '',
    brandColor: '#666666',
    description_short: '',
  }
}

// ─── Pre-build all services ───────────────────────────────────────────────
const ALL_BUILDER_SERVICES: Record<string, BuilderService> = {}
const allServiceIds = new Set<string>()
for (const cat of BUILDER_CATEGORIES) {
  for (const sid of cat.serviceIds) {
    allServiceIds.add(sid)
  }
}
for (const sid of allServiceIds) {
  ALL_BUILDER_SERVICES[sid] = buildService(sid)
}

// ─── Component ────────────────────────────────────────────────────────────
export default function ServicePalette() {
  const [search, setSearch] = useState('')
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['active', 'triggers', 'ai']))
  const [activeServiceIds, setActiveServiceIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem('0n-vault')
      if (raw) {
        const vault = JSON.parse(raw)
        setActiveServiceIds(new Set(Object.keys(vault)))
      }
    } catch {}
  }, [])

  const allServices = useMemo(() => Object.values(ALL_BUILDER_SERVICES), [])

  const activeServices = useMemo(() => {
    if (activeServiceIds.size === 0) return []
    return allServices.filter((s) => activeServiceIds.has(s.id))
  }, [allServices, activeServiceIds])

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim()

    // Build filtered active services
    let filteredActive = activeServices
    if (q) {
      filteredActive = activeServices.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.tools?.some((t) => t.name.toLowerCase().includes(q))
      )
    }

    // Build filtered regular categories
    const regularCategories = BUILDER_CATEGORIES.map((cat) => {
      const services = cat.serviceIds
        .map((sid) => ALL_BUILDER_SERVICES[sid])
        .filter(Boolean)

      if (!q) return { ...cat, services }

      const filtered = services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.tools?.some((t) => t.name.toLowerCase().includes(q))
      )
      return { ...cat, services: filtered }
    }).filter((cat) => cat.services.length > 0)

    // Prepend active category if it has services
    const result: Array<{
      id: string
      label: string
      icon: string
      color: string
      services: BuilderService[]
      isActive?: boolean
      serviceCount?: number
    }> = []

    if (filteredActive.length > 0) {
      result.push({
        id: 'active',
        label: 'Active',
        icon: svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', '%237ed957'),
        color: '#7ed957',
        services: filteredActive,
        isActive: true,
        serviceCount: filteredActive.length,
      })
    }

    for (const cat of regularCategories) {
      result.push({
        ...cat,
        isActive: false,
        serviceCount: cat.serviceIds.length,
      })
    }

    return result
  }, [activeServices, search])

  function toggleCategory(catId: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }

  return (
    <div className="builder-palette">
      <div className="builder-palette-header">
        <input
          className="builder-palette-search"
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="builder-palette-body">
        {filteredCategories.map((cat) => {
          const isOpen = openCategories.has(cat.id) || search.length > 0
          return (
            <div key={cat.id} className="builder-category">
              <div
                className="builder-category-header"
                onClick={() => toggleCategory(cat.id)}
                style={cat.isActive ? { color: 'var(--accent)' } : { color: cat.color }}
              >
                <span className={`builder-category-chevron${isOpen ? ' open' : ''}`}>
                  &#9654;
                </span>
                <img
                  className="builder-category-icon"
                  src={cat.icon}
                  alt=""
                  width={16}
                  height={16}
                />
                <span>{cat.label}</span>
                {cat.isActive && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#3FCF8E',
                      marginLeft: 6,
                    }}
                  />
                )}
                <span className="builder-category-count">
                  {cat.serviceCount}
                </span>
              </div>
              {isOpen && (
                <div className="builder-category-services">
                  {cat.services.map((service) => (
                    <ServicePaletteItem key={service.id} service={service} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
