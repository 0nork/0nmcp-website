import type { Metadata } from 'next'
import Link from 'next/link'
import blogData from '@/data/blog-posts.json'

export const metadata: Metadata = {
  title: 'Blog — 0nMCP',
  description:
    'Release notes, tutorials, and deep-dives from the team building 0nMCP. 819 tools, 48 services, and growing.',
  openGraph: {
    title: 'Blog — 0nMCP',
    description:
      'Release notes, tutorials, and deep-dives from the team building 0nMCP.',
    url: 'https://0nmcp.com/blog',
    type: 'website',
  },
  alternates: { canonical: 'https://0nmcp.com/blog' },
}

const categoryMeta: Record<string, { label: string; color: string; bg: string }> = {
  release: { label: 'Release', color: '#7ed957', bg: 'rgba(126,217,87,0.12)' },
  tutorial: { label: 'Tutorial', color: '#00d4ff', bg: 'rgba(0,212,255,0.12)' },
  'deep-dive': { label: 'Deep Dive', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  news: { label: 'News', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  default: { label: 'Post', color: 'var(--text-secondary)', bg: 'var(--bg-card)' },
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function BlogPage() {
  const posts = [...blogData.posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog — 0nMCP',
    description: 'Release notes, tutorials, and deep-dives from the team building 0nMCP.',
    url: 'https://0nmcp.com/blog',
    publisher: {
      '@type': 'Organization',
      name: '0nMCP',
      url: 'https://0nmcp.com',
    },
    hasPart: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `https://0nmcp.com/blog/${p.slug}`,
      datePublished: p.date,
      author: { '@type': 'Person', name: p.author },
      description: p.excerpt,
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://0nmcp.com/blog' },
    ],
  }

  return (
    <div style={{ paddingTop: '7rem', paddingBottom: '6rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
          }}
        >
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--accent)' }}>Blog</span>
        </nav>

        {/* Header */}
        <div
          className="heading-glow"
          style={{ marginBottom: '1rem', textAlign: 'center' }}
        >
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              margin: 0,
            }}
          >
            The 0nMCP{' '}
            <span style={{ color: 'var(--accent)' }}>Blog</span>
          </h1>
        </div>

        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '1.0625rem',
            maxWidth: '560px',
            margin: '0 auto 3.5rem',
            lineHeight: 1.65,
          }}
        >
          Release notes, tutorials, and deep-dives from the team building the universal AI API orchestrator.
        </p>

        {/* Blog card hover styles */}
        <style>{`
          .blog-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 0.875rem;
            overflow: hidden;
            transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .blog-card:hover {
            border-color: var(--accent);
            transform: translateY(-3px);
            box-shadow: 0 0 20px rgba(126,217,87,0.12), 0 8px 32px rgba(0,0,0,0.3);
          }
        `}</style>

        {/* Post grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {posts.map((post, i) => {
            const cat = categoryMeta[post.category] ?? categoryMeta.default
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <article className="blog-card">
                  {/* Image area */}
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      overflow: 'hidden',
                      background: 'var(--bg-secondary)',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      width={800}
                      height={450}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      padding: '1.375rem',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    {/* Category + date row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          letterSpacing: '0.07em',
                          textTransform: 'uppercase',
                          color: cat.color,
                          background: cat.bg,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '0.3rem',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {cat.label}
                      </span>
                      <time
                        dateTime={post.date}
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {formatDate(post.date)}
                      </time>
                    </div>

                    {/* Title */}
                    <h2
                      style={{
                        fontSize: '1.0625rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.35,
                        margin: '0 0 0.625rem',
                      }}
                    >
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        margin: '0 0 1rem',
                        flex: 1,
                      }}
                    >
                      {post.excerpt}
                    </p>

                    {/* Author + read more */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {post.author}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--accent)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                        }}
                      >
                        Read &rarr;
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        {/* Footer nav */}
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <Link
            href="/"
            style={{
              fontSize: '0.875rem',
              color: 'var(--accent)',
              fontWeight: 700,
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
            }}
          >
            &larr; Back to 0nMCP
          </Link>
        </div>
      </div>
    </div>
  )
}
