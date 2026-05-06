/**
 * AEO scorer — Answer Engine Optimization. Ported from 0nmcp-website's
 * cro9 engine so sxowebsite can grade pages on AI-citation quality. The
 * 10-dimension model + DEFAULT_AEO_WEIGHTS are kept identical so a page
 * scored here can be compared 1:1 against scores in the 0nmcp engine.
 *
 * Each detector returns 0-1. Final AEO score is a weighted sum × 100.
 */

export interface AEOFactors {
  bluf: number
  definition: number
  procedure: number
  comparison: number
  faq: number
  authorEEAT: number
  freshness: number
  schema: number
  informationGain: number
  specificity: number
}

export interface AEOWeights {
  bluf: number
  definition: number
  procedure: number
  comparison: number
  faq: number
  authorEEAT: number
  freshness: number
  schema: number
  informationGain: number
  specificity: number
}

export const DEFAULT_AEO_WEIGHTS: AEOWeights = {
  bluf: 0.18,
  definition: 0.14,
  procedure: 0.12,
  comparison: 0.10,
  faq: 0.10,
  authorEEAT: 0.08,
  freshness: 0.08,
  schema: 0.08,
  informationGain: 0.06,
  specificity: 0.06,
}

export const AEO_DIMENSION_LABELS: Record<keyof AEOFactors, string> = {
  bluf: 'BLUF (Bottom Line Up Front)',
  definition: 'Definition Block',
  procedure: 'Numbered Procedure',
  comparison: 'Comparison Table',
  faq: 'FAQ Block',
  authorEEAT: 'Author E-E-A-T',
  freshness: 'Freshness Markers',
  schema: 'JSON-LD Schema',
  informationGain: 'Information Gain',
  specificity: 'Specificity (numbers/dates/entities)',
}

const FLUFF_PHRASES = [
  "in today's fast-paced world",
  'look no further',
  'as we all know',
  'cutting-edge',
  'revolutionary',
  'leverage',
  'synergy',
  'in conclusion',
  'it is important to note',
]

export function detectBLUF(text: string): number {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith('#'))

  if (paragraphs.length === 0) return 0
  const first = paragraphs[0].replace(/\*\*/g, '').replace(/^_|_$/g, '')

  const wordCount = first.split(/\s+/).length
  if (wordCount < 15 || wordCount > 100) return 0.3

  const sentences = first.split(/[.!?]+/).filter((s) => s.trim().length > 5)
  if (sentences.length < 1 || sentences.length > 4) return 0.4

  const lower = first.toLowerCase()
  for (const fluff of FLUFF_PHRASES) {
    if (lower.includes(fluff)) return 0.3
  }

  const answersQuestion = /\b(is|are|means|refers to|describes|works by|enables|allows)\b/i.test(first)
  return answersQuestion ? 1.0 : 0.7
}

export function detectDefinition(text: string): number {
  const head = text.split(/\s+/).slice(0, 200).join(' ')
  const definitionPattern = /\*\*[A-Z][^*]{20,200}\b(is|are|means|refers to)\b[^*]{5,100}\*\*/
  if (definitionPattern.test(head)) return 1.0

  // HTML strong/b also counts
  const htmlPattern = /<(strong|b)>[A-Z][^<]{20,200}\b(is|are|means|refers to)\b[^<]{5,100}<\/(strong|b)>/i
  if (htmlPattern.test(head)) return 1.0

  const partialBold = /\*\*[A-Z][^*]{20,200}\*\*/
  if (partialBold.test(head)) return 0.5
  return 0
}

