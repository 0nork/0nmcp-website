import Anthropic from '@anthropic-ai/sdk'
import { ContentBrief, BlogPost, ActionBucket } from './types'

/**
 * Generate a URL-safe slug from a title string.
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

/**
 * Build the system prompt for blog post generation.
 * Encodes all CRO9 content rules as strict instructions.
 */
function buildSystemPrompt(brief: ContentBrief): string {
  return `You are an expert SEO content writer for 0nMCP (0nmcp.com), an AI orchestration platform.

You write high-quality, SEO-optimized blog posts that follow strict content rules.

CONTENT RULES (MUST follow exactly):

WORD COUNT: ${brief.wordCount.min}-${brief.wordCount.max} words total.

PARAGRAPH STRUCTURE:
- Each paragraph: ${brief.structure.paragraphWords.min}-${brief.structure.paragraphWords.max} words
- 2-4 sentences per paragraph
- Average sentence length: 12-20 words
- Reading level: Grade 7-9

HEADINGS:
- ${brief.structure.h2Frequency.min}-${brief.structure.h2Frequency.max} H2 headings total
- One H2 every 180-260 words
- Primary keyword in at least one H2

KEYWORD ENGINEERING:
- Primary keyword: "${brief.query}"
- Density: ${(brief.keywords.density.min * 100).toFixed(1)}%-${(brief.keywords.density.max * 100).toFixed(1)}%
- Required placements:
${brief.keywords.placements.map((p) => `  - ${p}`).join('\n')}

REQUIRED SECTIONS (must include ALL):
${brief.requiredSections.map((s) => `- ${s}`).join('\n')}

TONE & STYLE:
- Professional but accessible
- Use concrete examples and data points
- No fluff or filler content
- Every paragraph must add value
- Use markdown formatting (## for H2, **bold** for emphasis)

OUTPUT FORMAT:
Return the blog post in markdown format. Start with the title as # H1.
After the main content, add a --- separator, then provide:
META_TITLE: (under 60 chars, keyword front-loaded)
META_DESCRIPTION: (150-160 chars, includes keyword, ends with CTA)`
}

/**
 * Build the user prompt for a specific brief.
 */
function buildUserPrompt(brief: ContentBrief): string {
  const bucketContext: Record<ActionBucket, string> = {
    CTR_FIX:
      'This content needs to maximize click-through rate. Use compelling hooks, power words, and brackets in the title. The first paragraph must be a direct answer or attention-grabbing hook.',
    STRIKING_DISTANCE:
      'This content is close to ranking in the top 3. Add depth, authority signals, case studies, and comprehensive coverage to push it over the edge.',
    RELEVANCE_REBUILD:
      'This content needs a complete relevance overhaul. Match the search intent precisely, restructure for the winning format, and add missing semantic entities.',
    LOCAL_BOOST:
      'This content needs stronger local SEO signals. Include location-specific examples, local testimonials, and geographic context throughout.',
  }

  return `Write a blog post optimized for the query: "${brief.query}"

URL: ${brief.url}
Action bucket: ${brief.bucket}
Context: ${bucketContext[brief.bucket]}

Target word count: ${brief.wordCount.min}-${brief.wordCount.max} words.

Write the complete blog post now. Follow all content rules exactly.`
}

/**
 * Parse the generated content to extract title, body, and meta description.
 */
function parseGeneratedContent(content: string): {
  title: string
  body: string
  metaDescription: string
} {
  const lines = content.split('\n')

  // Extract title from first H1
  let title = ''
  let bodyStart = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      title = line.replace(/^#\s+/, '')
      bodyStart = i + 1
      break
    }
  }

  if (!title && lines.length > 0) {
    title = lines[0].replace(/^#+\s*/, '')
    bodyStart = 1
  }

  // Split at --- separator to find meta section
  const separatorIndex = content.lastIndexOf('---')
  let body: string
  let metaDescription = ''

  if (separatorIndex > content.length / 2) {
    body = lines.slice(bodyStart).join('\n').substring(0, separatorIndex - lines.slice(0, bodyStart).join('\n').length).trim()
    const metaSection = content.substring(separatorIndex + 3)

    // Extract META_DESCRIPTION
    const metaMatch = metaSection.match(/META_DESCRIPTION:\s*(.+)/i)
    if (metaMatch) {
      metaDescription = metaMatch[1].trim()
    }

    // Try to get a better title from META_TITLE
    const titleMatch = metaSection.match(/META_TITLE:\s*(.+)/i)
    if (titleMatch) {
      title = titleMatch[1].trim()
    }
  } else {
    body = lines.slice(bodyStart).join('\n').trim()
  }

  // Fallback meta description from first paragraph
  if (!metaDescription) {
    const firstPara = body
      .split('\n\n')
      .find((p) => p.trim() && !p.trim().startsWith('#'))
    if (firstPara) {
      metaDescription = firstPara.replace(/\*\*/g, '').trim().slice(0, 160)
    }
  }

  return { title, body, metaDescription }
}

/**
 * Count words in a string.
 */
function countWords(text: string): number {
  return text
    .replace(/[#*_\-|>]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0).length
}

/**
 * Generate a SEO-optimized blog post from a CRO9 content brief.
 *
 * Uses Claude Sonnet via the Anthropic SDK to generate content
 * that follows the strict CRO9 content rules from the brief.
 *
 * @param brief - The content brief from the CRO9 brief generator
 * @returns A BlogPost object ready to save as a draft
 */
export async function generateBlogPost(
  brief: ContentBrief
): Promise<BlogPost> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required')
  }

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: buildSystemPrompt(brief),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(brief),
      },
    ],
  })

  // Extract text from response
  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in AI response')
  }

  const generated = textBlock.text
  const { title, body, metaDescription } = parseGeneratedContent(generated)
  const wordCount = countWords(body)

  return {
    title: title || `Guide: ${brief.query}`,
    slug: slugify(title || brief.query),
    content: body,
    metaDescription:
      metaDescription || `Learn about ${brief.query}. Expert guide with actionable insights.`,
    targetQuery: brief.query,
    bucket: brief.bucket,
    wordCount,
    status: 'draft',
    createdAt: new Date().toISOString(),
  }
}
