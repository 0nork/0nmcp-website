/**
 * AI Provider Utility — Universal AI routing for 0nmcp.com
 *
 * Every AI call routes through this module. The provider order is:
 * 1. User's per-user default (profiles.default_ai_providers)
 * 2. Platform default: gemini -> openai -> anthropic
 *
 * Admin can assign per-user defaults at /admin/users.
 * Owner (mike@rocketopp.com) defaults to ["gemini","openai"].
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Types ──

export type AIProviderId = 'gemini' | 'openai' | 'anthropic' | 'openrouter'

export interface AICallOptions {
  system: string
  user: string
  maxTokens?: number
  /** Override model per-provider. Defaults: gemini-2.0-flash, gpt-4o, claude-sonnet-4-20250514, anthropic/claude-sonnet-4-20250514 */
  model?: string
}

export interface AICallResult {
  text: string
  provider: AIProviderId
}

// ── Platform default order ──
// Gemini first (free/cheap), OpenAI second, Anthropic last (most expensive)
const DEFAULT_PROVIDER_ORDER: AIProviderId[] = ['gemini', 'openai', 'anthropic', 'openrouter']

// ── Admin client (singleton) ──

let _admin: SupabaseClient | null = null
function getAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _admin
}

// ── Provider API keys from env ──

function getProviderKey(provider: AIProviderId): string {
  switch (provider) {
    case 'gemini':
      return process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY || ''
    case 'openai':
      return process.env.OPENAI_API_KEY || ''
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY || ''
    case 'openrouter':
      return process.env.OPENROUTER_API_KEY || ''
  }
}

// ── Per-user provider lookup ──

// Cache user preferences for 5 minutes to avoid DB hits on every call
const providerCache = new Map<string, { providers: AIProviderId[] | null; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000

/**
 * Get the ordered AI provider list for a user.
 * Returns null if user has no custom preference (use platform default).
 */
export async function getUserAIProviders(userId: string): Promise<AIProviderId[] | null> {
  const cached = providerCache.get(userId)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.providers
  }

  try {
    const { data } = await getAdmin()
      .from('profiles')
      .select('default_ai_providers')
      .eq('id', userId)
      .maybeSingle()

    const providers = data?.default_ai_providers as AIProviderId[] | null
    const valid = Array.isArray(providers)
      ? providers.filter(p => ['gemini', 'openai', 'anthropic', 'openrouter'].includes(p))
      : null

    const result = valid && valid.length > 0 ? valid : null
    providerCache.set(userId, { providers: result, ts: Date.now() })
    return result
  } catch {
    return null
  }
}

/**
 * Resolve the provider order for a user.
 * If user has custom preferences, use those. Otherwise use platform default.
 */
export async function resolveProviderOrder(userId?: string): Promise<AIProviderId[]> {
  if (userId) {
    const custom = await getUserAIProviders(userId)
    if (custom) return custom
  }
  return DEFAULT_PROVIDER_ORDER
}

// ── Provider-specific call functions ──

async function callGemini(apiKey: string, opts: AICallOptions): Promise<string | null> {
  try {
    const model = opts.model || 'gemini-2.0-flash'
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: opts.system }] },
          contents: [{ parts: [{ text: opts.user }] }],
          generationConfig: { maxOutputTokens: opts.maxTokens || 2048 },
        }),
        signal: AbortSignal.timeout(45000),
      }
    )
    if (!res.ok) {
      const errBody = await res.text().catch(() => 'unable to read body')
      console.error(`[ai-provider] Gemini ${res.status}: ${errBody.slice(0, 500)}`)
      return null
    }
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch (err) {
    console.error('[ai-provider] Gemini error:', err instanceof Error ? err.message : err)
    return null
  }
}

async function callOpenAI(apiKey: string, opts: AICallOptions): Promise<string | null> {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model || 'gpt-4o',
        max_tokens: opts.maxTokens || 2048,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.user },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => 'unable to read body')
      console.error(`[ai-provider] OpenAI ${res.status}: ${errBody.slice(0, 500)}`)
      return null
    }
    const data = await res.json()
    return data.choices?.[0]?.message?.content || null
  } catch (err) {
    console.error('[ai-provider] OpenAI error:', err instanceof Error ? err.message : err)
    return null
  }
}

async function callAnthropic(apiKey: string, opts: AICallOptions): Promise<string | null> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: opts.model || 'claude-sonnet-4-20250514',
        max_tokens: opts.maxTokens || 2048,
        system: opts.system,
        messages: [{ role: 'user', content: opts.user }],
      }),
      signal: AbortSignal.timeout(45000),
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => 'unable to read body')
      console.error(`[ai-provider] Anthropic ${res.status}: ${errBody.slice(0, 500)}`)
      return null
    }
    const data = await res.json()
    return data.content?.[0]?.type === 'text' ? data.content[0].text : null
  } catch (err) {
    console.error('[ai-provider] Anthropic error:', err instanceof Error ? err.message : err)
    return null
  }
}

