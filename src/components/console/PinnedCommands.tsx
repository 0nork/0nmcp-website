'use client'

/**
 * PinnedCommands.tsx
 *
 * Persistent header bar where users pin their most-used commands for
 * one-click execution. Pins stored in localStorage. Max 8 pins.
 * Includes a searchable add-pin popover grouped by category.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Check, ChevronDown, Pin, Plus, Search, X } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ComponentType } from 'react'
import { ALL_COMMANDS, CATEGORY_COLORS, type CommandEntry } from '@/lib/console/recommendations'
import { IconMap } from './icon-map'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = '0n_pinned_commands'
const MAX_PINS = 8
const DEFAULT_PIN_IDS = ['workflow_create', 'vault_create', 'store_browse']

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PinnedCommandsProps {
  onExecuteCommand: (command: string) => void
  onNavigate: (view: string) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadPins(): string[] {
  if (typeof window === 'undefined') return DEFAULT_PIN_IDS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PIN_IDS
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
      return parsed
    }
  } catch {
    // malformed — reset
  }
  return DEFAULT_PIN_IDS
}

function savePins(ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

function resolveCommand(id: string): CommandEntry | undefined {
  return ALL_COMMANDS.find((c) => c.id === id)
}

const CATEGORY_ORDER: CommandEntry['category'][] = [
  'workflow', 'vault', 'deed', 'engine', 'store', 'builder', 'social', 'crm', 'convert', 'general',
]

function groupByCategory(commands: CommandEntry[]): Map<CommandEntry['category'], CommandEntry[]> {
  const map = new Map<CommandEntry['category'], CommandEntry[]>()
  for (const cat of CATEGORY_ORDER) {
    const items = commands.filter((c) => c.category === cat)
    if (items.length > 0) map.set(cat, items)
  }
  return map
}

// ---------------------------------------------------------------------------
// Single pinned pill button
// ---------------------------------------------------------------------------

interface PinButtonProps {
  entry: CommandEntry
  onExecute: (entry: CommandEntry) => void
  onUnpin: (id: string) => void
  isNew?: boolean
}

function PinButton({ entry, onExecute, onUnpin, isNew }: PinButtonProps) {
  const [hovered, setHovered] = useState(false)
  const [showX, setShowX] = useState(false)
  const [mounted, setMounted] = useState(false)

  const color = CATEGORY_COLORS[entry.category] ?? '#8888a0'
  const IconComponent = IconMap[entry.icon] ?? IconMap['Terminal']

  // Slide-in animation on mount
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(0.85)',
        transition: isNew
          ? 'opacity 200ms ease, transform 200ms ease'
          : 'opacity 150ms ease, transform 150ms ease',
      }}
      onMouseEnter={() => { setHovered(true); setShowX(true) }}
      onMouseLeave={() => { setHovered(false); setShowX(false) }}
    >
      <button
        onClick={() => onExecute(entry)}
        title={entry.description}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 10px',
          height: '28px',
          borderRadius: '20px',
          border: `1px solid ${hovered ? color + '66' : 'var(--border)'}`,
          background: hovered ? color + '18' : 'var(--bg-card)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
          boxShadow: hovered ? `0 0 8px ${color}22` : 'none',
          paddingRight: showX ? '24px' : '10px',
        }}
      >
        {/* Category dot */}
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
            opacity: hovered ? 1 : 0.7,
          }}
        />

        <IconComponent
          size={12}
          style={{ color: hovered ? color : 'var(--text-secondary)', flexShrink: 0 }}
        />

        <span
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
            transition: 'color 150ms ease',
          }}
        >
          {entry.label}
        </span>
      </button>

      {/* Unpin X button — appears on hover */}
      {showX && (
        <button
          onClick={(e) => { e.stopPropagation(); onUnpin(entry.id) }}
          title="Unpin"
          style={{
            position: 'absolute',
            right: '4px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--bg-tertiary)',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <X size={9} style={{ color: 'var(--text-muted)' }} />
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add-pin popover
// ---------------------------------------------------------------------------

interface AddPinPopoverProps {
  pinnedIds: string[]
  onPin: (id: string) => void
  onUnpin: (id: string) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
}

function AddPinPopover({ pinnedIds, onPin, onUnpin, onClose, anchorRef }: AddPinPopoverProps) {
  const [query, setQuery] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus search
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose, anchorRef])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_COMMANDS
    const q = query.toLowerCase()
    return ALL_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.command.toLowerCase().includes(q)
    )
  }, [query])

  const grouped = useMemo(() => groupByCategory(filtered), [filtered])

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        zIndex: 100,
        width: '320px',
        maxHeight: '420px',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-hover)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        animation: 'popoverIn 150ms ease',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes popoverIn {
          from { opacity: 0; transform: scale(0.96) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Search header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search commands..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: 'var(--text-primary)',
            caretColor: 'var(--accent)',
          }}
        />
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
          }}
        >
          <X size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Scrollable command list */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {grouped.size === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No commands found
          </div>
        )}
        {Array.from(grouped.entries()).map(([category, commands]) => (
          <div key={category}>
            {/* Category header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px 4px',
                position: 'sticky',
                top: 0,
                background: 'var(--bg-card)',
                zIndex: 1,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: CATEGORY_COLORS[category],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: CATEGORY_COLORS[category],
                }}
              >
                {category}
              </span>
            </div>

            {/* Commands in this category */}
            {commands.map((cmd) => {
              const isPinned = pinnedIds.includes(cmd.id)
              const canPin = !isPinned && pinnedIds.length < MAX_PINS
              const IconComponent = IconMap[cmd.icon] ?? IconMap['Terminal']
              const color = CATEGORY_COLORS[cmd.category] ?? '#8888a0'

              return (
                <PopoverCommandRow
                  key={cmd.id}
                  cmd={cmd}
                  isPinned={isPinned}
                  canPin={canPin}
                  color={color}
                  IconComponent={IconComponent}
                  onPin={onPin}
                  onUnpin={onUnpin}
                />
              )
            })}
          </div>
        ))}

        {/* Footer: pin count */}
        <div
          style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {pinnedIds.length} / {MAX_PINS} pinned
          </span>
          <Pin size={11} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Individual row inside the popover
