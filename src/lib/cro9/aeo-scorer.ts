/**
 * AEO scorer — runs against rendered markdown content.
 *
 * Each dimension returns a 0-1 score. Final AEO score is a weighted sum × 100.
 * Weights live in `aeo_weights` table and adapt via the outcome evaluator.
 *
 * Used in three places:
 *   1. After every blog post is generated — score the post, store on the row
 *   2. On WP-SXO 2.0 — same heuristics ported to PHP, score every page
 *   3. Daily cro9 cron — score top SERP-position pages we don't own to find
 *      AEO gaps the rewrite engine can exploit
 */

import type { AEOFactors, AEOWeights } from './types'
import { DEFAULT_AEO_WEIGHTS } from './types'

// ─── Detectors ────────────────────────────────────────────────────────────

const FLUFF_PHRASES = [
  'in today\'s fast-paced world',
  'look no further',
  'as we all know',
  'cutting-edge',
  'revolutionary',
  'leverage',
  'synergy',
  'in conclusion',
  'it is important to note',
]

/** First non-heading paragraph reads like a direct cite-able answer. */
export function detectBLUF(markdown: string): number {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith('#'))

  if (paragraphs.length === 0) return 0
  const first = paragraphs[0].replace(/\*\*/g, '').replace(/^_|_$/g, '')

  // Length: BLUF is 1-3 sentences, ~30-80 words
  const wordCount = first.split(/\s+/).length
  if (wordCount < 15 || wordCount > 100) return 0.3

  // Sentence count
  const sentences = first.split(/[.!?]+/).filter((s) => s.trim().length > 5)
  if (sentences.length < 1 || sentences.length > 4) return 0.4

  // Anti-fluff
  const lower = first.toLowerCase()
  for (const fluff of FLUFF_PHRASES) {
    if (lower.includes(fluff)) return 0.3
  }

  // Contains a verb cluster suggesting it answers a question (good signal)
  const answersQuestion = /\b(is|are|means|refers to|describes|works by|enables|allows)\b/i.test(first)

  return answersQuestion ? 1.0 : 0.7
}

/** Within the first 200 words: an inline definition like "**X is Y that does Z.**" */
export function detectDefinition(markdown: string): number {
  const head = markdown.split(/\s+/).slice(0, 200).join(' ')
  // Look for a bolded sentence that starts with a noun and contains "is" / "are" / "means"
  const definitionPattern = /\*\*[A-Z][^*]{20,200}\b(is|are|means|refers to)\b[^*]{5,100}\*\*/
  if (definitionPattern.test(head)) return 1.0

  // Bonus partial credit: bolded sentence that smells like a definition (no "is" but starts with subject)
  const partialBold = /\*\*[A-Z][^*]{20,200}\*\*/
  if (partialBold.test(head)) return 0.5
  return 0
}

/** A numbered list of imperative-verb-first steps. */
export function detectProcedure(markdown: string): number {
  const numberedListMatch = markdown.match(/(?:^|\n)\s*\d+\.\s+[^\n]+(?:\n\s*\d+\.\s+[^\n]+){2,}/g)
  if (!numberedListMatch) return 0

  // Score by imperative density
  const imperativeStarters = /^\s*\d+\.\s+(Click|Select|Choose|Enter|Open|Run|Install|Configure|Set|Add|Remove|Edit|Delete|Save|Verify|Check|Create|Update|Send|Post|Pull|Push|Import|Export|Build|Generate|Test|Activate|Deactivate|Restart|Connect|Disconnect|Authorize|Authenticate|Sign|Pick|Drag|Drop|Type|Paste|Copy|Move|Toggle|Enable|Disable)\b/i

  for (const block of numberedListMatch) {
    const lines = block.split('\n').filter((l) => /^\s*\d+\./.test(l))
    if (lines.length < 3) continue
    const imperatives = lines.filter((l) => imperativeStarters.test(l))
    const ratio = imperatives.length / lines.length
    if (ratio >= 0.6) return 1.0
    if (ratio >= 0.3) return 0.6
    return 0.4
  }
  return 0.3
}