async function callOpenRouter(apiKey: string, opts: AICallOptions): Promise<string | null> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://0nmcp.com',
        'X-Title': '0nMCP Console',
      },
      body: JSON.stringify({
        model: opts.model || 'anthropic/claude-sonnet-4-20250514',
        max_tokens: opts.maxTokens || 2048,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.user },
        ],
      }),
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => 'unable to read body')
      console.error(`[ai-provider] OpenRouter ${res.status}: ${errBody.slice(0, 500)}`)
      return null
    }
    const data = await res.json()
    return data.choices?.[0]?.message?.content || null
  } catch (err) {
    console.error('[ai-provider] OpenRouter error:', err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * Call a specific provider directly.
 */
export function callProvider(provider: AIProviderId, apiKey: string, opts: AICallOptions): Promise<string | null> {
  switch (provider) {
    case 'gemini': return callGemini(apiKey, opts)
    case 'openai': return callOpenAI(apiKey, opts)
    case 'anthropic': return callAnthropic(apiKey, opts)
    case 'openrouter': return callOpenRouter(apiKey, opts)
  }
}

// ── Main AI Call Function ──

/**
 * Universal AI call — tries providers in order based on user's preference.
 *
 * @param opts - system prompt, user message, maxTokens
 * @param userId - optional user ID for per-user provider lookup
 * @returns { text, provider } or null if all providers fail
 */
export async function callAI(
  opts: AICallOptions,
  userId?: string
): Promise<AICallResult | null> {
  const order = await resolveProviderOrder(userId)
  console.log(`[ai-provider] callAI order: ${order.join(' → ')} (user: ${userId || 'none'})`)

  for (const provider of order) {
    const key = getProviderKey(provider)
    if (!key) {
      console.log(`[ai-provider] ${provider}: no key, skipping`)
      continue
    }

    console.log(`[ai-provider] Trying ${provider}...`)
    const text = await callProvider(provider, key, opts)
    if (text) {
      console.log(`[ai-provider] ${provider} succeeded`)
      return { text, provider }
    }
    console.log(`[ai-provider] ${provider} returned null`)
  }

  console.error('[ai-provider] callAI: ALL providers failed')
  return null
}

/**
 * Call AI with conversation history (for chat routes).
 * Tries providers in user's preferred order.
 */
export async function callAIChat(
  system: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  userId?: string,
  maxTokens?: number
): Promise<AICallResult | null> {
  const order = await resolveProviderOrder(userId)
  console.log(`[ai-provider] callAIChat order: ${order.join(' → ')} (user: ${userId || 'none'})`)

  for (const provider of order) {
    const key = getProviderKey(provider)
    if (!key) {
      console.log(`[ai-provider] chat ${provider}: no key, skipping`)
      continue
    }

    console.log(`[ai-provider] chat trying ${provider}...`)
    const text = await callProviderChat(provider, key, system, messages, maxTokens)
    if (text) {
      console.log(`[ai-provider] chat ${provider} succeeded`)
      return { text, provider }
    }
    console.log(`[ai-provider] chat ${provider} returned null`)
  }

  console.error('[ai-provider] callAIChat: ALL providers failed')
  return null
}

async function callProviderChat(
  provider: AIProviderId,
  apiKey: string,
  system: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxTokens = 4000
): Promise<string | null> {
  try {
    if (provider === 'gemini') {
      // Gemini uses a different format for multi-turn
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents,
            generationConfig: { maxOutputTokens: maxTokens },
          }),
          signal: AbortSignal.timeout(45000),
        }
      )
      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        console.error(`[ai-chat] Gemini ${res.status}: ${errBody.slice(0, 500)}`)
        return null
      }
      const data = await res.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null
    }

    if (provider === 'openai') {
      const oaiMessages = [
        { role: 'system' as const, content: system },
        ...messages,
      ]
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: maxTokens,
          messages: oaiMessages,
        }),
        signal: AbortSignal.timeout(45000),
      })
      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        console.error(`[ai-chat] OpenAI ${res.status}: ${errBody.slice(0, 500)}`)
        return null
      }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || null
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: maxTokens,
          system,
          messages,
        }),
        signal: AbortSignal.timeout(45000),
      })
      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        console.error(`[ai-chat] Anthropic ${res.status}: ${errBody.slice(0, 500)}`)
        return null
      }
      const data = await res.json()
      return data.content?.[0]?.type === 'text' ? data.content[0].text : null
    }

    if (provider === 'openrouter') {
      const orMessages = [
        { role: 'system' as const, content: system },
        ...messages,
      ]
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://0nmcp.com',
          'X-Title': '0nMCP Console',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4-20250514',
          max_tokens: maxTokens,
          messages: orMessages,
        }),
        signal: AbortSignal.timeout(60000),
      })
      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        console.error(`[ai-chat] OpenRouter ${res.status}: ${errBody.slice(0, 500)}`)
        return null
      }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || null
    }

    return null
  } catch (err) {
    console.error(`[ai-chat] ${provider} error:`, err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * Invalidate the provider cache for a user (call after admin updates).
 */
export function invalidateProviderCache(userId: string): void {
  providerCache.delete(userId)
}
