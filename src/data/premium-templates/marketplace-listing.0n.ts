// Marketplace Listing Template — .0n format
// Canonical structure for creating new store listings on 0nmcp.com
// This is the MACHINE-EXECUTABLE format: structured data that maps directly to store_listings table
// Companion: ~/.claude/skills/create-store-listing/SKILL.md (AI instruction format)

/**
 * Store Listing .0n Template
 *
 * This template defines the canonical format for a purchasable .0n workflow
 * in the 0nmcp.com Console Store. Every field maps directly to the
 * `store_listings` table in Supabase.
 *
 * Two levels:
 *   1. LISTING METADATA — title, slug, description, pricing, category, tags
 *   2. WORKFLOW DATA — the actual .0n file content (trigger, inputs, launch_codes, steps)
 *
 * The workflow_data field contains a complete .0n file that can be:
 *   - Imported into the Builder
 *   - Downloaded as a .0n.json file
 *   - Executed by 0nMCP's WorkflowRunner
 */

export interface StoreListingTemplate {
  // ═══════════════════════════════════════════
  // LISTING METADATA (store_listings columns)
  // ═══════════════════════════════════════════

  /** Display title — shown in StoreListingCard and ListingDetailModal */
  title: string

  /** URL slug — must be unique, lowercase, hyphens only */
  slug: string

  /** Short description — 1-2 sentences, shown in card grid */
  description: string

  /** Long description — markdown, shown in detail modal */
  long_description: string

  /** Category — filters in the Store tab */
  category: 'sales' | 'marketing' | 'support' | 'operations' | 'development' | 'social' | 'finance' | 'hr' | 'custom'

  /** Tags — for search and discovery */
  tags: string[]

  /** Price in cents — 0 for free listings */
  price: number

  /** Currency — ISO 4217 */
  currency: string

  /** Cover image URL — displayed in store cards (optional) */
  cover_image_url?: string

  /** Stripe product ID — for paid listings (optional) */
  stripe_product_id?: string

  /** Stripe price ID — for paid listings (optional) */
  stripe_price_id?: string

  /** Services used by this workflow — from the 0nMCP 26-service catalog */
  services: string[]

  /** Number of steps in the workflow */
  step_count: number

  /** Listing status */
  status: 'active' | 'draft' | 'archived'

  // ═══════════════════════════════════════════
  // WORKFLOW DATA (the .0n file content)
  // ═══════════════════════════════════════════

  /** Complete .0n workflow JSON — stored in workflow_data JSONB column */
  workflow_data: {
    /** .0n header — required for all .0n files */
    $0n: {
      version: string
      type: 'workflow'
      created: string
      name: string
      description: string
    }

    /** Trigger configuration */
    trigger: {
      type: 'webhook' | 'schedule' | 'event' | 'manual'
      config: Record<string, unknown>
    }

    /** User-provided inputs */
    inputs: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'select' | 'textarea'
      description: string
      required: boolean
      default?: unknown
      options?: string[]
      placeholder?: string
    }>

    /** Required API keys/credentials the user must provide */
    launch_codes: Record<string, {
      label: string
      description: string
      type: 'string'
      required: boolean
      help_url?: string
      placeholder?: string
    }>

    /** Workflow steps — executed in order by WorkflowRunner */
    steps: Array<{
      id: string
      service: string
      action: string
      params?: Record<string, unknown>
      description: string
      condition?: string
      on_error?: 'stop' | 'continue' | 'retry'
    }>
  }
}

// ═══════════════════════════════════════════════════════════
// BLANK TEMPLATE — Copy this to create a new store listing
// ═══════════════════════════════════════════════════════════

export const BLANK_LISTING_TEMPLATE: StoreListingTemplate = {
  title: '',
  slug: '',
  description: '',
  long_description: '',
  category: 'custom',
  tags: [],
  price: 0,
  currency: 'usd',
  services: [],
  step_count: 0,
  status: 'draft',

  workflow_data: {
    $0n: {
      version: '1.0.0',
      type: 'workflow',
      created: new Date().toISOString(),
      name: '',
      description: '',
    },
    trigger: {
      type: 'manual',
      config: {},
    },
    inputs: {},
    launch_codes: {},
    steps: [],
  },
}

