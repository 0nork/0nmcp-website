'use client'

import { getBandColor, type ScoreBand } from '@/lib/0nexec/scoring-engine'

interface ScoreRingProps {
  score: number
  band: ScoreBand
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

export function ScoreRing({ score, band, size = 64, strokeWidth = 4, showLabel = true }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = getBandColor(band)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
        />
        {/* Score ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference - progress}`}
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`,
            transition: 'stroke-dasharray 0.6s ease',
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-foreground font-bold font-mono" style={{ fontSize: size * 0.28 }}>
            {score}
          </span>
        </div>
      )}
    </div>
  )
}
