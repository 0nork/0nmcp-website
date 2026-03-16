import { NextResponse } from 'next/server'
import { STATS, STATS_DISPLAY } from '@/data/stats'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ONMCP_URL = process.env.ONMCP_URL

/**
 * Test a single AI provider with a minimal request.
 * Returns { ok, status, error? } without generating real content.
 */
async function testProvider(
  name: string,
  fn: () => Promise<Response>
): Promise<{ name: string; ok: boolean; status?: number; error?: string; latency: number }> {
  const start = Date.now()
  try {
    const res = await fn()
    const latency = Date.now() - start
    if (res.ok) {
      return { name, ok: true, status: res.status, latency }
    }
    const body = await res.text().catch(() => '')
    return { name, ok: false, status: res.status, error: body.slice(0, 200), latency }
  } catch (err) {
    return { name, ok: false, error: err instanceof Error ? err.message : 'unknown', latency: Date.now() - start }
  }
}

export async function GET() {
  // ── 0nMCP local server check ──
  let mcpStatus: 'online' | 'cloud' = 'cloud'
  let mcpData: Record<string, unknown> | null = null

  if (ONMCP_URL) {
    try {
      const res = await fetch(`${ONMCP_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        mcpStatus = 'online'
        mcpData = await res.json()
      }
    } catch {
      // offline
    }
  }

  // ── AI Provider checks (lightweight validation) ──
  const providers: Array<{ name: string; configured: boolean; keyPrefix?: string }> = []

  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY || ''
  const openaiKey = process.env.OPENAI_API_KEY || ''
  const anthropicKey = process.env.ANTHROPIC_API_KEY || ''
  const openrouterKey = process.env.OPENROUTER_API_KEY || ''

  providers.push({ name: 'gemini', configured: !!geminiKey, keyPrefix: geminiKey ? geminiKey.slice(0, 8) + '...' : undefined })
  providers.push({ name: 'openai', configured: !!openaiKey, keyPrefix: openaiKey ? openaiKey.slice(0, 8) + '...' : undefined })
  providers.push({ name: 'anthropic', configured: !!anthropicKey, keyPrefix: anthropicKey ? anthropicKey.slice(0, 8) + '...' : undefined })
  providers.push({ name: 'openrouter', configured: !!openrouterKey, keyPrefix: openrouterKey ? openrouterKey.slice(0, 8) + '...' : undefined })

  // ── Live provider tests (send minimal requests to verify keys work) ──
  const liveTests = await Promise.all([
    geminiKey ? testProvider('gemini', () => fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "ok"' }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
        signal: AbortSignal.timeout(10000),
      }
    )) : { name: 'gemini', ok: false, error: 'no key', latency: 0 },

    openaiKey ? testProvider('openai', () => fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Say ok' }],
        }),
        signal: AbortSignal.timeout(10000),
      }
    )) : { name: 'openai', ok: false, error: 'no key', latency: 0 },

    anthropicKey ? testProvider('anthropic', () => fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Say ok' }],
        }),
        signal: AbortSignal.timeout(10000),
      }
    )) : { name: 'anthropic', ok: false, error: 'no key', latency: 0 },

    openrouterKey ? testProvider('openrouter', () => fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterKey}`,
          'HTTP-Referer': 'https://0nmcp.com',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Say ok' }],
        }),
        signal: AbortSignal.timeout(15000),
      }
    )) : { name: 'openrouter', ok: false, error: 'no key', latency: 0 },
  ])

  // ── Supabase check ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const supabaseConfigured = !!(supabaseUrl && supabaseKey)

  // ── CRM Agent Studio check ──
  const agentStudioKey = process.env.CRM_AGENT_STUDIO_KEY || ''
  const agentStudioConfigured = !!agentStudioKey

  // ── Google OAuth check ──
  const googleClientId = process.env.GOOGLE_CLIENT_ID || ''
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
  const googleConfigured = !!(googleClientId && googleClientSecret)

  const workingProviders = liveTests.filter(t => t.ok).length

  // Log results for Vercel
  console.log('[health] AI provider tests:', JSON.stringify(liveTests.map(t => ({ name: t.name, ok: t.ok, status: 'status' in t ? t.status : undefined, latency: t.latency, error: t.error }))))

  return NextResponse.json({
    status: mcpStatus,
    version: mcpData?.version || '2.2.0',
    uptime: mcpData?.uptime || null,
    connections: mcpData?.connections || 48,
    tools: mcpData?.tools || STATS.tools,
    mode: mcpStatus,
    message: workingProviders > 0
      ? `0nMCP — ${workingProviders} AI provider${workingProviders > 1 ? 's' : ''} active, ${STATS_DISPLAY.tools} tools ready`
      : `0nMCP Cloud — ${STATS_DISPLAY.tools} tools ready (AI providers not responding)`,

    // Diagnostic info
    ai_providers: providers,
    ai_live_tests: liveTests,
    services: {
      supabase: supabaseConfigured,
      agent_studio: agentStudioConfigured,
      google_oauth: googleConfigured,
    },
  })
}