// ═══════════════════════════════════════════════════════════
// EXAMPLE: LinkedIn Agentic Onboarding (reference listing)
// ═══════════════════════════════════════════════════════════

export const EXAMPLE_LISTING: StoreListingTemplate = {
  title: 'LinkedIn Agentic Onboarding',
  slug: 'linkedin-agentic-onboarding',
  description: 'AI-powered LinkedIn profile analysis, archetype classification, and automated posting with self-optimizing follow-up questions.',
  long_description: `## LinkedIn Agentic Onboarding & Self-Optimizing Conversion System

This .0n workflow connects to your LinkedIn profile and deploys a complete AI-powered content generation pipeline:

### What's Included

**PACG** — Profile-Adaptive Content Generator
Classifies your LinkedIn profile into a 5-dimensional professional archetype (tier, domain, style, posting behavior, vocabulary level) and generates posts that match your authentic voice.

**LVOS** — Language Variation Optimization System
Uses Thompson Sampling (multi-armed bandit) to select the optimal follow-up questions during onboarding. Self-improves with every interaction through 48-hour observation windows.

**CUCIA** — Cross-User Conversion Intelligence Aggregator
Anonymized segment-level learning that boosts variant selection based on what works for similar professional profiles across all users.

**TAICD** — Third-Party AI Intermediary Conversion Delivery
Execution receipts returned to your AI system as structured proof of every tool call.

### Features
- LinkedIn OAuth connection
- Automated posting (daily, weekly, biweekly)
- 23 banned phrase detection
- Autonomous plateau detection + new variant generation
- AI Manifest at /.well-known/0n-manifest.json
- Cron-driven self-optimization cycle`,

  category: 'sales',
  tags: ['linkedin', 'ai', 'automation', 'content', 'pacg', 'lvos', 'cucia', 'taicd', 'thompson-sampling', 'archetype'],
  price: 0,
  currency: 'usd',
  services: ['anthropic', 'linkedin', 'supabase'],
  step_count: 6,
  status: 'active',

  workflow_data: {
    $0n: {
      version: '1.0.0',
      type: 'workflow',
      created: '2026-02-28T00:00:00.000Z',
      name: 'LinkedIn Agentic Onboarding',
      description: 'AI-powered LinkedIn profile analysis, archetype classification, and automated posting with self-optimizing follow-up questions.',
    },
    trigger: {
      type: 'event',
      config: {
        event: 'linkedin_oauth_callback',
        description: 'Triggers when a user connects their LinkedIn profile via OAuth',
      },
    },
    inputs: {
      topic: {
        type: 'string',
        description: 'Optional topic for post generation',
        required: false,
        placeholder: 'e.g., AI automation, developer tools, leadership',
      },
      follow_up_response: {
        type: 'textarea',
        description: 'User response to the onboarding follow-up question',
        required: false,
      },
    },
    launch_codes: {
      LINKEDIN_CLIENT_ID: {
        label: 'LinkedIn Client ID',
        description: 'OAuth Client ID from your LinkedIn Developer App',
        type: 'string',
        required: true,
        help_url: 'https://developer.linkedin.com/',
        placeholder: '77abc123def456',
      },
      LINKEDIN_CLIENT_SECRET: {
        label: 'LinkedIn Client Secret',
        description: 'OAuth Client Secret from your LinkedIn Developer App',
        type: 'string',
        required: true,
        placeholder: 'AaBbCcDdEeFf...',
      },
      ANTHROPIC_API_KEY: {
        label: 'Anthropic API Key',
        description: 'API key for Claude (used for profile classification and content generation)',
        type: 'string',
        required: true,
        help_url: 'https://console.anthropic.com/',
        placeholder: 'sk-ant-...',
      },
    },
    steps: [
      {
        id: 'classify_profile',
        service: 'anthropic',
        action: 'Classify LinkedIn profile into 5D professional archetype using Claude',
        params: { model: 'claude-sonnet-4-20250514', analysis: ['tier', 'domain', 'style', 'postingBehavior', 'vocabularyLevel'] },
        description: 'PACG: Analyzes headline, industry, and profile data to produce a professional archetype.',
      },
      {
        id: 'save_archetype',
        service: 'supabase',
        action: 'Save classified archetype to linkedin_members table',
        params: { table: 'linkedin_members', operation: 'update', fields: ['archetype', 'onboarding_completed'] },
        description: 'Persists the archetype and marks onboarding as complete.',
      },
      {
        id: 'get_segment_boosts',
        service: 'supabase',
        action: 'Query CUCIA segment model for variant boosts',
        params: { table: 'cucia_segment_model', operation: 'select', key_format: 'domain:tier:postingBehavior' },
        description: 'CUCIA: Fetches anonymized cross-user conversion data to boost variant selection.',
      },
      {
        id: 'select_variant',
        service: 'internal',
        action: 'Thompson Sampling variant selection with CUCIA boosts',
        params: { algorithm: 'thompson_sampling', distribution: 'beta', boost_source: '{{get_segment_boosts.output.boosts}}' },
        description: 'LVOS: Samples Beta(alpha, beta) for each variant, applies segment boosts, selects the highest-scoring question.',
      },
      {
        id: 'record_selection',
        service: 'supabase',
        action: 'Open 48-hour observation window for variant selection',
        params: { table: 'lvos_selections', operation: 'insert', window_hours: 48 },
        description: 'Creates an observation window to track conversion within 48 hours.',
      },
      {
        id: 'build_receipt',
        service: 'internal',
        action: 'Build TAICD execution receipt with tool call log',
        params: { tool_name: 'onboard_with_linkedin', log_to: 'linkedin_tool_calls' },
        description: 'TAICD: Constructs structured execution receipt and logs the tool call.',
      },
    ],
  },
}

