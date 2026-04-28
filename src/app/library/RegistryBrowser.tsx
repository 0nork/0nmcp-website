'use client'

import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface CategoryRow {
  slug: string
  label: string
  count: number
  premiumCount: number
  freeCount: number
}

interface RegistryItem {
  name: string
  title: string
  description: string
  premium: boolean
  typeLabel: string
  previewUrl: string
  installCommand: string
}

const PAGE_SIZE = 60

export default function RegistryBrowser() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [totals, setTotals] = useState<{ items: number; premium: number; free: number; categories: number } | null>(null)
  const [loadingCats, setLoadingCats] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [items, setItems] = useState<Record<string, RegistryItem[]>>({})
  const [loadingItems, setLoadingItems] = useState(false)
  const [filterText, setFilterText] = useState('')

  // Initial load — categories
  useEffect(() => {
    let cancelled = false
    fetch('/api/library/registry/categories')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (!d.ok) {
          setError(d.error ?? 'Failed to load categories')
          setLoadingCats(false)
          return
        }
        setCategories(d.categories)
        setTotals(d.totals)
        setLoadingCats(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(String(e))
        setLoadingCats(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Lazy-load items when a category is opened
  useEffect(() => {
    if (!openCategory) return
    if (items[openCategory]) return
    setLoadingItems(true)
    fetch(`/api/library/registry/category/${openCategory}?limit=${PAGE_SIZE}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) {
          setError(d.error ?? 'Failed to load items')
          setLoadingItems(false)
          return
        }
        setItems((prev) => ({ ...prev, [openCategory]: d.items }))
        setLoadingItems(false)
      })
      .catch((e) => {
        setError(String(e))
        setLoadingItems(false)
      })
  }, [openCategory, items])

  const filteredCategories = useMemo(() => {
    if (!filterText) return categories
    const f = filterText.toLowerCase()
    return categories.filter((c) => c.label.toLowerCase().includes(f) || c.slug.includes(f))
  }, [categories, filterText])

  if (loadingCats) {
    return (
      <div className="rounded-xl border border-border/40 bg-card/40 p-8 text-center text-sm text-muted-foreground">
        Loading the full library…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-300">
        Couldn&rsquo;t reach the registry: {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── Totals strip ── */}
      {totals && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { v: totals.items.toLocaleString(), l: 'Total Blocks' },
            { v: totals.categories.toString(), l: 'Categories' },
            { v: totals.free.toLocaleString(), l: 'Free' },
            { v: totals.premium.toLocaleString(), l: 'Premium' },
          ].map((s) => (
            <Card key={s.l} className="border-border/60 bg-card/60 text-center backdrop-blur">
              <CardContent className="py-5">
                <div className="font-mono text-2xl font-black text-[#6EE05A] tabular-nums">{s.v}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Search bar ── */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter categories — try 'dashboard', 'pricing', 'hero', 'login'…"
          className="h-12 pl-10"
        />
      </div>

      {/* ── Category grid ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filteredCategories.map((c) => {
          const isOpen = openCategory === c.slug
          return (
            <button
              key={c.slug}
              onClick={() => setOpenCategory(isOpen ? null : c.slug)}
              className={[
                'group rounded-xl border p-4 text-left transition-colors',
                isOpen
                  ? 'border-[#6EE05A]/40 bg-[#6EE05A]/5'
                  : 'border-border/60 bg-card/40 hover:border-[#6EE05A]/30 hover:bg-card/70',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-white">{c.label}</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {c.count.toLocaleString()}
                </Badge>
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {c.freeCount} free · {c.premiumCount} premium
              </p>
            </button>
          )
        })}
      </div>

      {/* ── Open category items ── */}
      {openCategory && (
        <Card className="border-[#6EE05A]/30 bg-card/60 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">
                  <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                    {categories.find((c) => c.slug === openCategory)?.label}
                  </span>
                </CardTitle>
                <CardDescription>
                  Showing the first {PAGE_SIZE} of{' '}
                  {categories.find((c) => c.slug === openCategory)?.count.toLocaleString()} blocks in this category.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpenCategory(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingItems ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading blocks…</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {(items[openCategory] ?? []).map((it) => (
                  <a
                    key={it.name}
                    href={it.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col rounded-lg border border-border/60 bg-background/40 p-4 transition-colors hover:border-[#6EE05A]/30 hover:bg-background/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-white">{it.title}</p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {it.premium && (
                          <Badge className="bg-[#a78bfa]/15 font-mono text-[9px] text-[#a78bfa] hover:bg-[#a78bfa]/20">
                            <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                            Pro
                          </Badge>
                        )}
                        <Badge variant="outline" className="font-mono text-[9px]">
                          {it.typeLabel}
                        </Badge>
                      </div>
                    </div>
                    {it.description && (
                      <p className="mt-2 line-clamp-2 text-xs text-white/65">{it.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <code className="rounded bg-muted/40 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                        {it.name}
                      </code>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
