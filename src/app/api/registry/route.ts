import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const REGISTRY_BASE = 'https://registry.modelcontextprotocol.io'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const limit = parseInt(searchParams.get('limit') || '50')
  const cursor = searchParams.get('cursor') || ''

  const admin = getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  // Query our cached registry data
  let query = admin
    .from('mcp_registry_servers')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (search) {
    query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (cursor) {
    query = query.lt('name', cursor)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    servers: data || [],
    metadata: {
      count: data?.length || 0,
      nextCursor: data && data.length === limit ? data[data.length - 1].name : null,
      source: REGISTRY_BASE,
      aggregator: '0nMCP',
      lastSync: data?.[0]?.synced_at || null,
    },
  })
}
