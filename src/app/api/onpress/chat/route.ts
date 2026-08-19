/**
 * POST /api/onpress/chat
 *
 * OnPress AI Chat endpoint.
 * Validates OAuth Bearer token, builds system prompt from site context,
 * calls Anthropic API (Haiku 4.5), and returns AI response.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireScope, type TokenInfo } from '@/lib/oauth'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ''
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 1024
const MAX_MSG_LEN = 500
const MAX_HISTORY = 20

interface SiteContext {
  name: string
  description?: string
  url?: string
  pages?: Array<{ title: string; url: string; excerpt: string }>
  services?: Array<{ name: string; price: string; booking_url?: string }>
  contact?: { phone?: string; email?: string; address?: string; hours?: string }
  navigation?: Array<{ label: string; url: string }>
  custom?: string
}

interface ChatRequest {
  message: string
  conversation?: Array<{ role: 'user' | 'assistant'; content: string }>
  session_id?: string
  site_context: SiteContext
  capabilities?: string[]
  personality?: string
  image?: string
}

export async function POST(request: NextRequest) {
  // ── Auth ──
  const authResult = await requireScope(request, 'runs:spend')
  if (authResult instanceof Response) return authResult
  const { tokenInfo } = authResult as { tokenInfo: TokenInfo }

  // ── Parse body ──
  let body: ChatRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { message, conversation, site_context, capabilities, personality, image } = body

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  if (!site_context || !site_context.name) {
    return NextResponse.json({ error: 'Site context with name is required' }, { status: 400 })
  }

  // Truncate message
  const truncatedMessage = message.slice(0, MAX_MSG_LEN)

  // ── Build system prompt ──
  const systemPrompt = buildSystemPrompt(
    site_context,
    personality || '',
    capabilities || ['faq']
  )

  // ── Build messages ──
  const messages: Array<{ role: 'user' | 'assistant'; content: string | Array<Record<string, unknown>> }> = []

  // Add conversation history (limit to MAX_HISTORY)
  if (Array.isArray(conversation)) {
    const history = conversation.slice(-MAX_HISTORY)
    for (const msg of history) {
      if (
        msg &&
        typeof msg.role === 'string' &&
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string'
      ) {
        messages.push({
          role: msg.role,
          content: msg.content.slice(0, 2000),
        })
      }
    }
  }

  // Add current message (with optional image)
  if (image && typeof image === 'string' && image.startsWith('data:image/')) {
    const match = image.match(/^data:image\/(jpeg|png);base64,(.+)$/)
    if (match) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: `image/${match[1]}`,
              data: match[2],
            },
          },
          {
            type: 'text',
            text: truncatedMessage,
          },
        ],
      })
    } else {
      messages.push({ role: 'user', content: truncatedMessage })
    }
  } else {
    messages.push({ role: 'user', content: truncatedMessage })
  }

  // ── Call AI (Groq free → Anthropic fallback) ──
  try {
    let reply = ''
    const usage = { input_tokens: 0, output_tokens: 0 }

    // Try Groq first (FREE)
    const groqPool = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',').filter(Boolean)
    let aiSuccess = false

    if (groqPool.length > 0) {
      const groqKey = groqPool[Math.floor(Math.random() * groqPool.length)].trim()
      const groqMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) })),
      ]

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', reasoning_effort: 'low', max_tokens: MAX_TOKENS, messages: groqMessages }),
        signal: AbortSignal.timeout(30000),
      }).catch(() => null)

      if (groqRes?.ok) {
        const groqData = await groqRes.json()
        reply = groqData.choices?.[0]?.message?.content || ''
        usage.input_tokens = groqData.usage?.prompt_tokens || 0
        usage.output_tokens = groqData.usage?.completion_tokens || 0
        aiSuccess = true
      }
    }

    // Fallback to Anthropic if Groq fails
    if (!aiSuccess && ANTHROPIC_KEY) {
      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model: DEFAULT_MODEL, max_tokens: MAX_TOKENS, system: systemPrompt, messages }),
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) {
        return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 502 })
      }

      const data = await res.json()
      if (data.content) {
        for (const block of data.content) {
          if (block.type === 'text') reply += block.text
        }
      }
      if (data.usage) {
        usage.input_tokens = data.usage.input_tokens || 0
        usage.output_tokens = data.usage.output_tokens || 0
      }
    }

    if (!reply) {
      return NextResponse.json({ error: 'No AI response generated.' }, { status: 502 })
    }

    // Parse actions from reply
    const actions = parseActions(reply)

    // Log usage (non-blocking)
    logUsage(tokenInfo.userId, site_context.url || '', usage).catch(() => {})

    return NextResponse.json({
      success: true,
      reply,
      actions,
      usage,
    })
  } catch (err) {
    console.error('[onpress/chat] Error:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Could not reach AI service. Please try again.' },
      { status: 502 }
    )
  }
}

/* ── System Prompt Builder ── */

