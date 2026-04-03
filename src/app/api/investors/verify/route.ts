import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false, error: 'No token provided' })
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(token)) {
      return NextResponse.json({ valid: false, error: 'Invalid token format' })
    }

    const supabase = getAdmin()

    const { data, error } = await supabase
      .from('nda_signatures')
      .select('id, full_name, email, signed_at, expires_at, revoked, views')
      .eq('access_token', token)
      .single()

    if (error || !data) {
      return NextResponse.json({ valid: false, error: 'Token not found' })
    }

    if (data.revoked) {
      return NextResponse.json({ valid: false, error: 'Access has been revoked' })
    }

    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Token has expired' })
    }

    // Increment view count
    await supabase
      .from('nda_signatures')
      .update({
        views: (data.views || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', data.id)

    return NextResponse.json({
      valid: true,
      name: data.full_name,
      email: data.email,
      signed_at: data.signed_at,
    })
  } catch (err) {
    console.error('NDA verify error:', err)
    return NextResponse.json({ valid: false, error: 'Internal server error' })
  }
}
