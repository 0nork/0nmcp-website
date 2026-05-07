import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import {
  getQueueStats,
  queueCommand,
  cancelCommand,
  checkVipPermission,
  getPendingCommands,
  claimCommand,
  completeCommand,
  failCommand,
  getSyncHistory,
  COMMAND_TYPES,
} from '@/lib/command-queue'

export const dynamic = 'force-dynamic'

const OWNER_EMAIL = 'mike@rocketopp.com'

/**
 * GET /api/command-queue — Get queue overview + sync history
 *
 * VIP access required. Owner always has access.
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Owner bypass or VIP check
  const isOwner = user.email === OWNER_EMAIL
  if (!isOwner) {
    const canView = await checkVipPermission(user.id, 'can_view_queue')
    if (!canView) return NextResponse.json({ error: 'VIP access required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'overview'

  if (view === 'pending') {
    const direction = (searchParams.get('direction') || 'to_offline') as 'to_offline' | 'to_live'
    const commands = await getPendingCommands(direction)
    return NextResponse.json({ commands })
  }

  if (view === 'sync') {
    const history = await getSyncHistory()
    return NextResponse.json({ history })
  }

  if (view === 'types') {
    return NextResponse.json({ types: COMMAND_TYPES })
  }

  // Default: overview
  const stats = await getQueueStats()
  return NextResponse.json(stats)
}

/**
 * POST /api/command-queue — Queue a new command or perform an action
 *
 * Body:
 *   { action: 'queue', command_type, payload, priority? }
 *   { action: 'claim', command_id }
 *   { action: 'complete', command_id, result }
 *   { action: 'fail', command_id, error }
 *   { action: 'cancel', command_id }
 */
export async function POST(request: NextRequest) {
  // Check for service role / cron secret (for 0nCommand sync)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  let isServiceAuth = false

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    isServiceAuth = true
  }

  let userId: string
  let isOwner = false

  if (isServiceAuth) {
    userId = 'system'
    isOwner = true
  } else {
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    userId = user.id
    isOwner = user.email === OWNER_EMAIL
  }

  const body = await request.json()
  const { action } = body

  switch (action) {
    case 'queue': {
      if (!isOwner) {
        const canQueue = await checkVipPermission(userId, 'can_queue_commands')
        if (!canQueue) return NextResponse.json({ error: 'VIP queue permission required' }, { status: 403 })
      }

      const cmd = await queueCommand(userId, body.command_type, body.payload || {}, {
        priority: body.priority,
        direction: body.direction,
      })
      return NextResponse.json({ ok: true, command: cmd })
    }

    case 'claim': {
      // Only service auth or owner can claim (0nCommand sync)
      if (!isServiceAuth && !isOwner) {
        return NextResponse.json({ error: 'Service auth required to claim commands' }, { status: 403 })
      }
      const claimed = await claimCommand(body.command_id)
      if (!claimed) return NextResponse.json({ error: 'Command not available' }, { status: 404 })
      return NextResponse.json({ ok: true, command: claimed })
    }

    case 'complete': {
      if (!isServiceAuth && !isOwner) {
        return NextResponse.json({ error: 'Service auth required to complete commands' }, { status: 403 })
      }
      const completed = await completeCommand(body.command_id, body.result || {})
      return NextResponse.json({ ok: true, command: completed })
    }

    case 'fail': {
      if (!isServiceAuth && !isOwner) {
        return NextResponse.json({ error: 'Service auth required' }, { status: 403 })
      }
      await failCommand(body.command_id, body.error || 'Unknown error')
      return NextResponse.json({ ok: true })
    }

    case 'cancel': {
      if (!isOwner) {
        const canCancel = await checkVipPermission(userId, 'can_cancel_commands')
        if (!canCancel) return NextResponse.json({ error: 'VIP cancel permission required' }, { status: 403 })
      }
      await cancelCommand(body.command_id)
      return NextResponse.json({ ok: true })
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }
}
