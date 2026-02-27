'use client'

interface StatusDotProps {
  status: 'online' | 'offline' | 'unknown'
  size?: 'sm' | 'md'
}

export function StatusDot({ status, size = 'sm' }: StatusDotProps) {
  const dims = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'

  const color =
    status === 'online'
      ? 'bg-[var(--accent)]'
      : status === 'offline'
        ? 'bg-red-500'
        : 'bg-[var(--text-muted)]'

  return (
    <span className={`relative inline-flex ${dims}`}>
      <span className={`${dims} rounded-full ${color}`} />
      {status === 'online' && (
        <span
          className={`absolute inset-0 rounded-full ${color} animate-ping opacity-50`}
          style={{ animationDuration: '2s' }}
        />
      )}
    </span>
  )
}
