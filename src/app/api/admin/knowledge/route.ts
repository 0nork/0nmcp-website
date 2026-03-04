import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = ['mike@rocketopp.com']

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/admin/knowledge — list knowledge entries (with optional service_key filter)
 */
export async function GET(request: NextRequest) {
  const admin = getAdmin()
  const serviceKey = request.nextUrl.searchParams.get('service')
  const docType = request.nextUrl.searchParams.get('type')

  let query = admin
    .from('service_knowledge')
    .select('id, service_key, doc_type, title, section, tags, priority, is_active, url, created_at, updated_at')
    .order('service_key')
    .order('priority', { ascending: true })

  if (serviceKey) query = query.eq('service_key', serviceKey)
  if (docType) query = query.eq('doc_type', docType)

  const { data, error } = await query.limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entries: data || [], count: data?.length || 0 })
}

/**
 * POST /api/admin/knowledge — add or update a knowledge entry
 */
export async function POST(request: NextRequest) {
  const admin = getAdmin()

  // Quick admin check via auth header
  const authHeader = request.headers.get('x-admin-email')
  if (!authHeader || !ADMIN_EMAILS.includes(authHeader)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { id, service_key, doc_type, title, content, url, section, tags, priority, is_active } = body

  if (!service_key || !title || !content) {
    return NextResponse.json({ error: 'service_key, title, and content are required' }, { status: 400 })
  }

  const entry = {
    service_key,
    doc_type: doc_type || 'api_reference',
    title,
    content,
    url: url || null,
    section: section || null,
    tags: tags || [],
    priority: priority ?? 50,
    is_active: is_active ?? true,
    updated_at: new Date().toISOString(),
  }

  if (id) {
    // Update existing
    const { error } = await admin.from('service_knowledge').update(entry).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, action: 'updated', id })
  } else {
    // Insert new
    const { data, error } = await admin.from('service_knowledge').insert(entry).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, action: 'created', id: data.id })
  }
}

/**
 * DELETE /api/admin/knowledge?id=xxx — delete a knowledge entry
 */
export async function DELETE(request: NextRequest) {
  const admin = getAdmin()
  const id = request.nextUrl.searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'id parameter required' }, { status: 400 })

  const { error } = await admin.from('service_knowledge').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, action: 'deleted', id })
}
