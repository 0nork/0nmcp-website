import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { enrichRow, type FieldKey, type CustomField, type LeadRow } from '@/lib/outreach-enricher'
import { checkBalance, deductRuns, isOwner } from '@/lib/runs'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for enrichment

/**
 * POST /api/outreach/enrich — Qualify and enrich a single lead row
 *
 * Body: { row: LeadRow, fields: FieldKey[], customFields: CustomField[] }
 * Returns: { result: EnrichResult }
 *
 * Cost: 1 Spark per lead (owner bypass)
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const { row, fields, customFields } = body as {
    row: LeadRow
    fields: FieldKey[]
    customFields: CustomField[]
  }

  if (!row) {
    return NextResponse.json({ error: 'Row data required' }, { status: 400 })
  }

  // Check Runs balance (owner bypass)
  if (!isOwner(user.email || '')) {
    const check = await checkBalance(user.id, 'api.outreach.enrich', user.email || '')
    if (!check.allowed) {
      return NextResponse.json({
        error: 'insufficient_runs',
        message: `Need ${check.cost} Runs, have ${check.balance}.`,
      }, { status: 402 })
    }
  }

  try {
    const result = await enrichRow(row, fields || [], customFields || [])

    // Deduct Runs after successful enrichment
    if (!isOwner(user.email || '')) {
      await deductRuns(user.id, 'api.outreach.enrich', 'Outreach: enrich lead')
    }

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
