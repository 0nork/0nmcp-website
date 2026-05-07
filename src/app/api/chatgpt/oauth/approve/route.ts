import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { auth_req_id } = await req.json()

  // Get authenticated user from Supabase session
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  )

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: authReq } = await db
    .from('chatgpt_auth_requests')
    .select('*')
    .eq('id', auth_req_id)
    .eq('status', 'pending')
    .single()

  if (!authReq || new Date(authReq.expires_at) < new Date()) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  await db
    .from('chatgpt_auth_requests')
    .update({ status: 'authorized', user_id: user.id })
    .eq('id', auth_req_id)

  const redirect = new URL(authReq.redirect_uri)
  redirect.searchParams.set('code', authReq.auth_code)
  if (authReq.state) redirect.searchParams.set('state', authReq.state)

  return NextResponse.json({ redirect_to: redirect.toString() })
}
