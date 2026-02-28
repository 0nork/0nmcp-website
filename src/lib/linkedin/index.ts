/**
 * LinkedIn Agentic Onboarding — Barrel Export
 * Import everything from @/lib/linkedin
 */

// Types
export type {
  Archetype,
  ArchetypeTier,
  ArchetypeDomain,
  ArchetypeStyle,
  PostingBehavior,
  VocabularyLevel,
  Member,
  LvosVariant,
  LvosSelection,
  ExecutionReceipt,
  OnboardingResult,
  PostGenerationResult,
  LinkedInProfile,
  LinkedInTokens,
  AiManifest,
} from './types'

// Auth
export {
  getAuthorizationUrl,
  exchangeCode,
  fetchProfile,
  upsertMember,
  getMemberByUserId,
  getMember,
} from './auth'

// PACG
export { classifyProfile } from './pacg/classifier'
export { buildInstructions, buildFollowUpContext } from './pacg/instructions'
export { validatePost, sanitizePost } from './pacg/validator'

// LVOS
export { SEED_VARIANTS } from './lvos/seed-variants'
export { selectVariant, recordSelection, updateVariantWeights } from './lvos/selector'
export { recordConversion, processExpiredWindows } from './lvos/observer'
export { detectPlateau, generateNewVariants, runPlateauCycle } from './lvos/plateau-detector'

// CUCIA
export { buildSegmentKey, getSegmentBoosts, updateSegmentModel } from './cucia/aggregator'

// TAICD
export { buildReceipt, logToolCall, getRecentReceipts } from './taicd/receipt-constructor'

// Pipeline
export { runOnboarding, processFollowUpResponse } from './pipeline/onboarding'
export { generatePost } from './pipeline/post-generator'

// Network
export { buildManifest } from './network/manifest'
export { logAiInteraction, getInteractionStats } from './network/ai-interaction-logger'
export { optimizeManifest } from './network/manifest-optimizer'
