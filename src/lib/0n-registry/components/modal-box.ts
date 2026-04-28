import type { RegistryItem } from '../index'

const SOURCE = `'use client'

/**
 * 0n Modal Box — pre-composed dialog with title + description + body
 * + footer slots. Branded primary button. Close on Esc or overlay click.
 *
 * Install:
 *   npx shadcn@latest add https://0nmcp.com/r/0n-modal-box.json
 *
 * Use:
 *   <ModalBox
 *     trigger={<Button>Open</Button>}
 *     title="Save your work?"
 *     description="Changes will be applied immediately."
 *     primaryAction={{ label: 'Save', onClick: () => save() }}
 *     secondaryAction={{ label: 'Cancel' }}
 *   >
 *     Optional body content goes here.
 *   </ModalBox>
 */

import { useState, type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Action {
  label: string
  onClick?: () => void
  /** Variant of the button; passed straight through to shadcn Button. */
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
}

export interface ModalBoxProps {
  trigger: ReactNode
  title: string
  description?: string
  children?: ReactNode
  primaryAction?: Action
  secondaryAction?: Action
  /** Controlled open state. Omit for uncontrolled. */
  open?: boolean
  onOpenChange?: (next: boolean) => void
}

export function ModalBox({
  trigger,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  open,
  onOpenChange,
}: ModalBoxProps) {
  const [internal, setInternal] = useState(false)
  const isOpen = open ?? internal
  const setOpen = (v: boolean) => {
    if (open === undefined) setInternal(v)
    onOpenChange?.(v)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
        {(primaryAction || secondaryAction) && (
          <DialogFooter>
            {secondaryAction ? (
              <Button
                variant={secondaryAction.variant ?? 'outline'}
                onClick={() => {
                  secondaryAction.onClick?.()
                  setOpen(false)
                }}
              >
                {secondaryAction.label}
              </Button>
            ) : null}
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
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
`

export const modalBox: RegistryItem = {
  name: '0n-modal-box',
  type: 'registry:block',
  title: 'Modal Box',
  description:
    'Pre-composed centered dialog with title, description, body, and footer slots. Drop in a trigger, get a working modal — no Dialog plumbing.',
  dependencies: [],
  registryDependencies: ['button', 'dialog'],
  category: 'overlays',
  useCases: [
    'Confirm/cancel before destructive actions',
    'Compose forms that interrupt the page',
    'Single-step task flows',
  ],
  files: [
    {
      path: 'components/0n/modal-box.tsx',
      type: 'registry:block',
      target: 'components/0n/modal-box.tsx',
      content: SOURCE,
    },
  ],
}
