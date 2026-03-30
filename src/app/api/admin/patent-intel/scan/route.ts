import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Rate limit: 1 scan per type per 30 minutes
const RATE_LIMIT_MS = 30 * 60 * 1000

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const scanType = body.scan_type || 'all'

    // Check rate limit
    const db = supabase()
    const { data: recent } = await db
      .from('intel_scans')
      .select('created_at')
      .eq('scan_type', scanType)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (recent) {
      const elapsed = Date.now() - new Date(recent.created_at).getTime()
      if (elapsed < RATE_LIMIT_MS) {
        const waitMins = Math.ceil((RATE_LIMIT_MS - elapsed) / 60000)
        return NextResponse.json(
          { error: `Rate limited. Next ${scanType} scan available in ${waitMins} minutes.` },
          { status: 429 }
        )
      }
    }

    // Import and run scan async
    const { runScan } = await import('@/lib/patent-intel/scan-engine')
    runScan(scanType).catch(err => console.error('[0nDefender] Scan error:', err))

    return NextResponse.json({
      success: true,
      message: `${scanType} scan initiated`,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 })
  }
}
