/**
 * POST /api/console/0ncode — 0nCode AI Code Generation
 *
 * Modes:
 *   - generate: Creates 3 design variation names, then generates HTML for each
 *   - variations: Creates 3 radical variations of existing HTML
 *   - styles: Returns just the 3 style/direction names for a prompt
 *
 * Uses Gemini 3 Flash for speed + creativity (temperature 1.2)
 * Falls back to OpenAI if Gemini unavailable
 *
 * Auth: Session (console) or Bearer token (external)
 */

import { NextRequest, NextResponse } from 'next/server'
import { resolveAuth } from '@/lib/token-auth'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const STYLE_PROMPT = `You are a conceptual design director. Given a UI description, generate exactly 3 unique design direction names.
Each name should be a physical/material metaphor (e.g., "Kinetic Wireframe", "Risograph Press", "Volumetric Glass", "Spectral Neon", "Brutalist Concrete").
NEVER use artist names, brand names, or copyrighted references. Use only physical materials, printing techniques, architectural styles, or natural phenomena.
Return ONLY a JSON array of 3 strings. No explanation.`

const CODE_PROMPT = `You are an elite UI designer and front-end developer. Generate a single, self-contained HTML file that implements the described UI component.

RULES:
- Output ONLY raw HTML. No markdown fencing, no explanations.
- Include ALL CSS inline in a <style> tag.
- Include any JS inline in a <script> tag.
- Use Google Fonts via @import if needed.
- Make it visually stunning — use animations, gradients, shadows, hover states.
- Design direction: Apply the given style metaphor to the visual treatment.
- Responsive by default.
- Dark theme preferred unless specified otherwise.
- No external dependencies.
- The HTML should be production-ready and copy-pasteable.`

const VARIATIONS_PROMPT = `You are a radical design experimenter. Given an existing HTML UI component, create 3 completely different visual interpretations.
Each variation should be a dramatic reimagining — different layout, different color palette, different typography, different animation style.
For each variation, output a JSON object on its own line: {"name": "Variation Name", "html": "<full html here>"}
Output exactly 3 JSON objects, one per line. No other text.`

async function generateWithGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1.2,
        maxOutputTokens: 8192,
      },
    }),
    signal: AbortSignal.timeout(60000),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

async function generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8192,
      temperature: 1.2,
    }),
    signal: AbortSignal.timeout(60000),
  })

  if (!res.ok) throw new Error(`OpenAI API ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function generate(prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    return generateWithGemini(prompt, geminiKey)
  }

  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    return generateWithOpenAI(prompt, openaiKey)
  }

  throw new Error('No AI API key configured (GEMINI_API_KEY or OPENAI_API_KEY)')
}

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:html)?\n?/gm, '').replace(/\n?```$/gm, '').trim()
}

export async function POST(request: NextRequest) {
  const auth = await resolveAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { prompt?: string; mode?: string; currentHtml?: string; styleName?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { prompt, mode = 'generate', currentHtml, styleName } = body

  if (!prompt && mode !== 'variations') {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
  }

  try {
    if (mode === 'styles') {
      // Return 3 style direction names
      const result = await generate(`${STYLE_PROMPT}\n\nUI Description: ${prompt}`)
      let styles: string[]
      try {
        styles = JSON.parse(result.trim())
      } catch {
        styles = ['Kinetic Wireframe', 'Volumetric Glass', 'Spectral Neon']
      }
      return NextResponse.json({ styles })
    }

    if (mode === 'variations' && currentHtml) {
      // Generate 3 variations of existing HTML
      const result = await generate(`${VARIATIONS_PROMPT}\n\nExisting HTML:\n${currentHtml}`)
      const variations: Array<{ name: string; html: string }> = []
      const lines = result.split('\n').filter(l => l.trim().startsWith('{'))
      for (const line of lines) {
        try {
          const obj = JSON.parse(line)
          if (obj.name && obj.html) {
            variations.push({ name: obj.name, html: stripMarkdownFences(obj.html) })
          }
        } catch { /* skip malformed lines */ }
      }
      return NextResponse.json({ variations })
    }

    if (mode === 'single' && styleName) {
      // Generate HTML for a specific style
      const result = await generate(
        `${CODE_PROMPT}\n\nDesign Direction: "${styleName}"\nUI Component: ${prompt}`
      )
      return NextResponse.json({ html: stripMarkdownFences(result), styleName })
    }

    // Default: generate — get 3 styles then generate HTML for each
    const stylesResult = await generate(`${STYLE_PROMPT}\n\nUI Description: ${prompt}`)
    let styles: string[]
    try {
      styles = JSON.parse(stylesResult.trim())
    } catch {
      styles = ['Kinetic Wireframe', 'Volumetric Glass', 'Spectral Neon']
    }

    // Generate all 3 in parallel
    const htmlResults = await Promise.allSettled(
      styles.map(style =>
        generate(`${CODE_PROMPT}\n\nDesign Direction: "${style}"\nUI Component: ${prompt}`)
      )
    )

    const artifacts = styles.map((style, i) => {
      const result = htmlResults[i]
      if (result.status === 'fulfilled') {
        return {
          styleName: style,
          html: stripMarkdownFences(result.value),
          status: 'complete' as const,
        }
      }
      return {
        styleName: style,
        html: '',
        status: 'error' as const,
        error: (result.reason as Error)?.message || 'Generation failed',
      }
    })

    return NextResponse.json({ artifacts, prompt })
  } catch (err) {
    console.error('[0ncode] Generation error:', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Generation failed' },
      { status: 500 }
    )
  }
}
