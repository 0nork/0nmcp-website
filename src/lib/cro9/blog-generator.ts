import { callAI } from '@/lib/ai-provider'
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
  return `You are the AI-search-era content writer for 0nMCP (0nmcp.com), an AI orchestration platform.

You write blog posts engineered to be CITED — not just ranked. The target reader is ChatGPT, Claude, Gemini, Perplexity, and Google AI Overview answering a user query, choosing which source to quote. Old-school keyword-density SEO is necessary but not sufficient. Citation-quality signals matter more.

CONTENT RULES (MUST follow exactly):

WORD COUNT: ${brief.wordCount.min}-${brief.wordCount.max} words total.

═══════════════════════════════════════════════════════
  AI-SEARCH SIGNAL QUALITY (the differentiator) — NON-NEGOTIABLE
═══════════════════════════════════════════════════════

1. **BLUF (Bottom Line Up Front)**: The FIRST paragraph is a direct, cite-able answer to the query "${brief.query}". 2-3 sentences. No setup, no "in this post we'll explore." It must read like the line an AI would lift verbatim into a citation.

2. **Definition block**: Within the first 200 words, include a single bolded sentence that defines the core concept in <25 words. Format: \`**X is Y that does Z.**\` This is what AI engines extract for "What is X?" queries.

3. **HowTo / process block** (when applicable): If the query is procedural, include a numbered list with EXACT step counts (3-step, 5-step, 7-step). Each step starts with an imperative verb. AI engines preferentially cite numbered procedures.

4. **Comparison table** (when 2+ options exist): markdown table with at least 3 rows × 3 columns. AI engines extract tables verbatim into "X vs Y" answers. Always include a "When to choose" or "Best for" column.

5. **FAQ block at the end**: 5-7 question/answer pairs in this exact format:
   ### Q: [literal question, voice-search natural language]
   A: [direct 1-3 sentence answer, cite-able as a quote]
   These questions should match what real users type into AI search.

6. **Specificity bias**: Every claim should have a number, date, named entity, or exact phrasing. "Many users" → bad. "73% of agencies surveyed in Q1 2026" → good. AI engines preferentially cite specific claims over vague ones.

7. **Inline citations**: When making a claim that isn't 0nMCP-internal, attribute it. "According to [Anthropic's 2025 model card]..." or "(MIT, 2024)". AI engines reward content that itself cites well.

8. **No fluff phrases**: Ban: "in today's fast-paced world", "look no further", "as we all know", "cutting-edge", "revolutionary", "leverage", "synergy". Every adjective must be earned by the noun.

═══════════════════════════════════════════════════════
  STRUCTURE
═══════════════════════════════════════════════════════

- Paragraph: ${brief.structure.paragraphWords.min}-${brief.structure.paragraphWords.max} words, 2-4 sentences each
- Sentences: 12-20 words average; Grade 7-9 reading level
- ${brief.structure.h2Frequency.min}-${brief.structure.h2Frequency.max} H2 headings, primary keyword in at least one
- One H2 every 180-260 words
- Use markdown: ## for H2, ### for H3, **bold** for emphasis, \`code\` for technical terms

═══════════════════════════════════════════════════════
  KEYWORD ENGINEERING
═══════════════════════════════════════════════════════

- Primary keyword: "${brief.query}"
- Density: ${(brief.keywords.density.min * 100).toFixed(1)}%-${(brief.keywords.density.max * 100).toFixed(1)}%
- Required placements:
${brief.keywords.placements.map((p) => `  - ${p}`).join('\n')}

═══════════════════════════════════════════════════════
  REQUIRED SECTIONS (must include ALL)
═══════════════════════════════════════════════════════

${brief.requiredSections.map((s) => `- ${s}`).join('\n')}

═══════════════════════════════════════════════════════
  OUTPUT FORMAT
═══════════════════════════════════════════════════════

Return the blog post in markdown format. Start with the title as # H1.

The structure must be (in this order):
1. # Title
2. **One-sentence BLUF** — the cite-able answer (italic block paragraph)
3. **Definition block** within first 200 words
4. ## H2 sections covering required topics
5. ## Frequently Asked Questions (with 5-7 ### Q: / A: pairs)
6. ## Bottom line (2-3 sentence summary that mirrors the BLUF)

After the main content, add a --- separator, then provide:
META_TITLE: (under 60 chars, keyword front-loaded, no clickbait)
META_DESCRIPTION: (150-160 chars, BLUF-style direct answer, ends with subtle CTA)
EXCERPT: (130-160 chars, quotable summary used in cards + social cards)`
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
  excerpt: string
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
  let excerpt = ''

  if (separatorIndex > content.length / 2) {
    body = lines.slice(bodyStart).join('\n').substring(0, separatorIndex - lines.slice(0, bodyStart).join('\n').length).trim()
    const metaSection = content.substring(separatorIndex + 3)

    const metaMatch = metaSection.match(/META_DESCRIPTION:\s*(.+)/i)
    if (metaMatch) metaDescription = metaMatch[1].trim()

    const titleMatch = metaSection.match(/META_TITLE:\s*(.+)/i)
    if (titleMatch) title = titleMatch[1].trim()

    const excerptMatch = metaSection.match(/EXCERPT:\s*(.+)/i)
    if (excerptMatch) excerpt = excerptMatch[1].trim()
  } else {
    body = lines.slice(bodyStart).join('\n').trim()
  }

  // Fallback meta description from BLUF / first paragraph
  if (!metaDescription) {
    const firstPara = body
      .split('\n\n')
      .find((p) => p.trim() && !p.trim().startsWith('#'))
    if (firstPara) {
      metaDescription = firstPara.replace(/\*\*/g, '').replace(/^_|_$/g, '').trim().slice(0, 160)
    }
  }

  if (!excerpt) excerpt = metaDescription.slice(0, 160)

  return { title, body, metaDescription, excerpt }
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
  const result = await callAI({
    system: buildSystemPrompt(brief),
    user: buildUserPrompt(brief),
    maxTokens: 4096,
  })

  if (!result) {
    throw new Error('All AI providers failed — check API keys')
  }

  const generated = result.text
  const { title, body, metaDescription, excerpt } = parseGeneratedContent(generated)
  const wordCount = countWords(body)
  const finalTitle = title || `Guide: ${brief.query}`
  const finalSlug = slugify(finalTitle || brief.query)

  // OG-style hero image generated dynamically from the title — no missing
  // assets, no manual uploads. Routes via /api/og/blog which renders an
  // SVG/PNG card on the fly.
  const image = `/api/og/blog?slug=${encodeURIComponent(finalSlug)}&title=${encodeURIComponent(finalTitle)}`

  return {
    title: finalTitle,
    slug: finalSlug,
    content: body,
    body, // CRITICAL: blog/[slug] reads from `body`, not `content`
    excerpt: excerpt || metaDescription.slice(0, 160),
    image,
    metaDescription:
      metaDescription || `Learn about ${brief.query}. Expert guide with actionable insights.`,
    targetQuery: brief.query,
    bucket: brief.bucket,
    wordCount,
    status: 'draft',
    createdAt: new Date().toISOString(),
  }
}
