import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ─── POST: Generate hashtags for content ─────────────────────────

export async function POST(request: NextRequest) {
  let contentText = ''

  try {
    const body = await request.json()
    const { content } = body as { content?: string }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    contentText = content

    const apiKey = process.env.ANTHROPIC_API_KEY

    // If no API key, return intelligent mock hashtags based on content
    if (!apiKey) {
      const mockHashtags = generateMockHashtags(content)
      return NextResponse.json({ hashtags: mockHashtags })
    }

    // Call Anthropic API
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Generate 5-10 relevant hashtags for this social media post. Return ONLY a JSON array of hashtag strings (without #). No other text, explanation, or markdown formatting. Just the raw JSON array.\n\nContent: ${content}`,
        },
      ],
    })

    // Extract text from response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim()

    // Parse the JSON array
    let hashtags: string[]
    try {
      // Try to parse directly
      hashtags = JSON.parse(responseText)
      if (!Array.isArray(hashtags)) {
        throw new Error('Response is not an array')
      }
      // Sanitize: remove # prefix if present, lowercase, trim
      hashtags = hashtags
        .map((t) => String(t).replace(/^#/, '').trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 50)
        .slice(0, 10)
    } catch {
      // If JSON parsing fails, try to extract hashtags from text
      const matches = responseText.match(/["']([^"']+)["']/g)
      if (matches && matches.length > 0) {
        hashtags = matches
          .map((m) => m.replace(/["']/g, '').replace(/^#/, '').trim().toLowerCase())
          .filter((t) => t.length > 0 && t.length <= 50)
          .slice(0, 10)
      } else {
        // Ultimate fallback to mock
        hashtags = generateMockHashtags(content)
      }
    }

    return NextResponse.json({ hashtags })
  } catch (err) {
    // On any error, fall back to mock hashtags
    console.error('Hashtag generation error:', err)
    const hashtags = contentText
      ? generateMockHashtags(contentText)
      : ['ai', 'automation', 'mcp', 'workflow', 'tech']
    return NextResponse.json({ hashtags })
  }
}

// ─── Mock hashtag generator ──────────────────────────────────────

function generateMockHashtags(content: string): string[] {
  const lower = content.toLowerCase()

  // Topic detection with keyword mapping
  const topicMap: Record<string, string[]> = {
    ai: ['ai', 'artificialintelligence', 'machinelearning'],
    automation: ['automation', 'workflow', 'nocode'],
    mcp: ['mcp', 'modelcontextprotocol', 'aitools'],
    api: ['api', 'restapi', 'developer'],
    security: ['security', 'encryption', 'cybersecurity'],
    vault: ['vault', 'credentials', 'secrets'],
    open: ['opensource', 'github', 'community'],
    deploy: ['deployment', 'devops', 'cicd'],
    stripe: ['stripe', 'payments', 'fintech'],
    supabase: ['supabase', 'database', 'backend'],
    next: ['nextjs', 'react', 'webdev'],
    typescript: ['typescript', 'javascript', 'coding'],
    startup: ['startup', 'saas', 'buildinpublic'],
    product: ['product', 'launch', 'buildinpublic'],
  }

  const result: string[] = []
  const seen = new Set<string>()

  for (const [keyword, tags] of Object.entries(topicMap)) {
    if (lower.includes(keyword)) {
      for (const tag of tags) {
        if (!seen.has(tag)) {
          seen.add(tag)
          result.push(tag)
        }
      }
    }
  }

  // Always include some base tags
  const baseTags = ['tech', 'innovation', 'software']
  for (const tag of baseTags) {
    if (!seen.has(tag) && result.length < 8) {
      seen.add(tag)
      result.push(tag)
    }
  }

  return result.slice(0, 10)
}
