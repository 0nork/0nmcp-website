import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/marketplace/courses/generate
 *
 * Purchase-gated AI course generator.
 * 1. Validates the caller has purchased 'ai-course-generator'
 * 2. Generates a full course structure via Anthropic
 * 3. Stores the draft in course_drafts
 */

const PRODUCT_SLUG = 'ai-course-generator'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ── Template fallback when no API key ────────────────────────────────
function generateTemplate(input: CourseInput): CourseStructure {
  const { course_title, target_audience, skill_level, module_count, lessons_per_module, include_quizzes, tone } = input
  const modules: CourseModule[] = []

  for (let m = 0; m < module_count; m++) {
    const lessons: CourseLesson[] = []
    for (let l = 0; l < lessons_per_module; l++) {
      const lesson: CourseLesson = {
        title: `Lesson ${m * lessons_per_module + l + 1}: ${course_title} — Part ${l + 1}`,
        content: `# ${course_title} — Module ${m + 1}, Lesson ${l + 1}\n\nThis ${tone} lesson is designed for ${target_audience || 'general learners'} at the ${skill_level} level.\n\n## Overview\n\nIn this lesson you will learn essential concepts that build toward mastery of ${course_title}.\n\n## Key Concepts\n\n- **Foundation**: Core principles and fundamentals\n- **Application**: Real-world use cases and examples\n- **Practice**: Hands-on exercises to reinforce learning\n\n## Summary\n\nYou have completed the foundational concepts for this section. The next lesson builds on these ideas.\n\n---\n*Template content — add an ANTHROPIC_API_KEY for AI-generated lessons.*`,
        duration_minutes: skill_level === 'beginner' ? 8 : skill_level === 'intermediate' ? 12 : 15,
      }
      if (include_quizzes) {
        lesson.quiz = [
          { question: `What is a primary benefit of ${course_title}?`, options: ['Improved efficiency', 'No benefit', 'Slower processes', 'More complexity'], correct: 0 },
          { question: `Who is this course designed for?`, options: ['Nobody', target_audience || 'General learners', 'Only experts', 'Only beginners'], correct: 1 },
        ]
      }
      lessons.push(lesson)
    }
    modules.push({
      title: `Module ${m + 1}: ${course_title} — Section ${m + 1}`,
      description: `Core concepts of ${course_title} for ${target_audience || 'learners'}.`,
      lessons,
    })
  }

  return {
    title: course_title,
    subtitle: input.course_subtitle || `A ${skill_level} course for ${target_audience || 'learners'}`,
    description: `A comprehensive ${skill_level} course on ${course_title} with ${module_count} modules and ${module_count * lessons_per_module} lessons.`,
    modules,
  }
}

// ── Types ────────────────────────────────────────────────────────────
interface CourseInput {
  course_title: string
  course_subtitle?: string
  target_audience?: string
  skill_level: string
  course_goal?: string
  course_category?: string
  module_count: number
  lessons_per_module: number
  include_quizzes: boolean
  include_assignments: boolean
  tone: string
  keywords?: string[]
  additional_instructions?: string
}

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

interface CourseLesson {
  title: string
  content: string
  duration_minutes: number
  quiz?: QuizQuestion[]
  assignment?: string
}

interface CourseModule {
  title: string
  description: string
  lessons: CourseLesson[]
}

interface CourseStructure {
  title: string
  subtitle?: string
  description: string
  modules: CourseModule[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationId, userId, ...input } = body as { locationId: string; userId?: string } & CourseInput

    // ── Validate required fields ──
    if (!input.course_title?.trim()) {
      return NextResponse.json({ error: 'course_title is required' }, { status: 400 })
    }

    const supabase = db()

    // ── Purchase gate (skip for admin/owner locations) ──
    const OWNER_LOCATIONS = ['nphConTwfHcVE1oA0uep', 'F76MNKOMQCMruMrumtdf', 'K5ojkHmrp4hcTZrtFBAC', '6MSqx0trfxgLxeHBJE1k']
    if (locationId && !OWNER_LOCATIONS.includes(locationId)) {
      const { data: purchase } = await supabase
        .from('add0n_purchases')
        .select('id')
        .eq('location_id', locationId)
        .eq('product_slug', PRODUCT_SLUG)
        .eq('status', 'active')
        .maybeSingle()

      if (!purchase) {
        return NextResponse.json(
          { error: 'AI Course Generator has not been purchased for this location. Visit the store to activate.' },
          { status: 403 }
        )
      }
    }