/** A markdown comparison table with at least 3 rows × 3 cols. */
export function detectComparison(markdown: string): number {
  const tableMatch = markdown.match(/\|[^\n]+\|\n\|[\s:|-]+\|\n(?:\|[^\n]+\|\n?){2,}/)
  if (!tableMatch) return 0

  const rows = tableMatch[0].split('\n').filter((r) => r.trim().startsWith('|'))
  if (rows.length < 4) return 0.4 // header + separator + ≥2 rows

  const cols = rows[0].split('|').filter((c) => c.trim()).length
  if (cols < 3) return 0.5

  // Bonus: includes "When to choose" / "Best for" / "Pros" — comparison-shaped
  const tableText = tableMatch[0].toLowerCase()
  if (/best for|when to choose|pros|cons|use case/.test(tableText)) return 1.0
  return 0.8
}

/** FAQ block at the end with 5-7 voice-search-natural Q/A pairs. */
export function detectFAQ(markdown: string): number {
  // Match "## FAQ" / "## Frequently Asked" + ### Q: pattern
  const faqHeader = /##\s+(FAQ|Frequently Asked|Common Questions)/i.test(markdown)
  if (!faqHeader) return 0

  const qaPairs = markdown.match(/###\s+Q:|###\s+\d+\.\s+|###\s+\?/g) || []
  const qaPairsAlt = markdown.match(/\*\*Q:\*\*|\*\*Question:\*\*/g) || []
  const total = qaPairs.length + qaPairsAlt.length

  if (total >= 5 && total <= 8) return 1.0
  if (total >= 3) return 0.7
  if (total >= 1) return 0.4
  return 0.2
}

/** E-E-A-T author signals: byline + credential phrase. */
export function detectAuthorEEAT(markdown: string, opts?: { author?: string; authorTitle?: string }): number {
  let score = 0
  if (opts?.author && opts.author.length > 0) score += 0.5
  if (opts?.authorTitle && opts.authorTitle.length > 0) score += 0.3

  // Body-level signals: "I've been...", years of experience, credentials
  const credentialPattern = /\b(\d+\s+years?\b|certified|founder|CEO|engineer|architect|expert|specialist|PhD|MBA|MD)\b/i
  if (credentialPattern.test(markdown)) score += 0.2

  return Math.min(1, score)
}

/** Freshness: "Updated <date>" marker or recent updated_at. */
export function detectFreshness(markdown: string, opts?: { updatedAt?: string }): number {
  const inlineUpdated = /\b(Updated|Last updated|As of)\s+(January|February|March|April|May|June|July|August|September|October|November|December|\d{4})/i.test(markdown)

  let recencyScore = 0
  if (opts?.updatedAt) {
    const days = (Date.now() - new Date(opts.updatedAt).getTime()) / 86_400_000
    if (days < 30) recencyScore = 1.0
    else if (days < 90) recencyScore = 0.7
    else if (days < 180) recencyScore = 0.4
    else recencyScore = 0.1
  }

  if (inlineUpdated && recencyScore > 0) return Math.max(recencyScore, 0.8)
  if (inlineUpdated) return 0.7
  return recencyScore
}

/** Schema completeness — caller passes a flag indicating whether FAQPage /
 *  HowTo / Article JSON-LD is present. We can't scrape it from markdown
 *  alone, so the brief/scorer must hydrate this. */
export function detectSchema(opts: {
  hasArticle?: boolean
  hasFAQ?: boolean
  hasHowTo?: boolean
  hasOrganization?: boolean
}): number {
  let score = 0
  if (opts.hasArticle) score += 0.4
  if (opts.hasFAQ) score += 0.25
  if (opts.hasHowTo) score += 0.25
  if (opts.hasOrganization) score += 0.10
  return Math.min(1, score)
}

/** Specificity: density of numbers, dates, named entities per 100 words. */
export function detectSpecificity(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean)
  if (words.length < 50) return 0

  const numberMatches = markdown.match(/\b\d+(\.\d+)?%?\b/g) || []
  const dateMatches = markdown.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Q[1-4])\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{4}\b/g) || []
  // Named entity proxy: capitalized 2+-word sequences
  const entityMatches = markdown.match(/\b[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+\b/g) || []

  const density = (numberMatches.length + dateMatches.length + entityMatches.length) / (words.length / 100)
  // 5+ specific items per 100 words = 1.0
  return Math.min(1, density / 5)
}

