/**
 * Brain Training Factory — Shared Types
 *
 * All training runs happen OFFLINE in Claude Code (MAX plan).
 * These types are used by generator, evaluator, accumulator, and the /training skill.
 */

export interface TierConfig {
  tier: number
  name: string
  batchSize: number
  personaCount: number
  domains: string[]
  scoreThreshold: number
  color: string
}

export interface TrainingItem {
  id: string
  domain: string
  question: string
  difficulty: number // 1-5
  groundTruth: string
  evaluationCriteria: string[]
}

export interface TrainingBatch {
  items: TrainingItem[]
  tier: TierConfig
  generatedAt: string
}

export interface Persona {
  id: string
  name: string
  specialty: string
  systemPrompt: string
  unlocksAtTier: number
  avatar: string // emoji
}

export interface PersonaResponse {
  personaId: string
  personaName: string
  response: string
  score: number
}

export interface EvaluationScores {
  accuracy: number
  reasoning: number
  completeness: number
  relevance: number
}

export interface EvaluationResult {
  itemId: string
  domain: string
  question: string
  groundTruth: string
  personaResponses: PersonaResponse[]
  synthesis: string
  scores: EvaluationScores
  compositeScore: number
  accepted: boolean
}

export interface TrainingRunStats {
  batchSize: number
  avgCompositeScore: number
  entriesAdded: number
  entriesPruned: number
  durationMs: number
  tierLevel: number
  milestonesTriggered: string[]
  runType: 'offline' | 'manual' | 'user_ingest' | 'housekeeping'
}

export interface LeaderboardData {
  currentTier: TierConfig
  totalKnowledge: number
  avgScore: number
  nextTierProgress: {
    current: number
    needed: number
    label: string
  }
  recentRuns: {
    id: string
    batch_size: number
    avg_composite_score: number
    entries_added: number
    entries_pruned: number
    duration_ms: number
    tier_level: number
    run_type: string
    created_at: string
  }[]
  domainCoverage: {
    domain: string
    count: number
    avgScore: number
  }[]
  milestones: {
    milestone_key: string
    reached_at: string
    metadata: Record<string, unknown>
  }[]
  personaScores: {
    id: string
    name: string
    specialty: string
    avgScore: number
    unlocksAtTier: number
    isActive: boolean
  }[]
}

export interface MilestoneConfig {
  key: string
  label: string
  description: string
  check: (stats: MilestoneCheckContext) => boolean
}

export interface MilestoneCheckContext {
  totalKnowledge: number
  avgScore: number
  daysActive: number
  currentTier: number
  domainsWithMastery: string[]
  hasUserContributions: boolean
  lastRunScore: number
}
