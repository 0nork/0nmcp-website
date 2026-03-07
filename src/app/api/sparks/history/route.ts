import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getHistory } from '@/lib/sparks'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sparks/history?limit=50&offset=0
 *
 * Returns the user's Spark transaction history.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase!.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0')

    const { transactions, total } = await getHistory(user.id, limit, offset)

    return NextResponse.json({
      transactions: transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        balance_after: tx.balance_after,
        description: tx.description,
        created_at: tx.created_at,
      })),
      total,
      limit,
      offset,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
