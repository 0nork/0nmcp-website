/**
 * 0nFlow API — flow CRUD.
 *
 *   POST  /api/flows             create a flow (template)
 *   GET   /api/flows             list flows (filter by owner_product, active)
 */

import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { isFlowAuthorized } from '@/lib/0nflow/auth'
import type { FlowDefinition } from '@/lib/0nflow/types'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const auth = isFlowAuthorized(req)
  if (!auth.ok) return NextResponse.json({ error: 'Unauthorized', reason: auth.reason }, { status: 401 })

  const supabase = createSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  let body: FlowDefinition
  try {
    body = (await req.json()) as FlowDefinition
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.slug || !body.name || !Array.isArray(body.steps) || body.steps.length === 0) {
    return NextResponse.json({ error: 'slug, name, and non-empty steps[] required' }, { status: 400 })
  }

  const row = {
    slug: body.slug,
    name: body.name,
    description: body.description ?? null,
    owner_email: body.owner_email ?? null,
    owner_product: body.owner_product ?? null,
    active: body.active ?? true,
    steps: body.steps,
    default_provider: body.default_provider ?? 'crm',
    default_location_id: body.default_location_id ?? null,
    metadata: body.metadata ?? {},
  }

  const { data, error } = await supabase
    .from('flows')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, flow: data })
}

export async function GET(req: Request) {
  const supabase = createSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const url = new URL(req.url)
  const product = url.searchParams.get('owner_product')
  const onlyActive = url.searchParams.get('active') !== 'false'

  let q = supabase.from('flows').select('*').order('created_at', { ascending: false })
  if (product) q = q.eq('owner_product', product)
  if (onlyActive) q = q.eq('active', true)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, flows: data })
}
