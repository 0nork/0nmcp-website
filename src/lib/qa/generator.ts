// =============================================================================
// QA Distribution Engine — Multi-Platform Content Generator
// =============================================================================
// Generates authentic, platform-appropriate content with natural backlinks
// Uses Claude (Anthropic SDK) for AI generation
// =============================================================================

import Anthropic from '@anthropic-ai/sdk'
import {
  PlatformId,
  Platform,
  PLATFORMS,
  RELEVANT_SUBREDDITS,
  ContentRequest,
  GeneratedContent,
  ContentBatch,
} from './types'

// ---------------------------------------------------------------------------
// Platform-Specific Prompts
// ---------------------------------------------------------------------------

const PLATFORM_PROMPTS: Record<PlatformId, string> = {
  quora: `You are writing a Quora answer. Quora users expect:
- Detailed, expert-level responses
- Personal experience or professional knowledge
- Clear structure with paragraphs (not excessive bullets)
- A helpful tone that educates
- Citations or references when making claims
- Answers that directly address the question asked

DO NOT:
- Sound salesy or promotional
- Use corporate marketing speak
- Start with "Great question!"
- Use excessive formatting
- Make the answer feel like an ad

If including a link, it should feel like a natural recommendation, not a pitch.`,

  reddit: `You are writing for Reddit. Reddit users HATE:
- Self-promotion that doesn't add value
- Marketing speak or corporate tone
- Answers that feel like ads
- Excessive positivity or enthusiasm
- Not disclosing affiliations

Reddit users LOVE:
- Authentic, conversational tone
- Admitting limitations or downsides
- Specific, actionable advice
- Personal anecdotes or experiences
- Being helpful without expecting anything

Write like a knowledgeable community member, not a marketer.
If mentioning a tool/product, be balanced - mention alternatives too.
Use casual language, contractions, maybe light humor.`,

  poe: `You are providing knowledge to build a Poe bot's responses.
Focus on:
- Clear, accurate information
- Structured for easy AI consumption
- Comprehensive coverage of the topic
- Examples and use cases
- Common questions and answers`,

  warrior_forum: `You are writing for Warrior Forum. This is an internet marketing community.
The tone is:
- Direct and practical
- Results-focused
- Community member to community member
- Okay to mention tools (marketers expect it)
- Include specific tactics or numbers when possible

These are fellow marketers - they want actionable tips, not fluff.
Signature links are normal here, so in-content links should still add value.`,

  indiehackers: `You are writing for Indie Hackers. This community values:
- Transparency and authenticity
- "Build in public" mentality
- Specific numbers (revenue, users, etc.)
- Lessons learned from failures
- Practical startup advice
- Supporting fellow founders

Tone: Friendly, helpful, founder-to-founder.
It's okay to mention your own product if relevant, but be genuine about it.`,

  growthhackers: `You are writing for GrowthHackers. This is a growth marketing community.
They expect:
- Data-driven insights
- Specific growth tactics with results
- Case studies and experiments
- Frameworks and methodologies
- Advanced marketing concepts

Be specific about metrics, results, and implementation.
Growth hackers want actionable strategies, not generic advice.`,

  medium: `You are writing a Medium article. Medium readers expect:
- Well-written, polished content
- Clear narrative structure
- Engaging opening
- Value throughout (not just at the end)
- Professional but accessible tone

Format with clear headings, but don't over-format.
The content should stand alone as a valuable read.`,

  hackernews: `You are writing for Hacker News. HN readers are:
- Highly technical and skeptical
- Allergic to marketing speak
- Interested in technical depth
- Quick to call out BS
- Appreciative of honest, nuanced takes

Write like an engineer explaining to other engineers.
Acknowledge tradeoffs. Be specific. No hype.
If showing a product, focus on technical innovation, not marketing.`,

  producthunt: `You are writing for Product Hunt. The community is:
- Early adopter minded
- Interested in new tools and products
- Appreciative of good design and UX
- Looking for productivity improvements

Tone: Enthusiastic but genuine.
Focus on what makes a product unique and useful.`,

  dev_to: `You are writing for Dev.to. This developer community values:
- Technical accuracy
- Practical tutorials
- Code examples
- Beginner-friendly explanations
- Personal learning journeys

Write like a developer sharing with other developers.
Include code snippets where relevant.`,

  hashnode: `You are writing for Hashnode. Similar to Dev.to:
- Technical content
- Developer-focused
- Tutorial style welcome
- Personal voice encouraged

Focus on practical, implementable content.`,

  linkedin: `You are writing for LinkedIn. The professional audience expects:
- Business-focused insights
- Professional tone (but not stuffy)
- Thought leadership content
- Industry trends and observations
- Career/business lessons

Avoid being too casual, but don't be corporate boring either.
Personal stories that relate to professional lessons work well.`,
}

