'use client'

/**
 * IntegrationOrbit — Service logos orbiting a central counter
 * Two concentric rings rotating in opposite directions
 * White circle icons on a gradient ring track
 */

const OUTER_RING = [
  { label: 'CRM', color: '#6EE05A', icon: '0n' },
  { label: 'Stripe', color: '#635BFF', icon: 'St' },
  { label: 'Slack', color: '#4A154B', icon: 'Sl' },
  { label: 'GitHub', color: '#FFFFFF', icon: 'GH' },
  { label: 'Supabase', color: '#3ECF8E', icon: 'Sb' },
  { label: 'OpenAI', color: '#10A37F', icon: 'OA' },
  { label: 'Canva', color: '#00C4CC', icon: 'Cv' },
  { label: 'Figma', color: '#F24E1E', icon: 'Fg' },
]

const INNER_RING = [
  { label: 'Claude', color: '#D4A574', icon: 'An' },
  { label: 'Telegram', color: '#26A5E4', icon: 'Tg' },
  { label: 'Gemini', color: '#4285F4', icon: 'Gm' },
  { label: 'Groq', color: '#F55036', icon: 'Gq' },
  { label: 'SendGrid', color: '#1A82E2', icon: 'SG' },
]

interface IntegrationOrbitProps {
  count?: string
  label?: string
  size?: number
}

export function IntegrationOrbit({ count = '1,598+', label = 'Tools Connected', size = 380 }: IntegrationOrbitProps) {
  const center = size / 2
  const outerRadius = size * 0.42
  const innerRadius = size * 0.26

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>

      {/* Outer gradient ring track */}
      <div
        className="absolute rounded-full"
        style={{
          inset: 0,
          background: `conic-gradient(from 0deg, rgba(110,224,90,0.15), rgba(110,224,90,0.05), rgba(0,196,204,0.15), rgba(110,224,90,0.05), rgba(110,224,90,0.15))`,
        }}
      />
      <div
        className="absolute rounded-full bg-background"
        style={{ inset: size * 0.1 }}
      />

      {/* Inner ring track */}
      <div
        className="absolute rounded-full"
        style={{
          inset: size * 0.18,
          background: `conic-gradient(from 180deg, rgba(110,224,90,0.08), transparent, rgba(0,196,204,0.08), transparent, rgba(110,224,90,0.08))`,
        }}
      />
      <div
        className="absolute rounded-full bg-background"
        style={{ inset: size * 0.25 }}
      />

      {/* Center circle */}
      <div
        className="absolute rounded-full border border-border bg-card"
        style={{ inset: size * 0.3 }}
      />

      {/* Center counter */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <div className="text-3xl font-bold text-foreground tracking-tight">{count}</div>
        <div className="text-xs text-muted-foreground font-medium mt-0.5">{label}</div>
      </div>

      {/* Outer icons — rotate clockwise */}
      <div className="absolute inset-0" style={{ animation: 'orbitCW 35s linear infinite' }}>
        {OUTER_RING.map((svc, i) => {
          const angle = (360 / OUTER_RING.length) * i
          const rad = (angle * Math.PI) / 180
          const iconSize = 44
          const x = center + outerRadius * Math.cos(rad) - iconSize / 2
          const y = center + outerRadius * Math.sin(rad) - iconSize / 2
          return (
            <div
              key={svc.label}
              className="absolute rounded-full bg-card border border-border flex items-center justify-center shadow-lg"
              style={{
                width: iconSize,
                height: iconSize,
                left: x,
                top: y,
                animation: 'orbitCCW 35s linear infinite',
              }}
            >
              <span className="text-[11px] font-black font-mono" style={{ color: svc.color }}>
                {svc.icon}
              </span>
            </div>
          )
        })}
      </div>

      {/* Inner icons — rotate counter-clockwise */}
      <div className="absolute inset-0" style={{ animation: 'orbitCCW 28s linear infinite' }}>
        {INNER_RING.map((svc, i) => {
          const angle = (360 / INNER_RING.length) * i
          const rad = (angle * Math.PI) / 180
          const iconSize = 36
          const x = center + innerRadius * Math.cos(rad) - iconSize / 2
          const y = center + innerRadius * Math.sin(rad) - iconSize / 2
          return (
            <div
              key={svc.label}
              className="absolute rounded-full bg-card border border-border flex items-center justify-center shadow-md"
              style={{
                width: iconSize,
                height: iconSize,
                left: x,
                top: y,
                animation: 'orbitCW 28s linear infinite',
              }}
            >
              <span className="text-[9px] font-black font-mono" style={{ color: svc.color }}>
                {svc.icon}
              </span>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes orbitCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitCCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  )
}
