/**
 * 0n Console — Store Types
 * Shared TypeScript types for the Premium .0n Store marketplace.
 */

export interface StoreListing {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  tags: string[]
  price: number
  currency: string
  cover_image_url: string | null
  stripe_product_id: string | null
  stripe_price_id: string | null
  workflow_id: string | null
  status: 'active' | 'draft' | 'archived'
  total_purchases: number
  created_at: string
  updated_at: string
}

export interface PurchaseRecord {
  id: string
  buyer_id: string
  listing_id: string
  workflow_id: string | null
  stripe_session_id: string | null
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'refunded'
  created_at: string
}

export interface PurchaseWithWorkflow extends PurchaseRecord {
  listing: StoreListing
  workflow_data: Record<string, unknown> | null
  workflow_name: string | null
}

export type StoreCategory = 'all' | 'marketing' | 'sales' | 'support' | 'data' | 'devops' | 'custom' | 'extensions'

export const STORE_CATEGORIES: { key: StoreCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'extensions', label: 'Chrome Extensions' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'sales', label: 'Sales' },
  { key: 'support', label: 'Support' },
  { key: 'data', label: 'Data' },
  { key: 'devops', label: 'DevOps' },
  { key: 'custom', label: 'Custom' },
]

export interface ProductTier {
  key: string
  label: string
  tagline: string
  priceMonthly: number
  priceYearly: number | null
  features: string[]
  highlight?: boolean
}

export const SOCIAL_ENGINE_TIERS: ProductTier[] = [
  {
    key: 'free',
    label: 'Free',
    tagline: 'Turn It On',
    priceMonthly: 0,
    priceYearly: null,
    features: [
      '10 AI posts/month',
      'Basic engagement scoring',
      'LinkedIn generate button',
      'Community access',
    ],
  },
  {
    key: 'creator',
    label: 'Creator',
    tagline: 'Turn It Up',
    priceMonthly: 19,
    priceYearly: 190,
    features: [
      'Unlimited AI posts',
      'Voice learning engine',
      'Advanced scoring',
      'Schedule & queue',
      'Correction memory',
      'Export drafts',
    ],
  },
  {
    key: 'operator',
    label: 'Operator',
    tagline: 'The Full Stack',
    priceMonthly: 49,
    priceYearly: 490,
    highlight: true,
    features: [
      'Everything in Creator',
      'Multi-channel distribution',
      'CRM integration',
      'Relationship heat map',
      'Meeting prep AI',
      'Analytics dashboard',
    ],
  },
  {
    key: 'agency',
    label: 'Agency',
    tagline: 'Run the Whole Stack',
    priceMonthly: 149,
    priceYearly: 1490,
    features: [
      'Everything in Operator',
      'Up to 10 client accounts',
      'White-label reports',
      'Team management',
      'Priority support',
      'API access',
    ],
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    tagline: 'Custom Scale',
    priceMonthly: 499,
    priceYearly: null,
    features: [
      'Everything in Agency',
      'Unlimited client accounts',
      'Dedicated infrastructure',
      'Custom integrations',
      'SLA guarantee',
      'Onboarding concierge',
    ],
  },
]

export interface SubscriptionStatus {
  tier: string
  status: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  trialEnd?: string
}
