import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { streamConversionEvent } from '@/lib/linkedin/ads'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: member } = await admin
    .from('linkedin_members')
    .select('linkedin_access_token, token_expires_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member?.linkedin_access_token) {
    return NextResponse.json({ error: 'LinkedIn not connected' }, { status: 400 })
  }

  let body: { conversionRuleId?: string; email?: string; amount?: string; currency?: string; timestamp?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.conversionRuleId || !body.email) {
    return NextResponse.json({ error: 'conversionRuleId and email required' }, { status: 400 })
  }

  // SHA-256 hash the email
  const encoder = new TextEncoder()
  const data2 = encoder.encode(body.email.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data2)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const emailHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  try {
    await streamConversionEvent(member.linkedin_access_token, {
      conversion: `urn:lla:llaPartnerConversion:${body.conversionRuleId}`,
      conversionHappenedAt: body.timestamp || Date.now(),
      conversionValue: body.amount ? { amount: body.amount, currencyCode: body.currency || 'USD' } : undefined,
      user: {
        userIds: [{ idType: 'SHA256_EMAIL', idValue: emailHash }],
      },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Failed to stream conversion',
    }, { status: 502 })
  }
}
