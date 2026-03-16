import { NextResponse } from 'next/server'
import { STATS, STATS_DISPLAY } from '@/data/stats'
import { ALL_PROVIDER_IDS, getProviderKey, type AIProviderId } from '@/lib/ai-provider'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ONMCP_URL = process.env.ONMCP_URL

interface TestResult {
  name: string
  ok: boolean
  status?: number
  error?: string
  latency: number
}

/**
 * Test a provider with a minimal request.
 */
async function testProvider(name: string, fn: () => Promise<Response>): Promise<TestResult> {
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

/**
 * Build a minimal test request for each provider format.
 */
function buildTest(provider: AIProviderId, key: string): (() => Promise<Response>) | null {
  const timeout = 10000

  switch (provider) {
    case 'gemini':
      return () => fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Referer': 'https://0nmcp.com' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say "ok"' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
          signal: AbortSignal.timeout(timeout),
        }
      )

    case 'anthropic':
      return () => fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Say ok' }],
        }),
        signal: AbortSignal.timeout(timeout),
      })

    // All OpenAI-compatible providers
    default: {
      const urls: Record<string, string> = {
        openai: 'https://api.openai.com/v1/chat/completions',
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
        groq: 'https://api.groq.com/openai/v1/chat/completions',
        deepseek: 'https://api.deepseek.com/v1/chat/completions',
        perplexity: 'https://api.perplexity.ai/chat/completions',
        mistral: 'https://api.mistral.ai/v1/chat/completions',
        xai: 'https://api.x.ai/v1/chat/completions',
        together: 'https://api.together.xyz/v1/chat/completions',
      }
      const models: Record<string, string> = {
        openai: 'gpt-4o-mini',
        openrouter: 'anthropic/claude-sonnet-4-20250514',
        groq: 'llama-3.1-8b-instant',
        deepseek: 'deepseek-chat',
        perplexity: 'sonar',
        mistral: 'mistral-small-latest',
        xai: 'grok-3-fast',
        together: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      }
      const url = urls[provider]
      const model = models[provider]
      if (!url || !model) return null

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      }
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = 'https://0nmcp.com'
      }

      return () => fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Say ok' }],
        }),
        signal: AbortSignal.timeout(provider === 'openrouter' || provider === 'xai' ? 15000 : timeout),
      })
    }
  }
}

export async function GET() {
  // ── 0nMCP local server check ──
  let mcpStatus: 'online' | 'cloud' = 'cloud'
  let mcpData: Record<string, unknown> | null = null

  if (ONMCP_URL) {
    try {
      const res = await fetch(`${ONMCP_URL}/health`, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        mcpStatus = 'online'
        mcpData = await res.json()
      }
    } catch {
      // offline
    }
  }

  // ── Test all 10 AI providers in parallel ──
  const providers: Array<{ name: AIProviderId; configured: boolean; keyPrefix?: string }> = []
  const testPromises: Promise<TestResult>[] = []

  for (const id of ALL_PROVIDER_IDS) {
    const key = getProviderKey(id)
    providers.push({
      name: id,
      configured: !!key,
      keyPrefix: key ? key.slice(0, 8) + '...' : undefined,
    })

    if (key) {
      const testFn = buildTest(id, key)
      if (testFn) {
        testPromises.push(testProvider(id, testFn))
      } else {
        testPromises.push(Promise.resolve({ name: id, ok: false, error: 'no test config', latency: 0 }))
      }
    } else {
      testPromises.push(Promise.resolve({ name: id, ok: false, error: 'no key', latency: 0 }))
    }
  }

  const liveTests = await Promise.all(testPromises)

  // ── Service checks ──
  const supabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  const agentStudioConfigured = !!process.env.CRM_AGENT_STUDIO_KEY
  const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

  const workingProviders = liveTests.filter(t => t.ok).length

  console.log('[health] AI provider tests:', JSON.stringify(liveTests.map(t => ({
    name: t.name, ok: t.ok, status: t.status, latency: t.latency, error: t.error,
  }))))

  return NextResponse.json({
    status: mcpStatus,
    version: '2.4.0',
    uptime: mcpData?.uptime || null,
    connections: mcpData?.connections || 48,
    tools: mcpData?.tools || STATS.tools,
    mode: mcpStatus,
    message: workingProviders > 0
      ? `0nMCP — ${workingProviders}/${ALL_PROVIDER_IDS.length} AI providers active, ${STATS_DISPLAY.tools} tools ready`
      : `0nMCP Cloud — ${STATS_DISPLAY.tools} tools ready (AI providers not responding)`,

    ai_providers: providers,
    ai_live_tests: liveTests,
    ai_summary: {
      total: ALL_PROVIDER_IDS.length,
      configured: providers.filter(p => p.configured).length,
      working: workingProviders,
    },
    services: {
      supabase: supabaseConfigured,
      agent_studio: agentStudioConfigured,
      google_oauth: googleConfigured,
    },
  })
}
