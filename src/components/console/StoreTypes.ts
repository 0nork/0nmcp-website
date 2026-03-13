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
  vendor_id: string | null
  vendor_name: string | null
  vendor_tier: string | null
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

// ── Asset Types ──

export type AssetType = 'workflow' | 'landing_page' | 'email' | 'form' | 'product_page'

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  workflow: 'Workflow',
  landing_page: 'Landing Page',
  email: 'Email Template',
  form: 'Form',
  product_page: 'Product Page',
}

export const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  workflow: '#7ed957',
  landing_page: '#6366f1',
  email: '#06b6d4',
  form: '#f59e0b',
  product_page: '#ec4899',
}

// ── Builder Asset ──

export interface BuilderAsset {
  id: string
  user_id: string
  asset_type: AssetType
  title: string
  prompt: string
  config: Record<string, unknown>
  html: string
  metadata: Record<string, unknown>
  status: 'draft' | 'published' | 'archived'
  version: number
  listing_id: string | null
  created_at: string
  updated_at: string
}

// ── Vendor Profile ──

export interface VendorProfile {
  id: string
  user_id: string
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  business_name: string | null
  business_type: string
  country: string
  application_fee_percent: number
  vendor_tier: string
  is_approved: boolean
  is_active: boolean
  total_revenue_cents: number
  total_payouts_cents: number
  total_sales: number
  vendor_slug: string | null
  vendor_bio: string | null
  vendor_avatar_url: string | null
  applied_at: string
  approved_at: string | null
}

// ── Vendor Dashboard Stats ──

export interface VendorDashboard {
  profile: VendorProfile
  listingCount: number
  recentTransactions: VendorTransaction[]
  payouts: VendorPayout[]
  monthlyRevenue: { month: string; revenue: number }[]
}

export interface VendorTransaction {
  id: string
  listing_name: string
  amount_cents: number
  platform_fee_cents: number
  vendor_payout_cents: number
  status: string
  created_at: string
  buyer_name?: string
}

export interface VendorPayout {
  id: string
  amount_cents: number
  currency: string
  status: string
  arrival_date: string | null
  created_at: string
}

// ── Store Review ──

export interface StoreReview {
  id: string
  buyer_id: string
  listing_id: string
  rating: number
  review_text: string | null
  is_verified_purchase: boolean
  created_at: string
  buyer_name?: string
  buyer_avatar?: string
}
