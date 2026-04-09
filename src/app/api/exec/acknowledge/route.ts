import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  const { alertId } = await req.json()
  if (!alertId) return NextResponse.json({ error: 'alertId required' }, { status: 400 })

  const { error } = await supabase
    .from('exec_alerts')
    .update({ acknowledged: true })
    .eq('id', alertId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ acknowledged: true })
}
