import type { RegistryItem } from '../index'

const SOURCE = `'use client'

/**
 * 0n Side Slider — slide-in panel from any edge of the screen. Sections
 * are pre-styled (header / body / footer). Built on shadcn Sheet.
 *
 * Install:
 *   npx shadcn@latest add https://0nmcp.com/r/0n-side-slider.json
 *
 * Use:
 *   <SideSlider
 *     side="right"
 *     trigger={<Button>Filters</Button>}
 *     title="Filters"
 *     description="Narrow what you're looking at."
 *   >
 *     <YourFiltersUI />
 *   </SideSlider>
 */

import { useState, type ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export interface SideSliderProps {
  trigger: ReactNode
  title: string
  description?: string
  children?: ReactNode
  side?: 'right' | 'left' | 'top' | 'bottom'
  open?: boolean
  onOpenChange?: (next: boolean) => void
}

export function SideSlider({
  trigger,
  title,
  description,
  children,
  side = 'right',
  open,
  onOpenChange,
}: SideSliderProps) {
  const [internal, setInternal] = useState(false)
  const isOpen = open ?? internal
  const setOpen = (v: boolean) => {
    if (open === undefined) setInternal(v)
    onOpenChange?.(v)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
`

export const sideSlider: RegistryItem = {
  name: '0n-side-slider',
  type: 'registry:block',
  title: 'Side Slider',
  description:
    'Edge-anchored slide-in panel with header + body slots. Pre-composed Sheet wrapper for filter drawers, inspectors, and detail panes.',
  dependencies: [],
  registryDependencies: ['sheet'],
  category: 'overlays',
  useCases: [
    'Filter / sort panels on desktop',
    'Detail inspectors next to a list view',
    'Mobile nav drawers (left side)',
  ],
  files: [
    {
      path: 'components/0n/side-slider.tsx',
      type: 'registry:block',
      target: 'components/0n/side-slider.tsx',
      content: SOURCE,
    },
  ],
}
