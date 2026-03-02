import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { decryptVaultData } from '@/lib/vault-crypto'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ONMCP_URL = process.env.ONMCP_URL || 'http://localhost:3001'
const PLATFORM_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ''

const SYSTEM_PROMPT =
  'You are 0n Console, the AI assistant for the 0nMCP ecosystem — a universal AI API orchestrator with 819 tools across 48 services in 21 categories.\n\n' +
  'You help users with:\n' +
  '- Workflow automation (.0n SWITCH files, RUNs)\n' +
  '- Service connections (Vault credential management)\n' +
  '- Cold email outreach (Smartlead integration)\n' +
  '- Social media management\n' +
  '- CRM operations (contacts, pipelines, conversations)\n' +
  '- AI orchestration across Claude, GPT, Gemini, Perplexity\n\n' +
  'Available services include: CRM, Stripe, SendGrid, Slack, Discord, Twilio, GitHub, Shopify, OpenAI, Anthropic, Gmail, Google Sheets, Google Drive, Airtable, Notion, MongoDB, Supabase, Zendesk, Jira, HubSpot, Mailchimp, Google Calendar, Calendly, Zoom, Linear, Microsoft, Smartlead, Facebook Ads, Zapier, and more.\n\n' +
  'Key features:\n' +
  '- Three-Level Execution: Pipeline > Assembly Line > Radial Burst\n' +
  '- 0nVault: AES-256-GCM encrypted credential storage\n' +
  '- Visual Builder: Drag-and-drop workflow creation\n' +
  '- Store: Marketplace for pre-built automation templates\n' +
  '- BYOK: Users bring their own API keys via the Vault\n\n' +
  'Be concise, technical, and helpful. Use markdown formatting. When users ask about tools or services, give specific actionable guidance.'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Get the user's personal Anthropic API key from their Vault.
 * BYOK (Bring Your Own Key) — user connects their own key, chat always works.
 */
async function getUserAnthropicKey(userId: string): Promise<string | null> {
  try {
    const admin = getAdmin()
    const { data: row } = await admin
      .from('user_vaults')
      .select('encrypted_key, iv, salt')
      .eq('user_id', userId)
      .eq('service_name', 'anthropic')
      .maybeSingle()

    if (!row?.encrypted_key || !row?.iv || !row?.salt) return null

    const plaintext = await decryptVaultData(userId, row.encrypted_key, row.iv, row.salt)
    try {
      const parsed = JSON.parse(plaintext)
      return parsed.api_key || null
    } catch {
      return plaintext || null
    }
  } catch {
    return null
  }
}

/**
 * Call the Anthropic API with a given key.
 */
async function callClaude(apiKey: string, message: string): Promise<{ text: string; source: 'claude-byok' | 'claude' } | null> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }],
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) return null

    const data = await res.json()
    const text = data.content?.[0]?.type === 'text'
      ? data.content[0].text
      : null

    return text ? { text, source: 'claude-byok' } : null
  } catch {
    return null
  }
}

// ── Smart Local Fallback ──────────────────────────────────────
// Handles common questions without any external API call.

