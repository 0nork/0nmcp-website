/**
 * Shared loader for the shadcn.io public registry.
 *
 * One canonical fetch → slim transform → in-process cache. Used by both
 * /api/library/registry/categories and /api/library/registry/[category]
 * routes so the upstream is hit once per revalidate window.
 */

const REGISTRY_URL = 'https://www.shadcn.io/r/registry.json'
const REVALIDATE_SECONDS = 60 * 60 * 6 // 6 hours

export interface RegistryItem {
  name: string
  title: string
  description: string
  type: string
  premium: boolean
  category: string
  deps: string[]
}

export interface CategorySummary {
  slug: string
  label: string
  count: number
  premiumCount: number
  freeCount: number
}

interface FullRegistry {
  items: RegistryItem[]
  categories: CategorySummary[]
  totals: { items: number; premium: number; free: number; categories: number }
}

let cached: { data: FullRegistry; expires: number } | null = null

const TYPE_LABEL: Record<string, string> = {
  'registry:block': 'Block',
  'registry:example': 'Example',
  'registry:ui': 'Primitive',
  'registry:style': 'Style',
  'registry:hook': 'Hook',
}

function titleCase(slug: string): string {
  if (!slug) return ''
  return slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

function categoryFromFiles(files: { path: string }[] | undefined): string {
  if (!files || files.length === 0) return ''
  const path = files[0].path
  // Common pattern: blocks/<category>/<name>.tsx
  const parts = path.split('/')
  if (parts.length >= 3 && parts[0] === 'blocks') return parts[1]
  // Fallback for examples/, ui/, hooks/
  if (parts.length >= 2) return parts[0]
  return ''
}

export async function loadRegistry(): Promise<FullRegistry> {
  const now = Date.now()
  if (cached && cached.expires > now) return cached.data

  const res = await fetch(REGISTRY_URL, {
    headers: { 'User-Agent': '0nMCP-Library/1.0' },
    next: { revalidate: REVALIDATE_SECONDS },
  })
  if (!res.ok) throw new Error(`shadcn registry fetch failed: ${res.status}`)

  const raw = (await res.json()) as {
    items: Array<{
      name: string
      title?: string
      description?: string
      type: string
      premium?: boolean
      registryDependencies?: string[]
      files?: { path: string }[]
    }>
  }

  const items: RegistryItem[] = raw.items.map((i) => ({
    name: i.name,
    title: i.title ?? titleCase(i.name),
    description: i.description ?? '',
    type: i.type,
    premium: i.premium ?? false,
    category: categoryFromFiles(i.files),
    deps: i.registryDependencies ?? [],
  }))

  // Build category summary
  const byCat = new Map<string, { count: number; premium: number; free: number }>()
  for (const it of items) {
    const cat = it.category || 'other'
    const e = byCat.get(cat) ?? { count: 0, premium: 0, free: 0 }
    e.count += 1
    if (it.premium) e.premium += 1
    else e.free += 1
    byCat.set(cat, e)
  }

  const categories: CategorySummary[] = Array.from(byCat.entries())
    .map(([slug, e]) => ({
      slug,
      label: titleCase(slug),
      count: e.count,
      premiumCount: e.premium,
      freeCount: e.free,
    }))
    .sort((a, b) => b.count - a.count)

  const data: FullRegistry = {
    items,
    categories,
    totals: {
      items: items.length,
      premium: items.filter((i) => i.premium).length,
      free: items.filter((i) => !i.premium).length,
      categories: categories.length,
    },
  }

  cached = { data, expires: now + REVALIDATE_SECONDS * 1000 }
  return data
}

export function shadcnPreviewUrl(name: string): string {
  return `https://www.shadcn.io/blocks/${name}`
}

export function typeLabel(type: string): string {
  return TYPE_LABEL[type] ?? type
}
