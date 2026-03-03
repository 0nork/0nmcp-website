import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import blogData from '@/data/blog-posts.json'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  slug: string
  title: string
  date: string
  category: string
  author: string
  author_title: string
  image: string
  excerpt: string
  tags: string[]
  body: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryMeta: Record<string, { label: string; color: string; bg: string }> = {
  release: { label: 'Release', color: '#7ed957', bg: 'rgba(126,217,87,0.12)' },
  tutorial: { label: 'Tutorial', color: '#00d4ff', bg: 'rgba(0,212,255,0.12)' },
  'deep-dive': { label: 'Deep Dive', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  news: { label: 'News', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  default: { label: 'Post', color: '#8888a0', bg: 'rgba(136,136,160,0.1)' },
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getPost(slug: string): BlogPost | undefined {
  return blogData.posts.find((p) => p.slug === slug)
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function renderMarkdown(md: string): string {
  let html = md

  // Escape HTML special chars first (except in code blocks — we handle those separately)
  // We'll do code blocks first to protect their content, then process the rest

  // Fenced code blocks (``` ... ```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    const langAttr = lang ? ` data-lang="${lang}"` : ''
    return `<pre${langAttr}><code>${escaped}</code></pre>`
  })

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />')

  // H1
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  // H2
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  // H3
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  // H4
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')

  // Tables — simple 3-row detection (header | sep | rows)
  html = html.replace(
    /((?:\|.+\|\n)+)/g,
    (block) => {
      const rows = block.trim().split('\n')
      if (rows.length < 2) return block
      // Check second row is a separator
      if (!/^\|[\s\-|:]+\|$/.test(rows[1])) return block

      const headerCells = rows[0]
        .split('|')
        .filter((_, i, arr) => i > 0 && i < arr.length - 1)
        .map((c) => `<th>${c.trim()}</th>`)
        .join('')

      const bodyRows = rows
        .slice(2)
        .filter((r) => r.trim())
        .map((r) => {
          const cells = r
            .split('|')
            .filter((_, i, arr) => i > 0 && i < arr.length - 1)
            .map((c) => `<td>${c.trim()}</td>`)
            .join('')
          return `<tr>${cells}</tr>`
        })
        .join('\n')

      return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
    }
  )

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Unordered lists — collect consecutive - lines
  html = html.replace(/((?:^- .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^- /, '')}</li>`)
      .join('')
    return `<ul>${items}</ul>`
  })

  // Ordered lists — collect consecutive N. lines
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^\d+\. /, '')}</li>`)
      .join('')
    return `<ol>${items}</ol>`
  })

  // Inline code (single backtick) — after code blocks are safe
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>')

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Paragraphs — wrap lines that aren't already wrapped in block elements
  const blockTags = ['<h1', '<h2', '<h3', '<h4', '<ul', '<ol', '<li', '<pre', '<blockquote', '<table', '<hr', '<p']
  const lines = html.split('\n')
  const output: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      output.push('')
      i++
      continue
    }
    const isBlock = blockTags.some((tag) => trimmed.startsWith(tag))
    if (isBlock) {
      output.push(line)
      i++
      continue
    }
    // Collect paragraph lines
    const paraLines: string[] = [trimmed]
    i++
    while (i < lines.length && lines[i].trim() && !blockTags.some((tag) => lines[i].trim().startsWith(tag))) {
      paraLines.push(lines[i].trim())
      i++
    }
    output.push(`<p>${paraLines.join(' ')}</p>`)
  }

  return output.join('\n')
}

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return blogData.posts.map((p) => ({ slug: p.slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Post Not Found — 0nMCP' }

  return {
    title: `${post.title} — 0nMCP`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://0nmcp.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.image,
          width: 800,
          height: 450,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
    alternates: { canonical: `https://0nmcp.com/blog/${post.slug}` },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const posts = [...blogData.posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const currentIndex = posts.findIndex((p) => p.slug === post.slug)
  const prevPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null

  const cat = categoryMeta[post.category] ?? categoryMeta.default

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: `https://0nmcp.com${post.image}`,
    datePublished: post.date,
    dateModified: post.date,
    url: `https://0nmcp.com/blog/${post.slug}`,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.author_title,
      url: 'https://0nmcp.com/community',
    },
    publisher: {
      '@type': 'Organization',
      name: '0nMCP',
      url: 'https://0nmcp.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://0nmcp.com/brand/logo-full.jpg',
      },
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
    inLanguage: 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://0nmcp.com/blog/${post.slug}`,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://0nmcp.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://0nmcp.com/blog/${post.slug}` },
    ],
  }

  const htmlBody = renderMarkdown(post.body)

  return (
    <div
      style={{
        paddingTop: '7rem',
        paddingBottom: '6rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '2rem',
          }}
        >
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Blog
          </Link>
          <span>/</span>
          <span
            style={{
              color: 'var(--accent)',
              maxWidth: '240px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {post.title}
          </span>
        </nav>

        {/* Category badge */}
        <div style={{ marginBottom: '1rem' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: cat.color,
              background: cat.bg,
              padding: '0.2rem 0.6rem',
              borderRadius: '0.3rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {cat.label}
          </span>
        </div>

        {/* Title */}
        <div className="heading-glow" style={{ marginBottom: '1.25rem' }}>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {post.title}
          </h1>
        </div>

        {/* Author / date row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#0a0a0f',
                fontFamily: 'var(--font-mono)',
                flexShrink: 0,
              }}
            >
              {post.author.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {post.author}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {post.author_title}
              </div>
            </div>
          </div>
          <div
            style={{
              width: '1px',
              height: '24px',
              background: 'var(--border)',
            }}
          />
          <time
            dateTime={post.date}
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {formatDate(post.date)}
          </time>
        </div>

        {/* Hero image */}
        <div
          style={{
            width: '100%',
            borderRadius: '0.875rem',
            overflow: 'hidden',
            marginBottom: '2.5rem',
            border: '1px solid var(--border)',
          }}
        >
          <img
            src={post.image}
            alt={post.title}
            width={800}
            height={450}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Article body */}
        <article
          style={{
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            lineHeight: 1.75,
          }}
          dangerouslySetInnerHTML={{ __html: htmlBody }}
        />

        {/* Inline styles for article elements via a style tag */}
        <style>{`
          article h1 {
            font-size: 2rem;
            font-weight: 900;
            color: var(--text-primary);
            font-family: var(--font-display);
            letter-spacing: -0.03em;
            margin: 2.5rem 0 1rem;
            line-height: 1.2;
          }
          article h2 {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--text-primary);
            font-family: var(--font-display);
            letter-spacing: -0.02em;
            margin: 2.25rem 0 0.875rem;
            line-height: 1.3;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border);
          }
          article h3 {
            font-size: 1.1875rem;
            font-weight: 700;
            color: var(--text-primary);
            font-family: var(--font-display);
            margin: 1.75rem 0 0.625rem;
            line-height: 1.35;
          }
          article h4 {
            font-size: 1rem;
            font-weight: 700;
            color: var(--accent);
            font-family: var(--font-mono);
            margin: 1.5rem 0 0.5rem;
            letter-spacing: 0.02em;
          }
          article p {
            margin: 0 0 1.25rem;
            color: var(--text-secondary);
          }
          article strong {
            color: var(--text-primary);
            font-weight: 700;
          }
          article em {
            color: var(--text-secondary);
            font-style: italic;
          }
          article a {
            color: var(--accent);
            text-decoration: underline;
            text-decoration-color: rgba(126,217,87,0.4);
            text-underline-offset: 3px;
            transition: color 0.2s, text-decoration-color 0.2s;
          }
          article a:hover {
            color: var(--accent-dim);
            text-decoration-color: var(--accent-dim);
          }
          article code {
            font-family: var(--font-mono);
            font-size: 0.85em;
            background: rgba(126,217,87,0.08);
            color: var(--accent);
            padding: 0.15em 0.4em;
            border-radius: 0.25rem;
            border: 1px solid rgba(126,217,87,0.15);
          }
          article pre {
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 0.625rem;
            padding: 1.25rem 1.5rem;
            overflow-x: auto;
            margin: 1.5rem 0;
            position: relative;
          }
          article pre code {
            background: none;
            border: none;
            padding: 0;
            font-size: 0.8125rem;
            color: var(--text-primary);
            line-height: 1.6;
          }
          article pre[data-lang]::before {
            content: attr(data-lang);
            position: absolute;
            top: 0.5rem;
            right: 0.75rem;
            font-family: var(--font-mono);
            font-size: 0.625rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          article ul, article ol {
            margin: 0 0 1.25rem;
            padding-left: 1.5rem;
          }
          article li {
            margin-bottom: 0.375rem;
            color: var(--text-secondary);
            line-height: 1.65;
          }
          article li strong {
            color: var(--text-primary);
          }
          article blockquote {
            border-left: 3px solid var(--accent);
            padding-left: 1rem;
            margin: 1.5rem 0;
            color: var(--text-muted);
            font-style: italic;
          }
          article hr {
            border: none;
            border-top: 1px solid var(--border);
            margin: 2.5rem 0;
          }
          article table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.875rem;
            font-family: var(--font-mono);
          }
          .blog-nav-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 0.75rem;
            padding: 1rem 1.125rem;
            transition: border-color 0.2s ease;
          }
          .blog-nav-card:hover {
            border-color: var(--accent);
          }
          article th {
            background: var(--bg-secondary);
            color: var(--accent);
            font-weight: 700;
            padding: 0.625rem 0.875rem;
            border: 1px solid var(--border);
            text-align: left;
            font-size: 0.75rem;
            letter-spacing: 0.03em;
          }
          article td {
            padding: 0.5rem 0.875rem;
            border: 1px solid var(--border);
            color: var(--text-secondary);
            vertical-align: top;
          }
          article tr:nth-child(even) td {
            background: rgba(255,255,255,0.015);
          }
        `}</style>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '2.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            {post.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '0.3rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Prev / Next navigation */}
        {(prevPost || nextPost) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: prevPost && nextPost ? '1fr 1fr' : '1fr',
              gap: '1rem',
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            {prevPost && (
              <Link
                href={`/blog/${prevPost.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="blog-nav-card">
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: '0.375rem',
                    }}
                  >
                    &larr; Previous
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      lineHeight: 1.35,
                    }}
                  >
                    {prevPost.title}
                  </div>
                </div>
              </Link>
            )}
            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                style={{ textDecoration: 'none', gridColumnStart: prevPost ? 'auto' : 1 }}
              >
                <div className="blog-nav-card" style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: '0.375rem',
                    }}
                  >
                    Next &rarr;
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      lineHeight: 1.35,
                    }}
                  >
                    {nextPost.title}
                  </div>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Back to blog */}
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link
            href="/blog"
            style={{
              fontSize: '0.875rem',
              color: 'var(--accent)',
              fontWeight: 700,
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
            }}
          >
            &larr; All Posts
          </Link>
        </div>
      </div>
    </div>
  )
}