function buildSystemPrompt(
  ctx: SiteContext,
  personality: string,
  capabilities: string[]
): string {
  let prompt = `You are a friendly, knowledgeable assistant for ${ctx.name}. ${personality}\n\n`
  prompt += `About this business:\n`

  if (ctx.url) prompt += `- Website: ${ctx.url}\n`
  if (ctx.description) prompt += `- Description: ${ctx.description}\n`

  if (ctx.pages && ctx.pages.length > 0) {
    prompt += `\nKey pages:\n`
    for (const p of ctx.pages) {
      prompt += `- ${p.title} (${p.url}): ${p.excerpt}\n`
    }
  }

  if (ctx.services && ctx.services.length > 0) {
    prompt += `\nServices/Products:\n`
    for (const s of ctx.services) {
      prompt += `- ${s.name} — ${s.price}`
      if (s.booking_url) prompt += ` (Book: ${s.booking_url})`
      prompt += `\n`
    }
  }

  if (ctx.contact) {
    const c = ctx.contact
    prompt += `\nContact info:\n`
    if (c.email) prompt += `- Email: ${c.email}\n`
    if (c.phone) prompt += `- Phone: ${c.phone}\n`
    if (c.address) prompt += `- Address: ${c.address}\n`
    if (c.hours) prompt += `- Hours: ${c.hours}\n`
  }

  if (ctx.custom) {
    prompt += `\nAdditional info:\n${ctx.custom}\n`
  }

  const caps: string[] = []
  if (capabilities.includes('faq')) caps.push('Answer frequently asked questions')
  if (capabilities.includes('booking')) caps.push('Help visitors book appointments or services')
  if (capabilities.includes('lead_capture')) caps.push('Collect visitor contact information when appropriate')
  if (capabilities.includes('vision')) caps.push('Analyze images visitors share')

  if (caps.length) {
    prompt += `\nYou can: ${caps.join(', ')}.\n`
  }

  prompt += `\nRules:\n`
  prompt += `- Be concise and helpful (2-3 sentences typical)\n`
  prompt += `- If asked about booking, provide the direct booking link\n`
  prompt += `- If asked about pricing, give exact prices from the service list\n`
  prompt += `- Never make up information not in your context\n`
  prompt += `- For questions outside your knowledge, suggest calling or visiting the website\n`
  prompt += `- If the visitor seems interested, gently suggest booking\n`

  return prompt
}

/* ── Action Parser ── */

function parseActions(reply: string): Array<{ type: string; data: Record<string, string> }> {
  const actions: Array<{ type: string; data: Record<string, string> }> = []

  // Detect booking URLs
  const bookingPattern = /\bhttps?:\/\/[^\s<>"]+(?:book|appointment|schedule|reserve)[^\s<>"]*\b/gi
  const matches = reply.match(bookingPattern)
  if (matches) {
    for (const url of matches) {
      actions.push({ type: 'booking_link', data: { url } })
    }
  }

  return actions
}

/* ── Usage Logger ── */

async function logUsage(
  userId: string,
  siteUrl: string,
  usage: { input_tokens: number; output_tokens: number }
): Promise<void> {
  // Optional: log to Supabase for usage tracking
  // For now, just console log
  console.log(
    `[onpress/chat] user=${userId} site=${siteUrl} in=${usage.input_tokens} out=${usage.output_tokens}`
  )
}
