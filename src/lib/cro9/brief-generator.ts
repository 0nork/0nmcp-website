import { ScoredPage, ContentBrief, ActionBucket } from './types'

/**
 * Content rules ported from CRO9 Google Apps Script.
 * Strict and enforceable structure/keyword/section requirements.
 */
const CONTENT_RULES = {
  WORD_COUNTS: {
    pillar: { min: 2200, max: 3200, target: 2800 },
    cluster: { min: 1000, max: 1600, target: 1300 },
    service: { min: 900, max: 1400, target: 1150 },
    local_service: { min: 1200, max: 1800, target: 1500 },
  },

  STRUCTURE: {
    paragraphWords: { min: 40, max: 85 },
    sentencesPerParagraph: { min: 2, max: 4 },
    avgSentenceWords: { min: 12, max: 20 },
    readingGrade: { min: 7, max: 9 },
    h2FrequencyWords: { min: 180, max: 260 },
  },

  KEYWORDS: {
    primaryDensity: { min: 0.006, max: 0.012 },
    secondaryDensity: { min: 0.002, max: 0.006 },
    placements: [
      'Title tag (1x, front-loaded)',
      'H1 (1x exact match)',
      'First 100 words (1x)',
      'One H2 (1x exact or close variant)',
      'Last 120 words (1x)',
      'URL slug',
      'Meta description',
    ],
  },

  REQUIRED_SECTIONS: [
    'Author Box (real name, credentials, local tie if relevant)',
    'Proof Block (quantified outcome or case study snippet)',
    'Sources (minimum 2-3 external citations)',
    'Last Updated (auto-refresh date on content edits)',
    'FAQ Section (5-8 questions minimum)',
  ],
} as const

type PageType = 'pillar' | 'cluster' | 'service' | 'local_service'

/**
 * Determine page type based on URL signals and impressions volume.
 */
function determinePageType(page: ScoredPage): PageType {
  const url = page.url.toLowerCase()
  const query = page.query.toLowerCase()

  // High volume or guide-like URLs = pillar content
  if (
    page.impressions > 5000 ||
    url.includes('/guide') ||
    url.includes('/ultimate') ||
    url.includes('/complete') ||
    url.includes('/pillar')
  ) {
    return 'pillar'
  }

  // Local intent = local service page
  if (
    url.includes('pittsburgh') ||
    url.includes('local') ||
    url.includes('near') ||
    query.includes('near me') ||
    query.includes('local')
  ) {
    return 'local_service'
  }

  // Service/transactional pages
  if (
    url.includes('service') ||
    url.includes('pricing') ||
    url.includes('hire') ||
    url.includes('cost')
  ) {
    return 'service'
  }

  // Default: cluster content
  return 'cluster'
}

/**
 * Get bucket-specific priority action instructions.
 */
function getBucketInstructions(
  bucket: ActionBucket,
  page: ScoredPage
): string[] {
  switch (bucket) {
    case 'CTR_FIX':
      return [
        'Content ranks but does not get clicks.',
        'Rewrite Title Tag with power words and brackets (e.g., [2025 Guide]).',
        'First paragraph must be a direct answer or compelling hook.',
        'Add number/statistic in first 50 words.',
        `Current CTR: ${(page.ctr * 100).toFixed(1)}% — needs improvement.`,
      ]
    case 'STRIKING_DISTANCE':
      return [
        `Position ${page.position.toFixed(1)} — within striking distance of top 3.`,
        'Add 2 new H2 sections (Benefits + Case Study).',
        'Expand existing sections with more specific examples.',
        'Add 3-5 internal links to related content.',
        'Strengthen proof block with quantified outcomes.',
      ]
    case 'RELEVANCE_REBUILD':
      return [
        'Content has visibility but poor rankings.',
        'Analyze top 5 SERP results for intent match.',
        'Restructure to match winning content format.',
        'Add missing semantic entities.',
        'Update all statistics and examples to current year.',
      ]
    case 'LOCAL_BOOST':
      return [
        'Strengthen local signals throughout content.',
        'Add location-specific examples and case studies.',
        'Include LocalBusiness + GeoCoordinates schema.',
        'Mention neighborhoods, landmarks, or local context.',
        'Add local testimonials or reviews if available.',
      ]
  }
}

/**
 * Generate a content brief for a scored page.
 *
 * The brief contains strict, enforceable rules for content creation:
 * - Word count ranges based on page type (pillar/cluster/service/local)
 * - Paragraph structure: 40-85 words per paragraph
 * - H2 frequency: every 180-260 words
 * - Keyword density: 0.6%-1.2%
 * - Required placements: title, H1, first 100 words, last paragraph, meta
 * - Required sections: author box, proof block, sources, FAQ, last updated
 */
export function generateBrief(page: ScoredPage): ContentBrief {
  const pageType = determinePageType(page)
  const wordSpecs = CONTENT_RULES.WORD_COUNTS[pageType]
  const targetWords = wordSpecs.target

  // Calculate H2 frequency range
  const minH2 = Math.max(
    2,
    Math.floor(targetWords / CONTENT_RULES.STRUCTURE.h2FrequencyWords.max)
  )
  const maxH2 = Math.ceil(
    targetWords / CONTENT_RULES.STRUCTURE.h2FrequencyWords.min
  )

  // Priority score: higher for CTR_FIX and STRIKING_DISTANCE
  const priorityMap: Record<ActionBucket, number> = {
    CTR_FIX: 90,
    STRIKING_DISTANCE: 80,
    LOCAL_BOOST: 70,
    RELEVANCE_REBUILD: 60,
  }

  // Adjust priority by opportunity score
  const priority = Math.round(
    priorityMap[page.bucket] * 0.6 + page.score * 100 * 0.4
  )

  const bucketInstructions = getBucketInstructions(page.bucket, page)

  return {
    url: page.url,
    query: page.query,
    bucket: page.bucket,
    wordCount: {
      min: wordSpecs.min,
      max: wordSpecs.max,
    },
    structure: {
      paragraphWords: {
        min: CONTENT_RULES.STRUCTURE.paragraphWords.min,
        max: CONTENT_RULES.STRUCTURE.paragraphWords.max,
      },
      h2Frequency: {
        min: minH2,
        max: maxH2,
      },
    },
    keywords: {
      density: {
        min: CONTENT_RULES.KEYWORDS.primaryDensity.min,
        max: CONTENT_RULES.KEYWORDS.primaryDensity.max,
      },
      placements: [
        ...CONTENT_RULES.KEYWORDS.placements,
        ...bucketInstructions,
      ],
    },
    requiredSections: [...CONTENT_RULES.REQUIRED_SECTIONS],
    priority,
  }
}

/**
 * Generate briefs for multiple scored pages, sorted by priority.
 */
export function generateBriefs(pages: ScoredPage[]): ContentBrief[] {
  return pages
    .map((page) => generateBrief(page))
    .sort((a, b) => b.priority - a.priority)
}
