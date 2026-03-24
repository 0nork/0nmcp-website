/**
 * BrandSVG — Inline SVG brand components
 * Replaces PNG logo/icon references for crisp rendering at any size.
 */

interface LogoProps {
  height?: number
  className?: string
}

/** Full "0nMCP" logo — white text, used in MegaNav and Footer */
export function Logo0nMCP({ height = 32, className }: LogoProps) {
  const scale = height / 32
  const w = Math.round(100 * scale)
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 100 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="0nMCP"
    >
      {/* Icon box */}
      <rect x="0" y="2" width="28" height="28" rx="6" fill="#0B0F19" stroke="#6EE05A" strokeWidth="1.2" strokeOpacity="0.5" />
      <text x="14" y="22" textAnchor="middle" fill="#6EE05A" fontSize="16" fontWeight="700" fontFamily="'JetBrains Mono', monospace">0n</text>
      {/* MCP text */}
      <text x="34" y="23" fill="white" fontSize="18" fontWeight="700" fontFamily="'JetBrains Mono', monospace" letterSpacing="-0.5">MCP</text>
    </svg>
  )
}

/** Green "0n" icon — used in sidebar, forum, dashboard */
export function Icon0n({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="0n"
    >
      <rect width="40" height="40" rx="8" fill="#0B0F19" stroke="#6EE05A" strokeWidth="1.5" strokeOpacity="0.4" />
      <text x="20" y="27" textAnchor="middle" fill="#6EE05A" fontSize="20" fontWeight="700" fontFamily="'JetBrains Mono', monospace">0n</text>
    </svg>
  )
}

/** Console logo — "0n Console" text mark */
export function LogoConsole({ height = 22, className }: LogoProps) {
  const w = Math.round(height * 5)
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 120 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="0n Console"
    >
      <text x="0" y="17" fill="#6EE05A" fontSize="14" fontWeight="700" fontFamily="'JetBrains Mono', monospace">0n</text>
      <text x="28" y="17" fill="white" fontSize="14" fontWeight="500" fontFamily="'Instrument Sans', sans-serif" letterSpacing="0.5">Console</text>
    </svg>
  )
}
