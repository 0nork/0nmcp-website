/**
 * GET /api/console/integrations — Returns the user's connected integrations with status.
 *
 * Response: {
 *   integrations: [{ service: "stripe", connected: true, capabilities: [...] }],
 *   connectedCount: number,
 *   totalAvailable: number,
 * }
 *
 * This endpoint checks the user's vault entries (without decrypting) and
 * their CRM sub-location to build a connection status map.
 */

import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getUserVaultServices } from '@/lib/vault-bridge'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** All services the execution engine + 0nMCP can operate on */
const AVAILABLE_SERVICES: Array<{
  service: string
  label: string
  category: string
  capabilities: string[]
}> = [
  {
    service: 'anthropic',
    label: 'Anthropic (Claude)',
    category: 'ai',
    capabilities: ['AI chat', 'workflow generation', 'tool calling'],
  },
  {
    service: 'openai',
    label: 'OpenAI (GPT)',
    category: 'ai',
    capabilities: ['AI chat', 'embeddings', 'image generation'],
  },
  {
    service: 'google',
    label: 'Google (Gemini)',
    category: 'ai',
    capabilities: ['AI chat', 'multimodal analysis'],
  },
  {
    service: 'openrouter',
    label: 'OpenRouter',
    category: 'ai',
    capabilities: ['AI chat gateway', '400+ models'],
  },
  {
    service: 'crm',
    label: 'CRM',
    category: 'crm',
    capabilities: ['contacts', 'pipelines', 'email', 'opportunities', 'calendars'],
  },
  {
    service: 'stripe',
    label: 'Stripe',
    category: 'payments',
    capabilities: ['revenue', 'customers', 'subscriptions', 'invoices', 'balance'],
  },
  {
    service: 'slack',
    label: 'Slack',
    category: 'communication',
    capabilities: ['post messages', 'list channels', 'read messages'],
  },
  {
    service: 'discord',
    label: 'Discord',
    category: 'communication',
    capabilities: ['send messages', 'manage channels'],
  },
  {
    service: 'resend',
    label: 'Resend',
    category: 'email',
    capabilities: ['transactional email', 'email templates'],
  },
  {
    service: 'sendgrid',
    label: 'SendGrid',
    category: 'email',
    capabilities: ['bulk email', 'email campaigns', 'analytics'],
  },
  {
    service: 'twilio',
    label: 'Twilio',
    category: 'communication',
    capabilities: ['SMS', 'voice calls', 'WhatsApp'],
  },
  {
    service: 'github',
    label: 'GitHub',
    category: 'development',
    capabilities: ['repos', 'issues', 'PRs', 'actions'],
  },
  {
    service: 'supabase',
    label: 'Supabase',
    category: 'database',
    capabilities: ['database queries', 'auth', 'storage', 'realtime'],
  },
  {
    service: 'notion',
    label: 'Notion',
    category: 'productivity',
    capabilities: ['pages', 'databases', 'search'],
  },
  {
    service: 'airtable',
    label: 'Airtable',
    category: 'productivity',
    capabilities: ['tables', 'records', 'views'],
  },
  {
    service: 'shopify',
    label: 'Shopify',
    category: 'ecommerce',
    capabilities: ['products', 'orders', 'customers', 'inventory'],
  },
  {
    service: 'smartlead',
    label: 'Smartlead',
    category: 'outreach',
    capabilities: ['campaigns', 'leads', 'sequences', 'analytics'],
  },
  {
    service: 'google_calendar',
    label: 'Google Calendar',
    category: 'productivity',
    capabilities: ['events', 'scheduling', 'availability'],
  },
  {
    service: 'google_sheets',
    label: 'Google Sheets',
    category: 'productivity',
    capabilities: ['read sheets', 'write data', 'formulas'],
  },
  {
    service: 'google_drive',
    label: 'Google Drive',
    category: 'productivity',
    capabilities: ['files', 'folders', 'sharing'],
  },
  {
    service: 'gmail',
    label: 'Gmail',
    category: 'email',
    capabilities: ['send email', 'read inbox', 'labels'],
  },
  {
    service: 'hubspot',
    label: 'HubSpot',
    category: 'crm',
    capabilities: ['contacts', 'deals', 'companies', 'tickets'],
  },
  {
    service: 'linear',
    label: 'Linear',
    category: 'development',
    capabilities: ['issues', 'projects', 'cycles'],
  },
  {
    service: 'vercel',
    label: 'Vercel',
    category: 'development',
    capabilities: ['deployments', 'projects', 'domains'],
  },
  {
    service: 'perplexity',
    label: 'Perplexity',
    category: 'ai',
    capabilities: ['AI search', 'citations', 'research'],
  },
]

export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = /* TODO_GETUSER_MANUAL: review this call — getSession() preferred per Rule 10a */ await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get vault services (no decryption — just check which services have entries)
  const vaultServices = await getUserVaultServices(user.id)
  const connectedSet = new Set(vaultServices)

  // Build integration status list
  const integrations = AVAILABLE_SERVICES.map(svc => ({
    service: svc.service,
    label: svc.label,
    category: svc.category,
    connected: connectedSet.has(svc.service),
    capabilities: svc.capabilities,
  }))

  const connectedCount = integrations.filter(i => i.connected).length

  return NextResponse.json({
    integrations,
    connectedCount,
    totalAvailable: AVAILABLE_SERVICES.length,
  })
}