export function detectProcedure(text: string): number {
  const numberedListMatch = text.match(/(?:^|\n)\s*\d+\.\s+[^\n]+(?:\n\s*\d+\.\s+[^\n]+){2,}/g)
  if (!numberedListMatch) return 0

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

export function detectComparison(text: string): number {
  const tableMatch = text.match(/\|[^\n]+\|\n\|[\s:|-]+\|\n(?:\|[^\n]+\|\n?){2,}/)
  if (tableMatch) {
    const rows = tableMatch[0].split('\n').filter((r) => r.trim().startsWith('|'))
    if (rows.length < 4) return 0.4
    const cols = rows[0].split('|').filter((c) => c.trim()).length
    if (cols < 3) return 0.5
    const tableText = tableMatch[0].toLowerCase()
    if (/best for|when to choose|pros|cons|use case/.test(tableText)) return 1.0
    return 0.8
  }
  // HTML table fallback — count rows × cols
  const htmlTable = /<table[\s\S]*?<\/table>/i.exec(text)
  if (htmlTable) {
    const rows = (htmlTable[0].match(/<tr[\s\S]*?<\/tr>/gi) || []).length
    if (rows >= 3) return 0.8
    if (rows >= 2) return 0.5
  }
  return 0
}

export function detectFAQ(text: string): number {
  const faqHeader = /(##\s+|<h[12][^>]*>)\s*(FAQ|Frequently Asked|Common Questions)/i.test(text)
  if (!faqHeader) return 0

  const qaPairs = text.match(/###\s+Q:|###\s+\d+\.\s+|###\s+\?/g) || []
  const qaPairsAlt = text.match(/\*\*Q:\*\*|\*\*Question:\*\*/g) || []
  // FAQPage JSON-LD
  const faqSchema = /"@type"\s*:\s*"FAQPage"/i.test(text) ? 1 : 0
  const total = qaPairs.length + qaPairsAlt.length + faqSchema * 5

  if (total >= 5 && total <= 8) return 1.0
  if (total >= 3) return 0.7
  if (total >= 1) return 0.4
  return 0.2
}

export function detectAuthorEEAT(text: string, opts?: { author?: string; authorTitle?: string }): number {
  let score = 0
  if (opts?.author && opts.author.length > 0) score += 0.5
  if (opts?.authorTitle && opts.authorTitle.length > 0) score += 0.3

  const credentialPattern = /\b(\d+\s+years?\b|certified|founder|CEO|engineer|architect|expert|specialist|PhD|MBA|MD)\b/i
  if (credentialPattern.test(text)) score += 0.2
  // Person schema
  if (/"@type"\s*:\s*"Person"/i.test(text)) score += 0.2

  return Math.min(1, score)
}

export function detectFreshness(text: string, opts?: { updatedAt?: string }): number {
  const inlineUpdated =
    /\b(Updated|Last updated|As of)\s+(January|February|March|April|May|June|July|August|September|October|November|December|\d{4})/i.test(text)

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
  if (opts.hasOrganization) score += 0.1
  return Math.min(1, score)
}

export function detectSpecificity(text: string): number {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length < 50) return 0

  const numberMatches = text.match(/\b\d+(\.\d+)?%?\b/g) || []
  const dateMatches =
    text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Q[1-4])\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{4}\b/g) || []
  const entityMatches = text.match(/\b[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+\b/g) || []

  const density = (numberMatches.length + dateMatches.length + entityMatches.length) / (words.length / 100)
  return Math.min(1, density / 5)
}

export function detectInformationGain(text: string): number {
  let score = 0
  if (/```[\s\S]*?```|<code[\s\S]*?<\/code>|<pre[\s\S]*?<\/pre>/.test(text)) score += 0.3
  if (/\|[^\n]+\|\n\|[\s:|-]+\|\n\|[^\n]+\|/.test(text) || /<table/i.test(text)) score += 0.2
  if (/(according to|per the|cited in)\s+\[/i.test(text)) score += 0.3
  if (/\bcase study\b|\binternal data\b|\bproprietary\b/i.test(text)) score += 0.2
  return Math.min(1, score)
}

export interface ScoreInputs {
  text: string
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
    bluf: detectBLUF(input.text),
    definition: detectDefinition(input.text),
    procedure: detectProcedure(input.text),
    comparison: detectComparison(input.text),
    faq: detectFAQ(input.text),
    authorEEAT: detectAuthorEEAT(input.text, { author: input.author, authorTitle: input.authorTitle }),
    freshness: detectFreshness(input.text, { updatedAt: input.updatedAt }),
    schema: detectSchema({
      hasArticle: input.hasArticle,
      hasFAQ: input.hasFAQ,
      hasHowTo: input.hasHowTo,
      hasOrganization: input.hasOrganization,
    }),
    informationGain: detectInformationGain(input.text),
    specificity: detectSpecificity(input.text),
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

export function aeoGaps(factors: AEOFactors, threshold = 0.5): (keyof AEOFactors)[] {
  return (Object.keys(factors) as (keyof AEOFactors)[]).filter((k) => factors[k] < threshold)
}
