import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/outreach/upload — Parse a CSV file and return rows + headers
 * Accepts multipart form data with a 'file' field containing CSV content.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const text = await file.text()
    const rows = parseCSV(text)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV is empty or could not be parsed' }, { status: 400 })
    }

    const headers = Object.keys(rows[0])

    // Check required columns
    const hasCompanyName = headers.some(h =>
      h.toLowerCase() === 'company name' || h.toLowerCase() === 'company_name'
    )
    const hasCompanyUrl = headers.some(h =>
      h.toLowerCase() === 'company url' || h.toLowerCase() === 'company_domain'
    )

    if (!hasCompanyName || !hasCompanyUrl) {
      return NextResponse.json({
        error: 'CSV must contain "Company Name" and "Company URL" columns',
        headers,
      }, { status: 400 })
    }

    return NextResponse.json({
      filename: file.name,
      totalRows: rows.length,
      headers,
      rows, // Send all rows — client manages them
      preview: rows.slice(0, 5),
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

/**
 * Parse CSV text into array of objects.
 * Handles quoted fields, newlines within quotes, and BOM.
 */
function parseCSV(text: string): Record<string, string>[] {
  // Remove BOM
  const clean = text.replace(/^\uFEFF/, '')
  const lines = splitCSVLines(clean)

  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue

    const row: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (values[j] || '').trim()
    }
    rows.push(row)
  }

  return rows
}

function splitCSVLines(text: string): string[] {
  const lines: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '"') {
      inQuotes = !inQuotes
      current += char
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') i++ // skip \r\n
      if (current.trim()) lines.push(current)
      current = ''
    } else {
      current += char
    }
  }
  if (current.trim()) lines.push(current)
  return lines
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)
  return values
}
