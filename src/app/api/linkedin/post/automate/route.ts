import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { getMember } from '@/lib/linkedin/auth'
import { logToolCall } from '@/lib/linkedin/taicd/receipt-constructor'
import { recordConversion } from '@/lib/linkedin/lvos/observer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { member_id: string; frequency?: string; enabled: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.member_id || typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'member_id and enabled are required' }, { status: 400 })
  }

  const startTime = Date.now()

  const member = await getMember(body.member_id)
  if (!member || member.user_id !== user.id) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  const frequency = body.frequency || member.posting_frequency || 'weekly'
  const admin = getAdmin()

  await admin
    .from('linkedin_members')
    .update({
      automated_posting_enabled: body.enabled,
      posting_frequency: frequency,
    })
    .eq('id', body.member_id)

  // Record as conversion if enabling
  if (body.enabled) {
    await recordConversion(body.member_id, 'enabled_automation').catch(() => {})
  }

  const receipt = await logToolCall({
    toolName: 'enable_automated_posting',
    memberId: body.member_id,
    inputParams: { enabled: body.enabled, frequency },
    outputResult: { enabled: body.enabled, frequency },
    executionTimeMs: Date.now() - startTime,
    success: true,
  })

  return NextResponse.json({ enabled: body.enabled, frequency, receipt })
}