    // ── Defaults ──
    const courseInput: CourseInput = {
      course_title: input.course_title.trim(),
      course_subtitle: input.course_subtitle?.trim(),
      target_audience: input.target_audience?.trim() || 'general learners',
      skill_level: input.skill_level || 'beginner',
      course_goal: input.course_goal?.trim(),
      course_category: input.course_category?.trim(),
      module_count: Math.min(8, Math.max(2, Number(input.module_count) || 3)),
      lessons_per_module: Math.min(6, Math.max(1, Number(input.lessons_per_module) || 3)),
      include_quizzes: input.include_quizzes !== false,
      include_assignments: input.include_assignments === true,
      tone: input.tone || 'professional',
      keywords: input.keywords,
      additional_instructions: input.additional_instructions?.trim(),
    }

    // ── Create draft record ──
    const { data: draft, error: draftError } = await supabase
      .from('course_drafts')
      .insert({
        location_id: locationId || 'dashboard',
        user_id: userId || null,
        ...courseInput,
        generation_status: 'generating',
      })
      .select('id')
      .single()

    if (draftError || !draft) {
      console.error('Draft insert error:', draftError)
      return NextResponse.json({ error: 'Failed to create draft record' }, { status: 500 })
    }

    const draftId = draft.id

    // ── Generate course ──
    let structure: CourseStructure
    let model = 'template'

