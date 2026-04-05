'use client'

/**
 * VoidLoader — Agentic AI loading visualization
 * Nucleus core with decision wave ripples and data motes
 * Use as full-page loader or inline component
 */

interface VoidLoaderProps {
  /** Full-screen overlay mode */
  fullscreen?: boolean
  /** Optional message below the visualization */
  message?: string
  /** Size of the void container (default 400) */
  size?: number
}

export default function VoidLoader({ fullscreen = false, message, size = 400 }: VoidLoaderProps) {
  const half = size / 2

  return (
    <>
      <style>{`
        .void-container {
          position: relative;
          filter: contrast(150%) brightness(120%);
        }
        .void-nucleus {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 36px; height: 36px;
          background: #fff;
          border-radius: 50%;
          filter: blur(2px);
          box-shadow: 0 0 40px 10px rgba(255,255,255,0.8);
          animation: void-nucleus-pulse 3s ease-in-out infinite;
        }
        @keyframes void-nucleus-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 40px 10px rgba(255,255,255,0.8); }
          50% { transform: translate(-50%, -50%) scale(1.15); box-shadow: 0 0 60px 15px rgba(255,255,255,0.6); }
        }
        .void-wave {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(110, 224, 90, 0.25);
          border-radius: 50%;
          animation: void-ripple 4s infinite linear;
        }
        @keyframes void-ripple {
          0% { width: 0; height: 0; opacity: 0.8; }
          100% { width: ${size * 1.2}px; height: ${size * 1.2}px; opacity: 0; }
        }
        .void-wave-cyan {
          border-color: rgba(0, 212, 255, 0.2);
          animation: void-ripple 5s infinite linear;
        }
        .void-wave-purple {
          border-color: rgba(167, 139, 250, 0.15);
          animation: void-ripple 6s infinite linear;
        }
        .void-mote {
          width: 4px; height: 4px;
          background: #6EE05A;
          position: absolute;
          border-radius: 50%;
          filter: blur(1px);
          box-shadow: 0 0 6px 2px rgba(126,217,87,0.4);
        }
        .void-mote-1 {
          top: 50%; left: 50%;
          animation: void-orbit-1 6s infinite ease-in-out;
        }
        .void-mote-2 {
          top: 50%; left: 50%;
          background: #00d4ff;
          box-shadow: 0 0 6px 2px rgba(0,212,255,0.4);
          animation: void-orbit-2 8s infinite ease-in-out;
        }
        .void-mote-3 {
          top: 50%; left: 50%;
          background: #a78bfa;
          box-shadow: 0 0 6px 2px rgba(167,139,250,0.4);
          animation: void-orbit-3 7s infinite ease-in-out;
        }
        .void-mote-4 {
          top: 50%; left: 50%;
          background: #fff;
          width: 3px; height: 3px;
          box-shadow: 0 0 4px 1px rgba(255,255,255,0.5);
          animation: void-orbit-4 5s infinite ease-in-out;
        }
        @keyframes void-orbit-1 {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(${half * 0.7}px, ${-half * 0.4}px); opacity: 0; }
        }
        @keyframes void-orbit-2 {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(${-half * 0.5}px, ${half * 0.6}px); opacity: 0; }
        }
        @keyframes void-orbit-3 {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(${half * 0.3}px, ${half * 0.7}px); opacity: 0; }
        }
        @keyframes void-orbit-4 {
          0% { transform: translate(0, 0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(${-half * 0.6}px, ${-half * 0.3}px); opacity: 0; }
        }
        .void-tendril {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(110, 224, 90, 0.3), transparent);
          transform-origin: left center;
          animation: void-tendril-pulse 3s infinite ease-in-out;
        }
        @keyframes void-tendril-pulse {
          0% { width: 0; opacity: 0; }
          50% { opacity: 0.6; }
          100% { width: ${half * 0.8}px; opacity: 0; }
        }
      `}</style>

      <div style={{
        ...(fullscreen ? {
          position: 'fixed' as const, inset: 0, zIndex: 9999,
          background: 'var(--bg-primary)',
        } : {}),
        display: 'flex', flexDirection: 'column' as const,
        justifyContent: 'center', alignItems: 'center',
        minHeight: fullscreen ? '100vh' : 'auto',
        overflow: 'hidden',
      }}>
        <div className="void-container" style={{ width: size, height: size, position: 'relative' }}>
          {/* Decision waves */}
          <div className="void-wave" />
          <div className="void-wave" style={{ animationDelay: '1.3s' }} />
          <div className="void-wave void-wave-cyan" style={{ animationDelay: '0.7s' }} />
          <div className="void-wave void-wave-purple" style={{ animationDelay: '2s' }} />

          {/* Tendrils */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <div key={i} className="void-tendril" style={{
              top: '50%', left: '50%',
              transform: `rotate(${deg}deg)`,
              animationDelay: `${i * 0.4}s`,
            }} />
          ))}

          {/* Data motes */}
          <div className="void-mote void-mote-1" />
          <div className="void-mote void-mote-2" style={{ animationDelay: '2s' }} />
          <div className="void-mote void-mote-3" style={{ animationDelay: '3.5s' }} />
          <div className="void-mote void-mote-4" style={{ animationDelay: '1s' }} />

          {/* Nucleus */}
          <div className="void-nucleus" />
        </div>

        {message && (
          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.9375rem',
            fontFamily: "'Instrument Sans', system-ui, sans-serif",
            marginTop: '1.5rem',
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}>
            {message}
          </p>
        )}
      </div>
    </>
  )
}
