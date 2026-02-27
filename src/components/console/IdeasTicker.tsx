'use client'

interface IdeasTickerProps {
  ideas: string[]
  onClick: (idea: string) => void
}

export function IdeasTicker({ ideas, onClick }: IdeasTickerProps) {
  if (ideas.length === 0) return null

  const doubled = [...ideas, ...ideas]

  return (
    <div className="overflow-hidden relative py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Edge fades */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 z-[2]"
        style={{ background: 'linear-gradient(to right, var(--bg-primary), transparent)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-12 z-[2]"
        style={{ background: 'linear-gradient(to left, var(--bg-primary), transparent)' }}
      />

      <div className="flex items-center gap-1.5 pl-4 mb-1">
        <span
          className="text-[10px] font-semibold tracking-wider uppercase"
          style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}
        >
          Ideas
        </span>
      </div>

      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `console-ticker-scroll ${ideas.length * 5}s linear infinite`,
        }}
      >
        {doubled.map((idea, i) => (
          <button
            key={i}
            onClick={() => onClick(idea)}
            className="inline-flex items-center shrink-0 text-xs px-4 py-0.5 transition-colors cursor-pointer bg-transparent border-none"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <span
              className="w-1 h-1 rounded-full mr-2.5 shrink-0"
              style={{ backgroundColor: 'var(--accent)' }}
            />
            {idea}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes console-ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
