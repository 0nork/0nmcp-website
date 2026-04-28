import type { RegistryItem } from '../index'

const SOURCE = `'use client'

/**
 * 0n Pop Bubble — anchored floating panel built on shadcn Popover.
 * Pass any rich content; foundation for date pickers, color pickers,
 * info tooltips, mini-forms, and inline detail views.
 *
 * Install:
 *   npx shadcn@latest add https://0nmcp.com/r/0n-pop-bubble.json
 *
 * Use:
 *   <PopBubble trigger={<Button>Pick a day</Button>}>
 *     <Calendar mode="single" />
 *   </PopBubble>
 */

import { useState, type ReactNode } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface PopBubbleProps {
  trigger: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  /** When true, content has no padding so a Calendar/ColorPicker can be edge-to-edge. */
  raw?: boolean
  open?: boolean
  onOpenChange?: (next: boolean) => void
}

export function PopBubble({
  trigger,
  children,
  side = 'bottom',
  align = 'center',
  raw,
  open,
  onOpenChange,
}: PopBubbleProps) {
  const [internal, setInternal] = useState(false)
  const isOpen = open ?? internal
  const setOpen = (v: boolean) => {
    if (open === undefined) setInternal(v)
    onOpenChange?.(v)
  }

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent side={side} align={align} className={raw ? 'p-0' : undefined}>
        {children}
      </PopoverContent>
    </Popover>
  )
}
`

export const popBubble: RegistryItem = {
  name: '0n-pop-bubble',
  type: 'registry:block',
  title: 'Pop Bubble',
  description:
    'Anchored floating panel for inline detail. Pre-composed Popover wrapper with positioning + raw-mode flag for edge-to-edge content like calendars.',
  dependencies: [],
  registryDependencies: ['popover'],
  category: 'overlays',
  useCases: [
    'Date / time pickers anchored to an input',
    'Color picker popovers',
    'Inline link or user-mention previews',
  ],
  files: [
    {
      path: 'components/0n/pop-bubble.tsx',
      type: 'registry:block',
      target: 'components/0n/pop-bubble.tsx',
      content: SOURCE,
    },
  ],
}
