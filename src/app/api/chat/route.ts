import { type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { callAIChat } from '@/lib/ai-provider'
import { STATS_DISPLAY } from '@/data/stats'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SYSTEM_PROMPT =
  `You are 0nMCP, a universal AI API orchestrator with ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services in ${STATS_DISPLAY.categories} categories. ` +
  'You help users manage workflows, execute tasks, and connect services. ' +
  'You speak concisely and helpfully. When users describe tasks, suggest which 0nMCP tools and services could accomplish them. ' +
  'Keep responses focused and actionable.'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  let userId: string | undefined
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    userId = user.id
  }

  let body: { messages?: Array<{ role: string; content: string }> }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const messages = body.messages
  if (!messages || !messages.length) {
    return new Response(JSON.stringify({ error: 'Messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Use ai-provider with automatic fallback across all 10 providers
  const result = await callAIChat(
    SYSTEM_PROMPT,
    messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    userId,
    2048
  )

  if (!result) {
    return new Response(JSON.stringify({ error: 'All AI providers failed. No API keys with available credits.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Return as SSE-compatible format for existing frontend
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Send as a single content block delta matching Anthropic SSE format
      const events = [
        `event: message_start\ndata: {"type":"message_start","message":{"id":"msg_auto","type":"message","role":"assistant","content":[],"model":"${result.provider}"}}\n\n`,
        `event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n`,
        `event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":${JSON.stringify(result.text)}}}\n\n`,
        `event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n`,
        `event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}\n\n`,
        `event: message_stop\ndata: {"type":"message_stop"}\n\n`,
      ]
      for (const event of events) {
        controller.enqueue(encoder.encode(event))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
