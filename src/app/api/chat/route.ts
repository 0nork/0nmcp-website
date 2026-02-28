import { type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

const SYSTEM_PROMPT =
  'You are 0nMCP, a universal AI API orchestrator with 819 tools across 48 services in 21 categories. ' +
  'You help users manage workflows, execute tasks, and connect services. ' +
  'You speak concisely and helpfully. When users describe tasks, suggest which 0nMCP tools and services could accomplish them. ' +
  'Keep responses focused and actionable.'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
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

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'AI not configured on server' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      stream: true,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text()
    return new Response(JSON.stringify({ error: `API error: ${anthropicRes.status}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Stream the response through
  return new Response(anthropicRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
