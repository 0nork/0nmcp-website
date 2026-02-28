import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
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

  // Fetch purchases with listing + workflow data
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`
      *,
      listing:listings!listing_id (
        id, title, slug, description, category, tags, price, currency,
        cover_image_url, status, total_purchases
      )
    `)
    .eq('buyer_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Purchases fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 })
  }

  // Fetch workflow data for each purchase that has a workflow_id
  const workflowIds = [...new Set(
    (purchases || [])
      .map((p: { workflow_id: string | null }) => p.workflow_id)
      .filter(Boolean)
  )]

  let workflowMap: Record<string, { workflow_data: unknown; name: string }> = {}
  if (workflowIds.length > 0) {
    const { data: workflows } = await supabase
      .from('workflows')
      .select('id, name, workflow_data')
      .in('id', workflowIds)

    if (workflows) {
      workflowMap = Object.fromEntries(
        workflows.map((w: { id: string; name: string; workflow_data: unknown }) => [
          w.id,
          { workflow_data: w.workflow_data, name: w.name },
        ])
      )
    }
  }

  // Merge workflow data into purchases
  const enriched = (purchases || []).map((p: Record<string, unknown>) => ({
    ...p,
    workflow_data: p.workflow_id ? workflowMap[p.workflow_id as string]?.workflow_data ?? null : null,
    workflow_name: p.workflow_id ? workflowMap[p.workflow_id as string]?.name ?? null : null,
  }))

  return NextResponse.json({ purchases: enriched })
}
