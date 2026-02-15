import Link from 'next/link'

interface CapabilityHeroProps {
  triggerName: string
  actionName: string
  description: string
  slug: string
}

export default function CapabilityHero({
  triggerName,
  actionName,
  description,
}: CapabilityHeroProps) {
  return (
    <section className="py-20 md:py-28">
      <div className="section-container text-center">
        <div className="inline-block mb-6">
          <span
            className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent)',
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.2)',
            }}
          >
            Turn it 0n
          </span>
        </div>

        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          style={{ letterSpacing: '-0.03em' }}
        >
          Connect{' '}
          <span style={{ color: 'var(--accent)' }}>{triggerName}</span>
          {actionName && (
            <>
              {' '}to{' '}
              <span style={{ color: 'var(--accent)' }}>{actionName}</span>
            </>
          )}
        </h1>

        <p
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="#how-it-works" className="btn-accent text-base px-8 py-3">
            Turn it 0n &rarr;
          </Link>
          <Link
            href="/turn-it-on"
            className="btn-ghost text-base px-8 py-3"
          >
            All Integrations
          </Link>
        </div>
      </div>
    </section>
  )
}
