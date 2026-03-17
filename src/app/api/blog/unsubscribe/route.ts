import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  const token = req.nextUrl.searchParams.get('token')

  if (!email && !token) {
    return NextResponse.json({ error: 'Email or token required' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const admin = createClient(url, key)

  let query = admin.from('blog_subscribers').update({ unsubscribed_at: new Date().toISOString() })
  if (token) query = query.eq('confirmation_token', token)
  else if (email) query = query.eq('email', email.toLowerCase().trim())

  await query

  return NextResponse.json({ ok: true, message: 'Unsubscribed' })
}
