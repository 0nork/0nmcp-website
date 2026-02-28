const BANNED_PHRASES = [
  'game-changer',
  'game changer',
  'disrupting',
  'synergy',
  'leverage',
  'circle back',
  'move the needle',
  'at the end of the day',
  'think outside the box',
  'low-hanging fruit',
  'deep dive',
  'bandwidth',
  'paradigm shift',
  'best-in-class',
  'bleeding edge',
  'thought leader',
  'value proposition',
  'core competency',
  'pivot',
  'disrupt',
  'innovative solution',
]

const LINKEDIN_CLICHES = [
  /^i'?m (excited|thrilled|humbled|honored|delighted) to (announce|share)/i,
  /^after \d+ years/i,
  /^agree\??$/i,
  /^thoughts\??$/i,
  /\b(hashtag|#)\w+/g, // count hashtags
]

export interface ValidationResult {
  valid: boolean
  banned_phrases_found: string[]
  cliches_found: string[]
  hashtag_count: number
  char_count: number
  warnings: string[]
}

/**
 * Validate a LinkedIn post against quality rules.
 */
export function validatePost(content: string): ValidationResult {
  const lower = content.toLowerCase()
  const warnings: string[] = []

  // Check banned phrases
  const banned_phrases_found = BANNED_PHRASES.filter(phrase =>
    lower.includes(phrase.toLowerCase())
  )

  // Check cliches
  const cliches_found: string[] = []
  for (const pattern of LINKEDIN_CLICHES) {
    if (pattern instanceof RegExp) {
      const match = content.match(pattern)
      if (match && !pattern.global) {
        cliches_found.push(match[0])
      }
    }
  }

  // Count hashtags
  const hashtags = content.match(/#\w+/g) || []
  const hashtag_count = hashtags.length

  if (hashtag_count > 3) {
    warnings.push(`Too many hashtags (${hashtag_count}). Max 3 recommended.`)
  }

  // Character count
  const char_count = content.length
  if (char_count > 3000) {
    warnings.push(`Post is ${char_count} characters. LinkedIn max is ~3000.`)
  }
  if (char_count < 50) {
    warnings.push('Post is very short. Consider adding more substance.')
  }

  // Check for all-caps sections
  const words = content.split(/\s+/)
  const capsWords = words.filter(w => w.length > 3 && w === w.toUpperCase())
  if (capsWords.length > 2) {
    warnings.push('Excessive use of ALL CAPS detected.')
  }

  const valid = banned_phrases_found.length === 0 && cliches_found.length === 0 && hashtag_count <= 3

  return {
    valid,
    banned_phrases_found,
    cliches_found,
    hashtag_count,
    char_count,
    warnings,
  }
}

/**
 * Strip banned phrases from content (for auto-correction).
 */
export function sanitizePost(content: string): string {
  let result = content
  for (const phrase of BANNED_PHRASES) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    result = result.replace(regex, '').replace(/\s{2,}/g, ' ')
  }
  return result.trim()
}
