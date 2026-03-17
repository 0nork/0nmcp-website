import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { email, name } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const admin = createClient(url, key)

  const { error } = await admin
    .from('blog_subscribers')
    .upsert(
      { email: email.toLowerCase().trim(), name: name?.trim() || null, confirmed: true, source: 'website' },
      { onConflict: 'email' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'Subscribed successfully' })
}
