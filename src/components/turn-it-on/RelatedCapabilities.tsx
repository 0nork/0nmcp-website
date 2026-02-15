import Link from 'next/link'

interface RelatedCapability {
  slug: string
  name: string
}

interface RelatedCapabilitiesProps {
  title: string
  capabilities: RelatedCapability[]
}

export default function RelatedCapabilities({
  title,
  capabilities,
}: RelatedCapabilitiesProps) {
  if (capabilities.length === 0) return null

  return (
    <div className="mb-12">
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {capabilities.map((cap) => (
          <Link
            key={cap.slug}
            href={`/turn-it-on/${cap.slug}`}
            className="glow-box group"
            style={{ textDecoration: 'none' }}
          >
            <span
              className="text-sm font-medium block transition-colors duration-200"
              style={{ color: 'var(--text-primary)' }}
            >
              {cap.name}
            </span>
            <span
              className="text-xs mt-2 block"
              style={{ color: 'var(--text-muted)' }}
            >
              Turn it 0n &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
