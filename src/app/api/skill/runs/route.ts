import { NextRequest, NextResponse } from 'next/server'
import { verifySkillToken } from '@/lib/skill-auth'
import { checkBalance, deductRuns, getBalance, isOwner } from '@/lib/runs'

export const dynamic = 'force-dynamic'

/**
 * GET /api/skill/runs — Check current Runs balance
 * POST /api/skill/runs — Deduct Runs for an action
 *
 * Body (POST): { action: string, description?: string }
 */
export async function GET(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (isOwner(user.email)) {
    return NextResponse.json({
      balance: 999999,
      is_owner: true,
      message: 'Owner — unlimited Runs',
    })
  }

  const bal = await getBalance(user.id)
  return NextResponse.json({
    balance: bal.balance,
    lifetime_earned: bal.lifetime_earned,
    lifetime_spent: bal.lifetime_spent,
    is_owner: false,
  })
}

export async function POST(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { action, description } = await request.json()
  if (!action) {
    return NextResponse.json({ error: 'action required' }, { status: 400 })
  }

  // Owner bypass
  if (isOwner(user.email)) {
    return NextResponse.json({ ok: true, balance: 999999, cost: 0, is_owner: true })
  }

  // Check balance first
  const check = await checkBalance(user.id, action, user.email)
  if (!check.allowed) {
    return NextResponse.json({
      error: 'insufficient_runs',
      balance: check.balance,
      cost: check.cost,
      message: `This action costs ${check.cost} Runs — you have ${check.balance}. Purchase more at https://www.0nmcp.com/console`,
      alert: check.alert,
    }, { status: 402 })
  }

  // Deduct
  const result = await deductRuns(
    user.id,
    action,
    description || `Skill: ${action}`,
    { source: 'skill', action }
  )

  return NextResponse.json({
    ok: true,
    balance: result.balance,
    cost: result.cost,
    transaction_id: result.transaction_id,
  })
}
