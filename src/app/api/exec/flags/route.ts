/**
 * GET /api/exec/flags
 * Returns all active (unacknowledged) alerts for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  let userId: string | null = null

  if (authHeader?.startsWith('Bearer ')) {
    const { data } = await supabase.auth.getUser(authHeader.slice(7))
    userId = data.user?.id ?? null
  }

  if (!userId) {
    const { data } = /* TODO_GETUSER_MANUAL: review this call — getSession() preferred per Rule 10a */ await supabase.auth.getUser()
    userId = data.user?.id ?? null
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: alerts, error } = await supabase
    .from('exec_alerts')
    .select('*, exec_clients(client_name, pipedrive_deal_id, pm_name)')
    .eq('onmcp_user_id', userId)
    .eq('acknowledged', false)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    alerts: alerts || [],
    count: alerts?.length || 0,
  })
}