// ---------------------------------------------------------------------------
// Prompt Builder
// ---------------------------------------------------------------------------

function buildGenerationPrompt(
  request: ContentRequest,
  platform: Platform,
  contentNumber: number
): string {
  const platformGuidance = PLATFORM_PROMPTS[platform.id]

  const backlinkGuidance = request.includeBacklinks
    ? `
BACKLINK INSTRUCTIONS:
- Include ONE natural link to ${request.websiteUrl}
- The link should appear where it genuinely helps the reader
- Use natural anchor text (not "click here" or exact match keywords)
- Format: [anchor text](${request.websiteUrl}) or [anchor text](${request.websiteUrl}/relevant-page)
- The link should feel like a helpful resource, not an advertisement
- Ideal placement: when recommending tools, providing resources, or citing sources

Good anchor text examples:
- "this MCP orchestration tool"
- "a universal API connector I've been using"
- "0nMCP's approach to this"
- "${request.websiteName}"

Bad anchor text (don't use):
- "best MCP server tool"
- "click here"
- "check this out"
`
    : `
Do NOT include any links to ${request.websiteUrl} in this content.
`

  return `${platformGuidance}

---

TOPIC: ${request.topic}

TARGET KEYWORDS (use naturally, don't stuff): ${request.targetKeywords.join(', ')}

ABOUT THE BRAND (for context, don't make this the focus):
- Website: ${request.websiteUrl}
- Name: ${request.websiteName}
- What they do: ${request.businessDescription}

${backlinkGuidance}

PLATFORM CONSTRAINTS:
- Max length: ${platform.maxLength || 'No limit'} characters
- Min length: ${platform.minLength} characters
- Format: ${platform.format}
- Tone: ${platform.preferredTone}
- Self-promotion rules: ${platform.selfPromotionRules}

${request.existingQuestionUrl ? `QUESTION URL: ${request.existingQuestionUrl}` : ''}
${request.targetSubreddit ? `TARGET SUBREDDIT: ${request.targetSubreddit}` : ''}
${request.additionalContext ? `ADDITIONAL CONTEXT: ${request.additionalContext}` : ''}

CONTENT TYPE: ${request.contentType}

Generate content variant #${contentNumber} of ${request.numberOfVariants}.
${request.numberOfVariants > 1 ? 'Make this variant distinct from others - different angle, examples, or structure.' : ''}

Respond with JSON:
{
  "title": "string or null (for posts/articles that need titles)",
  "body": "the main content in ${platform.format} format",
  "suggestedTags": ["array", "of", "tags"],
  "keywordsUsed": ["keywords", "from", "the", "list", "that", "were", "used"],
  "scores": {
    "authenticity": 8,
    "value": 9,
    "seoOptimization": 7,
    "platformFit": 9
  }
}`
}

// ---------------------------------------------------------------------------
// Main Generator Class
// ---------------------------------------------------------------------------

