import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/console/vault-files — list user's vault files, optionally filtered by type
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const url = new URL(request.url)
  const fileType = url.searchParams.get('type')
  const category = url.searchParams.get('category')

  let query = supabase
    .from('user_vault_files')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (fileType) query = query.eq('file_type', fileType)
  if (category) query = query.eq('category', category)

  const { data: files, error } = await query

  if (error) {
    console.error('[vault-files] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch vault files' }, { status: 500 })
  }

  // Get counts by type
  const { data: counts } = await supabase
    .from('user_vault_files')
    .select('file_type')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const typeCounts: Record<string, number> = {}
  if (counts) {
    for (const row of counts) {
      typeCounts[row.file_type] = (typeCounts[row.file_type] || 0) + 1
    }
  }

  return NextResponse.json({ files: files || [], typeCounts, total: files?.length || 0 })
}

// POST /api/console/vault-files — add a file to the vault
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  let body: {
    name: string
    file_type: string
    category?: string
    description?: string
    file_data: Record<string, unknown>
    source?: string
    source_id?: string
    version?: string
    tags?: string[]
    icon?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name || !body.file_data) {
    return NextResponse.json({ error: 'name and file_data are required' }, { status: 400 })
  }

  // Auto-detect file_type from $0n header if not provided
  const header = (body.file_data as { $0n?: { type?: string } }).$0n
  const fileType = body.file_type || header?.type || 'workflow'

  const { data: file, error } = await supabase
    .from('user_vault_files')
    .insert({
      user_id: user.id,
      name: body.name,
      file_type: fileType,
      category: body.category || fileType,
      description: body.description || '',
      file_data: body.file_data,
      source: body.source || 'manual',
      source_id: body.source_id || null,
      version: body.version || '1.0.0',
      tags: body.tags || [],
      icon: body.icon || null,
    })
    .select('id, name, file_type, category, created_at')
    .single()

  if (error) {
    console.error('[vault-files] Insert error:', error)
    return NextResponse.json({ error: 'Failed to save vault file' }, { status: 500 })
  }

  return NextResponse.json({ file })
}

// DELETE /api/console/vault-files — remove a file from vault
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const url = new URL(request.url)
  const fileId = url.searchParams.get('id')
  if (!fileId) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase
    .from('user_vault_files')
    .update({ status: 'archived' })
    .eq('id', fileId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[vault-files] Delete error:', error)
    return NextResponse.json({ error: 'Failed to archive vault file' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
