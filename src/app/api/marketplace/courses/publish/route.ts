import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getToken } from '@/lib/crm/token-store'

/**
 * POST /api/marketplace/courses/publish
 *
 * Publish a course draft to the CRM via the Courses API.
 * Creates: Product (course) -> Chapters (modules) -> Lessons
 */

const CRM_API = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

interface PublishBody {
  draftId: string
  locationId: string
  accessToken?: string  // optional — falls back to token-store
  pricing?: {
    type: 'free' | 'one_time' | 'recurring'
    amount: number  // in dollars
  }
}

export async function POST(request: NextRequest) {
  try {
    const { draftId, locationId, accessToken: directToken, pricing } = (await request.json()) as PublishBody

    if (!draftId || !locationId) {
      return NextResponse.json({ error: 'draftId and locationId are required' }, { status: 400 })
    }

    const supabase = db()

    // ── Load draft ──
    const { data: draft, error: draftErr } = await supabase
      .from('course_drafts')
      .select('*')
      .eq('id', draftId)
      .single()

    if (draftErr || !draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    if (!draft.generated_structure) {
      return NextResponse.json({ error: 'Draft has no generated structure' }, { status: 400 })
    }

    // ── Resolve access token ──
    let token = directToken
    if (!token) {
      const stored = await getToken(locationId)
      if (!stored) {
        return NextResponse.json(
          { error: 'No CRM access token found. Provide accessToken or install the app via OAuth.' },
          { status: 401 }
        )
      }
      token = stored.access_token
    }

    // ── Mark as publishing ──
    await supabase
      .from('course_drafts')
      .update({ publish_status: 'publishing', publish_error: null, updated_at: new Date().toISOString() })
      .eq('id', draftId)

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Version: CRM_VERSION,
    }

    const structure = draft.generated_structure as {
      title: string
      subtitle?: string
      description: string
      modules: Array<{
        title: string
        description: string
        lessons: Array<{
          title: string
          content: string
          duration_minutes?: number
          quiz?: Array<{ question: string; options: string[]; correct: number }>
          assignment?: string
        }>
      }>
    }

    // ── 1. Create Product (course container) ──
    const productRes = await fetch(`${CRM_API}/products/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        locationId,
        name: structure.title,
        description: structure.description,
        productType: 'DIGITAL',
        statementDescriptor: structure.title.slice(0, 22),
        ...(pricing && pricing.type !== 'free' ? {
          prices: [{
            name: pricing.type === 'recurring' ? 'Monthly Access' : 'Full Access',
            type: pricing.type === 'recurring' ? 'recurring' : 'one_time',
            amount: Math.round(pricing.amount * 100), // cents
            currency: 'USD',
            ...(pricing.type === 'recurring' ? { recurring: { interval: 'month', intervalCount: 1 } } : {}),
          }],
        } : {}),
      }),
    })

    if (!productRes.ok) {
      const errText = await productRes.text()
      await supabase
        .from('course_drafts')
        .update({ publish_status: 'failed', publish_error: `Product create failed: ${productRes.status} — ${errText}`, updated_at: new Date().toISOString() })
        .eq('id', draftId)
      return NextResponse.json({ error: `Failed to create CRM product: ${productRes.status}` }, { status: productRes.status })
    }

    const productData = await productRes.json()
    const productId = productData.id || productData.product?.id

    // ── 2. Create Chapters (modules) + Lessons ──
    let lessonsCreated = 0
    let chaptersCreated = 0
    const errors: string[] = []

    for (let mi = 0; mi < structure.modules.length; mi++) {
      const mod = structure.modules[mi]

      // Create chapter (module)
      const chapterRes = await fetch(`${CRM_API}/courses/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          locationId,
          productId,
          title: mod.title,
          description: mod.description || '',
          order: mi + 1,
        }),
      })

      if (!chapterRes.ok) {
        const errText = await chapterRes.text()
        errors.push(`Module ${mi + 1} "${mod.title}": ${chapterRes.status} — ${errText}`)
        continue
      }

      const chapterData = await chapterRes.json()
      const chapterId = chapterData.id || chapterData.course?.id
      chaptersCreated++

      // Create lessons within chapter
      for (let li = 0; li < mod.lessons.length; li++) {
        const lesson = mod.lessons[li]

        // Build lesson content with optional quiz/assignment
        let fullContent = lesson.content

        if (lesson.quiz?.length) {
          fullContent += '\n\n---\n\n## Quiz\n\n'
          lesson.quiz.forEach((q, qi) => {
            fullContent += `**${qi + 1}. ${q.question}**\n\n`
            q.options.forEach((opt, oi) => {
              fullContent += `${String.fromCharCode(65 + oi)}. ${opt}\n`
            })
            fullContent += '\n'
          })
        }

        if (lesson.assignment) {
          fullContent += `\n\n---\n\n## Assignment\n\n${lesson.assignment}\n`
        }

        const lessonRes = await fetch(`${CRM_API}/courses/${chapterId}/lessons`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: lesson.title,
            content: fullContent,
            order: li + 1,
            duration: lesson.duration_minutes || 10,
          }),
        })

        if (lessonRes.ok) {
          lessonsCreated++
        } else {
          const errText = await lessonRes.text()
          errors.push(`Lesson "${lesson.title}": ${lessonRes.status} — ${errText}`)
        }
      }
    }

    // ── 3. Update draft with publish result ──
    const publishStatus = errors.length === 0 ? 'published' : (lessonsCreated > 0 ? 'published' : 'failed')

    await supabase
      .from('course_drafts')
      .update({
        publish_status: publishStatus,
        crm_product_id: productId,
        crm_course_url: `/courses`,
        published_at: new Date().toISOString(),
        publish_error: errors.length > 0 ? errors.join('; ') : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', draftId)

    return NextResponse.json({
      success: true,
      productId,
      chaptersCreated,
      lessonsCreated,
      totalModules: structure.modules.length,
      totalLessons: structure.modules.reduce((s, m) => s + m.lessons.length, 0),
      errors: errors.length > 0 ? errors : undefined,
      courseUrl: '/courses',
    })
  } catch (err) {
    console.error('Course publish error:', err)
    return NextResponse.json({ error: 'Failed to publish course' }, { status: 500 })
  }
}
