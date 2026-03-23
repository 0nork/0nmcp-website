import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/courses/generate
 *
 * AI-powered course generator. Uses Anthropic to create a full course
 * structure with modules, lessons, quizzes. Falls back to a structured
 * template when ANTHROPIC_API_KEY is not set.
 */

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

interface Lesson {
  title: string
  content: string
  duration_minutes: number
  quiz?: QuizQuestion[]
}

interface Module {
  title: string
  description: string
  lessons: Lesson[]
}

interface Course {
  title: string
  description: string
  modules: Module[]
}

function generateTemplate(topic: string, audience: string, lessonCount: number, difficulty: string, style: string): Course {
  const moduleCount = Math.max(2, Math.ceil(lessonCount / 3))
  const lessonsPerModule = Math.ceil(lessonCount / moduleCount)

  const modules: Module[] = []
  for (let m = 0; m < moduleCount; m++) {
    const lessons: Lesson[] = []
    const count = m === moduleCount - 1 ? lessonCount - (lessonsPerModule * m) : lessonsPerModule
    for (let l = 0; l < Math.max(1, count); l++) {
      lessons.push({
        title: `Lesson ${m * lessonsPerModule + l + 1}: ${topic} — Part ${l + 1}`,
        content: `# ${topic} — Module ${m + 1}, Lesson ${l + 1}\n\nThis lesson covers essential concepts of ${topic} for ${audience}.\n\n## Overview\n\nIn this ${difficulty}-level ${style} lesson, you will learn the fundamentals needed to master this subject. The content is designed specifically for ${audience} who want to develop practical skills.\n\n## Key Concepts\n\n- **Concept 1**: Understanding the foundation of ${topic}\n- **Concept 2**: Applying knowledge in real-world scenarios\n- **Concept 3**: Building on what you've learned\n\n## Practical Application\n\nTake what you have learned and apply it to your own context. Start with small experiments and gradually scale up your approach.\n\n## Summary\n\nThis lesson introduced the core ideas. In the next lesson, we will build on these concepts with more advanced techniques.\n\n---\n\n*Replace this template content with your own material, or regenerate with an API key for AI-written content.*`,
        duration_minutes: difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 12 : 15,
        quiz: [
          {
            question: `What is a key benefit of understanding ${topic}?`,
            options: ['Improved efficiency', 'No benefit', 'Slower processes', 'More complexity'],
            correct: 0,
          },
          {
            question: `Who is this course designed for?`,
            options: ['Nobody', audience, 'Only experts', 'Only beginners'],
            correct: 1,
          },
          {
            question: `What difficulty level is this lesson?`,
            options: ['Beginner', 'Intermediate', 'Advanced', difficulty.charAt(0).toUpperCase() + difficulty.slice(1)],
            correct: 3,
          },
        ],
      })
    }
    modules.push({
      title: `Module ${m + 1}: ${topic} Fundamentals — Part ${m + 1}`,
      description: `This module covers core concepts of ${topic} tailored for ${audience}.`,
      lessons,
    })
  }

  return {
    title: `${topic} Mastery: A ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Course`,
    description: `A comprehensive ${difficulty} course on ${topic} designed for ${audience}. This ${style} course features ${lessonCount} lessons across ${moduleCount} modules with quizzes to test your knowledge.`,
    modules,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      topic,
      audience = 'general learners',
      lesson_count = 5,
      difficulty = 'beginner',
      style = 'practical',
    } = body

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 })
    }

    const count = Math.min(10, Math.max(3, Number(lesson_count) || 5))
    const apiKey = process.env.ANTHROPIC_API_KEY

    // ── AI generation path ──
    if (apiKey) {
      const prompt = `You are an expert course creator. Generate a complete, professional course on the given topic.

Topic: ${topic.trim()}
Audience: ${audience}
Difficulty: ${difficulty}
Style: ${style}
Number of lessons: ${count}

Create a course with this EXACT JSON structure (no markdown, just JSON):
{
  "title": "Engaging course title",
  "description": "2-3 sentence marketing description",
  "modules": [
    {
      "title": "Module 1: ...",
      "description": "What this module covers",
      "lessons": [
        {
          "title": "Lesson title",
          "content": "Full lesson content (500+ words). Include real, actionable information. Use headers (## style), bullet points, and examples. Make it genuinely educational.",
          "duration_minutes": 10,
          "quiz": [
            {
              "question": "...",
              "options": ["A", "B", "C", "D"],
              "correct": 0
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Create 3-5 modules with 2-4 lessons each (totalling ${count} lessons).
- Each lesson MUST have at least 500 words of real, useful educational content.
- Each module MUST have exactly 3 quiz questions.
- Content should be ${difficulty} level and ${style} in style.
- Make the content REAL and USEFUL — not placeholder text.
- Each lesson should teach something specific and actionable.
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
          max_tokens: 8192,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const text = data.content?.[0]?.text || ''

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const course: Course = JSON.parse(jsonMatch[0])
            return NextResponse.json({ course, source: 'ai' })
          } catch {
            // Parse failed — fall through to template
          }
        }
      }
    }

    // ── Template fallback ──
    const course = generateTemplate(topic.trim(), audience, count, difficulty, style)
    return NextResponse.json({ course, source: apiKey ? 'ai-fallback' : 'template' })
  } catch (err) {
    console.error('Course generate error:', err)
    return NextResponse.json({ error: 'Failed to generate course' }, { status: 500 })
  }
}
