/**
 * AI Provider Utility — Universal AI routing for 0nmcp.com
 *
 * 10 providers, prioritized by user preference then platform default.
 * OpenAI-compatible providers share a unified call function.
 *
 * Provider order: user's default_ai_providers → platform fallback order
 * Platform default: groq → deepseek → gemini → openrouter → perplexity → openai → anthropic → mistral → xai → together
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Types ──

export type AIProviderId =
  | 'gemini' | 'openai' | 'anthropic' | 'openrouter'
  | 'groq' | 'deepseek' | 'perplexity' | 'mistral' | 'xai' | 'together'

export const ALL_PROVIDER_IDS: AIProviderId[] = [
  'groq', 'deepseek', 'gemini', 'openrouter', 'perplexity',
  'openai', 'anthropic', 'mistral', 'xai', 'together',
]

export interface AICallOptions {
  system: string
  user: string
  maxTokens?: number
  model?: string
}

export interface AICallResult {
  text: string
  provider: AIProviderId
}

// ── Provider Config ──

interface ProviderConfig {
  name: string
  envKeys: string[]
  baseUrl: string
  defaultModel: string
  defaultChatModel?: string
  /** Custom headers beyond Authorization */
  extraHeaders?: Record<string, string>
  /** For Gemini/Anthropic which have non-OpenAI formats */
  format: 'openai' | 'gemini' | 'anthropic'
  timeout?: number
}

const PROVIDERS: Record<AIProviderId, ProviderConfig> = {
  groq: {
    name: 'Groq',
    envKeys: ['GROQ_API_KEY'],
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    defaultChatModel: 'llama-3.3-70b-versatile',
    format: 'openai',
  },
  deepseek: {
    name: 'DeepSeek',
    envKeys: ['DEEPSEEK_API_KEY'],
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    defaultModel: 'deepseek-chat',
    defaultChatModel: 'deepseek-chat',
    format: 'openai',
  },
  gemini: {
    name: 'Gemini',
    envKeys: ['GOOGLE_GEMINI_API_KEY', 'GOOGLE_AI_KEY', 'GEMINI_API_KEY'],
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-2.5-flash-lite',
    format: 'gemini',
  },
  openrouter: {
    name: 'OpenRouter',
    envKeys: ['OPENROUTER_API_KEY'],
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'anthropic/claude-4-sonnet-20250522',
    defaultChatModel: 'anthropic/claude-4-sonnet-20250522',
    extraHeaders: { 'HTTP-Referer': 'https://0nmcp.com', 'X-Title': '0nMCP Console' },
    format: 'openai',
    timeout: 60000,
  },
  perplexity: {
    name: 'Perplexity',
    envKeys: ['PERPLEXITY_API_KEY'],
    baseUrl: 'https://api.perplexity.ai/chat/completions',
    defaultModel: 'sonar',
    defaultChatModel: 'sonar',
    format: 'openai',
  },
  openai: {
    name: 'OpenAI',
    envKeys: ['OPENAI_API_KEY'],
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o',
    defaultChatModel: 'gpt-4o',
    format: 'openai',
  },
  anthropic: {
    name: 'Anthropic',
    envKeys: ['ANTHROPIC_API_KEY'],
    baseUrl: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-sonnet-4-20250514',
    format: 'anthropic',
  },
  mistral: {
    name: 'Mistral',
    envKeys: ['MISTRAL_API_KEY'],
    baseUrl: 'https://api.mistral.ai/v1/chat/completions',
    defaultModel: 'mistral-large-latest',
    defaultChatModel: 'mistral-large-latest',
    format: 'openai',
  },
  xai: {
    name: 'xAI Grok',
    envKeys: ['XAI_API_KEY'],
    baseUrl: 'https://api.x.ai/v1/chat/completions',
    defaultModel: 'grok-3-fast',
    defaultChatModel: 'grok-3-fast',
    format: 'openai',
    timeout: 60000,
  },
  together: {
    name: 'Together AI',
    envKeys: ['TOGETHER_API_KEY'],
    baseUrl: 'https://api.together.xyz/v1/chat/completions',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    defaultChatModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    format: 'openai',
  },
}

// ── Platform default order (cheapest/fastest first) ──
const DEFAULT_PROVIDER_ORDER: AIProviderId[] = [
  'groq', 'deepseek', 'gemini', 'openrouter', 'perplexity',
  'openai', 'anthropic', 'mistral', 'xai', 'together',
]

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

export function getProviderKey(provider: AIProviderId): string {
  const config = PROVIDERS[provider]
  if (!config) return ''
  for (const envKey of config.envKeys) {
    const val = process.env[envKey]
    if (val) return val
  }
  return ''
}

// ── Per-user provider lookup ──

const providerCache = new Map<string, { providers: AIProviderId[] | null; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000

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
      ? providers.filter(p => ALL_PROVIDER_IDS.includes(p))
      : null

    const result = valid && valid.length > 0 ? valid : null
    providerCache.set(userId, { providers: result, ts: Date.now() })
    return result
  } catch {
    return null
  }
}

