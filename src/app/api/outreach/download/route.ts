import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/outreach/download — Convert enriched results to CSV and return as download
 *
 * Body: { results: Record<string, string>[], filename?: string }
 * Returns: CSV file as attachment
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const results = body.results as Record<string, string>[]
  const filename = body.filename || 'enriched.csv'

  if (!results || results.length === 0) {
    return NextResponse.json({ error: 'No results to download' }, { status: 400 })
  }

  // Collect all unique headers across all rows
  const headerSet = new Set<string>()
  for (const row of results) {
    for (const key of Object.keys(row)) {
      headerSet.add(key)
    }
  }
  const headers = Array.from(headerSet)

  // Build CSV
  const lines: string[] = []
  lines.push(headers.map(h => escapeCSV(h)).join(','))

  for (const row of results) {
    const values = headers.map(h => escapeCSV(row[h] || ''))
    lines.push(values.join(','))
  }

  const csv = lines.join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
