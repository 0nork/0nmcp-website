import type { RegistryItem } from '../index'

const SOURCE = `'use client'

/**
 * 0n Bottom Pull — mobile-friendly drawer that slides up from the bottom.
 * Pre-composed with title, body, and primary action slots. Built on
 * shadcn Drawer (vaul under the hood).
 *
 * Install:
 *   npx shadcn@latest add https://0nmcp.com/r/0n-bottom-pull.json
 *
 * Use:
 *   <BottomPull
 *     trigger={<Button>Open</Button>}
 *     title="Quick actions"
 *     description="Best for mobile flows."
 *     primaryAction={{ label: 'Done' }}
 *   >
 *     <p>Body content.</p>
 *   </BottomPull>
 */

import { useState, type ReactNode } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

interface Action {
  label: string
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
}

export interface BottomPullProps {
  trigger: ReactNode
  title: string
  description?: string
  children?: ReactNode
  primaryAction?: Action
  open?: boolean
  onOpenChange?: (next: boolean) => void
}

export function BottomPull({
  trigger,
  title,
  description,
  children,
  primaryAction,
  open,
  onOpenChange,
}: BottomPullProps) {
  const [internal, setInternal] = useState(false)
  const isOpen = open ?? internal
  const setOpen = (v: boolean) => {
    if (open === undefined) setInternal(v)
    onOpenChange?.(v)
  }

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        {children ? <div className="px-4 pb-2">{children}</div> : null}
        <DrawerFooter>
          {primaryAction ? (
            <Button
              variant={primaryAction.variant ?? 'default'}
              onClick={() => {
                primaryAction.onClick?.()
                setOpen(false)
              }}
            >
              {primaryAction.label}
            </Button>
          ) : null}
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
`

export const bottomPull: RegistryItem = {
  name: '0n-bottom-pull',
  type: 'registry:block',
  title: 'Bottom Pull',
  description:
    'Mobile-friendly bottom-anchored drawer with title, body, and footer slots. Pre-composed so you don’t plumb every Drawer subcomponent.',
  dependencies: ['vaul'],
  registryDependencies: ['button', 'drawer'],
  category: 'overlays',
  useCases: [
    'Mobile filter or sort sheets',
    'Quick-action menus that need keyboard space',
    'Multi-step wizards on phones',
  ],
  files: [
    {
      path: 'components/0n/bottom-pull.tsx',
      type: 'registry:block',
      target: 'components/0n/bottom-pull.tsx',
      content: SOURCE,
    },
  ],
}
