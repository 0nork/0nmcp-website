import type { RegistryItem } from '../index'

const SOURCE = `'use client'

/**
 * 0n Drop Pick — controlled select dropdown with built-in label and
 * placeholder. Wraps shadcn Select with the boilerplate (Trigger / Value /
 * Content / Items) collapsed into a single options array.
 *
 * Install:
 *   npx shadcn@latest add https://0nmcp.com/r/0n-drop-pick.json
 *
 * Use:
 *   <DropPick
 *     label="Plan"
 *     value={plan}
 *     onChange={setPlan}
 *     options={[
 *       { value: 'supporter', label: 'Supporter' },
 *       { value: 'builder',   label: 'Builder'   },
 *       { value: 'enterprise', label: 'Enterprise' },
 *     ]}
 *   />
 */

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export interface DropPickOption {
  value: string
  label: string
}

export interface DropPickProps {
  options: DropPickOption[]
  value?: string
  defaultValue?: string
  onChange?: (next: string) => void
  label?: string
  placeholder?: string
  id?: string
  className?: string
}

export function DropPick({
  options,
  value,
  defaultValue,
  onChange,
  label,
  placeholder = 'Choose…',
  id,
  className,
}: DropPickProps) {
  const [internal, setInternal] = useState<string>(defaultValue ?? '')
  const current = value !== undefined ? value : internal

  const set = (next: string) => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  return (
    <div className={className}>
      {label ? (
        <Label htmlFor={id} className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </Label>
      ) : null}
      <Select value={current || undefined} onValueChange={set}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
`

export const dropPick: RegistryItem = {
  name: '0n-drop-pick',
  type: 'registry:block',
  title: 'Drop Pick',
  description:
    'Controlled or uncontrolled select dropdown with built-in label, placeholder, and options array. Replaces 6 lines of Select boilerplate with one component.',
  dependencies: [],
  registryDependencies: ['select', 'label'],
  category: 'controls',
  useCases: [
    'Plan / tier picker',
    'Sort-order selector',
    'Country / language picker',
  ],
  files: [
    {
      path: 'components/0n/drop-pick.tsx',
      type: 'registry:block',
      target: 'components/0n/drop-pick.tsx',
      content: SOURCE,
    },
  ],
}
