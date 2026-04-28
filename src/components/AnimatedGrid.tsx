/**
 * Subtle animated grid — horizontal and vertical lines that fade in and
 * out at randomized intervals. Pure SVG with SMIL animation so there's
 * no JS work on the main thread; runs even with React paused.
 *
 * Designed to sit absolutely positioned behind a hero or feature panel.
 * Brand-color stroke (green) at low alpha so it reads as "alive" rather
 * than a literal grid.
 */

interface AnimatedGridProps {
  /** Number of horizontal lines to draw. */
  rows?: number
  /** Number of vertical lines to draw. */
  cols?: number
  /** Stroke color for the lines. */
  color?: string
  className?: string
  /** Peak opacity of any one line at the bright moment of its fade. */
  peakOpacity?: number
}

// Deterministic pseudo-random so SSR + client match without hydration warnings.
function pseudo(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

export default function AnimatedGrid({
  rows = 14,
  cols = 22,
  color = '#6EE05A',
  peakOpacity = 0.18,
  className = '',
}: AnimatedGridProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {/* ── Horizontal lines ─────────────────────────────────────── */}
      {Array.from({ length: rows }).map((_, i) => {
        const y = (i + 1) * (800 / (rows + 1))
        const dur = 4 + pseudo(i, 1) * 6
        const delay = pseudo(i, 2) * 5
        return (
          <line
            key={`h-${i}`}
            x1={0}
            y1={y}
            x2={1200}
            y2={y}
            stroke={color}
            strokeWidth={0.5}
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values={`0;${peakOpacity};0`}
              dur={`${dur.toFixed(2)}s`}
              begin={`${delay.toFixed(2)}s`}
              repeatCount="indefinite"
            />
          </line>
        )
      })}

      {/* ── Vertical lines ───────────────────────────────────────── */}
      {Array.from({ length: cols }).map((_, i) => {
        const x = (i + 1) * (1200 / (cols + 1))
        const dur = 5 + pseudo(i, 3) * 7
        const delay = pseudo(i, 4) * 6
        return (
          <line
            key={`v-${i}`}
            x1={x}
            y1={0}
            x2={x}
            y2={800}
            stroke={color}
            strokeWidth={0.5}
            opacity={0}
          >
            <animate
              attributeName="opacity"
              values={`0;${peakOpacity * 0.85};0`}
              dur={`${dur.toFixed(2)}s`}
              begin={`${delay.toFixed(2)}s`}
              repeatCount="indefinite"
            />
          </line>
        )
      })}

      {/* ── A handful of crossing-point pulses for life ──────────── */}
      {Array.from({ length: 6 }).map((_, i) => {
        const cx = pseudo(i, 5) * 1200
        const cy = pseudo(i, 6) * 800
        const dur = 6 + pseudo(i, 7) * 4
        const delay = pseudo(i, 8) * 8
        return (
          <circle key={`p-${i}`} cx={cx} cy={cy} r={1.5} fill={color} opacity={0}>
            <animate
              attributeName="opacity"
              values={`0;${peakOpacity * 2};0`}
              dur={`${dur.toFixed(2)}s`}
              begin={`${delay.toFixed(2)}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="1;3;1"
              dur={`${dur.toFixed(2)}s`}
              begin={`${delay.toFixed(2)}s`}
              repeatCount="indefinite"
            />
          </circle>
        )
      })}
    </svg>
  )
}
