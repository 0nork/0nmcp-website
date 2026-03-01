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
