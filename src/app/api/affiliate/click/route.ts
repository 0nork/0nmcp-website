import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { code, page } = await req.json()
    if (!code) return NextResponse.json({ ok: true })

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const hdrs = await headers()
    const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const ua = hdrs.get('user-agent') || ''
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)

    // Look up referrer
    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('referral_code', code)
      .single()

    await admin.from('affiliate_clicks').insert({
      referral_code: code,
      referrer_id: profile?.id || null,
      page_url: page || null,
      ip_hash: ipHash,
      user_agent: ua.slice(0, 500),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
