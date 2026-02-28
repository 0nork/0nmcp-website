import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, no-cache',
}

// 1x1 transparent GIF (43 bytes)
const TRANSPARENT_GIF = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b,
])

function extractBrowser(ua: string): string {
  if (!ua) return 'Unknown'
  if (ua.includes('Edg/') || ua.includes('Edge/')) return 'Edge'
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera'
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari'
  return 'Other'
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { s: siteId, p: pageUrl, r: referrer, d: userAgent, t: timestamp } = body

    if (!siteId) {
      return NextResponse.json(
        { error: 'Missing site_id (s)' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const browser = extractBrowser(userAgent || '')
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent || '')
    const device = isMobile ? 'mobile' : 'desktop'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase.from('tracking_events').insert({
      site_id: siteId,
      page_url: pageUrl || null,
      referrer: referrer || null,
      event_type: 'pageview',
      device,
      browser,
      session_id: generateSessionId(),
      created_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    })

    if (error) {
      console.error('Tracking insert error:', error)
      return NextResponse.json(
        { ok: false, error: 'Insert failed' },
        { status: 500, headers: CORS_HEADERS }
      )
    }

    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS })
  } catch (err) {
    console.error('Tracking POST error:', err)
    return NextResponse.json(
      { ok: false, error: 'Invalid request' },
      { status: 400, headers: CORS_HEADERS }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('s')
    const pageUrl = searchParams.get('p')
    const referrer = searchParams.get('r')

    if (siteId) {
      const userAgent = request.headers.get('user-agent') || ''
      const browser = extractBrowser(userAgent)
      const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)
      const device = isMobile ? 'mobile' : 'desktop'

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      await supabase.from('tracking_events').insert({
        site_id: siteId,
        page_url: pageUrl || null,
        referrer: referrer || null,
        event_type: 'pageview',
        device,
        browser,
        session_id: generateSessionId(),
        created_at: new Date().toISOString(),
      })
    }

    return new NextResponse(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'image/gif',
        'Content-Length': String(TRANSPARENT_GIF.length),
      },
    })
  } catch {
    return new NextResponse(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'image/gif',
        'Content-Length': String(TRANSPARENT_GIF.length),
      },
    })
  }
}
