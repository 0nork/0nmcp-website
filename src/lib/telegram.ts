/**
 * Telegram Bot API Client — 0nGram
 *
 * Lightweight wrapper around the Telegram Bot HTTP API.
 * All methods use fetch() — no SDK dependency.
 *
 * Env vars:
 *   TELEGRAM_BOT_TOKEN — Bot token from @BotFather
 */

const API_BASE = 'https://api.telegram.org'

function getToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not configured')
  return token
}

function url(method: string): string {
  return `${API_BASE}/bot${getToken()}/${method}`
}

// ── Types ──

export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramChat {
  id: number
  type: 'private' | 'group' | 'supergroup' | 'channel'
  title?: string
  username?: string
  first_name?: string
  last_name?: string
}

export interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: TelegramChat
  date: number
  text?: string
  entities?: Array<{
    type: string
    offset: number
    length: number
  }>
}

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
  callback_query?: {
    id: string
    from: TelegramUser
    message?: TelegramMessage
    data?: string
  }
}

export interface SendMessageOptions {
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML'
  disable_web_page_preview?: boolean
  disable_notification?: boolean
  reply_to_message_id?: number
  reply_markup?: unknown
}

export interface BotCommand {
  command: string
  description: string
}

// ── API Methods ──

async function call<T = unknown>(method: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(url(method), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!data.ok) {
    console.error(`[telegram] ${method} failed:`, data.description || data)
    throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`)
  }

  return data.result as T
}

/**
 * Send a text message to a chat
 */
export async function sendMessage(
  chatId: number | string,
  text: string,
  options?: SendMessageOptions
): Promise<TelegramMessage> {
  // Telegram has a 4096 char limit — split if needed
  if (text.length <= 4096) {
    return call<TelegramMessage>('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || 'Markdown',
      disable_web_page_preview: options?.disable_web_page_preview ?? true,
      ...options,
    })
  }

  // Split long messages at newline boundaries
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > 0) {
    if (remaining.length <= 4096) {
      chunks.push(remaining)
      break
    }
    let splitAt = remaining.lastIndexOf('\n', 4096)
    if (splitAt < 1000) splitAt = 4096
    chunks.push(remaining.slice(0, splitAt))
    remaining = remaining.slice(splitAt)
  }

  let lastMsg: TelegramMessage | undefined
  for (const chunk of chunks) {
    lastMsg = await call<TelegramMessage>('sendMessage', {
      chat_id: chatId,
      text: chunk,
      parse_mode: options?.parse_mode || 'Markdown',
      disable_web_page_preview: options?.disable_web_page_preview ?? true,
    })
  }
  return lastMsg!
}

/**
 * Send a chat action (typing indicator, etc.)
 */
export async function sendChatAction(
  chatId: number | string,
  action: 'typing' | 'upload_photo' | 'upload_document' | 'upload_video' | 'record_voice' = 'typing'
): Promise<boolean> {
  return call<boolean>('sendChatAction', {
    chat_id: chatId,
    action,
  })
}

/**
 * Register the webhook URL with Telegram
 */
export async function setWebhook(
  webhookUrl: string,
  secretToken?: string
): Promise<boolean> {
  return call<boolean>('setWebhook', {
    url: webhookUrl,
    secret_token: secretToken,
    allowed_updates: ['message', 'callback_query'],
    max_connections: 40,
    drop_pending_updates: false,
  })
}

/**
 * Remove the webhook
 */
export async function deleteWebhook(): Promise<boolean> {
  return call<boolean>('deleteWebhook', { drop_pending_updates: false })
}

/**
 * Get current webhook info
 */
export async function getWebhookInfo(): Promise<{
  url: string
  has_custom_certificate: boolean
  pending_update_count: number
  last_error_date?: number
  last_error_message?: string
}> {
  return call('getWebhookInfo')
}

/**
 * Set bot commands visible in the Telegram menu
 */
export async function setMyCommands(commands: BotCommand[]): Promise<boolean> {
  return call<boolean>('setMyCommands', { commands })
}

/**
 * Get bot info
 */
export async function getMe(): Promise<TelegramUser> {
  return call<TelegramUser>('getMe')
}

/**
 * Answer a callback query (inline button press)
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert = false
): Promise<boolean> {
  return call<boolean>('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  })
}
