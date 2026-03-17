import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.formData()
  const token = body.get('token')?.toString()
  const hint = body.get('token_type_hint')?.toString()

  if (!token) return NextResponse.json({}, { status: 200 })

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  if (!hint || hint === 'refresh_token') {
    await db.from('chatgpt_refresh_tokens')
      .update({ is_revoked: true })
      .eq('token', token)
  }

  // RFC 7009: always return 200
  return NextResponse.json({})
}
