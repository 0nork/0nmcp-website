'use client'

export type FocusArea = 'idle' | 'thinking' | 'vault' | 'learning' | 'suggesting' | 'federation'

interface OnCallIconProps {
  focus: FocusArea
  onClick: () => void
  hasNotification?: boolean
}

const FOCUS_GRADIENTS: Record<FocusArea, string> = {
  idle: '#7ed957, #5cb83a',
  thinking: '#00d4ff, #a78bfa, #00d4ff',
  vault: '#ff6b35, #ff9f43',
  learning: '#7ed957, #00d4ff, #a78bfa, #ff6b35',
  suggesting: '#7ed957, #5cb83a',
  federation: '#a78bfa, #10a37f, #4285f4',
}

const FOCUS_ANIMATIONS: Record<FocusArea, string> = {
  idle: 'oncall-pulse',
  thinking: 'oncall-spin',
  vault: 'oncall-glow',
  learning: 'oncall-spin',
  suggesting: 'oncall-breathe',
  federation: 'oncall-spin',
}

export function OnCallIcon({ focus, onClick, hasNotification }: OnCallIconProps) {
  const gradient = FOCUS_GRADIENTS[focus]
  const animation = FOCUS_ANIMATIONS[focus]
  const speed = focus === 'thinking' ? '1.5s' : focus === 'learning' ? '3s' : '2s'

  return (
    <>
      <button
        onClick={onClick}
        className="relative w-14 h-14 rounded-full cursor-pointer transition-transform hover:scale-110 active:scale-95"
        style={{ animation: `${animation} ${speed} ease-in-out infinite` }}
        aria-label="Open 0ncall assistant"
      >
        {/* Gradient border ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from var(--oncall-angle, 0deg), ${gradient})`,
            animation: focus === 'idle' || focus === 'suggesting'
              ? 'none'
              : `oncall-rotate 3s linear infinite`,
          }}
        />
        {/* Inner circle */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            inset: '3px',
            background: '#0a0a0f',
          }}
        >
          <span
            className="text-sm font-black tracking-tight select-none"
            style={{
              background: `linear-gradient(135deg, ${gradient.split(',')[0]}, ${gradient.split(',').pop()})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            0n
          </span>
        </div>
        {/* Notification dot */}
        {hasNotification && (
          <div
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
            style={{
              backgroundColor: '#ff6b35',
              borderColor: '#0a0a0f',
              animation: 'oncall-notif-pulse 2s ease-in-out infinite',
            }}
          />
        )}
      </button>

      <style>{`
        @property --oncall-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes oncall-rotate {
          to { --oncall-angle: 360deg; }
        }
        @keyframes oncall-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(126, 217, 87, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(126, 217, 87, 0); }
        }
        @keyframes oncall-spin {
          0%, 100% { box-shadow: 0 0 12px rgba(0, 212, 255, 0.3); }
          50% { box-shadow: 0 0 20px rgba(167, 139, 250, 0.4); }
        }
        @keyframes oncall-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(255, 107, 53, 0.3); }
          50% { box-shadow: 0 0 16px rgba(255, 159, 67, 0.5); }
        }
        @keyframes oncall-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes oncall-notif-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  )
}
