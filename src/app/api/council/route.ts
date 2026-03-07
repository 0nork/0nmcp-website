import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { decryptVaultData } from '@/lib/vault-crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type AIProvider = 'anthropic' | 'openai' | 'google'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getUserAIKey(userId: string, serviceName: string): Promise<string | null> {
  try {
    const admin = getAdmin()
    const { data: row } = await admin
      .from('user_vaults')
      .select('encrypted_key, iv, salt')
      .eq('user_id', userId)
      .eq('service_name', serviceName)
      .maybeSingle()

    if (!row?.encrypted_key || !row?.iv || !row?.salt) return null

    const plaintext = await decryptVaultData(userId, row.encrypted_key, row.iv, row.salt)
    try {
      const parsed = JSON.parse(plaintext)
      return parsed.api_key || null
    } catch {
      return plaintext || null
    }
  } catch {
    return null
  }
}

/* ─── AI PROVIDER CALLS ─────────────────────────────────────── */

async function callClaude(apiKey: string, system: string, user: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages: [{ role: 'user', content: user }],
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.content?.[0]?.text || null
  } catch {
    return null
  }
}

async function callOpenAI(apiKey: string, system: string, user: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.choices?.[0]?.message?.content || null
  } catch {
    return null
  }
}

async function callGemini(apiKey: string, system: string, user: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ parts: [{ text: user }] }],
          generationConfig: { maxOutputTokens: 1000 },
        }),
        signal: AbortSignal.timeout(30000),
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch {
    return null
  }
}

/* ─── MAIN HANDLER — AI FEDERATION ──────────────────────────── */

export async function POST(request: NextRequest) {
  const { system, user } = await request.json()

  if (!system || !user) {
    return NextResponse.json({ error: 'Missing system or user prompt', text: '[error: missing prompt]' }, { status: 400 })
  }

  // Get authenticated user for BYOK vault access
  let userId: string | null = null
  try {
    const supabase = await createSupabaseServer()
    if (supabase) {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      userId = authUser?.id || null
    }
  } catch { /* continue without auth */ }

  const providers: AIProvider[] = ['anthropic', 'openai', 'google']

  // ── Layer 1: User's own vault keys (BYOK) ────────────────
  if (userId) {
    for (const provider of providers) {
      const userKey = await getUserAIKey(userId, provider)
      if (!userKey) continue

      let text: string | null = null
      if (provider === 'anthropic') text = await callClaude(userKey, system, user)
      else if (provider === 'openai') text = await callOpenAI(userKey, system, user)
      else if (provider === 'google') text = await callGemini(userKey, system, user)

      if (text) {
        return NextResponse.json({ text, provider })
      }
    }
  }

  // ── Layer 2: Platform keys from env ───────────────────────
  const platformKeys = ([
    { provider: 'anthropic' as AIProvider, key: process.env.ANTHROPIC_API_KEY || '' },
    { provider: 'openai' as AIProvider, key: process.env.OPENAI_API_KEY || '' },
    { provider: 'google' as AIProvider, key: process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY || '' },
  ] as { provider: AIProvider; key: string }[]).filter(p => p.key.length > 0)

  for (const { provider, key } of platformKeys) {
    let text: string | null = null
    if (provider === 'anthropic') text = await callClaude(key, system, user)
    else if (provider === 'openai') text = await callOpenAI(key, system, user)
    else if (provider === 'google') text = await callGemini(key, system, user)

    if (text) {
      return NextResponse.json({ text, provider })
    }
  }

  // ── Layer 3: Graceful degradation ─────────────────────────
  return NextResponse.json({
    text: 'I need an AI key to generate responses. Please add an API key (Claude, GPT-4o, or Gemini) in the Console Vault under Credentials. Any one of these will power the entire Council system.',
    provider: 'none',
    fallback: true,
  })
}
