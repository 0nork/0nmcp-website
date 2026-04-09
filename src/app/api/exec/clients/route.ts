import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET — list clients for user
export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || ''
  const accountRes = await fetch(new URL('/api/console/account', req.url).toString(), { headers: { cookie: cookieHeader } })
  if (!accountRes.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const account = await accountRes.json()
  const userId = account.id || account.user_id

  const { data, error } = await supabase
    .from('exec_clients')
    .select('*')
    .eq('onmcp_user_id', userId)
    .order('client_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ clients: data, count: data.length })
}

// POST — add a client
export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || ''
  const accountRes = await fetch(new URL('/api/console/account', req.url).toString(), { headers: { cookie: cookieHeader } })
  if (!accountRes.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const account = await accountRes.json()
  const userId = account.id || account.user_id

  const body = await req.json()
  if (!body.client_name || !body.pipedrive_deal_id) {
    return NextResponse.json({ error: 'client_name and pipedrive_deal_id required' }, { status: 400 })
  }

  const { data, error } = await supabase.from('exec_clients').insert({
    onmcp_user_id: userId,
    client_name: body.client_name,
    pipedrive_deal_id: body.pipedrive_deal_id,
    pipedrive_company_domain: body.pipedrive_company_domain || '',
    linkedin_account_id: body.linkedin_account_id,
    slack_channel_id: body.slack_channel_id,
    client_industry: body.client_industry,
    pm_name: body.pm_name,
    stage_baselines: body.stage_baselines || {},
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ client: data }, { status: 201 })
}

// DELETE — remove a client
export async function DELETE(req: NextRequest) {
  const { clientId } = await req.json()
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

  const { error } = await supabase.from('exec_clients').update({ active: false }).eq('id', clientId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deactivated: true })
}
