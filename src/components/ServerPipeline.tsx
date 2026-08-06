/**
 * Animated 0nMCP Server Pipeline diagram.
 *
 * Pure SVG with SMIL animation. Shows the full request lifecycle:
 *   AI clients → MCP transport → 0nMCP core (hex) →
 *   Three-Level Execution lanes (Pipeline / Assembly Line / Radial Burst) →
 *   Vault encryption → Service grid (106 services).
 *
 * No CSS animations, no inline styles. Drop-in <ServerPipeline /> on dark bg.
 */

const ACCENT = '#6EE05A'
const CYAN = '#14b8a6'
const PURPLE = '#8b5cf6'
const AMBER = '#f59e0b'
const RED = '#ef4444'
const MUTED = '#475569'

const CLIENTS = [
  { x: 60, label: 'Claude', color: PURPLE },
  { x: 195, label: 'Cursor', color: CYAN },
  { x: 330, label: 'Windsurf', color: AMBER },
  { x: 465, label: 'Gemini', color: ACCENT },
]

const SERVICES = [
  { label: 'CRM', color: ACCENT },
  { label: 'Stripe', color: '#635BFF' },
  { label: 'Slack', color: '#E01E5A' },
  { label: 'GitHub', color: '#9ca3af' },
  { label: 'OpenAI', color: '#10a37f' },
  { label: 'Supabase', color: CYAN },
  { label: 'Twilio', color: RED },
  { label: 'Sendgrid', color: '#1A82E2' },
  { label: 'Notion', color: '#fff' },
  { label: 'Airtable', color: AMBER },
  { label: 'Shopify', color: '#7AB55C' },
  { label: 'Linear', color: PURPLE },
]

