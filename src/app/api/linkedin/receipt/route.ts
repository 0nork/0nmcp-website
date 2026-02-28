import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getMember } from '@/lib/linkedin/auth'
import { getRecentReceipts } from '@/lib/linkedin/taicd/receipt-constructor'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get('member_id')
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  if (!memberId) {
    return NextResponse.json({ error: 'member_id is required' }, { status: 400 })
  }

  const member = await getMember(memberId)
  if (!member || member.user_id !== user.id) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  const receipts = await getRecentReceipts(memberId, limit)
  return NextResponse.json({ receipts })
}
