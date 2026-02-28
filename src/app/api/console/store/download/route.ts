import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { workflowId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { workflowId } = body
  if (!workflowId) {
    return NextResponse.json({ error: 'workflowId is required' }, { status: 400 })
  }

  // Verify user has purchased a listing linked to this workflow
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id, listing_id')
    .eq('buyer_id', user.id)
    .eq('workflow_id', workflowId)
    .eq('status', 'completed')
    .maybeSingle()

  if (!purchase) {
    return NextResponse.json({ error: 'Purchase not found' }, { status: 403 })
  }

  // Fetch workflow data
  const { data: workflow, error } = await supabase
    .from('workflows')
    .select('id, name, slug, workflow_data')
    .eq('id', workflowId)
    .single()

  if (error || !workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
  }

  // Track download (fire and forget)
  await supabase.from('downloads').insert({
    user_id: user.id,
    workflow_id: workflowId,
    listing_id: purchase.listing_id,
  })

  return NextResponse.json({
    workflow: workflow.workflow_data,
    filename: `${workflow.slug || workflow.name || 'workflow'}.0n`,
  })
}