export default function ServerPipeline() {
  return (
    <svg
      viewBox="0 0 600 720"
      role="img"
      aria-label="0nMCP server pipeline animation"
      className="w-full h-auto max-h-[720px]"
    >
      <defs>
        <linearGradient id="coreGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.9" />
          <stop offset="50%" stopColor={CYAN} stopOpacity="0.85" />
          <stop offset="100%" stopColor={PURPLE} stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="coreGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.5" />
          <stop offset="60%" stopColor={ACCENT} stopOpacity="0.08" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="laneGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0" />
          <stop offset="50%" stopColor={ACCENT} stopOpacity="0.8" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
        <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ─── 1. AI CLIENTS ROW ─────────────────────────────────────── */}
      <g>
        <text x="300" y="22" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace" letterSpacing="2">
          AI CLIENTS
        </text>
        {CLIENTS.map((c, i) => (
          <g key={c.label}>
            <rect
              x={c.x}
              y="32"
              width="75"
              height="40"
              rx="8"
              fill="rgba(15,17,23,0.7)"
              stroke={c.color}
              strokeWidth="1.2"
              opacity="0.9"
            >
              <animate
                attributeName="opacity"
                values="0.5;1;0.5"
                dur="3s"
                begin={`${i * 0.6}s`}
                repeatCount="indefinite"
              />
            </rect>
            <text
              x={c.x + 37.5}
              y="56"
              textAnchor="middle"
              fill={c.color}
              fontSize="11"
              fontFamily="monospace"
              fontWeight="600"
            >
              {c.label}
            </text>
            {/* Down-line + traveling packet */}
            <line x1={c.x + 37.5} y1="72" x2={c.x + 37.5} y2="120" stroke="#1f2937" strokeWidth="1" />
            <circle r="3" fill={c.color} filter="url(#soft-glow)">
              <animate
                attributeName="cy"
                values="72;120"
                dur="2s"
                begin={`${i * 0.5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cx"
                values={`${c.x + 37.5};${c.x + 37.5}`}
                dur="2s"
                begin={`${i * 0.5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="2s"
                begin={`${i * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </g>

      {/* ─── 2. MCP TRANSPORT LAYER ─────────────────────────────────── */}
      <g>
        <rect x="40" y="120" width="520" height="36" rx="8" fill="rgba(110,224,90,0.06)" stroke="rgba(110,224,90,0.25)" strokeWidth="1" />
        <text x="60" y="143" fill={ACCENT} fontSize="11" fontFamily="monospace" fontWeight="700" letterSpacing="2">
          MCP TRANSPORT
        </text>
        <text x="200" y="143" fill="#64748b" fontSize="10" fontFamily="monospace">
          stdio · HTTP · SSE · tool discovery · schema negotiation
        </text>
        {/* Flowing packets across transport */}
        {[0, 0.7, 1.4, 2.1].map((delay, i) => (
          <circle key={i} r="2.5" cy="138" fill={ACCENT}>
            <animate attributeName="cx" values="60;540" dur="2.8s" begin={`${delay}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" dur="2.8s" begin={`${delay}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>

      {/* ─── 3. 0nMCP CORE HEXAGON ──────────────────────────────────── */}
      <g transform="translate(300 240)">
        {/* Outer pulsing glow */}
        <circle r="80" fill="url(#coreGlow)">
          <animate attributeName="r" values="70;95;70" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
        </circle>
        {/* Rotating outer ring */}
        <g>
          <circle r="55" fill="none" stroke={ACCENT} strokeWidth="0.8" strokeDasharray="3 8" opacity="0.5">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0;360"
              dur="20s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
        {/* Counter-rotating ring */}
        <g>
          <circle r="48" fill="none" stroke={CYAN} strokeWidth="0.6" strokeDasharray="2 6" opacity="0.4">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="360;0"
              dur="14s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
        {/* Hexagon */}
        <polygon
          points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20"
          fill="rgba(15,17,23,0.95)"
          stroke="url(#coreGrad)"
          strokeWidth="2"
          filter="url(#soft-glow)"
        />
        <text x="0" y="-4" textAnchor="middle" fill={ACCENT} fontSize="13" fontFamily="monospace" fontWeight="800">
          0nMCP
        </text>
        <text x="0" y="12" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
          v4.5.1
        </text>
        {/* Pulsing core dot */}
        <circle r="3" fill={ACCENT}>
          <animate attributeName="r" values="2;4;2" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Stats badges around core */}
      <g>
        <rect x="40" y="220" width="80" height="22" rx="4" fill="rgba(110,224,90,0.08)" stroke="rgba(110,224,90,0.2)" strokeWidth="0.8" />
        <text x="80" y="235" textAnchor="middle" fill={ACCENT} fontSize="10" fontFamily="monospace" fontWeight="700">
          1,598+ tools
        </text>
        <rect x="480" y="220" width="80" height="22" rx="4" fill="rgba(20,184,166,0.08)" stroke="rgba(20,184,166,0.2)" strokeWidth="0.8" />
        <text x="520" y="235" textAnchor="middle" fill={CYAN} fontSize="10" fontFamily="monospace" fontWeight="700">
          106 services
        </text>
        <rect x="40" y="260" width="80" height="22" rx="4" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.8" />
        <text x="80" y="275" textAnchor="middle" fill={PURPLE} fontSize="10" fontFamily="monospace" fontWeight="700">
          5 patents
        </text>
        <rect x="480" y="260" width="80" height="22" rx="4" fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.2)" strokeWidth="0.8" />
        <text x="520" y="275" textAnchor="middle" fill={AMBER} fontSize="10" fontFamily="monospace" fontWeight="700">
          Source-available
        </text>
      </g>

      {/* ─── 4. THREE-LEVEL EXECUTION LANES ─────────────────────────── */}
      <g>
        <text x="300" y="345" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace" letterSpacing="2">
          THREE-LEVEL EXECUTION · PATENT PENDING
        </text>

        {/* Lane 1 — PIPELINE (sequential) */}
        <g>
          <text x="44" y="375" fill={ACCENT} fontSize="9" fontFamily="monospace" fontWeight="700">
            PIPELINE
          </text>
          <line x1="115" y1="372" x2="555" y2="372" stroke="#1f2937" strokeWidth="1" />
          {[0, 1, 2, 3, 4, 5].map((step) => {
            const cx = 130 + step * 80
            return (
              <g key={`p${step}`}>
                <circle cx={cx} cy="372" r="6" fill="rgba(15,17,23,0.95)" stroke={ACCENT} strokeWidth="1.2">
                  <animate
                    attributeName="r"
                    values="4;7;4"
                    dur="3s"
                    begin={`${step * 0.4}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-opacity"
                    values="0.4;1;0.4"
                    dur="3s"
                    begin={`${step * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )
          })}
          {/* Traveling packet */}
          <circle r="3" cy="372" fill={ACCENT} filter="url(#soft-glow)">
            <animate attributeName="cx" values="130;530" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Lane 2 — ASSEMBLY LINE (parallel rows) */}
        <g>
          <text x="44" y="412" fill={CYAN} fontSize="9" fontFamily="monospace" fontWeight="700">
            ASSEMBLY
          </text>
          {[0, 1].map((row) => {
            const y = 408 + row * 14
            return (
              <g key={`a-row-${row}`}>
                <line x1="115" y1={y} x2="555" y2={y} stroke="#1f2937" strokeWidth="0.8" />
                {[0, 1, 2, 3, 4, 5, 6].map((step) => {
                  const cx = 130 + step * 65
                  return (
                    <rect
                      key={`a${row}-${step}`}
                      x={cx - 5}
                      y={y - 4}
                      width="10"
                      height="8"
                      rx="2"
                      fill="rgba(15,17,23,0.95)"
                      stroke={CYAN}
                      strokeWidth="1"
                    >
                      <animate
                        attributeName="stroke-opacity"
                        values="0.3;1;0.3"
                        dur="2.4s"
                        begin={`${(row + step) * 0.2}s`}
                        repeatCount="indefinite"
                      />
                    </rect>
                  )
                })}
                <circle r="2.5" cy={y} fill={CYAN} filter="url(#soft-glow)">
                  <animate
                    attributeName="cx"
                    values="130;520"
                    dur="2.4s"
                    begin={`${row * 0.6}s`}
                    repeatCount="indefinite"
                  />
                  <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" begin={`${row * 0.6}s`} repeatCount="indefinite" />
                </circle>
              </g>
            )
          })}
        </g>

        {/* Lane 3 — RADIAL BURST (dots flying outward) */}
        <g transform="translate(300 460)">
          <text x="-256" y="0" fill={PURPLE} fontSize="9" fontFamily="monospace" fontWeight="700">
            RADIAL
          </text>
          <circle r="4" fill={PURPLE} filter="url(#soft-glow)">
            <animate attributeName="r" values="2;5;2" dur="1.6s" repeatCount="indefinite" />
          </circle>
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180
            const x2 = Math.cos(angle) * 150
            const y2 = Math.sin(angle) * 22
            return (
              <g key={`r${i}`}>
                <line x1="0" y1="0" x2={x2} y2={y2} stroke={PURPLE} strokeWidth="0.5" opacity="0.2" />
                <circle r="2" fill={PURPLE}>
                  <animate
                    attributeName="cx"
                    values={`0;${x2}`}
                    dur="2.2s"
                    begin={`${i * 0.15}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values={`0;${y2}`}
                    dur="2.2s"
                    begin={`${i * 0.15}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0"
                    dur="2.2s"
                    begin={`${i * 0.15}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )
          })}
        </g>
      </g>

      {/* ─── 5. VAULT LAYER ─────────────────────────────────────────── */}
      <g>
        <rect x="40" y="500" width="520" height="34" rx="8" fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.25)" strokeWidth="1" />
        <text x="60" y="522" fill={AMBER} fontSize="11" fontFamily="monospace" fontWeight="700" letterSpacing="2">
          0nVAULT
        </text>
        <text x="148" y="522" fill="#64748b" fontSize="10" fontFamily="monospace">
          AES-256-GCM · PBKDF2-SHA512 · hardware bound · audit-trail
        </text>
        {/* Lock icon — pulsing */}
        <g transform="translate(528 510)">
          <rect x="-7" y="3" width="14" height="11" rx="1.5" fill={AMBER} opacity="0.85">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </rect>
          <path d="M -4 3 L -4 0 A 4 4 0 0 1 4 0 L 4 3" fill="none" stroke={AMBER} strokeWidth="1.8" />
          <circle cy="8" r="1.4" fill="#0d1117" />
        </g>
      </g>

      {/* ─── 6. SERVICE OUTPUT GRID ─────────────────────────────────── */}
      <g>
        <text x="300" y="558" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace" letterSpacing="2">
          ROUTED TO 111 SERVICES (sample)
        </text>
        {SERVICES.map((s, i) => {
          const col = i % 6
          const row = Math.floor(i / 6)
          const x = 50 + col * 85
          const y = 575 + row * 50
          return (
            <g key={s.label}>
              <rect
                x={x}
                y={y}
                width="75"
                height="38"
                rx="8"
                fill="rgba(15,17,23,0.85)"
                stroke={s.color}
                strokeWidth="1"
                opacity="0.85"
              >
                <animate
                  attributeName="stroke-opacity"
                  values="0.3;1;0.3"
                  dur="3.5s"
                  begin={`${i * 0.25}s`}
                  repeatCount="indefinite"
                />
              </rect>
              <text
                x={x + 37.5}
                y={y + 23}
                textAnchor="middle"
                fill={s.color}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="600"
              >
                {s.label}
              </text>
            </g>
          )
        })}
      </g>

      {/* Connector lines core → lanes → vault → services (subtle) */}
      <g stroke="#1f2937" strokeWidth="0.6" fill="none">
        <line x1="300" y1="320" x2="300" y2="350" />
        <line x1="300" y1="475" x2="300" y2="500" />
        <line x1="300" y1="534" x2="300" y2="565" />
      </g>
    </svg>
  )
}
