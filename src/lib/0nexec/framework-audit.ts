/**
 * 0nExec Framework Audit — 12 Ad Copy Hacks Detection Engine
 * Runs against LinkedIn Ads creative text
 * Each detector returns a HackFlag or null
 */

import type { HackFlag } from './scoring-engine'

interface Creative {
  headline: string
  body: string
  cta: string
}

interface AuditMeta {
  creativeDaysInMarket: number
}

interface HackDetector {
  hack: number
  name: string
  layer: HackFlag['layer']
  detect: (creative: Creative, meta: AuditMeta) => Omit<HackFlag, 'hackNumber' | 'hackName' | 'layer'> | null
}

function computeFleschKincaid(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const syllables = words.reduce((sum, word) => {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '')
    if (cleaned.length <= 3) return sum + 1
    const count = cleaned.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
      .replace(/^y/, '')
      .match(/[aeiouy]{1,2}/g)?.length || 1
    return sum + count
  }, 0)

  if (sentences.length === 0 || words.length === 0) return 5

  return 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59
}

const HACK_DETECTORS: HackDetector[] = [
  {
    hack: 1,
    name: 'Headlines First',
    layer: 'Attention',
    detect: (creative) => {
      const level = computeFleschKincaid(creative.headline)
      if (level > 9) return {
        issue: `Headline reads at grade ${Math.round(level)}. Above grade 9 disqualifies 2/3 of audience before line 2.`,
        severity: 'critical',
        scoreImpact: -8,
      }
      return null
    },
  },
  {
    hack: 2,
    name: 'Say What Only You Can Say',
    layer: 'Trust',
    detect: (creative) => {
      const hasFalsifiable = /\d+\s+(client|company|business|customer|year|month|deal)/i.test(creative.body)
      if (!hasFalsifiable) return {
        issue: 'No falsifiable proof claim detected. Competitor could swap their name into this ad.',
        severity: 'critical',
        scoreImpact: -7,
      }
      return null
    },
  },
  {
    hack: 3,
    name: 'Call Out Your Avatar',
    layer: 'Attention',
    detect: (creative) => {
      const hasCallOut = /if you('re|re| are)|(for |only for |built for )/i.test(creative.body + ' ' + creative.headline)
      if (!hasCallOut) return {
        issue: 'No avatar call-out detected. Ad speaks to nobody specifically.',
        severity: 'warning',
        scoreImpact: -4,
      }
      return null
    },
  },
  {
    hack: 4,
    name: 'Always Have a Reason Why',
    layer: 'Action',
    detect: (creative) => {
      const hasBecause = /because|reason|why we('re|re)|that('s|s) why/i.test(creative.body)
      if (!hasBecause) return {
        issue: 'No stated reason for the offer. Compliance rate suppressed.',
        severity: 'warning',
        scoreImpact: -3,
      }
      return null
    },
  },
  {
    hack: 5,
    name: 'Damaging Admissions',
    layer: 'Trust',
    detect: (creative) => {
      const hasDamage = /but (it|they|we|our)|not for everyone|won't work if|honest(ly)?/i.test(creative.body)
      if (!hasDamage) return {
        issue: 'No damaging admission present. Every claim without owned flaws is discounted.',
        severity: 'critical',
        scoreImpact: -9,
      }
      return null
    },
  },
  {
    hack: 6,
    name: "Show Don't Tell",
    layer: 'Desire',
    detect: (creative) => {
      const hasAbstract = /\b(grow|scale|improve|enhance|optimize|boost|increase)\b/i.test(creative.body)
      const hasMoment = /when you|imagine|picture|monday morning|look at your|open your/i.test(creative.body)
      if (hasAbstract && !hasMoment) return {
        issue: 'Abstract benefit language with no moment specificity. Describe the scene.',
        severity: 'warning',
        scoreImpact: -4,
      }
      return null
    },
  },
  {
    hack: 7,
    name: 'Tie Benefits to Status',
    layer: 'Desire',
    detect: (creative) => {
      const hasStatusGiver = /your (team|board|clients|competitors|investor|spouse|boss|partner)/i.test(creative.body)
      if (!hasStatusGiver) return {
        issue: 'Benefits described with no status-giver. Nobody specific will notice the transformation.',
        severity: 'warning',
        scoreImpact: -3,
      }
      return null
    },
  },
  {
    hack: 8,
    name: 'Urgency & Scarcity',
    layer: 'Action',
    detect: (creative, meta) => {
      const hasUrgency = /limited|only \d+|spots|deadline|ends|closing|monday|this week/i.test(creative.body)
      if (!hasUrgency && meta.creativeDaysInMarket > 14) return {
        issue: `Creative in market ${meta.creativeDaysInMarket} days with no urgency mechanism.`,
        severity: 'warning',
        scoreImpact: -3,
      }
      return null
    },
  },
  {
    hack: 11,
    name: 'Clear CTA',
    layer: 'Action',
    detect: (creative) => {
      const weakCTA = /learn more|click here|find out|discover|explore/i.test(creative.cta)
      if (weakCTA) return {
        issue: `CTA "${creative.cta}" has no next-step specificity. Replace with action + outcome.`,
        severity: 'critical',
        scoreImpact: -8,
      }
      return null
    },
  },
  {
    hack: 12,
    name: 'Third Grade Reading Level',
    layer: 'Foundation',
    detect: (creative) => {
      const level = computeFleschKincaid(creative.body)
      if (level > 9) return {
        issue: `Body copy reads at grade ${Math.round(level)}. Reduce until grade 3–6.`,
        severity: 'critical',
        scoreImpact: -7,
      }
      return null
    },
  },
]

export function auditCreative(creative: Creative, meta: AuditMeta): HackFlag[] {
  const flags: HackFlag[] = []

  for (const detector of HACK_DETECTORS) {
    const result = detector.detect(creative, meta)
    if (result) {
      flags.push({
        hackNumber: detector.hack,
        hackName: detector.name,
        layer: detector.layer,
        ...result,
      })
    }
  }

  return flags
}

export { computeFleschKincaid }
