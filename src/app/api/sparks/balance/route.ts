import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getBalance, getLowBalanceAlert, isOwner } from '@/lib/sparks'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sparks/balance
 *
 * Returns the current user's Spark balance + low balance alert if applicable.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase!.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Owner bypass
    if (isOwner(user.email || '')) {
      return NextResponse.json({
        balance: 999999,
        lifetime_earned: 999999,
        lifetime_spent: 0,
        is_owner: true,
        alert: null,
      })
    }

    const bal = await getBalance(user.id)
    const alert = getLowBalanceAlert(bal.balance)

    return NextResponse.json({
      balance: bal.balance,
      lifetime_earned: bal.lifetime_earned,
      lifetime_spent: bal.lifetime_spent,
      last_purchase_at: bal.last_purchase_at,
      alert: alert ? {
        level: alert.level,
        message: alert.message,
        suggested_pack: alert.suggestedPack,
        purchase_url: `/api/sparks/purchase?pack=${alert.suggestedPack}`,
      } : null,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}
