'use client'

import type { CommandCategory } from './commands'

interface Props {
  categories: Record<CommandCategory, { label: string; description: string }>
  active: CommandCategory | 'all'
  onSelect: (cat: CommandCategory | 'all') => void
}

export function CategoryFilter({ categories, active, onSelect }: Props) {
  const cats = Object.entries(categories) as [CommandCategory, { label: string; description: string }][]

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      <button
        onClick={() => onSelect('all')}
        style={{
          padding: '5px 12px',
          borderRadius: 6,
          border: active === 'all' ? '1px solid rgba(110,224,90,0.4)' : '1px solid rgba(255,255,255,0.08)',
          background: active === 'all' ? 'rgba(110,224,90,0.1)' : 'rgba(255,255,255,0.03)',
          color: active === 'all' ? '#6EE05A' : 'rgba(255,255,255,0.5)',
          fontSize: '0.75rem',
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        All
      </button>
      {cats.map(([id, cat]) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          style={{
            padding: '5px 12px',
            borderRadius: 6,
            border: active === id ? '1px solid rgba(110,224,90,0.4)' : '1px solid rgba(255,255,255,0.08)',
            background: active === id ? 'rgba(110,224,90,0.1)' : 'rgba(255,255,255,0.03)',
            color: active === id ? '#6EE05A' : 'rgba(255,255,255,0.5)',
            fontSize: '0.75rem',
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
