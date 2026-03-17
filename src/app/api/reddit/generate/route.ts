/**
 * POST /api/reddit/generate — AI-powered Reddit content generation
 *
 * Called by mcp0n Devvit app + Command Center to generate Reddit posts/comments.
 * Uses the AI provider cascade (groq → deepseek → gemini → ...) to avoid Anthropic API costs.
 * Stores drafts in reddit_content table for the approval pipeline.
 */

import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { callAI } from '@/lib/ai-provider'
import { pickSubreddit, TARGET_SUBREDDITS } from '@/lib/platforms/reddit'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      topic,
      subreddit,
      tone = 'helpful',
      contentType = 'post',
      includeLink = true,
    } = body

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 })
    }

    // Pick subreddit if not specified
    const targetSubreddit = subreddit || pickSubreddit()

    // Build the AI prompt
    const system = `You are a Reddit power user who writes genuinely valuable posts for r/${targetSubreddit}. You are knowledgeable about AI, automation, APIs, developer tools, and workflow orchestration.

Rules:
- Write in ${tone} tone
- Sound like a real person, NOT a marketer or bot
- Lead with value — share real insight, a discovery, or a problem you solved
- NO clickbait, NO hype, NO "game-changer" language
- Keep it conversational and authentic to Reddit culture
- If mentioning 0nMCP or any tool, frame it as something you genuinely found useful, not an ad
- Use Reddit formatting (## headers, bullet points, code blocks where relevant)
- ${includeLink ? 'Include a natural mention of 0nmcp.com only if it fits organically — never force it' : 'Do NOT include any links'}
- Aim for 150-400 words — substantial but not a wall of text`

    const userPrompt = contentType === 'post'
      ? `Write a Reddit post for r/${targetSubreddit} about: ${topic}

Return ONLY valid JSON with this exact format:
{"title": "your post title here", "body": "your post body here"}`
      : `Write a Reddit comment responding to a discussion about: ${topic}

Return ONLY valid JSON with this exact format:
{"body": "your comment here"}`

    // Call AI (uses provider cascade — avoids Anthropic costs)
    const result = await callAI({
      system,
      user: userPrompt,
      maxTokens: 1500,
    })

    if (!result) {
      return NextResponse.json({ error: 'All AI providers failed' }, { status: 503 })
    }

    // Parse AI response
    let title = ''
    let generatedBody = ''

    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        title = parsed.title || ''
        generatedBody = parsed.body || ''
      } else {
        // Fallback: use raw text
        generatedBody = result.text
        if (contentType === 'post') {
          const lines = generatedBody.split('\n').filter(l => l.trim())
          title = lines[0]?.replace(/^#+\s*/, '') || topic
          generatedBody = lines.slice(1).join('\n')
        }
      }
    } catch {
      // JSON parse failed — use raw text
      generatedBody = result.text
      title = topic
    }

    const wordCount = generatedBody.split(/\s+/).filter(Boolean).length
    const hasLink = generatedBody.includes('0nmcp.com')

    // Store in reddit_content table
    const admin = createSupabaseAdmin()
    let contentId: string | null = null

    if (admin) {
      const { data } = await admin.from('reddit_content').insert({
        content_type: contentType,
        subreddit: targetSubreddit,
        title: contentType === 'post' ? title : null,
        body: generatedBody,
        tone,
        word_count: wordCount,
        includes_link: hasLink,
        link_url: hasLink ? 'https://0nmcp.com' : null,
        status: 'draft',
        persona: '0nMCP',
      }).select('id').single()

      contentId = data?.id || null
    }

    return NextResponse.json({
      title,
      body: generatedBody,
      subreddit: targetSubreddit,
      tone,
      contentType,
      wordCount,
      includes_link: hasLink,
      provider: result.provider,
      contentId,
    })
  } catch (err) {
    console.error('[/api/reddit/generate] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}

// GET — return available subreddits and tones
export async function GET() {
  return NextResponse.json({
    subreddits: TARGET_SUBREDDITS,
    tones: ['casual', 'technical', 'helpful', 'enthusiastic', 'dry_humor'],
    contentTypes: ['post', 'comment'],
  })
}
