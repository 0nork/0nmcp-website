import type { RegistryItem } from '../index'

const SOURCE = `'use client'

/**
 * 0n Flip Tile — single two-state toggle button. Press to mark on/off.
 * Built on shadcn Button with aria-pressed wired in.
 *
 * Install:
 *   npx shadcn@latest add https://0nmcp.com/r/0n-flip-tile.json
 *
 * Use:
 *   <FlipTile icon={Heart} pressed={liked} onPressedChange={setLiked} />
 */

import { useState, type ComponentType } from 'react'
import { Button } from '@/components/ui/button'

export interface FlipTileProps {
  icon: ComponentType<{ className?: string }>
  /** Controlled pressed state. If omitted, the tile manages its own. */
  pressed?: boolean
  onPressedChange?: (next: boolean) => void
  label?: string
  /** Render the icon as fill on press (heart, star). Default true. */
  fillOnPress?: boolean
}

export function FlipTile({
  icon: Icon,
  pressed,
  onPressedChange,
  label,
  fillOnPress = true,
}: FlipTileProps) {
  const [internal, setInternal] = useState(false)
  const isOn = pressed !== undefined ? pressed : internal

  const handle = () => {
    const next = !isOn
    if (pressed === undefined) setInternal(next)
    onPressedChange?.(next)
  }

  return (
    <Button
      variant={isOn ? 'default' : 'outline'}
      size="icon"
      onClick={handle}
      aria-pressed={isOn}
      aria-label={label}
    >
      <Icon className={isOn && fillOnPress ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
    </Button>
  )
}
`

export const flipTile: RegistryItem = {
  name: '0n-flip-tile',
  type: 'registry:block',
  title: 'Flip Tile',
  description:
    'Two-state toggle button with aria-pressed support. Controlled or uncontrolled. Drop in for like/save/star/mute interactions.',
  dependencies: ['lucide-react'],
  registryDependencies: ['button'],
  category: 'controls',
  useCases: [
    'Heart / favorite buttons',
    'Star / pin interactions',
    'Single binary settings',
  ],
  files: [
    {
      path: 'components/0n/flip-tile.tsx',
      type: 'registry:block',
      target: 'components/0n/flip-tile.tsx',
      content: SOURCE,
    },
  ],
}
