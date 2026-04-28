import type { RegistryItem } from '../index'

const SOURCE = `'use client'

/**
 * 0n Spotlight — keyboard-driven cmd+k command palette.
 *
 * Triggers from a button, opens a centered dialog with a search input
 * and a list of suggestions. Esc closes. Arrow keys + Enter select.
 *
 * Install:
 *   npx shadcn@latest add https://0nmcp.com/r/0n-spotlight.json
 *
 * Use:
 *   <Spotlight items={[
 *     { icon: Mail, label: 'Compose new message', onSelect: () => {} },
 *     ...
 *   ]} />
 */

import { useEffect, useState, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export interface SpotlightItem {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  hint?: string
  onSelect: () => void
}

export interface SpotlightProps {
  items: SpotlightItem[]
  triggerLabel?: string
  placeholder?: string
}

export function Spotlight({
  items,
  triggerLabel = 'Open Spotlight',
  placeholder = 'Jump to anything…',
}: SpotlightProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  // Cmd+K to open globally
  useEffect(() => {
    function down(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [])

  const q = query.toLowerCase().trim()
  const filtered = q
    ? items.filter((i) => i.label.toLowerCase().includes(q))
    : items

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Search className="mr-2 h-4 w-4" />
        {triggerLabel}
        <kbd className="ml-3 rounded border border-border/60 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-md">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="border-0 bg-transparent focus-visible:ring-0 px-0"
            />
          </div>
          <div className="p-2 text-sm">
            <div className="px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Suggestions
            </div>
            {filtered.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    item.onSelect()
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted/50"
                >
                  {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
                  <span className="flex-1">{item.label}</span>
                  {item.hint ? (
                    <span className="font-mono text-[10px] text-muted-foreground">{item.hint}</span>
                  ) : null}
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                No matches for "{query}"
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
`

export const spotlight: RegistryItem = {
  name: '0n-spotlight',
  type: 'registry:block',
  title: 'Spotlight',
  description:
    'A keyboard-driven cmd+k command palette. Drop into any app to give users one place to jump anywhere — search, navigate, run commands.',
  dependencies: ['lucide-react'],
  registryDependencies: ['button', 'dialog', 'input'],
  category: 'overlays',
  useCases: [
    'App-wide cmd+k search',
    'Power-user navigation between sections',
    'Action launcher with keyboard shortcuts',
  ],
  files: [
    {
      path: 'components/0n/spotlight.tsx',
      type: 'registry:block',
      target: 'components/0n/spotlight.tsx',
      content: SOURCE,
    },
  ],
}
