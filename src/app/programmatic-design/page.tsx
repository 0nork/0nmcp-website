import type { Metadata } from 'next'
import Link from 'next/link'
import { Copy, ExternalLink, Sparkles, Terminal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toPublicSummary } from '@/lib/0n-registry'
import CopyButton from './CopyButton'

export const metadata: Metadata = {
  title: '0n Programmatic Website Design Components',
  description:
    'Pre-composed, shadcn-installable components from the 0n design system. One install command, your AI editor drops the source straight into the project.',
  alternates: { canonical: 'https://www.0nmcp.com/programmatic-design' },
  openGraph: {
    title: '0n Programmatic Website Design Components',
    description: 'Branded components installable via shadcn CLI from 0nmcp.com.',
    url: 'https://www.0nmcp.com/programmatic-design',
    type: 'website',
  },
}

export default function ProgrammaticDesignPage() {
  const summary = toPublicSummary()
  const byCategory = summary.items.reduce<Record<string, typeof summary.items>>((acc, it) => {
    ;(acc[it.category] ??= []).push(it)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8 lg:pt-36 lg:pb-20">
          <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-widest">
            <Sparkles className="mr-1.5 h-3 w-3 text-[#6EE05A]" />
            New · 0n Registry
          </Badge>
          <h1 className="text-balance text-5xl font-black tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
              Programmatic Website Design Components.
            </span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75">
            Branded, composable, pre-wired. Each one ships as a single shadcn-CLI install — one
            command, full TypeScript source dropped straight into your project. Use them as-is or
            tear them apart and remix.
          </p>

          {/* Install pattern */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-[#6EE05A]/25 bg-[#6EE05A]/5 px-4 py-3">
            <Terminal className="h-4 w-4 text-[#6EE05A]" />
            <code className="font-mono text-sm text-[#6EE05A]">
              npx shadcn@latest add https://0nmcp.com/r/&lt;name&gt;.json
            </code>
            <CopyButton text="npx shadcn@latest add https://0nmcp.com/r/0n-spotlight.json" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-xl">
            {[
              { v: summary.totals.items.toString(), l: 'Components' },
              { v: summary.totals.categories.toString(), l: 'Categories' },
              { v: 'BSL-1.1', l: 'Free to Self-Host' },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-border/60 bg-card/60 px-4 py-3 text-center">
                <div className="font-mono text-2xl font-black text-[#6EE05A] tabular-nums">{s.v}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Components by category ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat} className="mb-16 last:mb-0">
            <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
              <h2 className="text-2xl font-black tracking-tight">
                <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
                  {capitalize(cat)}
                </span>
              </h2>
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {items.length} {items.length === 1 ? 'component' : 'components'}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <Card key={it.name} className="border-border/60 bg-card/40 backdrop-blur transition-colors hover:border-[#6EE05A]/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">{it.title}</CardTitle>
                    <CardDescription className="text-white/65">{it.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-border/60 bg-background/60 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Install
                        </span>
                        <CopyButton text={it.install_command} small />
                      </div>
                      <code className="block break-all font-mono text-[11px] text-[#6EE05A]">
                        {it.install_command}
                      </code>
                    </div>

                    {it.useCases.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {it.useCases.map((u) => (
                          <li key={u} className="flex items-start gap-2 text-xs text-white/70">
                            <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-[#6EE05A]" />
                            {u}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Separator className="my-4 bg-border/40" />

                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/library#${it.name}`}>See live preview</Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <a href={it.registry_url} target="_blank" rel="noopener" aria-label="Open registry JSON">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>

                    {it.registryDependencies.length > 0 && (
                      <p className="mt-3 font-mono text-[10px] text-muted-foreground">
                        depends on: {it.registryDependencies.join(', ')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Bottom CTA ── */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-black tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
              Want them inside your AI editor?
            </span>
          </h2>
          <p className="mt-4 text-base text-white/70">
            0nMCP exposes this entire registry as MCP tools. Connect 0nMCP to Claude, Cursor, or
            Windsurf — then ask for "a confirm modal" and your editor drops the source in.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-7 text-base font-bold">
              <a href="https://0ncore.com" target="_blank" rel="noopener">
                Try 0nCore Free
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7">
              <Link href="/library">Browse the live library</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
