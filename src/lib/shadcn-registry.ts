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

// ── 0n re-categorization for items the upstream registry leaves uncategorized
// (registry:ui, registry:hook, registry:style — bare-file paths). We split
// the 233 free "Other" items into 6 friendly buckets based on name and type
// so they surface alongside the curated 39 core blocks in the library.

const EFFECTS = new Set([
  'plasma', 'noise', 'aurora', 'glitch', 'matrix', 'nebula', 'hologram',
  'waves', 'starfield', 'particles', 'fog', 'beams', 'gradient',
  'gradient-mesh', 'mesh-gradient', 'grid-pattern', 'dot-pattern', 'shimmer',
  'marquee', 'ripple', 'animated-beam', 'motion-highlight', 'animated-cursor',
  'magnetic', 'pixel-image', '3d-marquee', 'apple-hello-effect',
])

const AI_SURFACES = new Set([
  'chatbot', 'conversation', 'message', 'prompt-input', 'chain-of-thought',
  'reasoning', 'model-selector', 'voice-selector', 'mic-selector', 'persona',
  'agent', 'plan', 'artifact', 'actions', 'inline-citation', 'sources',
  'suggestion', 'tool', 'task', 'transcription', 'attachments', 'context',
  'environment-variables', 'schema-display', 'audio-player', 'speech-input',
  'stack-trace', 'test-results', 'web-preview', 'edge', 'node', 'queue',
  'branch', 'checkpoint', 'commit', 'panel', 'toolbar', 'snippet',
  'open-in-chat', 'code-block', 'code-editor', 'code-tabs', 'sandbox',
  'terminal', 'confirmation', 'package-info', 'file-tree', 'canvas',
  'controls',
])

const CONTROLS = new Set([
  'icon-button', 'arrow-button', 'copy-button', 'ripple-button',
  'loading-button', 'outline-fill-button', 'shine-button', 'gradient-button',
  'glow-border-button', 'magnetic-button', 'color-picker', 'combobox',
  'choicebox', 'dropzone', 'mac-os-dock', 'menu-dock', 'dock',
  'limelight-nav', 'navbar', 'kbd',
])

function categoryFromItem(item: {
  name: string
  type: string
  files?: { path: string }[]
}): string {
  const { name, type, files } = item
  // Path-based first: blocks/<cat>/<name>.tsx → <cat>
  if (files && files.length > 0) {
    const path = files[0].path
    const parts = path.split('/')
    if (parts.length >= 3 && parts[0] === 'blocks') return parts[1]
    if (parts.length === 2) return parts[0] // charts/, examples/, etc.
  }
  // Type + name fallback for the bare-file primitives (ui/hook/style)
  if (type === 'registry:hook') return 'hooks'
  if (type === 'registry:style') return 'themes'
  if (type === 'registry:ui') {
    if (EFFECTS.has(name)) return 'effects'
    if (AI_SURFACES.has(name)) return 'ai-surfaces'
    if (CONTROLS.has(name)) return 'controls'
    if (name.endsWith('-button')) return 'controls'
    return 'display'
  }
  return 'other'
}

// Friendly labels for our re-bucketed categories. Existing shadcn.io
// category slugs (dashboard, hero, pricing…) keep their auto-titlecased name.
const FRIENDLY_LABELS: Record<string, string> = {
  'ai-surfaces': 'AI Surfaces',
  effects: 'Effects',
  controls: 'Buttons & Controls',
  display: 'Display',
  hooks: 'Hooks',
  themes: 'Themes',
  charts: 'Charts',
  examples: 'Examples',
}

function labelFor(slug: string): string {
  return FRIENDLY_LABELS[slug] ?? titleCase(slug)
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
    category: categoryFromItem(i),
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
      label: labelFor(slug),
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
