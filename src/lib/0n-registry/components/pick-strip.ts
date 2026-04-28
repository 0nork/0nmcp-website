import type { RegistryItem } from '../index'

const SOURCE = `'use client'

/**
 * 0n Pick Strip — horizontal multi-select toggle group. Items render as
 * icon buttons; pressing one flips its on/off state independently.
 *
 * Install:
 *   npx shadcn@latest add https://0nmcp.com/r/0n-pick-strip.json
 *
 * Use:
 *   <PickStrip
 *     items={[
 *       { id: 'bold',   icon: BoldIcon,   label: 'Bold' },
 *       { id: 'italic', icon: ItalicIcon, label: 'Italic' },
 *       { id: 'star',   icon: StarIcon,   label: 'Star' },
 *     ]}
 *     value={picks}
 *     onChange={setPicks}
 *   />
 */

import { useState, type ComponentType } from 'react'
import { Button } from '@/components/ui/button'

export interface PickStripItem {
  id: string
  icon?: ComponentType<{ className?: string }>
  label?: string
  /** Custom rendered glyph if icon isn't enough (e.g., a styled letter). */
  glyph?: React.ReactNode
}

export interface PickStripProps {
  items: PickStripItem[]
  value?: string[]
  defaultValue?: string[]
  onChange?: (next: string[]) => void
}

export function PickStrip({ items, value, defaultValue = [], onChange }: PickStripProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue)
  const picks = value ?? internal

  const flip = (id: string) => {
    const next = picks.includes(id) ? picks.filter((p) => p !== id) : [...picks, id]
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-card/60 p-1">
      {items.map((it) => {
        const isOn = picks.includes(it.id)
        const Icon = it.icon
        return (
          <Button
            key={it.id}
            type="button"
            size="icon"
            variant={isOn ? 'default' : 'ghost'}
            aria-pressed={isOn}
            aria-label={it.label}
            onClick={() => flip(it.id)}
          >
            {it.glyph ? it.glyph : Icon ? <Icon className="h-4 w-4" /> : null}
          </Button>
        )
      })}
    </div>
  )
}
`

export const pickStrip: RegistryItem = {
  name: '0n-pick-strip',
  type: 'registry:block',
  title: 'Pick Strip',
  description:
    'Horizontal multi-select toggle group. Editor toolbars, formatting controls, filter chips — anywhere people pick several options.',
  dependencies: ['lucide-react'],
  registryDependencies: ['button'],
  category: 'controls',
  useCases: [
    'Editor formatting toolbar (bold/italic/underline)',
    'Filter chip rows',
    'Multi-select tag pickers',
  ],
  files: [
    {
      path: 'components/0n/pick-strip.tsx',
      type: 'registry:block',
      target: 'components/0n/pick-strip.tsx',
      content: SOURCE,
    },
  ],
}
