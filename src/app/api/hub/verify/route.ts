// app/api/hub/verify/route.ts
// Judges an IKY answer with AI — forgiving of casual phrasing, abbreviations,
// partial names (it must be EASY for the real person, hard for anyone else).
// On success, trusts this device for 30 days.
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { getUserVaultServices } from '@/lib/vault-bridge'
import { hubTrustToken, expectedFor } from '@/lib/hub-gate'
import { askAIForJson } from '@/lib/ai-call'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  )
  const user = (await supabase.auth.getSession()).data.session?.user
  if (!user) return NextResponse.json({ ok: false, error: 'not_authenticated' }, { status: 401 })

  const { challengeId, answer } = await req.json().catch(() => ({}))
  if (!challengeId || !answer || typeof answer !== 'string') {
    return NextResponse.json({ ok: false, error: 'missing_answer' }, { status: 400 })
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const { data: p } = await admin
    .from('profiles')
    .select('full_name, display_name, company, business_name, business_type, website')
    .eq('id', user.id)
    .single()
  const services = await getUserVaultServices(user.id).catch(() => [] as string[])
  const expected = expectedFor(String(challengeId), p || {}, services, user.email || '')

  if (!expected) return NextResponse.json({ ok: false, error: 'no_reference' }, { status: 400 })

  const { data } = await askAIForJson<{ verified: boolean; reason?: string }>(
    `You verify a returning user at a secure login door. Only the real account owner should pass.
The true answer, from their private account, is: "${expected}".
They typed: "${String(answer).slice(0, 200)}".
Judge generously for a HUMAN who knows this (accept partial names, abbreviations, casual phrasing, extra words, wrong capitalization; for a list, accept any one item). Reject vague guesses or clearly different answers.
Respond ONLY JSON: {"verified": boolean, "reason": string}`,
    { temperature: 0, maxTokens: 120, fallbackText: '{"verified":false,"reason":"unavailable"}' },
  )

  const verified = !!data?.verified
  const res = NextResponse.json({ ok: verified, ...(verified ? {} : { message: "That doesn't match what's on your account. Try again." }) })
  if (verified) {
    res.cookies.set('0n_trusted', hubTrustToken(user.id), {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 30 * 24 * 60 * 60,
    })
  }
  return res
}
