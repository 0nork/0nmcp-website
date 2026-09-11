/**
 * READ CRO9's APPROVED META OVERRIDES FOR THIS PAGE.
 *
 * CRO9's `nextjs` publish adapter stores an approved title/description against
 * a path. Storing it changes nothing on its own -- THIS is what turns a stored
 * override into something a visitor or a crawler sees. It sits on the render
 * path, so it fails to NOTHING: any error, timeout (2.5 s) or non-200 returns
 * {} and the page keeps its hand-written metadata. Cached 60 s (ISR), matching
 * the endpoint's own s-maxage. Absent fields are omitted, never null.
 *
 * Generated 2026-09-11 by the CRO9 wiring pass; the same file lives in every
 * RocketOpp Next.js site (source of the pattern: 0ntask/lib/cro9-meta.ts).
 */
import type { Metadata } from 'next'

const CRO9_BASE = 'https://www.cro9.com'
// Public tracking key(s) for this site, same class as a GA measurement id.
const CRO9_KEYS = ['cro9_917d980d731b08b465dab5ed18df18d542727963bfa00d17']

export type Cro9Meta = { title?: string; description?: string }

export async function cro9Meta(path: string): Promise<Cro9Meta> {
  for (const key of CRO9_KEYS) {
    try {
      const res = await fetch(`${CRO9_BASE}/api/cro9/meta?key=${encodeURIComponent(key)}&path=${encodeURIComponent(path)}`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2500),
      })
      if (!res.ok) continue
      // The endpoint answers { meta: { title?, description? }, note? } and ALWAYS 200,
      // an unknown key or no override being an empty `meta`. Measured 2026-09-11.
      const body = (await res.json()) as { meta?: { title?: unknown; description?: unknown } }
      const meta = body?.meta
      if (!meta || typeof meta !== 'object') continue
      const out: Cro9Meta = {}
      if (typeof meta.title === 'string' && meta.title.trim()) out.title = meta.title.trim()
      if (typeof meta.description === 'string' && meta.description.trim()) out.description = meta.description.trim()
      if (out.title || out.description) return out
    } catch {
      /* a broken CRO9 must never blank a title or take the page down */
    }
  }
  return {}
}

/** Base metadata, with CRO9's opinion (if any) laid over title and description. */
export async function withCro9Meta(path: string, base: Metadata): Promise<Metadata> {
  // `<meta name="cro9-meta" content="installed">` on every page, override or not:
  // CRO9's publish verifier reads it to tell "helper installed, page stale" from
  // "helper missing", which are different repairs.
  const other = (base.other ?? {}) as Record<string, string | number | (string | number)[]>
  const marked: Metadata = { ...base, other: { ...other, 'cro9-meta': 'installed' } }
  const o = await cro9Meta(path)
  if (!o.title && !o.description) return marked
  const out: Metadata = { ...marked }
  if (o.title) {
    const t = base.title
    // DefaultTemplateString needs a string template; a null template means "no template", so the plain string wins
    out.title = t && typeof t === 'object' && 'template' in t && typeof t.template === 'string' ? { default: o.title, template: t.template } : o.title
    if (base.openGraph) out.openGraph = { ...base.openGraph, title: o.title }
    if (base.twitter) out.twitter = { ...base.twitter, title: o.title }
  }
  if (o.description) {
    out.description = o.description
    if (base.openGraph) out.openGraph = { ...(out.openGraph || base.openGraph), description: o.description }
    if (base.twitter) out.twitter = { ...(out.twitter || base.twitter), description: o.description }
  }
  return out
}
