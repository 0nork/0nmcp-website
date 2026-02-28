/**
 * LinkedIn Agentic Onboarding — Core Types
 * PACG, LVOS, CUCIA, TAICD, Pipeline, Network
 */

/* ── Archetype (PACG) ── */

export type ArchetypeTier = 'executive' | 'manager' | 'individual' | 'student'
export type ArchetypeDomain =
  | 'tech' | 'finance' | 'marketing' | 'sales' | 'operations'
  | 'hr' | 'legal' | 'healthcare' | 'education' | 'other'
export type ArchetypeStyle =
  | 'thought-leader' | 'storyteller' | 'data-driven'
  | 'motivational' | 'educational' | 'casual'
export type PostingBehavior = 'daily' | 'weekly' | 'occasional' | 'lurker'
export type VocabularyLevel = 'expert' | 'professional' | 'conversational'

export interface Archetype {
  tier: ArchetypeTier
  domain: ArchetypeDomain
  style: ArchetypeStyle
  postingBehavior: PostingBehavior
  vocabularyLevel: VocabularyLevel
}

/* ── Member ── */

export interface Member {
  id: string
  user_id: string
  linkedin_id: string
  linkedin_access_token: string
  linkedin_refresh_token: string | null
  token_expires_at: string | null
  linkedin_name: string
  linkedin_headline: string | null
  linkedin_industry: string | null
  linkedin_profile_url: string | null
  linkedin_avatar_url: string | null
  archetype: Archetype | null
  onboarding_completed: boolean
  automated_posting_enabled: boolean
  posting_frequency: string
  last_post_at: string | null
  total_posts: number
  total_engagements: number
  created_at: string
  updated_at: string
}

/* ── LVOS ── */

export interface LvosVariant {
  id: string
  variant_key: string
  question_text: string
  context_hint: string | null
  alpha: number
  beta: number
  is_seed: boolean
  parent_variant_id: string | null
  created_at: string
}

export interface LvosSelection {
  id: string
  member_id: string
  variant_id: string
  session_id: string
  response_text: string | null
  conversion_event: string | null
  observation_window_start: string
  observation_window_end: string
  created_at: string
}

export interface LvosVariantPerformance {
  id: string
  variant_id: string
  member_id: string
  was_selected: boolean
  led_to_conversion: boolean
  response_quality: number
  created_at: string
}

/* ── CUCIA ── */

export interface CuciaSegmentModel {
  id: string
  segment_key: string
  sample_size: number
  avg_conversion_rate: number
  top_performing_variants: string[] // variant IDs
  archetype_distribution: Record<string, number>
  updated_at: string
}

/* ── TAICD ── */

export interface ExecutionReceipt {
  receipt_id: string
  tool_name: string
  member_id: string
  timestamp: string
  input_summary: Record<string, unknown>
  output_summary: Record<string, unknown>
  execution_time_ms: number
  success: boolean
  follow_up: string | null
}

/* ── AI Network ── */

export interface AiInteraction {
  id: string
  ai_system_identifier: string
  manifest_version: string
  tool_called: string
  input_params: Record<string, unknown>
  execution_receipt_id: string | null
  interaction_quality: number | null
  created_at: string
}

export interface ToolCall {
  id: string
  tool_name: string
  member_id: string | null
  input_params: Record<string, unknown>
  output_result: Record<string, unknown>
  execution_time_ms: number
  success: boolean
  error_message: string | null
  created_at: string
}

/* ── Automated Posts ── */

export interface AutomatedPost {
  id: string
  member_id: string
  content: string
  linkedin_post_id: string | null
  posted_at: string | null
  engagement_metrics: Record<string, number> | null
  created_at: string
}

/* ── Manifest ── */

export interface ManifestTool {
  name: string
  description: string
  input_schema: Record<string, unknown>
  output_schema: Record<string, unknown>
}

export interface AiManifest {
  schema_version: string
  name: string
  description: string
  tools: ManifestTool[]
  interaction_endpoint: string
  capabilities: string[]
  rate_limits: { requests_per_minute: number }
  version: string
}

/* ── Pipeline ── */

export interface OnboardingResult {
  member_id: string
  archetype: Archetype
  follow_up_question: string
  post_preview: string | null
  receipt: ExecutionReceipt
}

export interface PostGenerationResult {
  content: string
  archetype: Archetype
  tone_match_score: number
  banned_phrases_found: string[]
  valid: boolean
}

/* ── LinkedIn OAuth ── */

export interface LinkedInProfile {
  id: string
  localizedFirstName: string
  localizedLastName: string
  headline?: string
  industry?: string
  profilePicture?: string
  vanityName?: string
}

export interface LinkedInTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
}

/* ── API Request/Response ── */

export interface OnboardRequest {
  linkedin_code?: string
  linkedin_access_token?: string
  follow_up_response?: string
  session_id?: string
}

export interface PostPreviewRequest {
  member_id: string
  topic?: string
  style_override?: ArchetypeStyle
}

export interface PublishPostRequest {
  member_id: string
  content: string
}

export interface AutomatePostingRequest {
  member_id: string
  frequency: 'daily' | 'weekly' | 'biweekly'
  enabled: boolean
}

export interface GeneratePostRequest {
  member_id: string
  topic?: string
  context?: string
}
