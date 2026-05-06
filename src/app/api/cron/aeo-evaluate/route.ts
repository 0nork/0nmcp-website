/**
 * CRON: AEO outcome evaluator.
 * Schedule: daily 7am ET (after blog-seo + evaluate-interventions).
 *
 * For every published post in the 14-60 day window, pull cro9_events,
 * judge engagement, persist to aeo_outcomes, then adjust aeo_weights.
 * Closes the AEO half of the SXO/AEO marriage self-learning loop.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runAEOEvaluation } from '@/lib/cro9/aeo-evaluator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  if (!isVercelCron && process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  try {
    const result = await runAEOEvaluation(supabase)
    return NextResponse.json({ ok: true, ...result, ranAt: new Date().toISOString() })
  } catch (e) {
    console.error('[cron/aeo-evaluate] failed:', e)
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