/**
 * Resolve provider order: user's preferred first, then remaining as fallback.
 */
export async function resolveProviderOrder(userId?: string): Promise<AIProviderId[]> {
  if (userId) {
    const custom = await getUserAIProviders(userId)
    if (custom) {
      const remaining = DEFAULT_PROVIDER_ORDER.filter(p => !custom.includes(p))
      return [...custom, ...remaining]
    }
  }
  return DEFAULT_PROVIDER_ORDER
}

// ── Unified provider call functions ──

/**
 * Call any OpenAI-compatible provider (most of them).
 */
async function callOpenAICompatible(
  provider: AIProviderId,
  apiKey: string,
  opts: AICallOptions
): Promise<string | null> {
  const config = PROVIDERS[provider]
  if (!config) return null

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...config.extraHeaders,
    }

    const res = await fetch(config.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: opts.model || config.defaultModel,
        max_tokens: opts.maxTokens || 2048,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.user },
        ],
      }),
      signal: AbortSignal.timeout(config.timeout || 45000),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.error(`[ai-provider] ${config.name} ${res.status}: ${errBody.slice(0, 500)}`)
      return null
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || null
  } catch (err) {
    console.error(`[ai-provider] ${config.name} error:`, err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * Call Gemini (non-OpenAI format, uses API key in URL + Referer header).
 */
async function callGemini(apiKey: string, opts: AICallOptions): Promise<string | null> {
  try {
    const model = opts.model || 'gemini-2.5-flash-lite'
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://0nmcp.com',
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: opts.system }] },
          contents: [{ parts: [{ text: opts.user }] }],
          generationConfig: { maxOutputTokens: opts.maxTokens || 2048 },
        }),
        signal: AbortSignal.timeout(45000),
      }
    )
    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
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

/**
 * Call Anthropic (non-OpenAI format).
 */
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
      const errBody = await res.text().catch(() => '')
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

/**
 * Route to the correct call function based on provider format.
 */
export function callProvider(provider: AIProviderId, apiKey: string, opts: AICallOptions): Promise<string | null> {
  const config = PROVIDERS[provider]
  if (!config) return Promise.resolve(null)

  switch (config.format) {
    case 'gemini': return callGemini(apiKey, opts)
    case 'anthropic': return callAnthropic(apiKey, opts)
    case 'openai': return callOpenAICompatible(provider, apiKey, opts)
  }
}

// ── Main AI Call Functions ──

export async function callAI(
  opts: AICallOptions,
  userId?: string
): Promise<AICallResult | null> {
  const order = await resolveProviderOrder(userId)
  console.log(`[ai-provider] callAI order: ${order.join(' → ')} (user: ${userId || 'none'})`)

  for (const provider of order) {
    const key = getProviderKey(provider)
    if (!key) continue

    console.log(`[ai-provider] Trying ${provider}...`)
    const text = await callProvider(provider, key, opts)
    if (text) {
      console.log(`[ai-provider] ${provider} succeeded`)
      return { text, provider }
    }
  }

  console.error('[ai-provider] callAI: ALL providers failed')
  return null
}

/**
 * Call AI with conversation history (chat format).
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
    if (!key) continue

    console.log(`[ai-provider] chat trying ${provider}...`)
    const text = await callProviderChat(provider, key, system, messages, maxTokens)
    if (text) {
      console.log(`[ai-provider] chat ${provider} succeeded`)
      return { text, provider }
    }
  }

  console.error('[ai-provider] callAIChat: ALL providers failed')
  return null
}

/**
 * Chat-format call with multi-turn history.
 */
async function callProviderChat(
  provider: AIProviderId,
  apiKey: string,
  system: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxTokens = 4000
): Promise<string | null> {
  const config = PROVIDERS[provider]
  if (!config) return null

  try {
    // ── Gemini (custom format) ──
    if (config.format === 'gemini') {
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://0nmcp.com',
          },
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

    // ── Anthropic (custom format) ──
    if (config.format === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.defaultModel,
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

    // ── All OpenAI-compatible providers ──
    const chatMessages = [
      { role: 'system' as const, content: system },
      ...messages,
    ]
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...config.extraHeaders,
    }

    const res = await fetch(config.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.defaultChatModel || config.defaultModel,
        max_tokens: maxTokens,
        messages: chatMessages,
      }),
      signal: AbortSignal.timeout(config.timeout || 45000),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.error(`[ai-chat] ${config.name} ${res.status}: ${errBody.slice(0, 500)}`)
      return null
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || null
  } catch (err) {
    console.error(`[ai-chat] ${config.name} error:`, err instanceof Error ? err.message : err)
    return null
  }
}

/**
 * Invalidate the provider cache for a user.
 */
export function invalidateProviderCache(userId: string): void {
  providerCache.delete(userId)
}

/**
 * Get provider display info for UI.
 */
export function getProviderInfo(provider: AIProviderId) {
  const config = PROVIDERS[provider]
  return config ? { name: config.name, model: config.defaultModel } : null
}
