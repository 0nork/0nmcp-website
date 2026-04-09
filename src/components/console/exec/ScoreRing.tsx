'use client'

import { type ScoreBand } from '@/lib/0nexec/scoring-engine'

interface ScoreRingProps {
  score: number
  band: ScoreBand
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

function ringColor(band: ScoreBand): string {
  switch (band) {
    case 'NOMINAL': return '#fafafa'
    case 'MONITOR': return '#fafafa'
    case 'REVIEW': return '#F5C518'
    case 'CRITICAL': return '#EF4444'
  }
}

export function ScoreRing({ score, band, size = 64, strokeWidth = 4, showLabel = true }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = ringColor(band)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference - progress}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#fafafa] font-bold font-mono" style={{ fontSize: size * 0.28 }}>{score}</span>
        </div>
      )}
    </div>
  )
}
