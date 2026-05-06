/**
 * Canonical AI call helper for the entire RocketOpp / 0n ecosystem.
 *
 * SOP (codified 2026-05-06):
 *   1. CRM Agent Studio  → free (uses agency prepaid token allowance)
 *   2. Groq llama-3.3-70b-versatile → ~$0.001/call fallback
 *   3. Heuristic / template fallback → never throws
 *
 * Universal env vars (every Vercel project, all type:plain):
 *   CRM_LOCATION_ID
 *   CRM_AGENT_ID
 *   CRM_PIT_TOKEN     (agency PIT)
 *   GROQ_API_KEY
 *
 * Reference implementation: ~/Desktop/GitHub/verifiedsxo/lib/research.ts
 *
 * This file is intentionally portable. Drop into any repo's lib/ folder
 * with no other dependencies (no Supabase, no project-specific imports).
 */

const CRM_API = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile'
const DEFAULT_TIMEOUT_MS = 25_000

export type AISource = 'crm_agent' | 'groq' | 'fallback'

export interface AICallOptions {
  /** When true, request structured JSON output. Both providers honor this. */
  json?: boolean
  /** Max tokens (default 900). */
  maxTokens?: number
  /** Sampling temperature (default 0.3). */
  temperature?: number
  /** Per-call Groq model override. Default llama-3.3-70b-versatile. */
  groqModel?: string
  /** Skip CRM tier (e.g. for streaming-adjacent calls where speed beats free). */
  skipCRM?: boolean
  /** Skip Groq tier (e.g. for paranoid air-gapped builds). */
  skipGroq?: boolean
  /** Heuristic fallback string used if both AI tiers fail. */
  fallbackText?: string
  /** Per-call timeout (ms). Default 25s. */
  timeoutMs?: number
}

export interface AICallResult {
  text: string
  source: AISource
  /** True when both AI tiers failed and fallbackText was returned. */
  degraded: boolean
}

/**
 * Single canonical entry point for AI text/JSON calls.
 *
 * Returns `{ text, source, degraded }`. Never throws — degrades gracefully
 * to the heuristic so callers don't need their own error handling for the
 * AI itself (only for parsing what they get back).
 */
export async function askAI(prompt: string, opts: AICallOptions = {}): Promise<AICallResult> {
  const {
    json = false,
    maxTokens = 900,
    temperature = 0.3,
    groqModel = DEFAULT_GROQ_MODEL,
    skipCRM = false,
    skipGroq = false,
    fallbackText = '',
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = opts

  // Tier 1 — CRM Agent Studio
  if (!skipCRM) {
    const text = await tryCRMAgent(prompt, timeoutMs)
    if (text) return { text, source: 'crm_agent', degraded: false }
  }

  // Tier 2 — Groq
  if (!skipGroq) {
    const text = await tryGroq(prompt, { json, maxTokens, temperature, model: groqModel, timeoutMs })
    if (text) return { text, source: 'groq', degraded: false }
  }

  // Tier 3 — heuristic
  return { text: fallbackText, source: 'fallback', degraded: true }
}

// ──────────────────────────────────────────────────────────────────────────
// CRM Agent Studio
// ──────────────────────────────────────────────────────────────────────────

async function tryCRMAgent(prompt: string, timeoutMs: number): Promise<string> {
  const PIT = process.env.CRM_PIT_TOKEN
  const LOC = process.env.CRM_LOCATION_ID
  const AGENT = process.env.CRM_AGENT_ID
  if (!PIT || !LOC || !AGENT) return ''

  try {
    const r = await fetch(`${CRM_API}/agent-studio/public-api/agents/${AGENT}/execute`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PIT}`,
        Version: CRM_VERSION,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ message: prompt, locationId: LOC }),
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!r.ok) return ''
    const j = (await r.json()) as unknown
    return extractAgentText(j)
  } catch {
    return ''
  }
}

function extractAgentText(resp: unknown): string {
  if (!resp || typeof resp !== 'object') return ''
  const r = resp as Record<string, unknown>
  if (typeof r.response === 'string') return r.response
  if (typeof r.message === 'string') return r.message
  if (typeof r.output === 'string') return r.output
  if (Array.isArray(r.messages)) {
    const last = r.messages[r.messages.length - 1] as Record<string, unknown> | undefined
    if (last && typeof last.content === 'string') return last.content
  }
  if (typeof r.data === 'string') return r.data
  if (r.data && typeof r.data === 'object') return extractAgentText(r.data)
  return ''
}

// ──────────────────────────────────────────────────────────────────────────
// Groq
// ──────────────────────────────────────────────────────────────────────────

async function tryGroq(
  prompt: string,
  opts: { json: boolean; maxTokens: number; temperature: number; model: string; timeoutMs: number },
): Promise<string> {
  const KEY = process.env.GROQ_API_KEY
  if (!KEY) return ''

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
        response_format: opts.json ? { type: 'json_object' } : undefined,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(opts.timeoutMs),
    })
    if (!r.ok) return ''
    const j = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> }
    return j?.choices?.[0]?.message?.content || ''
  } catch {
    return ''
  }
}

// ──────────────────────────────────────────────────────────────────────────
// JSON helper
// ──────────────────────────────────────────────────────────────────────────

/**
 * Convenience: call askAI with json:true, parse the response, return null on
 * any parse failure. The caller decides what to do with null (use defaults,
 * retry, etc).
 */
export async function askAIForJson<T = unknown>(
  prompt: string,
  opts: Omit<AICallOptions, 'json'> = {},
): Promise<{ data: T | null; source: AISource; degraded: boolean }> {
  const { text, source, degraded } = await askAI(prompt, { ...opts, json: true })
  if (!text) return { data: null, source, degraded }
  try {
    const trimmed = text.trim()
    const start = trimmed.startsWith('{') ? trimmed : trimmed.match(/\{[\s\S]*\}/)?.[0]
    if (!start) return { data: null, source, degraded }
    return { data: JSON.parse(start) as T, source, degraded }
  } catch {
    return { data: null, source, degraded }
  }
}
