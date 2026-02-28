'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Search,
  HelpCircle,
  Activity,
  Shield,
  Workflow,
  Clock,
  MessageSquare,
  Users,
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onSelect: (cmd: string) => void
}

const COMMANDS = [
  { cmd: '/chat', desc: 'Open chat', icon: MessageSquare, group: 'Navigate' },
  { cmd: '/community', desc: 'The 0nBoard', icon: Users, group: 'Navigate' },
  { cmd: '/vault', desc: 'Manage credentials', icon: Shield, group: 'Navigate' },
  { cmd: '/flows', desc: 'View workflows', icon: Workflow, group: 'Navigate' },
  { cmd: '/history', desc: 'Activity log', icon: Clock, group: 'Navigate' },
  { cmd: '/help', desc: 'Show all commands', icon: HelpCircle, group: 'Actions' },
  { cmd: '/status', desc: 'Check 0nMCP status', icon: Activity, group: 'Actions' },
]

export function CommandPalette({ open, onClose, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = COMMANDS.filter(
    (c) =>
      !query ||
      c.cmd.toLowerCase().includes(query.toLowerCase()) ||
      c.desc.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        onSelect(filtered[activeIndex].cmd)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose, onSelect, filtered, activeIndex])

  // Global Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  // Group filtered commands
  const groups = filtered.reduce<Record<string, typeof COMMANDS>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = []
    acc[cmd.group].push(cmd)
    return acc
  }, {})

  let flatIndex = -1

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(10, 10, 15, 0.7)',
          backdropFilter: 'blur(8px)',
          animation: 'console-fade-in 0.15s ease',
        }}
        onClick={onClose}
      />

      {/* Palette */}
      <div
        className="relative w-full max-w-[640px] mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 40px var(--accent-glow)',
          animation: 'console-scale-in 0.2s ease',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 h-12"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {Object.entries(groups).map(([group, cmds]) => (
            <div key={group}>
              <div
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                {group}
              </div>
              {cmds.map((c) => {
                flatIndex++
                const idx = flatIndex
                const Icon = c.icon
                const isActive = activeIndex === idx
                return (
                  <button
                    key={c.cmd}
                    onClick={() => onSelect(c.cmd)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors border-none bg-transparent"
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon
                      size={16}
                      style={{
                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      }}
                    />
                    <span
                      className="text-xs"
                      style={{
                        color: 'var(--accent)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {c.cmd}
                    </span>
                    <span className="text-sm">{c.desc}</span>
                    {isActive && (
                      <span
                        className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        Enter
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No commands found
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes console-scale-in {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
