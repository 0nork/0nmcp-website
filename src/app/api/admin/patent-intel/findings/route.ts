import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const threatLevel = searchParams.get('threat_level')
  const scanType = searchParams.get('scan_type')
  const reviewed = searchParams.get('reviewed')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = db()
    .from('intel_findings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (threatLevel && threatLevel !== 'all') query = query.eq('threat_level', threatLevel)
  if (scanType && scanType !== 'all') query = query.eq('scan_type', scanType)
  if (reviewed === 'true') query = query.eq('reviewed', true)
  if (reviewed === 'false') query = query.eq('reviewed', false)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ findings: data || [], total: count || 0 })
}
