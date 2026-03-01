// LinkedIn Agentic Onboarding — Premium Template
// AI-powered profile classification, content generation, and self-optimizing follow-up system
// PACG + LVOS + CUCIA + TAICD

export const LINKEDIN_ONBOARDING_TEMPLATE = {
  name: 'LinkedIn Agentic Onboarding',
  description:
    'AI-powered LinkedIn profile analysis, archetype classification, and automated posting with self-optimizing follow-up questions. Includes PACG, LVOS, CUCIA, and TAICD subsystems.',
  version: '1.0.0',
  premium: true,
  category: 'Sales',
  icon: 'Linkedin',

  services: ['anthropic', 'linkedin', 'supabase'],

  subsystems: [
    { id: 'pacg', name: 'PACG', full: 'Profile-Adaptive Content Generator', color: '#0077b5' },
    { id: 'lvos', name: 'LVOS', full: 'Language Variation Optimization System', color: '#00d4ff' },
    { id: 'cucia', name: 'CUCIA', full: 'Cross-User Conversion Intelligence Aggregator', color: '#a855f7' },
    { id: 'taicd', name: 'TAICD', full: 'Third-Party AI Intermediary Conversion Delivery', color: '#f59e0b' },
  ],

  trigger: {
    type: 'event',
    description: 'Triggers on LinkedIn OAuth callback or manual onboarding request',
    event: 'linkedin_oauth_callback',
  },

  inputs: [
    {
      key: 'topic',
      label: 'Content Topic',
      type: 'text',
      required: false,
      placeholder: 'e.g., AI automation, developer tools, leadership',
    },
    {
      key: 'follow_up_response',
      label: 'Follow-up Response',
      type: 'textarea',
      required: false,
      placeholder: 'Your response to the onboarding follow-up question',
    },
  ],

  steps: [
    {
      id: 'classify_profile',
      name: 'Classify Profile',
      service: 'anthropic',
      action: 'Analyze LinkedIn profile and classify into 5D professional archetype',
      description:
        'PACG: Claude analyzes headline, industry, and profile data to produce a 5-dimensional archetype — tier (executive/manager/individual/student), domain (tech/finance/etc), style (thought-leader/storyteller/etc), posting behavior, vocabulary level.',
    },
    {
      id: 'save_archetype',
      name: 'Save Archetype',
      service: 'supabase',
      action: 'Persist classified archetype to linkedin_members table',
      description:
        'Saves the archetype JSON and marks onboarding as complete for the member record.',
    },
    {
      id: 'get_segment_boosts',
      name: 'CUCIA Segment Boost',
      service: 'supabase',
      action: 'Query anonymized segment model for variant selection boosts',
      description:
        'CUCIA: Looks up the segment key (domain:tier:postingBehavior) in cucia_segment_model to find top-performing variants for this professional segment. Returns 20%/10%/5% boost multipliers.',
    },
    {
      id: 'select_variant',
      name: 'Thompson Sampling',
      service: 'internal',
      action: 'Select optimal follow-up question via Thompson Sampling with CUCIA boosts',
      description:
        'LVOS: Samples from Beta(alpha, beta) distribution for each variant, applies segment boosts as multiplier, picks the variant with highest sample. Uses Marsaglia-Tsang Gamma approximation.',
    },
    {
      id: 'record_selection',
      name: 'Observation Window',
      service: 'supabase',
      action: 'Open 48-hour observation window to track conversion',
      description:
        'Creates a selection record with a 48-hour observation window. If the user generates a post or enables automation within this window, it counts as a conversion and updates variant weights.',
    },
    {
      id: 'build_receipt',
      name: 'Execution Receipt',
      service: 'internal',
      action: 'Construct TAICD execution receipt and log tool call',
      description:
        'TAICD: Builds structured receipt (rcpt_{ts}_{id}) with tool name, input/output summaries, execution time, and follow-up question. Logged to linkedin_tool_calls table for third-party AI verification.',
    },
  ],

  notifications: ['slack'],

  config: {
    observationWindowHours: 48,
    plateauSampleThreshold: 50,
    plateauGapThreshold: 0.05,
    maxBannedPhrases: 23,
    maxHashtags: 3,
    postMinLength: 50,
    postMaxLength: 3000,
    automatedPostingFrequencies: ['daily', 'weekly', 'biweekly'],
  },
} as const

export type LinkedInOnboardingTemplate = typeof LINKEDIN_ONBOARDING_TEMPLATE
