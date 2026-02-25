export interface PageData {
  url: string
  query: string
  impressions: number
  clicks: number
  ctr: number
  position: number
  conversions?: number
  lastUpdated?: string
}

export type ActionBucket = 'CTR_FIX' | 'STRIKING_DISTANCE' | 'RELEVANCE_REBUILD' | 'LOCAL_BOOST'

export interface ScoredPage extends PageData {
  score: number
  bucket: ActionBucket
  factors: {
    impressions: number
    position: number
    ctrGap: number
    conversions: number
    freshness: number
  }
}

export interface WeightConfig {
  impressions: number
  position: number
  ctrGap: number
  conversions: number
  freshness: number
}

export interface ContentBrief {
  url: string
  query: string
  bucket: ActionBucket
  wordCount: { min: number; max: number }
  structure: {
    paragraphWords: { min: number; max: number }
    h2Frequency: { min: number; max: number }
  }
  keywords: {
    density: { min: number; max: number }
    placements: string[]
  }
  requiredSections: string[]
  priority: number
}

export interface SEORun {
  id: string
  runAt: string
  pagesAnalyzed: number
  actionsGenerated: number
  weights: WeightConfig
  status: 'running' | 'completed' | 'failed'
}

export interface BlogPost {
  id?: string
  title: string
  slug: string
  content: string
  metaDescription: string
  targetQuery: string
  bucket: ActionBucket
  wordCount: number
  status: 'draft' | 'published' | 'scheduled'
  publishedAt?: string
  createdAt?: string
}

// CTR expectation curves (position -> expected CTR)
export const CTR_EXPECTATIONS: Record<number, number> = {
  1: 0.32, 2: 0.24, 3: 0.18, 4: 0.13, 5: 0.10,
  6: 0.07, 7: 0.05, 8: 0.04, 9: 0.03, 10: 0.02,
}

export const DEFAULT_WEIGHTS: WeightConfig = {
  impressions: 0.25,
  position: 0.25,
  ctrGap: 0.25,
  conversions: 0.15,
  freshness: 0.10,
}

export interface OutcomeData {
  pageUrl: string
  bucket: ActionBucket
  success: boolean
  metricDelta: {
    clicks: number
    impressions: number
    position: number
    ctr: number
  }
  evaluatedAt: string
}

export interface ActionRecord {
  id: string
  pageUrl: string
  bucket: ActionBucket
  originalMetrics: {
    clicks: number
    impressions: number
    position: number
    ctr: number
  }
  createdAt: string
  status: 'pending' | 'completed' | 'evaluated'
}