    // Try Groq first (FREE)
    const groqPool = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',').filter(Boolean)
    if (groqPool.length > 0) {
      try {
        const groqKey = groqPool[Math.floor(Math.random() * groqPool.length)].trim()
        const quizLine = courseInput.include_quizzes
          ? '- Each lesson MUST include a "quiz" array with 2-3 quiz questions (question, options array of 4, correct index 0-3)'
          : '- Do NOT include quizzes'
        const assignmentLine = courseInput.include_assignments
          ? '- Each lesson SHOULD include an "assignment" string with a practical exercise'
          : ''

        const groqPrompt = `You are an expert course creator. Generate a complete, professional course.

Course Title: ${courseInput.course_title}
${courseInput.course_subtitle ? `Subtitle: ${courseInput.course_subtitle}` : ''}
Target Audience: ${courseInput.target_audience}
Skill Level: ${courseInput.skill_level}
${courseInput.course_goal ? `Goal: ${courseInput.course_goal}` : ''}
Tone: ${courseInput.tone}
Modules: ${courseInput.module_count}
Lessons per Module: ${courseInput.lessons_per_module}

Return ONLY valid JSON:
{"title":"...","subtitle":"...","description":"2-3 sentence description","modules":[{"title":"Module 1: ...","description":"...","lessons":[{"title":"...","content":"Full lesson in Markdown (600+ words)","duration_minutes":10}]}]}

Rules:
- Create exactly ${courseInput.module_count} modules with ${courseInput.lessons_per_module} lessons each
- Each lesson: 600-800 words of genuine educational content with ## headers, examples
- Tone: ${courseInput.tone}, Skill: ${courseInput.skill_level}
${quizLine}
${assignmentLine}
- Return ONLY valid JSON.`

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'You are an expert course creator. Return ONLY valid JSON. No markdown fences.' },
              { role: 'user', content: groqPrompt },
            ],
            max_tokens: 8192,
            temperature: 0.4,
            response_format: { type: 'json_object' },
          }),
          signal: AbortSignal.timeout(90000),
        })

        if (groqRes.ok) {
          const data = await groqRes.json()
          const text = data.choices?.[0]?.message?.content || ''
          const parsed = JSON.parse(text) as CourseStructure
          if (parsed.title && parsed.modules?.length) {
            structure = parsed
            model = 'groq-llama-3.3-70b'

            // Update draft and return
            const totalLessons = structure.modules.reduce((sum, m) => sum + m.lessons.length, 0)
            const totalDuration = structure.modules.reduce(
              (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.duration_minutes || 10), 0), 0
            )
            await supabase.from('course_drafts').update({
              generated_structure: structure, generation_status: 'completed',
              generation_model: model, generated_at: new Date().toISOString(),
              estimated_duration: totalDuration, updated_at: new Date().toISOString(),
            }).eq('id', draftId)

            return NextResponse.json({
              draftId, structure, source: model,
              stats: { modules: structure.modules.length, lessons: totalLessons, duration: totalDuration },
            })
          }
        }
      } catch (groqErr) {
        console.error('Groq generation failed, trying Anthropic:', groqErr)
      }
    }

    // Try Anthropic as paid fallback
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (apiKey) {
      try {
        const quizLine = courseInput.include_quizzes
          ? '- Each lesson MUST include a "quiz" array with 2-3 quiz questions (question, options array of 4, correct index 0-3)'
          : '- Do NOT include quizzes'
        const assignmentLine = courseInput.include_assignments
          ? '- Each lesson SHOULD include an "assignment" string with a practical exercise'
          : ''
        const keywordsLine = courseInput.keywords?.length
          ? `- Focus on these keywords/topics: ${courseInput.keywords.join(', ')}`
          : ''
        const extraLine = courseInput.additional_instructions
          ? `- Additional instructions: ${courseInput.additional_instructions}`
          : ''

        const prompt = `You are an expert course creator. Generate a complete, professional course.

Course Title: ${courseInput.course_title}
${courseInput.course_subtitle ? `Subtitle: ${courseInput.course_subtitle}` : ''}
Target Audience: ${courseInput.target_audience}
Skill Level: ${courseInput.skill_level}
${courseInput.course_goal ? `Goal: ${courseInput.course_goal}` : ''}
${courseInput.course_category ? `Category: ${courseInput.course_category}` : ''}
Tone: ${courseInput.tone}
Modules: ${courseInput.module_count}
Lessons per Module: ${courseInput.lessons_per_module}

Return ONLY valid JSON with this structure:
{
  "title": "...",
  "subtitle": "...",
  "description": "2-3 sentence marketing description",
  "modules": [
    {
      "title": "Module 1: ...",
      "description": "What this module covers",
      "lessons": [
        {
          "title": "Lesson title",
          "content": "Full lesson in Markdown (600+ words). Real, actionable content with ## headers, bullet points, examples.",
          "duration_minutes": 10
        }
      ]
    }
  ]
}

Rules:
- Create exactly ${courseInput.module_count} modules with ${courseInput.lessons_per_module} lessons each
- Each lesson MUST have 800-1200 words of genuine, useful, ACTIONABLE educational content
- DO NOT write summaries or outlines — write the ACTUAL lesson content a student would read
- Include real-world examples, step-by-step instructions, and practical exercises
- Use Markdown formatting: ## headers, bullet points, numbered lists, **bold** for key terms
- Each lesson should teach ONE specific skill the student can immediately apply
- Include a "Key Takeaway" at the end of each lesson
- Include a "Try This Now" action step at the end of each lesson
- Content tone: ${courseInput.tone}
- Skill level: ${courseInput.skill_level}
${quizLine}
${assignmentLine}
${keywordsLine}
${extraLine}
- Return ONLY valid JSON. No markdown fences, no commentary.`

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 16384,
            messages: [{ role: 'user', content: prompt }],
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.content?.[0]?.text || ''
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            structure = JSON.parse(jsonMatch[0]) as CourseStructure
            model = 'claude-sonnet-4-20250514'
          } else {
            throw new Error('No JSON found in AI response')
          }
        } else {
          throw new Error(`Anthropic API ${res.status}: ${await res.text()}`)
        }
      } catch (err) {
        console.error('AI generation failed, falling back to template:', err)
        structure = generateTemplate(courseInput)
        model = 'template-fallback'
      }
    } else {
      structure = generateTemplate(courseInput)
    }

    // ── Update draft with generated structure ──
    const totalLessons = structure.modules.reduce((sum, m) => sum + m.lessons.length, 0)
    const totalDuration = structure.modules.reduce(
      (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.duration_minutes || 10), 0),
      0
    )

    await supabase
      .from('course_drafts')
      .update({
        generated_structure: structure,
        generation_status: 'completed',
        generation_model: model,
        generated_at: new Date().toISOString(),
        estimated_duration: totalDuration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', draftId)

    return NextResponse.json({
      draftId,
      structure,
      source: model,
      stats: {
        modules: structure.modules.length,
        lessons: totalLessons,
        duration: totalDuration,
      },
    })
  } catch (err) {
    console.error('Course generate error:', err)
    return NextResponse.json({ error: 'Failed to generate course' }, { status: 500 })
  }
}