// ---------------------------------------------------------------------------

interface PopoverCommandRowProps {
  cmd: CommandEntry
  isPinned: boolean
  canPin: boolean
  color: string
  IconComponent: ComponentType<LucideProps>
  onPin: (id: string) => void
  onUnpin: (id: string) => void
}

function PopoverCommandRow({
  cmd, isPinned, canPin, color, IconComponent, onPin, onUnpin,
}: PopoverCommandRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={() => isPinned ? onUnpin(cmd.id) : onPin(cmd.id)}
      disabled={!isPinned && !canPin}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '8px 12px',
        background: hovered && (isPinned || canPin) ? 'var(--bg-tertiary)' : 'transparent',
        border: 'none',
        cursor: isPinned || canPin ? 'pointer' : 'not-allowed',
        textAlign: 'left',
        opacity: !isPinned && !canPin ? 0.4 : 1,
        transition: 'background 120ms ease',
      }}
    >
      <IconComponent size={14} style={{ color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: '1.3' }}>
          {cmd.label}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {cmd.description}
        </div>
      </div>

      {/* Pin state indicator */}
      <div style={{ flexShrink: 0 }}>
        {isPinned ? (
          <Check size={13} style={{ color: 'var(--accent)' }} />
        ) : canPin ? (
          <Plus size={13} style={{ color: hovered ? color : 'var(--text-muted)' }} />
        ) : null}
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PinnedCommands({ onExecuteCommand, onNavigate }: PinnedCommandsProps) {
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [newlyPinnedId, setNewlyPinnedId] = useState<string | null>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    setPinnedIds(loadPins())
  }, [])

  const pinnedEntries = useMemo(
    () => pinnedIds.map(resolveCommand).filter(Boolean) as CommandEntry[],
    [pinnedIds]
  )

  const handleExecute = useCallback(
    (entry: CommandEntry) => {
      if (entry.action === 'navigate' && entry.actionPayload) {
        onNavigate(entry.actionPayload)
      } else {
        onExecuteCommand(entry.command)
      }
    },
    [onExecuteCommand, onNavigate]
  )

  const handlePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX_PINS) return prev
      const next = [...prev, id]
      savePins(next)
      setNewlyPinnedId(id)
      setTimeout(() => setNewlyPinnedId(null), 500)
      return next
    })
  }, [])

  const handleUnpin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = prev.filter((x) => x !== id)
      savePins(next)
      return next
    })
  }, [])

  const togglePopover = useCallback(() => {
    setIsPopoverOpen((prev) => !prev)
  }, [])

  return (
    <div
      style={{
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        paddingLeft: '12px',
        paddingRight: '8px',
        gap: '6px',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Pin icon label */}
      <Pin
        size={12}
        style={{ color: 'var(--text-muted)', flexShrink: 0, opacity: 0.6 }}
      />

      {/* Scrollable pinned buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flex: 1,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          paddingRight: '4px',
        }}
      >
        <style>{`
          .pinned-scroll::-webkit-scrollbar { display: none; }
        `}</style>

        {pinnedEntries.length === 0 && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No pinned commands — click + to add
          </span>
        )}

        {pinnedEntries.map((entry) => (
          <PinButton
            key={entry.id}
            entry={entry}
            onExecute={handleExecute}
            onUnpin={handleUnpin}
            isNew={entry.id === newlyPinnedId}
          />
        ))}
      </div>

      {/* Divider */}
      {pinnedEntries.length > 0 && (
        <div
          style={{
            width: '1px',
            height: '20px',
            background: 'var(--border)',
            flexShrink: 0,
          }}
        />
      )}

      {/* Add pin button */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          ref={addButtonRef}
          onClick={togglePopover}
          title="Add pinned command"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '0 8px',
            height: '28px',
            borderRadius: '20px',
            border: `1px solid ${isPopoverOpen ? 'var(--border-hover)' : 'var(--border)'}`,
            background: isPopoverOpen ? 'var(--bg-tertiary)' : 'var(--bg-card)',
            cursor: 'pointer',
            transition: 'background 150ms ease, border-color 150ms ease',
          }}
        >
          <Plus size={12} style={{ color: 'var(--text-secondary)' }} />
          <ChevronDown
            size={11}
            style={{
              color: 'var(--text-muted)',
              transform: isPopoverOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms ease',
            }}
          />
        </button>

        {/* Popover */}
        {isPopoverOpen && (
          <AddPinPopover
            pinnedIds={pinnedIds}
            onPin={handlePin}
            onUnpin={handleUnpin}
            onClose={() => setIsPopoverOpen(false)}
            anchorRef={addButtonRef}
          />
        )}
      </div>
    </div>
  )
}

export default PinnedCommands