/** Information gain — caller must pass a comparison signal (e.g. "this post
 *  ranks for query X but the top-10 SERP doesn't have a section on Y, which
 *  this post does"). For now we approximate via uniqueness signals: presence
 *  of a code block, a unique data table, a quoted internal source. */
export function detectInformationGain(markdown: string): number {
  let score = 0
  if (/```[\s\S]*?```/.test(markdown)) score += 0.3 // code block
  if (/\|[^\n]+\|\n\|[\s:|-]+\|\n\|[^\n]+\|/.test(markdown)) score += 0.2 // any table
  if (/(according to|per the|cited in)\s+\[/i.test(markdown)) score += 0.3 // inline citation
  if (/\bcase study\b|\binternal data\b|\bproprietary\b/i.test(markdown)) score += 0.2
  return Math.min(1, score)
}

// ─── Composite scoring ────────────────────────────────────────────────────

export interface ScoreInputs {
  markdown: string
  author?: string
  authorTitle?: string
  updatedAt?: string
  hasArticle?: boolean
  hasFAQ?: boolean
  hasHowTo?: boolean
  hasOrganization?: boolean
}

export function scoreAEOFactors(input: ScoreInputs): AEOFactors {
  return {
    bluf: detectBLUF(input.markdown),
    definition: detectDefinition(input.markdown),
    procedure: detectProcedure(input.markdown),
    comparison: detectComparison(input.markdown),
    faq: detectFAQ(input.markdown),
    authorEEAT: detectAuthorEEAT(input.markdown, { author: input.author, authorTitle: input.authorTitle }),
    freshness: detectFreshness(input.markdown, { updatedAt: input.updatedAt }),
    schema: detectSchema({
      hasArticle: input.hasArticle,
      hasFAQ: input.hasFAQ,
      hasHowTo: input.hasHowTo,
      hasOrganization: input.hasOrganization,
    }),
    informationGain: detectInformationGain(input.markdown),
    specificity: detectSpecificity(input.markdown),
  }
}

export function aeoScoreFromFactors(factors: AEOFactors, weights: AEOWeights = DEFAULT_AEO_WEIGHTS): number {
  const total =
    factors.bluf * weights.bluf +
    factors.definition * weights.definition +
    factors.procedure * weights.procedure +
    factors.comparison * weights.comparison +
    factors.faq * weights.faq +
    factors.authorEEAT * weights.authorEEAT +
    factors.freshness * weights.freshness +
    factors.schema * weights.schema +
    factors.informationGain * weights.informationGain +
    factors.specificity * weights.specificity

  return Math.round(total * 100)
}

export function scoreAEO(input: ScoreInputs, weights?: AEOWeights): { score: number; factors: AEOFactors } {
  const factors = scoreAEOFactors(input)
  const score = aeoScoreFromFactors(factors, weights)
  return { score, factors }
}

/** Returns a list of dimension names that are below threshold (need work). */
export function aeoGaps(factors: AEOFactors, threshold = 0.5): (keyof AEOFactors)[] {
  return (Object.keys(factors) as (keyof AEOFactors)[]).filter(
    (k) => factors[k] < threshold,
  )
}

/** Build the AEO requirements block for a content brief, given the gaps. */
export function aeoRequirementsFromGaps(gaps: (keyof AEOFactors)[]) {
  return {
    needsBLUF: gaps.includes('bluf'),
    needsDefinition: gaps.includes('definition'),
    needsProcedure: gaps.includes('procedure'),
    needsComparison: gaps.includes('comparison'),
    needsFAQ: gaps.includes('faq'),
    needsAuthorEEAT: gaps.includes('authorEEAT'),
    needsFreshness: gaps.includes('freshness'),
  }
}
