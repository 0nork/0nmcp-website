// 0nCore launched May 1, 2026. This component now renders a "live" celebration
// banner instead of a countdown. Existing call sites stay intact.

interface CountdownToLaunchProps {
  /** Compact 1-row layout for hero strips. */
  compact?: boolean
  className?: string
}

export default function CountdownToLaunch({ compact, className = '' }: CountdownToLaunchProps) {
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6EE05A] opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6EE05A]" />
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#6EE05A]">
          Live now · v4.10
        </span>
      </div>
    )
  }

  return (
    <div className={`text-center ${className}`}>
      <p className="font-mono text-xs uppercase tracking-widest text-[#6EE05A]">Launched</p>
      <p className="mt-1 text-2xl font-black text-white">0nCore is live.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        v4.10 · 1,640+ tools across 109 services
      </p>
    </div>
  )
}
