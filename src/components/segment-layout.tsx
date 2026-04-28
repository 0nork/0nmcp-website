'use client'

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

/**
 * Segment Layout — dual-sidebar segmented control with a center content
 * pane. Left and right item lists each render as a column of selectable
 * pills; clicking any pill swaps the central content. Inspired by the
 * shadix-ui pattern, ported into the 0n design system with brand-tinted
 * active states and animated content transitions.
 *
 * Composition
 *   <SegmentLayout leftItems={[…]} rightItems={[…]} defaultValue="claude">
 *     <SegmentLayoutContent value="claude">…</SegmentLayoutContent>
 *     …
 *   </SegmentLayout>
 */

export interface SegmentItem {
  label: string
  value: string
  disabled?: boolean
  /** Optional Lucide-style icon component for the pill row. */
  icon?: React.ComponentType<{ className?: string }>
  /** Optional small caption rendered beneath the label. */
  caption?: string
}

interface SegmentClassNames {
  mainWrapper?: string
  contentWrapper?: string
  itemsWrapper?: string
  itemsLabel?: string
}

interface SegmentLayoutProps {
  leftItems: SegmentItem[]
  rightItems: SegmentItem[]
  /** Optional headers shown above each sidebar column. */
  leftLabel?: string
  rightLabel?: string
  defaultValue?: string
  classNames?: SegmentClassNames
  children: ReactNode
}

interface SegmentContextValue {
  active: string
  setActive: (next: string) => void
}

const SegmentContext = createContext<SegmentContextValue | null>(null)

export function SegmentLayout({
  leftItems,
  rightItems,
  leftLabel,
  rightLabel,
  defaultValue,
  classNames,
  children,
}: SegmentLayoutProps) {
  const initial = defaultValue ?? leftItems[0]?.value ?? rightItems[0]?.value ?? ''
  const [active, setActive] = useState<string>(initial)

  return (
    <SegmentContext.Provider value={{ active, setActive }}>
      <div
        className={cn(
          'grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:gap-8',
          classNames?.mainWrapper,
        )}
      >
        {/* ── Left sidebar ───────────────────────────────────────── */}
        <ItemColumn label={leftLabel} items={leftItems} classNames={classNames} side="left" />

        {/* ── Center content ─────────────────────────────────────── */}
        <div
          className={cn(
            'min-w-0 rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur sm:p-8',
            classNames?.contentWrapper,
          )}
        >
          {Children.map(children, (child) => {
            if (!isValidElement(child)) return null
            const el = child as ReactElement<{ value?: string }>
            const value = el.props?.value
            if (typeof value !== 'string') return null
            const isActive = value === active
            return (
              <div
                key={value}
                role="tabpanel"
                hidden={!isActive}
                className={cn(
                  isActive ? 'animate-in fade-in-0 slide-in-from-bottom-1 duration-300' : '',
                )}
              >
                {isActive ? child : null}
              </div>
            )
          })}
        </div>

        {/* ── Right sidebar ──────────────────────────────────────── */}
        <ItemColumn label={rightLabel} items={rightItems} classNames={classNames} side="right" />
      </div>
    </SegmentContext.Provider>
  )
}

interface ItemColumnProps {
  label?: string
  items: SegmentItem[]
  classNames?: SegmentClassNames
  side: 'left' | 'right'
}

function ItemColumn({ label, items, classNames, side }: ItemColumnProps) {
  const ctx = useContext(SegmentContext)
  if (!ctx) return null
  const { active, setActive } = ctx

  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        side === 'right' ? 'lg:order-3' : 'lg:order-1',
        classNames?.itemsWrapper,
      )}
      role="tablist"
      aria-orientation="vertical"
    >
      {label && (
        <p
          className={cn(
            'mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground',
            classNames?.itemsLabel,
          )}
        >
          {label}
        </p>
      )}
      {items.map((item) => {
        const isActive = item.value === active
        const Icon = item.icon
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => !item.disabled && setActive(item.value)}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-all',
              'disabled:cursor-not-allowed disabled:opacity-40',
              isActive
                ? 'border-[#6EE05A]/40 bg-[#6EE05A]/8 text-white shadow-[0_0_24px_rgba(110,224,90,0.15)]'
                : 'border-border/40 bg-card/30 text-white/70 hover:border-[#6EE05A]/25 hover:bg-card/60 hover:text-white',
            )}
          >
            {Icon ? (
              <span
                className={cn(
                  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors',
                  isActive
                    ? 'bg-[#6EE05A]/15 ring-[#6EE05A]/30'
                    : 'bg-card/60 ring-border/40 group-hover:bg-[#6EE05A]/8 group-hover:ring-[#6EE05A]/25',
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-[#6EE05A]' : 'text-white/65')} />
              </span>
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="block truncate">{item.label}</span>
              {item.caption ? (
                <span
                  className={cn(
                    'mt-0.5 block truncate font-mono text-[10px] uppercase tracking-widest',
                    isActive ? 'text-[#6EE05A]/80' : 'text-muted-foreground',
                  )}
                >
                  {item.caption}
                </span>
              ) : null}
            </span>
            <span
              aria-hidden
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full transition-all',
                isActive ? 'bg-[#6EE05A] shadow-[0_0_8px_#6EE05A]' : 'bg-transparent',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

interface SegmentLayoutContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function SegmentLayoutContent({
  value: _value,
  children,
  className,
}: SegmentLayoutContentProps) {
  return <div className={className}>{children}</div>
}
