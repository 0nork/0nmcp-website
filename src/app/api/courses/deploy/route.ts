import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/courses/deploy
 *
 * Deploy a generated course to a CRM location via the CRM API.
 * Creates the course, then creates each lesson in order.
 */

const CRM_API_BASE = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

interface Lesson {
  title: string
  content: string
  duration_minutes?: number
}

interface Module {
  title: string
  description?: string
  lessons: Lesson[]
}

interface Course {
  title: string
  description: string
  modules: Module[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationId, course, access_token } = body as {
      locationId: string
      course: Course
      access_token: string
    }

    if (!locationId || !course || !access_token) {
      return NextResponse.json(
        { error: 'locationId, course, and access_token are required' },
        { status: 400 }
      )
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
      Version: CRM_VERSION,
    }

    // ── 1. Create the course ──
    const courseRes = await fetch(`${CRM_API_BASE}/courses/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        locationId,
        title: course.title,
        description: course.description,
        published: false,
      }),
    })

    if (!courseRes.ok) {
      const text = await courseRes.text()
      return NextResponse.json(
        { error: `Failed to create course: ${courseRes.status} — ${text}` },
        { status: courseRes.status }
      )
    }

    const courseData = await courseRes.json()
    const courseId = courseData.id || courseData.course?.id

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course created but no ID returned', raw: courseData },
        { status: 500 }
      )
    }

    // ── 2. Create lessons in order ──
    let lessonOrder = 0
    let lessonsCreated = 0
    const errors: string[] = []

    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        lessonOrder++
        const lessonBody = {
          title: lesson.title,
          content: lesson.content,
          order: lessonOrder,
        }

        const lessonRes = await fetch(`${CRM_API_BASE}/courses/${courseId}/lessons`, {
          method: 'POST',
          headers,
          body: JSON.stringify(lessonBody),
        })

        if (lessonRes.ok) {
          lessonsCreated++
        } else {
          const errText = await lessonRes.text()
          errors.push(`Lesson ${lessonOrder} "${lesson.title}": ${lessonRes.status} — ${errText}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      courseId,
      lessonsCreated,
      totalLessons: lessonOrder,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('Course deploy error:', err)
    return NextResponse.json({ error: 'Failed to deploy course' }, { status: 500 })
  }
}