export class MultiPlatformGenerator {
  private client: Anthropic
  private model: string = 'claude-sonnet-4-20250514'

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    })
  }

  async generateForPlatform(
    request: ContentRequest,
    platformId: PlatformId,
    variantNumber: number
  ): Promise<GeneratedContent> {
    const platform = PLATFORMS[platformId]
    const prompt = buildGenerationPrompt(request, platform, variantNumber)

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON')
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Extract backlinks from content
    const backlinks = this.extractBacklinks(parsed.body, request.websiteUrl)

    return {
      id: `content_${Date.now()}_${platformId}_${variantNumber}`,
      platform: platformId,
      contentType: request.contentType,
      title: parsed.title || undefined,
      body: parsed.body,
      wordCount: parsed.body.split(/\s+/).length,
      readingLevel: this.calculateReadingLevel(parsed.body),
      keywordsUsed: parsed.keywordsUsed || [],
      backlinks,
      suggestedTags: parsed.suggestedTags || [],
      scores: parsed.scores || {
        authenticity: 7,
        value: 7,
        seoOptimization: 7,
        platformFit: 7,
      },
      generatedAt: new Date().toISOString(),
    }
  }

  async generateBatch(request: ContentRequest): Promise<ContentBatch> {
    const contents: GeneratedContent[] = []

    for (const platformId of request.platforms) {
      for (let i = 1; i <= request.numberOfVariants; i++) {
        try {
          const content = await this.generateForPlatform(request, platformId, i)
          contents.push(content)

          // Rate limiting between requests
          await this.delay(500)
        } catch (error) {
          console.error(`Failed to generate for ${platformId} variant ${i}:`, error)
        }
      }
    }

    // Calculate summary
    const totalWords = contents.reduce((sum, c) => sum + c.wordCount, 0)
    const avgScores = {
      authenticity: this.average(contents.map((c) => c.scores.authenticity)),
      value: this.average(contents.map((c) => c.scores.value)),
      seoOptimization: this.average(contents.map((c) => c.scores.seoOptimization)),
      platformFit: this.average(contents.map((c) => c.scores.platformFit)),
    }

    return {
      requestId: `batch_${Date.now()}`,
      request,
      contents,
      summary: {
        totalPlatforms: request.platforms.length,
        totalVariants: contents.length,
        totalWords,
        averageScores: avgScores,
      },
      createdAt: new Date().toISOString(),
    }
  }

  // Generate specifically for Reddit with subreddit awareness
  async generateForReddit(
    request: ContentRequest,
    subredditName: string
  ): Promise<GeneratedContent> {
    const subreddit = RELEVANT_SUBREDDITS.find((s) => s.name === subredditName)

    const enhancedRequest: ContentRequest = {
      ...request,
      targetSubreddit: subredditName,
      additionalContext: subreddit
        ? `Subreddit rules: ${subreddit.selfPromoRules} self-promotion. Best content types: ${subreddit.bestPostTypes.join(', ')}.`
        : undefined,
    }

    return this.generateForPlatform(enhancedRequest, 'reddit', 1)
  }

  // Generate Q&A pairs for FAQ schema
  async generateFAQContent(
    topic: string,
    keywords: string[],
    websiteUrl: string,
    numberOfQuestions: number = 5
  ): Promise<{
    questions: { question: string; answer: string }[]
    schemaMarkup: string
  }> {
    const prompt = `Generate ${numberOfQuestions} FAQ questions and answers about: ${topic}

Keywords to incorporate naturally: ${keywords.join(', ')}

Requirements:
1. Questions should be what real users would search for
2. Answers should be concise but complete (40-100 words each)
3. Use natural language, not marketing speak
4. If relevant, ONE answer can mention ${websiteUrl} as a resource

Return JSON:
{
  "questions": [
    {"question": "...", "answer": "..."},
    ...
  ]
}`

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch![0])

    const schemaMarkup = this.generateFAQSchema(parsed.questions)

    return {
      questions: parsed.questions,
      schemaMarkup,
    }
  }

  // -----------------------------------------------------------------------
  // Helper Methods
  // -----------------------------------------------------------------------

  private extractBacklinks(content: string, baseUrl: string): GeneratedContent['backlinks'] {
    const backlinks: GeneratedContent['backlinks'] = []

    const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let match

    while ((match = markdownRegex.exec(content)) !== null) {
      const [, anchorText, url] = match
      try {
        if (url.includes(baseUrl) || url.includes(new URL(baseUrl).hostname)) {
          backlinks.push({
            url,
            anchorText,
            position: match.index,
          })
        }
      } catch {
        // Invalid URL, skip
      }
    }

    return backlinks
  }

  private calculateReadingLevel(text: string): number {
    // Simplified Flesch-Kincaid calculation
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length
    const words = text.split(/\s+/).length
    const syllables = this.countSyllables(text)

    if (sentences === 0 || words === 0) return 8

    const readingLevel = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
    return Math.max(1, Math.min(18, Math.round(readingLevel)))
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().match(/[a-z]+/g) || []
    return words.reduce((total, word) => {
      const syllables = word
        .replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '')
        .replace(/^y/, '')
        .match(/[aeiouy]{1,2}/g)
      return total + (syllables?.length || 1)
    }, 0)
  }

  private generateFAQSchema(questions: { question: string; answer: string }[]): string {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer,
        },
      })),
    }

    return `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return Math.round((numbers.reduce((a, b) => a + b, 0) / numbers.length) * 10) / 10
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// ---------------------------------------------------------------------------
// Question Finder (for Quora/Reddit)
// ---------------------------------------------------------------------------

export class QuestionFinder {
  private client: Anthropic

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    })
  }

  async generateSearchQueries(
    businessNiche: string,
    keywords: string[],
    numberOfQueries: number = 20
  ): Promise<{
    quoraQueries: string[]
    redditQueries: string[]
    forumQueries: string[]
  }> {
    const prompt = `Generate search queries to find questions/posts to answer on Q&A platforms.

Business niche: ${businessNiche}
Keywords: ${keywords.join(', ')}

Generate ${numberOfQueries} queries for each platform:

1. QUORA: Questions that users would search for on Quora about this topic
2. REDDIT: Search queries to find relevant Reddit posts/comments (use Reddit search format)
3. FORUMS: General forum search queries

Focus on questions where someone with expertise in ${businessNiche} could provide valuable answers.
Include questions at different stages:
- Awareness: "What is...", "Why does..."
- Consideration: "How to...", "Best way to..."
- Decision: "Which tool...", "X vs Y..."

Return JSON:
{
  "quoraQueries": ["query1", "query2", ...],
  "redditQueries": ["query1", "query2", ...],
  "forumQueries": ["query1", "query2", ...]
}`

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return JSON.parse(jsonMatch![0])
  }
}

export default MultiPlatformGenerator
