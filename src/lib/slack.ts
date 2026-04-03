/**
 * 0nMCP Slack App — Shared utilities
 *
 * Signing secret verification, bot token resolution,
 * Block Kit helpers, and Supabase installation lookup.
 */

import crypto from 'crypto'
import { createSupabaseAdmin } from '@/lib/supabase/admin'

// ── Constants ──

const SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || ''
const DEFAULT_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || ''
const CLIENT_ID = process.env.SLACK_CLIENT_ID || ''
const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || ''
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.0nmcp.com'
const REDIRECT_URI = `${APP_URL}/api/slack/callback`

export const SLACK_CONFIG = {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  APP_URL,
  SCOPES: [
    'app_mentions:read',
    'chat:write',
    'commands',
    'im:history',
    'im:read',
    'im:write',
  ].join(','),
}

// ── Signing Secret Verification ──

export function verifySlackRequest(
  timestamp: string | null,
  signature: string | null,
  body: string
): boolean {
  if (!timestamp || !signature || !SIGNING_SECRET) return false

  // Prevent replay attacks (5 min window)
  const ts = Number(timestamp)
  if (Number.isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false

  const sigBasestring = `v0:${timestamp}:${body}`
  const mySignature =
    'v0=' +
    crypto.createHmac('sha256', SIGNING_SECRET).update(sigBasestring).digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(mySignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    )
  } catch {
    return false
  }
}

// ── Bot Token Resolution (multi-workspace) ──

export async function getBotToken(teamId?: string): Promise<string> {
  if (!teamId) return DEFAULT_BOT_TOKEN

  const supabase = createSupabaseAdmin()
  if (!supabase) return DEFAULT_BOT_TOKEN

  const { data } = await supabase
    .from('slack_installations')
    .select('bot_token')
    .eq('team_id', teamId)
    .eq('is_active', true)
    .single()

  return data?.bot_token || DEFAULT_BOT_TOKEN
}

// ── Slack API Helpers ──

export async function slackPost(
  method: string,
  token: string,
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return res.json() as Promise<Record<string, unknown>>
}

export async function postMessage(
  token: string,
  channel: string,
  text: string,
  threadTs?: string,
  blocks?: SlackBlock[]
) {
  const payload: Record<string, unknown> = { channel, text }
  if (threadTs) payload.thread_ts = threadTs
  if (blocks) payload.blocks = blocks
  return slackPost('chat.postMessage', token, payload)
}

// ── Block Kit Types ──

export interface SlackBlock {
  type: string
  text?: { type: string; text: string; emoji?: boolean }
  elements?: unknown[]
  block_id?: string
  accessory?: unknown
  fields?: { type: string; text: string }[]
}

// ── Block Kit Builders ──

export function section(text: string): SlackBlock {
  return {
    type: 'section',
    text: { type: 'mrkdwn', text },
  }
}

export function header(text: string): SlackBlock {
  return {
    type: 'header',
    text: { type: 'plain_text', text, emoji: false },
  }
}

export function divider(): SlackBlock {
  return { type: 'divider' }
}

export function actions(elements: unknown[]): SlackBlock {
  return { type: 'actions', elements }
}

export function button(
  text: string,
  actionId: string,
  value?: string,
  style?: 'primary' | 'danger'
): Record<string, unknown> {
  const btn: Record<string, unknown> = {
    type: 'button',
    text: { type: 'plain_text', text, emoji: false },
    action_id: actionId,
    value: value || actionId,
  }
  if (style) btn.style = style
  return btn
}

export function codeBlock(text: string): string {
  return '```' + text + '```'
}
