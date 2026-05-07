import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await getAdmin()
      .from('builder_assets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

    return NextResponse.json({ asset: data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, html, config, status } = body

    const updates: Record<string, unknown> = {}
    if (title !== undefined) updates.title = title
    if (html !== undefined) updates.html = html
    if (config !== undefined) updates.config = config
    if (status !== undefined) updates.status = status

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await getAdmin()
      .from('builder_assets')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, title, asset_type, status, updated_at')
      .single()

    if (error || !data) return NextResponse.json({ error: 'Asset not found or update failed' }, { status: 404 })

    return NextResponse.json({ asset: data })
  } catch {
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await getAdmin()
      .from('builder_assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })

    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}
