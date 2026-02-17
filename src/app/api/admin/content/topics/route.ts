import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getAdmin } from '@/lib/content-engine'

const ADMIN_EMAILS = ['mike@rocketopp.com']

async function requireAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase!.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) return null
  return user
}

/** GET /api/admin/content/topics — List all topics */
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()
  const { data, error } = await admin
    .from('content_topics')
    .select('*')
    .order('priority', { ascending: false })
    .order('category')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

/** POST /api/admin/content/topics — Create new topic */
export async function POST(request: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const admin = getAdmin()
  const { data, error } = await admin.from('content_topics').insert(body).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