const LOCAL_KNOWLEDGE: Record<string, string> = {
  // Help & Getting Started
  'help': '**0n Console Commands**\n\n' +
    '`/chat` — AI assistant\n' +
    '`/vault` — Manage API keys & credentials\n' +
    '`/builder` — Visual workflow builder\n' +
    '`/flows` — Create automations\n' +
    '`/smartlead` — Cold email campaigns\n' +
    '`/social` — Social media management\n' +
    '`/store` — Marketplace templates\n' +
    '`/operations` — Active automations\n' +
    '`/terminal` — Web terminal\n' +
    '`/reporting` — Analytics & reports\n' +
    '`/convert` — Convert configs between platforms\n' +
    '`/status` — Check 0nMCP health\n\n' +
    'Type any command or describe what you want to automate.',

  'getting started': '**Getting Started with 0n Console**\n\n' +
    '1. **Connect Services** — Go to `/vault` and add API keys for the services you use\n' +
    '2. **Explore the Store** — Browse `/store` for pre-built automation templates\n' +
    '3. **Build Workflows** — Use `/builder` to visually create automations\n' +
    '4. **Run Operations** — Deploy and monitor in `/operations`\n\n' +
    '0nMCP supports **819 tools** across **48 services**. Start by connecting your most-used services in the Vault.',

  // Services
  'services': '**48 Connected Services**\n\n' +
    '**AI**: Anthropic (Claude), OpenAI (GPT), Google (Gemini), Perplexity\n' +
    '**CRM**: CRM (245 tools), HubSpot, Salesforce\n' +
    '**Email**: SendGrid, Gmail, Outlook, Smartlead\n' +
    '**Communication**: Slack, Discord, Twilio, WhatsApp\n' +
    '**Payments**: Stripe\n' +
    '**Development**: GitHub, Vercel, Supabase, MongoDB\n' +
    '**Productivity**: Notion, Airtable, ClickUp, Linear, Jira\n' +
    '**Marketing**: Mailchimp, Facebook Ads, Smartlead\n' +
    '**Calendar**: Google Calendar, Calendly, Zoom\n' +
    '**Other**: Google Drive, Google Sheets, Shopify, Zendesk, Zapier\n\n' +
    'Connect any service via the **Vault** (`/vault`).',

  // Smartlead
  'smartlead': '**Smartlead Integration**\n\n' +
    'Cold email outreach platform with 12 tools:\n' +
    '- **Campaigns** — Create, list, get, update campaigns\n' +
    '- **Leads** — Add, list, get leads per campaign\n' +
    '- **Sequences** — Create and list email sequences\n' +
    '- **Email Accounts** — Add and list sending accounts\n' +
    '- **Analytics** — Campaign performance stats\n\n' +
    'Go to `/smartlead` to manage campaigns, or connect your API key in `/vault` first.',

  // Vault
  'vault': '**0nVault — Encrypted Credential Storage**\n\n' +
    'Your API keys are encrypted with AES-256-GCM + PBKDF2 (100K iterations).\n\n' +
    '- Keys are encrypted client-side before storage\n' +
    '- Each service has its own encrypted entry\n' +
    '- Only YOU can decrypt your keys (derived from your user ID)\n\n' +
    'Go to `/vault` to connect services. Your keys power the Builder, Chat, and all automations.',

  // Builder
  'builder': '**Visual Workflow Builder**\n\n' +
    'Drag-and-drop workflow creation with:\n' +
    '- **Service palette** — All 48 services available as draggable nodes\n' +
    '- **Step configuration** — Set inputs, outputs, conditions per step\n' +
    '- **Connection lines** — Visual data flow between steps\n' +
    '- **Export** — Download as `.0n` SWITCH file\n' +
    '- **Import** — Load templates from the Store\n\n' +
    'Go to `/builder` to start building.',

  // 0nMCP
  '0nmcp': '**0nMCP — Universal AI API Orchestrator**\n\n' +
    '- **819 tools** across **48 services** in **21 categories**\n' +
    '- **Three-Level Execution**: Pipeline > Assembly Line > Radial Burst\n' +
    '- **Patent Pending**: US Provisional #63/990,046 (Vault Container)\n' +
    '- **.0n Standard**: Universal portable config format\n' +
    '- **BYOK**: Bring your own API keys\n' +
    '- **Open Source**: MIT licensed, npm install `0nmcp`\n\n' +
    'Install: `npm install -g 0nmcp`\n' +
    'Run: `0nmcp serve` for HTTP mode, `0nmcp` for MCP stdio mode.',
}

