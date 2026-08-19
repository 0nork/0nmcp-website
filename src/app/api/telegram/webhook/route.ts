/**
 * POST /api/telegram/webhook — 0nGram Telegram Bot Webhook
 *
 * Receives updates from Telegram, routes commands and messages.
 * AI chat powered by Groq (free tier) with Vault context for connected users.
 *
 * Env vars:
 *   TELEGRAM_BOT_TOKEN        — Bot token from @BotFather
 *   TELEGRAM_WEBHOOK_SECRET   — Secret token for update verification
 *   GROQ_API_KEY              — Groq API key (free tier)
 *   GROQ_API_KEYS             — Optional comma-separated key pool
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendMessage, sendChatAction, type TelegramUpdate, type TelegramMessage } from '@/lib/telegram'
import { createSupabaseAdmin } from '@/lib/supabase/admin'

// ── Constants ──

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
const MAX_TOKENS = 1024
const SITE_URL = 'https://0nmcp.com'

const GENERIC_SYSTEM_PROMPT = `You are 0nGram, the Telegram interface for 0nMCP — a universal AI orchestration platform with 1,598+ tools across 106 services.

0nMCP connects to CRM, Stripe, SendGrid, Slack, Discord, Twilio, GitHub, Shopify, OpenAI, Anthropic, Google services, Airtable, Notion, MongoDB, Supabase, and 40+ more services through a single unified API.

Key capabilities:
- Execute workflows (.0n SWITCH files) that automate multi-step processes
- Manage credentials securely via 0nVault (AES-256-GCM encryption)
- Three-level execution: Pipeline > Assembly Line > Radial Burst
- AI-powered workflow generation — describe outcomes, not steps

Keep responses concise and useful. Use Markdown formatting sparingly (Telegram supports basic Markdown).
When users ask about connecting their account, direct them to /connect.
For technical questions about 0nMCP, reference the docs at https://0nmcp.com.`

// ── Groq Key Pool ──

function getGroqKey(): string | null {
  const pool = process.env.GROQ_API_KEYS
  if (pool) {
    const keys = pool.split(',').map(k => k.trim()).filter(Boolean)
    if (keys.length > 0) return keys[Math.floor(Math.random() * keys.length)]
  }
  return process.env.GROQ_API_KEY || null
}

// ── Supabase Helpers ──

async function getOrCreateTelegramUser(
  telegramId: number,
  username?: string,
  firstName?: string
) {
  const supabase = createSupabaseAdmin()
  if (!supabase) return null

  // Try to find existing user
  const { data: existing } = await supabase
    .from('telegram_users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single()

  if (existing) {
    // Update username/name if changed
    if (existing.telegram_username !== username || existing.telegram_first_name !== firstName) {
      await supabase
        .from('telegram_users')
        .update({
          telegram_username: username || existing.telegram_username,
          telegram_first_name: firstName || existing.telegram_first_name,
          updated_at: new Date().toISOString(),
        })
        .eq('telegram_id', telegramId)
    }
    return existing
  }

  // Create new user
  const { data: created } = await supabase
    .from('telegram_users')
    .insert({
      telegram_id: telegramId,
      telegram_username: username || null,
      telegram_first_name: firstName || null,
    })
    .select()
    .single()

  return created
}

async function getVaultContext(onmcpUserId: string): Promise<string | null> {
  const supabase = createSupabaseAdmin()
  if (!supabase || !onmcpUserId) return null

  try {
    // Load user's vault data for context enrichment
    const { data: vault } = await supabase
      .from('user_vaults')
      .select('services, completion_pct')
      .eq('user_id', onmcpUserId)
      .single()

    if (!vault) return null

    const services = vault.services || {}
    const connected = Object.entries(services)
      .filter(([, v]: [string, unknown]) => (v as { connected?: boolean })?.connected)
      .map(([k]) => k)

    if (connected.length === 0) return null

    return `\n\nUser's connected services: ${connected.join(', ')}. Vault completion: ${vault.completion_pct || 0}%. You can reference these services when helping the user.`
  } catch {
    return null
  }
}

async function generateConnectToken(telegramId: number): Promise<string | null> {
  const supabase = createSupabaseAdmin()
  if (!supabase) return null

  // Generate a short-lived one-time token
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min

  const { error } = await supabase
    .from('telegram_users')
    .update({
      connect_token: token,
      connect_token_expires: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('telegram_id', telegramId)

  if (error) {
    console.error('[telegram] Failed to generate connect token:', error)
    return null
  }

  return token
}

// ── AI Chat ──

async function chatWithAI(
  userMessage: string,
  systemPrompt: string
): Promise<string> {
  const apiKey = getGroqKey()
  if (!apiKey) {
    return 'AI is temporarily unavailable. Please try again later or visit https://0nmcp.com for help.'
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[telegram] Groq API error:', res.status, err)
      return 'AI encountered an error. Please try again in a moment.'
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || 'No response generated.'
  } catch (err) {
    console.error('[telegram] AI chat error:', err)
    return 'Failed to reach AI service. Please try again.'
  }
}

// ── Command Handlers ──

async function handleStart(msg: TelegramMessage): Promise<string> {
  const name = msg.from?.first_name || 'there'
  return `Welcome to *0nGram*, ${name}! 🔌

I'm the Telegram interface for *0nMCP* — the universal AI orchestration platform with 1,598+ tools across 106 services.

*What I can do:*
- Answer questions about 0nMCP, workflows, and automation
- Show your connection status and Vault progress
- Link your Telegram to your 0nmcp.com account

*Commands:*
/help — List available commands
/status — Connection status + Vault info
/connect — Link your 0nmcp.com account

Or just type any message and I'll chat with you using AI.

Get started at ${SITE_URL}`
}

async function handleHelp(): Promise<string> {
  return `*0nGram Commands*

/start — Welcome message
/help — This help menu
/status — Connection status + Vault completion
/connect — Link your Telegram to 0nmcp.com

*Just type anything* to chat with AI. If your account is connected, I'll have context from your Vault (connected services, preferences).

*Links:*
- Console: ${SITE_URL}/console
- Docs: ${SITE_URL}/learn
- Store: ${SITE_URL}/store
- Community: ${SITE_URL}/forum`
}

async function handleStatus(msg: TelegramMessage): Promise<string> {
  const telegramId = msg.from?.id
  if (!telegramId) return 'Could not identify your Telegram account.'

  const user = await getOrCreateTelegramUser(telegramId, msg.from?.username, msg.from?.first_name)
  if (!user) return 'Database is temporarily unavailable.'

  if (!user.is_connected || !user.onmcp_user_id) {
    return `*Connection Status:* Not connected

Your Telegram is not linked to an 0nmcp.com account yet.

Use /connect to generate a one-time link and connect your accounts. This enables:
- Personalized AI responses with your Vault context
- Workflow execution from Telegram
- Service status notifications`
  }

  const vaultCtx = await getVaultContext(user.onmcp_user_id)
  const connectedInfo = vaultCtx || '\nNo services connected in Vault yet.'

  return `*Connection Status:* Connected

*Telegram:* @${user.telegram_username || user.telegram_first_name || telegramId}
*0nMCP Account:* Linked
${connectedInfo}

Manage your Vault at ${SITE_URL}/console`
}

async function handleConnect(msg: TelegramMessage): Promise<string> {
  const telegramId = msg.from?.id
  if (!telegramId) return 'Could not identify your Telegram account.'

  const user = await getOrCreateTelegramUser(telegramId, msg.from?.username, msg.from?.first_name)
  if (!user) return 'Database is temporarily unavailable.'

  if (user.is_connected && user.onmcp_user_id) {
    return `Your Telegram is already connected to your 0nmcp.com account.

Use /status to see your connection details.
To disconnect and reconnect, visit ${SITE_URL}/console/settings.`
  }

  const token = await generateConnectToken(telegramId)
  if (!token) return 'Failed to generate connection link. Please try again.'

  return `*Connect your 0nmcp.com account*

Click the link below to connect your Telegram to 0nMCP. This link expires in 15 minutes.

${SITE_URL}/connect/telegram?token=${token}

After connecting, I'll have context from your Vault — your connected services, preferences, and workflow history — making AI responses much more useful.`
}

// ── Main Handler ──

export async function POST(req: NextRequest) {
  // Verify the request is from Telegram
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (secret) {
    const headerSecret = req.headers.get('x-telegram-bot-api-secret-token')
    if (headerSecret !== secret) {
      console.warn('[telegram] Invalid secret token in webhook')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
  }

  let update: TelegramUpdate
  try {
    update = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only handle messages (not edited, not callback queries for now)
  const msg = update.message
  if (!msg || !msg.chat || !msg.from) {
    return NextResponse.json({ ok: true })
  }

  // Only handle private chats (not group messages)
  if (msg.chat.type !== 'private') {
    return NextResponse.json({ ok: true })
  }

  const chatId = msg.chat.id
  const text = msg.text?.trim() || ''
  const telegramId = msg.from.id

  if (!text) {
    return NextResponse.json({ ok: true })
  }

  try {
    // Check if it's a command
    const isCommand = text.startsWith('/')
    let response: string

    if (isCommand) {
      const command = text.split(/\s+/)[0].toLowerCase().replace(/@\w+$/, '') // strip @botname

      switch (command) {
        case '/start':
          response = await handleStart(msg)
          break
        case '/help':
          response = await handleHelp()
          break
        case '/status':
          response = await handleStatus(msg)
          break
        case '/connect':
          response = await handleConnect(msg)
          break
        default:
          response = `Unknown command: ${command}\n\nUse /help to see available commands.`
      }
    } else {
      // AI chat — show typing indicator, then respond
      await sendChatAction(chatId, 'typing')

      // Get user + vault context if connected
      const user = await getOrCreateTelegramUser(telegramId, msg.from.username, msg.from.first_name)
      let systemPrompt = GENERIC_SYSTEM_PROMPT

      if (user?.is_connected && user?.onmcp_user_id) {
        const vaultCtx = await getVaultContext(user.onmcp_user_id)
        if (vaultCtx) {
          systemPrompt += vaultCtx
        }
      }

      response = await chatWithAI(text, systemPrompt)
    }

    await sendMessage(chatId, response)
  } catch (err) {
    console.error('[telegram] Webhook handler error:', err)
    // Try to notify the user
    try {
      await sendMessage(chatId, 'Something went wrong. Please try again.')
    } catch {
      // Can't even send error message — just log it
    }
  }

  // Always return 200 to Telegram so it doesn't retry
  return NextResponse.json({ ok: true })
}

// Telegram sends GET to verify the endpoint exists
export async function GET() {
  return NextResponse.json({
    service: '0nGram',
    status: 'active',
    version: '1.0.0',
  })
}
