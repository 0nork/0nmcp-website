/**
 * Marketplace Stats API
 * GET /api/marketplace/stats
 *
 * Returns installation count, execution stats, trigger count.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const [installations, triggers, executions] = await Promise.all([
      db.from('marketplace_installations').select('id', { count: 'exact' }).eq('active', true),
      db.from('marketplace_triggers').select('id', { count: 'exact' }).eq('active', true),
      db.from('marketplace_executions').select('id, status', { count: 'exact' }),
    ])

    const successCount = executions.data?.filter((e) => e.status === 'success').length || 0

    return NextResponse.json({
      installations: installations.count || 0,
      activeTriggers: triggers.count || 0,
      totalExecutions: executions.count || 0,
      successfulExecutions: successCount,
      successRate: executions.count ? Math.round((successCount / executions.count) * 100) : 0,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({
      installations: 0,
      activeTriggers: 0,
      totalExecutions: 0,
      successfulExecutions: 0,
      successRate: 0,
    })
  }
}