function getLocalResponse(message: string): string | null {
  const lower = message.toLowerCase().trim()

  // Direct keyword matches
  for (const [key, response] of Object.entries(LOCAL_KNOWLEDGE)) {
    if (lower.includes(key)) return response
  }

  // Pattern matches
  if (lower.match(/^(hi|hello|hey|yo|sup)/)) {
    return 'Hey! I\'m the 0n Console AI. I can help you with workflow automation, service connections, and cold email campaigns.\n\nTry:\n- `/smartlead` — Manage cold email campaigns\n- `/vault` — Connect your API keys\n- `/builder` — Build visual workflows\n- `/store` — Browse automation templates\n\nOr just describe what you want to automate.'
  }

  if (lower.match(/what (can you|do you|are you)/)) {
    return LOCAL_KNOWLEDGE['help']!
  }

  if (lower.match(/how (do i|to|can i).*(connect|add|setup|configure)/)) {
    return '**Connecting a Service**\n\n1. Go to **Vault** (`/vault`)\n2. Find the service you want to connect\n3. Click it and enter your API key/credentials\n4. Your key is encrypted and stored securely\n\nOnce connected, the service is available in the Builder, Chat, and all automations.'
  }

  if (lower.match(/how (do i|to|can i).*(create|build|make).*(workflow|automation|flow)/)) {
    return '**Creating a Workflow**\n\n**Option 1 — Visual Builder** (`/builder`)\n- Drag services from the palette onto the canvas\n- Connect nodes to define data flow\n- Configure each step\'s inputs and outputs\n\n**Option 2 — AI Create** (`/flows`)\n- Describe what you want in natural language\n- AI generates the .0n SWITCH file\n\n**Option 3 — Store Templates** (`/store`)\n- Browse pre-built automations\n- Import directly to your Builder'
  }

  if (lower.match(/(cold email|outreach|campaign|lead gen)/)) {
    return LOCAL_KNOWLEDGE['smartlead']!
  }

  if (lower.match(/(price|cost|pricing|plan|upgrade|pro|team|subscription)/)) {
    return '**0n Console Plans**\n\n- **Free** — Console access, Vault, Builder, Community\n- **Pro ($19/mo)** — Priority AI, advanced workflows, premium templates\n- **Team ($49/mo)** — Multi-user, team Vault, priority support, all features\n\nAll plans include a 7-day free trial. Upgrade via the Upgrade button in the header.'
  }

  // No match — return null to signal "use AI or generic fallback"
  return null
}

export async function POST(request: NextRequest) {
  // Verify auth
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const message = body.message?.trim()
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // ── Layer 1: Try 0nMCP local server ────────────────────────
  try {
    const mcpRes = await fetch(`${ONMCP_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: message }),
      signal: AbortSignal.timeout(5000), // Quick timeout — don't hang
    })

    if (mcpRes.ok) {
      const data = await mcpRes.json()
      return NextResponse.json({
        text: data.result || data.output || data.message || 'Task executed successfully.',
        source: '0nmcp' as const,
        status: data.status || 'completed',
        steps: data.steps_executed || data.steps || 0,
        services: data.services_used || data.services || [],
      })
    }
  } catch {
    // 0nMCP offline — continue
  }

  // ── Layer 2: User's own Anthropic key (BYOK) ──────────────
  const userKey = await getUserAnthropicKey(user.id)
  if (userKey) {
    const result = await callClaude(userKey, message)
    if (result) {
      return NextResponse.json({
        text: result.text,
        source: 'claude-byok' as const,
      })
    }
  }

  // ── Layer 3: Platform Anthropic key ────────────────────────
  if (PLATFORM_ANTHROPIC_KEY) {
    const result = await callClaude(PLATFORM_ANTHROPIC_KEY, message)
    if (result) {
      return NextResponse.json({
        text: result.text,
        source: 'claude' as const,
      })
    }
  }

  // ── Layer 4: Smart local fallback ──────────────────────────
  const localResponse = getLocalResponse(message)
  if (localResponse) {
    return NextResponse.json({
      text: localResponse,
      source: 'local' as const,
    })
  }

  // ── Layer 5: Generic helpful response ──────────────────────
  return NextResponse.json({
    text: '**I can help with that!** To unlock full AI-powered responses, connect your Anthropic API key in the **Vault** (`/vault` → Anthropic).\n\n' +
      'In the meantime, try these commands:\n' +
      '- `/smartlead` — Cold email campaigns\n' +
      '- `/vault` — Connect services\n' +
      '- `/builder` — Visual workflow builder\n' +
      '- `/store` — Browse automation templates\n' +
      '- `/help` — See all available commands\n\n' +
      '*Tip: Add your own Anthropic key in the Vault for unlimited AI chat.*',
    source: 'local' as const,
  })
}
