import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { generateSequence, type SequenceConfig } from '@/lib/outreach-enricher'
import { checkBalance, deductRuns, isOwner } from '@/lib/runs'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/outreach/sequence — Generate a cold email sequence
 *
 * Body: { service, caseStudies, guarantees, ctas, templates[], personalizations[] }
 * Returns: { sequence: string }
 *
 * Cost: 5 Runs per generation (owner bypass)
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const config: SequenceConfig = {
    service: body.service || '',
    caseStudies: body.caseStudies || body.case_studies || '',
    guarantees: body.guarantees || '',
    ctas: body.ctas || '',
    templates: body.templates || [],
    personalizations: body.personalizations || [],
  }

  if (!config.service) {
    return NextResponse.json({ error: 'Service being sold is required' }, { status: 400 })
  }

  // Check Runs balance (owner bypass)
  if (!isOwner(user.email || '')) {
    const check = await checkBalance(user.id, 'api.outreach.sequence', user.email || '')
    if (!check.allowed) {
      return NextResponse.json({
        error: 'insufficient_runs',
        message: `Need ${check.cost} Runs, have ${check.balance}.`,
      }, { status: 402 })
    }
  }

  try {
    const sequence = await generateSequence(config)

    if (!isOwner(user.email || '')) {
      await deductRuns(user.id, 'api.outreach.sequence', 'Outreach: generate email sequence')
    }

    return NextResponse.json({ sequence })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
