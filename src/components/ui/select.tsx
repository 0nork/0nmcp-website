'use client'

import { createContext, useContext, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

const SelectContext = createContext<{
  value: string
  onValueChange: (v: string) => void
  open: boolean
  setOpen: (o: boolean) => void
}>({ value: '', onValueChange: () => {}, open: false, setOpen: () => {} })

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Select({ value: controlledValue, onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? '')
  const [open, setOpen] = useState(false)
  const val = controlledValue ?? internalValue
  const handleChange = (v: string) => {
    onValueChange?.(v)
    if (controlledValue === undefined) setInternalValue(v)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value: val, onValueChange: handleChange, open, setOpen }}>
      <div style={{ position: 'relative' }}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = useContext(SelectContext)
  return (
    <button
      className={cn('on-select-trigger', className)}
      onClick={() => ctx.setOpen(!ctx.open)}
      type="button"
      {...props}
    >
      {children}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = useContext(SelectContext)
  return <span>{ctx.value || placeholder || 'Select...'}</span>
}

export function SelectContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = useContext(SelectContext)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ctx.open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ctx.setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ctx.open, ctx])

  if (!ctx.open) return null

  return (
    <div ref={ref} className={cn('on-select-content', className)} {...props}>
      {children}
    </div>
  )
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function SelectItem({ value, className, children, ...props }: SelectItemProps) {
  const ctx = useContext(SelectContext)
  return (
    <div
      className={cn('on-select-item', ctx.value === value && 'on-select-item-active', className)}
      onClick={() => ctx.onValueChange(value)}
      {...props}
    >
      {children}
    </div>
  )
}
