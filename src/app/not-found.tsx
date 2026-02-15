import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-8 relative">
      {/* Glow */}
      <div
        className="absolute w-[400px] h-[400px] top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-[1] max-w-[500px]">
        {/* 404 */}
        <div
          className="font-mono text-[8rem] font-bold leading-none tracking-tight mb-4"
          style={{ color: 'var(--accent)' }}
        >
          404
        </div>

        {/* Message */}
        <h1 className="text-2xl font-semibold mb-3">
          This page doesn&apos;t exist. Yet.
        </h1>
        <p
          className="text-base leading-relaxed mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Try one of these instead.
        </p>

        {/* Links */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn-accent no-underline">
            Go Home
          </Link>
          <Link href="/turn-it-on" className="btn-ghost no-underline">
            Turn it 0n
          </Link>
          <a
            href="https://github.com/0nork/0nMCP"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost no-underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
