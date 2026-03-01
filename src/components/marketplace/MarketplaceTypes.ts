export interface MarketplaceListing {
  id: string
  title: string
  slug: string
  description: string | null
  long_description: string | null
  category: string
  tags: string[]
  price: number
  currency: string
  cover_image_url: string | null
  services: string[]
  step_count: number
  status: string
  total_purchases: number
  workflow_data?: Record<string, unknown> | null
  created_at: string
}

export type MarketplaceCategory = 'all' | 'automation' | 'integration' | 'analytics' | 'communication' | 'marketing' | 'sales' | 'support' | 'data' | 'devops' | 'extensions' | 'custom'

export const MARKETPLACE_CATEGORIES = [
  { key: 'all', label: 'All', color: '#7ed957' },
  { key: 'marketing', label: 'Marketing', color: '#ff6b35' },
  { key: 'sales', label: 'Sales', color: '#00d4ff' },
  { key: 'support', label: 'Support', color: '#a855f7' },
  { key: 'data', label: 'Data', color: '#22d3ee' },
  { key: 'devops', label: 'DevOps', color: '#f59e0b' },
  { key: 'extensions', label: 'Extensions', color: '#4285f4' },
  { key: 'custom', label: 'Custom', color: '#ec4899' },
] as const

export type SortOption = 'popular' | 'newest' | 'price_asc' | 'price_desc'

export const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'popular', label: 'Most Popular' },
  { key: 'newest', label: 'Newest' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
]

export function getCategoryColor(category: string): string {
  const found = MARKETPLACE_CATEGORIES.find((c) => c.key === category)
  return found?.color || '#ff6b35'
}
