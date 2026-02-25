import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { PlatformId, PLATFORMS } from '@/lib/qa/types'

// GET: Fetch distribution history
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const platform = request.nextUrl.searchParams.get('platform')
  const status = request.nextUrl.searchParams.get('status')

  let query = supabase
    .from('qa_distributions')
    .select(`
      id,
      content_id,
      platform,
      platform_url,
      status,
      response,
      distributed_at,
      created_at,
      qa_content (
        topic,
        title,
        content,
        quality_score,
        reading_level,
        keywords
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (platform) {
    query = query.eq('platform', platform)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ distributions: data || [] })
}

// POST: Distribute content to platforms
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  let body: {
    contentId?: string
    contentIds?: string[]
    platforms?: PlatformId[]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const contentIds = body.contentIds || (body.contentId ? [body.contentId] : [])
  const platforms = body.platforms

  if (contentIds.length === 0) {
    return NextResponse.json({ error: 'contentId or contentIds required' }, { status: 400 })
  }

  // Fetch the content
  const { data: contents, error: fetchError } = await supabase
    .from('qa_content')
    .select('*')
    .in('id', contentIds)

  if (fetchError || !contents || contents.length === 0) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }

  const results: Array<{
    contentId: string
    platform: string
    status: string
    distributionId?: string
    error?: string
  }> = []

  for (const content of contents) {
    const targetPlatforms = platforms || [content.platform as PlatformId]

    for (const platform of targetPlatforms) {
      if (!PLATFORMS[platform]) {
        results.push({
          contentId: content.id,
          platform,
          status: 'failed',
          error: `Invalid platform: ${platform}`,
        })
        continue
      }

      try {
        // Create distribution record (pending)
        const { data: dist, error: distError } = await supabase
          .from('qa_distributions')
          .insert({
            content_id: content.id,
            platform,
            status: 'pending',
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single()

        if (distError) {
          results.push({
            contentId: content.id,
            platform,
            status: 'failed',
            error: distError.message,
          })
          continue
        }

        // For platforms with API access, we could auto-post here.
        // For now, mark as pending for manual distribution or scheduler pickup.
        const platformConfig = PLATFORMS[platform]

        if (platformConfig.automationLevel === 'full' && platformConfig.apiAvailable) {
          // Auto-distribute for fully-automated platforms
          // This is a placeholder -- actual posting would call platform-specific APIs
          await supabase
            .from('qa_distributions')
            .update({
              status: 'pending',
              response: {
                note: 'Queued for automated distribution',
                platform_automation: platformConfig.automationLevel,
              },
            })
            .eq('id', dist.id)
        }

        // Update content status
        await supabase
          .from('qa_content')
          .update({ status: 'pending' })
          .eq('id', content.id)

        results.push({
          contentId: content.id,
          platform,
          status: 'pending',
          distributionId: dist.id,
        })
      } catch (err) {
        results.push({
          contentId: content.id,
          platform,
          status: 'failed',
          error: String(err),
        })
      }
    }
  }

  const successCount = results.filter((r) => r.status === 'pending').length
  const failCount = results.filter((r) => r.status === 'failed').length

  return NextResponse.json({
    results,
    summary: {
      total: results.length,
      pending: successCount,
      failed: failCount,
    },
  })
}
