import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { postContent } from '@/lib/poster'

const ADMIN_EMAILS = ['mike@rocketopp.com']

async function requireAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase!.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) return null
  return user
}

/**
 * POST /api/admin/content/post — Post content to its platform
 * Body: { id: string } or { ids: string[] }
 */
export async function POST(request: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()

    // Single item
    if (body.id) {
      const result = await postContent(body.id)
      return NextResponse.json(result)
    }

    // Batch posting
    if (body.ids && Array.isArray(body.ids)) {
      const results = []
      for (const id of body.ids) {
        const result = await postContent(id)
        results.push(result)
        // Small delay between posts to avoid rate limits
        await new Promise(r => setTimeout(r, 2000))
      }
      return NextResponse.json({
        results,
        posted: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      })
    }

    return NextResponse.json({ error: 'id or ids required' }, { status: 400 })
  } catch (err) {
    console.error('Posting error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Posting failed' },
      { status: 500 }
    )
  }
}
