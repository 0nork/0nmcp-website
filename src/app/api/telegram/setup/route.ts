/**
 * POST /api/telegram/setup — One-time webhook registration
 *
 * Registers the webhook URL with Telegram and sets bot commands.
 * Protected by a simple admin check (TELEGRAM_WEBHOOK_SECRET as auth).
 *
 * Env vars:
 *   TELEGRAM_BOT_TOKEN        — Bot token from @BotFather
 *   TELEGRAM_WEBHOOK_SECRET   — Secret token for webhook verification
 */

import { NextRequest, NextResponse } from 'next/server'
import { setWebhook, setMyCommands, getMe, getWebhookInfo, deleteWebhook } from '@/lib/telegram'

const WEBHOOK_URL = 'https://0nmcp.com/api/telegram/webhook'

const BOT_COMMANDS = [
  { command: 'start', description: 'Welcome message + getting started' },
  { command: 'help', description: 'List available commands' },
  { command: 'status', description: 'Connection status + Vault info' },
  { command: 'connect', description: 'Link your 0nmcp.com account' },
]

export async function POST(req: NextRequest) {
  // Auth check — require the webhook secret as Bearer token
  const authHeader = req.headers.get('authorization')
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'TELEGRAM_WEBHOOK_SECRET not configured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const action = (body as { action?: string }).action || 'setup'

  try {
    if (action === 'delete') {
      // Remove webhook
      await deleteWebhook()
      return NextResponse.json({ ok: true, action: 'deleted' })
    }

    if (action === 'info') {
      // Get current webhook info
      const info = await getWebhookInfo()
      const me = await getMe()
      return NextResponse.json({ ok: true, bot: me, webhook: info })
    }

    // Default: full setup
    // 1. Get bot info
    const me = await getMe()
    console.log(`[telegram] Setting up bot: @${me.username} (${me.id})`)

    // 2. Register webhook
    const webhookResult = await setWebhook(WEBHOOK_URL, secret)
    console.log(`[telegram] Webhook registered: ${webhookResult}`)

    // 3. Set bot commands
    const commandsResult = await setMyCommands(BOT_COMMANDS)
    console.log(`[telegram] Commands set: ${commandsResult}`)

    // 4. Verify
    const info = await getWebhookInfo()

    return NextResponse.json({
      ok: true,
      bot: {
        id: me.id,
        username: me.username,
        first_name: me.first_name,
      },
      webhook: {
        url: info.url,
        pending_updates: info.pending_update_count,
        last_error: info.last_error_message || null,
      },
      commands: BOT_COMMANDS,
    })
  } catch (err) {
    console.error('[telegram] Setup error:', err)
    return NextResponse.json(
      { error: 'Setup failed', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

// GET — show current setup status (no auth needed, read-only)
export async function GET() {
  try {
    const me = await getMe()
    const info = await getWebhookInfo()

    return NextResponse.json({
      ok: true,
      bot: {
        id: me.id,
        username: me.username,
        first_name: me.first_name,
      },
      webhook: {
        url: info.url,
        has_secret: info.url ? true : false,
        pending_updates: info.pending_update_count,
        last_error: info.last_error_message || null,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to get bot info', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
