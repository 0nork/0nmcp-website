'use client'

interface SubScoreBarProps {
  label: string
  value: number
  max?: number
  color: string
}

export function SubScoreBar({ label, value, max = 25, color }: SubScoreBarProps) {
  const pct = Math.round((value / max) * 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="text-foreground font-mono font-bold">{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