/**
 * Convert a StoreListingTemplate to a SQL INSERT statement.
 * Useful for generating migration seed data.
 */
export function listingToSQL(listing: StoreListingTemplate): string {
  const esc = (s: string) => s.replace(/'/g, "''")
  return `INSERT INTO store_listings (
  title, slug, description, long_description, category, tags, price, currency,
  ${listing.cover_image_url ? 'cover_image_url, ' : ''}${listing.stripe_product_id ? 'stripe_product_id, stripe_price_id, ' : ''}services, step_count, status, workflow_data
) VALUES (
  '${esc(listing.title)}',
  '${esc(listing.slug)}',
  '${esc(listing.description)}',
  E'${esc(listing.long_description).replace(/\n/g, '\\n')}',
  '${listing.category}',
  ARRAY[${listing.tags.map(t => `'${esc(t)}'`).join(', ')}],
  ${listing.price},
  '${listing.currency}',
  ${listing.cover_image_url ? `'${esc(listing.cover_image_url)}',\n  ` : ''}${listing.stripe_product_id ? `'${esc(listing.stripe_product_id)}', '${esc(listing.stripe_price_id || '')}',\n  ` : ''}ARRAY[${listing.services.map(s => `'${esc(s)}'`).join(', ')}],
  ${listing.step_count},
  '${listing.status}',
  '${JSON.stringify(listing.workflow_data, null, 2).replace(/'/g, "''")}'::JSONB
) ON CONFLICT (slug) DO NOTHING;`
}

/**
 * Convert a StoreListingTemplate to the API body format
 * for POST /api/admin/store/listings (future admin endpoint)
 */
export function listingToAPIBody(listing: StoreListingTemplate): Record<string, unknown> {
  return {
    title: listing.title,
    slug: listing.slug,
    description: listing.description,
    long_description: listing.long_description,
    category: listing.category,
    tags: listing.tags,
    price: listing.price,
    currency: listing.currency,
    cover_image_url: listing.cover_image_url || null,
    stripe_product_id: listing.stripe_product_id || null,
    stripe_price_id: listing.stripe_price_id || null,
    services: listing.services,
    step_count: listing.step_count,
    status: listing.status,
    workflow_data: listing.workflow_data,
  }
}
