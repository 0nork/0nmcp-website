import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string }
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders })
  }

  const { name, email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400, headers: corsHeaders })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name || '' } } })

  if (error) return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders })

  if (data.session) {
    return NextResponse.json({
      token: data.session.access_token,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: { id: data.user?.id, email: data.user?.email, name: name || data.user?.email?.split('@')[0] },
    }, { headers: corsHeaders })
  }

  return NextResponse.json({ message: 'Check your email to confirm your account', confirm_required: true }, { headers: corsHeaders })
}
