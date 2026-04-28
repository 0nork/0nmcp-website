'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ExternalLink, Search, Sparkles } from 'lucide-react'
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
  iframeUrl: string
  ogImageUrl: string
  installCommand: string
}

const PAGE_SIZE = 12 // 12 cards per page = 4 cols × 3 rows on lg

export default function RegistryBrowser() {
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [totals, setTotals] = useState<{ items: number; premium: number; free: number; categories: number } | null>(null)
  const [loadingCats, setLoadingCats] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [items, setItems] = useState<RegistryItem[]>([])
  const [totalInCategory, setTotalInCategory] = useState(0)
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

  // Reset page when category changes
  useEffect(() => {
    setPage(0)
  }, [openCategory])

  // Lazy-load page of items when category or page changes
  useEffect(() => {
    if (!openCategory) return
    setLoadingItems(true)
    const offset = page * PAGE_SIZE
    fetch(`/api/library/registry/category/${openCategory}?limit=${PAGE_SIZE}&offset=${offset}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) {
          setError(d.error ?? 'Failed to load items')
          setLoadingItems(false)
          return
        }
        setItems(d.items)
        setTotalInCategory(d.total)
        setLoadingItems(false)
      })
      .catch((e) => {
        setError(String(e))
        setLoadingItems(false)
      })
  }, [openCategory, page])

  const filteredCategories = useMemo(() => {
    if (!filterText) return categories
    const f = filterText.toLowerCase()
    return categories.filter((c) => c.label.toLowerCase().includes(f) || c.slug.includes(f))
  }, [categories, filterText])

  const totalPages = Math.max(1, Math.ceil(totalInCategory / PAGE_SIZE))
  const openCategoryLabel = categories.find((c) => c.slug === openCategory)?.label

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

      {/* ── Open category items (live previews) ── */}
      {openCategory && (
        <Card className="border-[#6EE05A]/30 bg-card/40 backdrop-blur">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">
                  <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                    {openCategoryLabel}
                  </span>
                </CardTitle>
                <CardDescription>
                  Page {page + 1} of {totalPages} · {totalInCategory.toLocaleString()} blocks total
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0 || loadingItems}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1 || loadingItems}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setOpenCategory(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingItems ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="h-[260px] animate-pulse rounded-lg bg-card/60" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((it) => (
                  <BlockPreviewCard key={it.name} item={it} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Single block preview card with lazy-loaded live iframe ──────────

function BlockPreviewCard({ item }: { item: RegistryItem }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)

  useEffect(() => {
    if (!ref.current || inView) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true)
            obs.disconnect()
          }
        }
      },
      { rootMargin: '200px' },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [inView])

  return (
    <div
      ref={ref}
      className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-background/40 transition-colors hover:border-[#6EE05A]/30"
    >
      {/* ── Preview pane (16:10) ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/40 bg-card/40">
        {/* OG image as instant placeholder */}
        {!iframeReady && (
          <Image
            src={item.ogImageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            unoptimized
          />
        )}
        {/* Real iframe lazy-loads when in view */}
        {inView && (
          <iframe
            src={item.iframeUrl}
            title={item.title}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            className={[
              'absolute inset-0 h-full w-full origin-top-left scale-[0.5]',
              'pointer-events-none', // user clicks card, not iframe
              iframeReady ? 'opacity-100' : 'opacity-0',
              'transition-opacity duration-500',
            ].join(' ')}
            style={{ width: '200%', height: '200%' }}
            onLoad={() => setIframeReady(true)}
          />
        )}
        {/* Hover overlay → opens full preview */}
        <a
          href={item.previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/70 via-black/0 to-black/0 p-3 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <span className="inline-flex items-center gap-1 rounded-md bg-[#6EE05A] px-3 py-1.5 text-xs font-bold text-black shadow-lg">
            Open preview <ExternalLink className="h-3 w-3" />
          </span>
        </a>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-bold text-white">{item.title}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            {item.premium && (
              <Badge className="bg-[#a78bfa]/15 font-mono text-[9px] text-[#a78bfa] hover:bg-[#a78bfa]/20">
                <Sparkles className="mr-0.5 h-2.5 w-2.5" /> Pro
              </Badge>
            )}
            <Badge variant="outline" className="font-mono text-[9px]">
              {item.typeLabel}
            </Badge>
          </div>
        </div>
        {item.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-white/65">{item.description}</p>
        )}
        <code className="mt-auto truncate rounded bg-muted/40 px-2 py-1 font-mono text-[10px] text-muted-foreground">
          {item.name}
        </code>
      </div>
    </div>
  )
}
