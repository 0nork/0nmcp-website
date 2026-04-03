import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, signature } = body

    if (!name || !email || !signature) {
      return NextResponse.json(
        { error: 'Name, email, and signature are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    const supabase = getAdmin()

    const { data, error } = await supabase
      .from('nda_signatures')
      .insert({
        full_name: name,
        email,
        company: company || null,
        signature,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select('access_token')
      .single()

    if (error) {
      console.error('NDA sign error:', error)
      return NextResponse.json(
        { error: 'Failed to process NDA signature' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, token: data.access_token })
  } catch (err) {
    console.error('NDA sign error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
