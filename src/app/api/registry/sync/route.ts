import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const REGISTRY_BASE = 'https://registry.modelcontextprotocol.io'

export async function GET() {
  // This can be triggered by Vercel cron
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)
  let allServers: any[] = []
  let cursor: string | null = null
  let pages = 0

  // Paginate through all servers
  do {
    const url = new URL(`${REGISTRY_BASE}/v0.1/servers`)
    url.searchParams.set('limit', '100')
    if (cursor) url.searchParams.set('cursor', cursor)

    const res = await fetch(url.toString())
    if (!res.ok) break

    const data = await res.json()
    allServers = allServers.concat(data.servers || [])
    cursor = data.metadata?.nextCursor || null
    pages++

    // Safety limit
    if (pages > 50) break
  } while (cursor)

  // Upsert all servers
  const now = new Date().toISOString()
  const rows = allServers.map((s: any) => ({
    name: s.name,
    title: s.title || s.name,
    description: s.description || '',
    version: s.version || '0.0.0',
    status: s.status || 'active',
    packages: s.packages || [],
    remotes: s.remotes || [],
    repository: s.repository || null,
    raw_data: s,
    synced_at: now,
    updated_at: s.updated_at || now,
  }))

  if (rows.length > 0) {
    // Batch upsert in chunks of 100
    for (let i = 0; i < rows.length; i += 100) {
      const chunk = rows.slice(i, i + 100)
      await admin
        .from('mcp_registry_servers')
        .upsert(chunk, { onConflict: 'name' })
    }
  }

  return NextResponse.json({
    synced: rows.length,
    pages,
    timestamp: now,
  })
}
