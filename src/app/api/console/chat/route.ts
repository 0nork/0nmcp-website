import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ONMCP_URL = process.env.ONMCP_URL || 'http://localhost:3001'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

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

  // Try 0nMCP execute first
  try {
    const mcpRes = await fetch(`${ONMCP_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: message }),
      signal: AbortSignal.timeout(30000),
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
    // 0nMCP offline or error, fall through to Claude
  }

  // Fallback to Anthropic
  if (ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system:
          'You are 0n Console, an AI assistant for the 0nMCP ecosystem. ' +
          'You help users with workflow automation, service connections, and AI orchestration. ' +
          'Be concise, technical, and helpful. ' +
          'The user has access to 0nMCP with 564 tools across 26 services.',
        messages: [{ role: 'user', content: message }],
      })

      const text =
        response.content[0]?.type === 'text'
          ? response.content[0].text
          : 'Unable to generate response.'

      return NextResponse.json({
        text,
        source: 'claude' as const,
      })
    } catch (err) {
      console.error('Anthropic error:', err)
    }
  }

  // Local fallback
  return NextResponse.json({
    text: 'Neither 0nMCP nor Claude are available. Start 0nMCP with `npx 0nmcp serve` or configure ANTHROPIC_API_KEY.',
    source: 'local' as const,
  })
}
