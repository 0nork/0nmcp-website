import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import blogData from '@/data/blog-posts.json'
import { STATS_DISPLAY } from '@/data/stats'
import ReadingProgressBar from '@/components/ReadingProgressBar'
import CodeCopyInit from '@/components/CodeCopyInit'

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
  release: { label: 'Release', color: '#6EE05A', bg: 'rgba(110,224,90,0.12)' },
  tutorial: { label: 'Tutorial', color: '#00d4ff', bg: 'rgba(0,212,255,0.12)' },
  'deep-dive': { label: 'Deep Dive', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  news: { label: 'News', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  comparison: { label: 'Comparison', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  security: { label: 'Security', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  integration: { label: 'Integration', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  default: { label: 'Post', color: '#6EE05A', bg: 'rgba(110,224,90,0.08)' },
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function extractH2Headings(md: string): { text: string; id: string }[] {
  const headings: { text: string; id: string }[] = []
  const lines = md.split('\n')
  for (const line of lines) {
    const match = line.match(/^## (.+)$/)
    if (match) {
      const text = match[1].replace(/\*\*/g, '').replace(/\*/g, '').trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      headings.push({ text, id })
    }
  }
  return headings
}

async function getPost(slug: string): Promise<BlogPost | undefined> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) {
    try {
      const admin = createClient(url, key)
      const { data } = await admin
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()
      if (data) {
        return {
          slug: data.slug,
          title: data.title,
          date: (data.published_at || data.created_at || '')?.split('T')[0],
          category: data.category || 'news',
          author: data.author || 'Mike Mento',
          author_title: data.author_title || 'Founder, RocketOpp LLC',
          image: data.image || `/blog/${data.slug}.svg`,
          excerpt: data.excerpt || data.meta_description || '',
          tags: data.tags || [],
          body: data.body || data.content || '',
        }
      }
    } catch { /* fallback to JSON */ }
  }
  return (blogData.posts as BlogPost[]).find((p) => p.slug === slug)
}

async function getAllPosts(): Promise<BlogPost[]> {
  let dbPosts: BlogPost[] = []
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) {
    try {
      const admin = createClient(url, key)
      const { data } = await admin
        .from('blog_posts')
        .select('slug, title, published_at, created_at, category, image, excerpt, tags')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
      dbPosts = (data || []).map((p: any) => ({
        slug: p.slug,
        title: p.title,
        date: (p.published_at || p.created_at || '')?.split('T')[0],
        category: p.category || 'news',
        author: '', author_title: '', image: p.image || '', excerpt: p.excerpt || '', tags: p.tags || [], body: '',
      }))
    } catch { /* fallback */ }
  }
  const dbSlugs = new Set(dbPosts.map(p => p.slug))
  return [
    ...dbPosts,
    ...(blogData.posts as BlogPost[]).filter(p => !dbSlugs.has(p.slug)),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function renderMarkdown(md: string): string {
  // Strip the first H1 (title) — it's already rendered above the article
  let html = md.replace(/^# .+$/m, '')

  // Fenced code blocks
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

  // H2 with anchor IDs
  html = html.replace(/^## (.+)$/gm, (_match, text) => {
    const clean = text.replace(/\*\*/g, '').replace(/\*/g, '').trim()
    const id = clean
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    return `<h2 id="${id}">${text}</h2>`
  })

  // H1
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  // H3
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  // H4
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')

  // Tables
  html = html.replace(
    /((?:\|.+\|\n)+)/g,
    (block) => {
      const rows = block.trim().split('\n')
      if (rows.length < 2) return block
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
      return `<div class="table-wrap"><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`
    }
  )

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Unordered lists
  html = html.replace(/((?:^- .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^- /, '')}</li>`)
      .join('')
    return `<ul>${items}</ul>`
  })

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^\d+\. /, '')}</li>`)
      .join('')
    return `<ol>${items}</ol>`
  })

  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>')
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Paragraphs
  const blockTags = ['<h1', '<h2', '<h3', '<h4', '<ul', '<ol', '<li', '<pre', '<blockquote', '<table', '<div class="table-wrap"', '<hr', '<p']
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
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found — 0nMCP' }

  return {
    title: `${post.title} — 0nMCP`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.0nmcp.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: `https://www.0nmcp.com${post.image}`,
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
      images: [`https://www.0nmcp.com${post.image}`],
    },
    alternates: { canonical: `https://www.0nmcp.com/blog/${post.slug}` },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const allPosts = await getAllPosts()
  const cat = categoryMeta[post.category] ?? categoryMeta.default
  const readingTime = estimateReadingTime(post.body)
  const headings = extractH2Headings(post.body)
  const htmlBody = renderMarkdown(post.body)

  // Collect all unique categories
  const allCategories = Array.from(new Set(allPosts.map(p => p.category))).sort()

  // Collect all unique tags
  const allTags = Array.from(new Set(allPosts.flatMap(p => p.tags))).sort()

  // Popular posts (first 5)
  const popularPosts = allPosts.slice(0, 5)

  // Related posts: same category, excluding current, up to 4
  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 4)
  // If not enough, fill with recent posts from other categories
  const fillerPosts = relatedPosts.length < 3
    ? allPosts.filter(p => p.slug !== post.slug && !relatedPosts.find(r => r.slug === p.slug)).slice(0, 3 - relatedPosts.length)
    : []
  const related = [...relatedPosts, ...fillerPosts].slice(0, 4)

  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: `https://www.0nmcp.com${post.image}`,
    datePublished: post.date,
    dateModified: post.date,
    url: `https://www.0nmcp.com/blog/${post.slug}`,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.author_title,
      url: 'https://www.0nmcp.com/community',
    },
    publisher: {
      '@type': 'Organization',
      name: '0nMCP',
      url: 'https://www.0nmcp.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.0nmcp.com/brand/logo-full.jpg',
      },
    },
    thumbnailUrl: `https://www.0nmcp.com${post.image}`,
    keywords: post.tags.join(', '),
    articleSection: post.category,
    inLanguage: 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.0nmcp.com/blog/${post.slug}`,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.0nmcp.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://www.0nmcp.com/blog/${post.slug}` },
    ],
  }

  return (
    <>
      <ReadingProgressBar />
      <CodeCopyInit />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <style>{`
        .blog-layout {
          padding: 7rem 1.5rem 6rem;
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 220px minmax(0, 680px) 260px;
          gap: 2rem;
          align-items: start;
          justify-content: center;
        }
        @media (max-width: 1200px) {
          .blog-layout {
            grid-template-columns: minmax(0, 680px) 240px;
            gap: 1.75rem;
            padding: 6rem 1.25rem 4rem;
          }
          .blog-sidebar-left { display: none; }
        }
        @media (max-width: 860px) {
          .blog-layout {
            grid-template-columns: minmax(0, 1fr);
            gap: 2rem;
            padding: 5.5rem 1rem 3rem;
            max-width: 680px;
          }
          .blog-sidebar-left { display: none; }
          .blog-sidebar-right { order: 2; }
        }
        @media (max-width: 480px) {
          .blog-layout {
            padding: 4.5rem 0.75rem 2.5rem;
          }
        }

        /* ─── Breadcrumb ─── */
        .blog-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
        }
        .blog-breadcrumb a {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color 0.2s;
        }
        .blog-breadcrumb a:hover {
          color: #6EE05A;
        }
        .blog-breadcrumb .current {
          color: rgba(255,255,255,0.7);
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ─── Featured image — 3D depth ─── */
        .blog-hero-img {
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 2rem;
          box-shadow:
            0 8px 30px rgba(0,0,0,0.12),
            0 2px 8px rgba(0,0,0,0.08),
            0 20px 60px rgba(0,0,0,0.06);
          transform: perspective(1000px) rotateX(1deg);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          position: relative;
        }
        .blog-hero-img::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          border: 1px solid var(--border);
          pointer-events: none;
        }
        .blog-hero-img:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-2px);
          box-shadow:
            0 12px 40px rgba(0,0,0,0.15),
            0 4px 12px rgba(0,0,0,0.1),
            0 30px 80px rgba(0,0,0,0.08);
        }
        .blog-hero-img img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* ─── Title ─── */
        .blog-title {
          font-size: clamp(1.6rem, 3.5vw, 2rem);
          font-weight: 900;
          background: linear-gradient(135deg, #6EE05A 0%, #14b8a6 50%, #8b5cf6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          line-height: 1.25;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }

        /* ─── Meta line ─── */
        .blog-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .blog-meta-author {
          font-weight: 600;
          color: #ffffff;
        }
        .blog-meta-sep {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          flex-shrink: 0;
        }

        /* ─── Category badge ─── */
        .blog-cat-badge {
          display: inline-block;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.2rem 0.6rem;
          border-radius: 0.3rem;
          margin-bottom: 0.75rem;
        }

        /* ─── Article body ─── */
        .blog-article {
          color: #ffffff;
          font-size: 1rem;
          line-height: 1.8;
        }
        .blog-article h1,
        .blog-article h2,
        .blog-article h3 {
          background: linear-gradient(135deg, #6EE05A 0%, #14b8a6 50%, #8b5cf6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .blog-article h1 {
          font-size: 1.75rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin: 2.5rem 0 1rem;
          line-height: 1.25;
        }
        .blog-article h2 {
          font-size: 1.375rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin: 2.25rem 0 0.875rem;
          line-height: 1.3;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid rgba(110,224,90,0.15);
        }
        .blog-article h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 1.75rem 0 0.625rem;
          line-height: 1.35;
        }
        .blog-article h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #6EE05A;
          margin: 1.5rem 0 0.5rem;
          letter-spacing: 0.01em;
        }
        .blog-article p {
          margin: 0 0 1.25rem;
          color: #ffffff;
        }
        .blog-article strong {
          color: #6EE05A;
          font-weight: 700;
        }
        .blog-article em {
          color: #ffffff;
          font-style: italic;
        }
        .blog-article a {
          color: #6EE05A;
          text-decoration: underline;
          text-decoration-color: rgba(110,224,90,0.4);
          text-underline-offset: 3px;
          transition: color 0.2s, text-decoration-color 0.2s;
        }
        .blog-article a:hover {
          color: #5cb83a;
          text-decoration-color: #5cb83a;
        }
        .blog-article code {
          font-size: 0.84em;
          background: rgba(110,224,90,0.08);
          color: #6EE05A;
          padding: 0.15em 0.5em;
          border-radius: 5px;
          border: 1px solid rgba(110,224,90,0.2);
          font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
        }

        /* ── 0nMCP Console — Branded Code Block ── */
        .blog-article pre {
          background: #1a1f2e;
          border: 1px solid #2a3040;
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          margin: 1.75rem 0;
          position: relative;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);
        }
        .blog-article pre::before {
          content: '';
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.75rem 1rem 0.625rem;
          background: #151923;
          border-bottom: 1px solid #2a3040;
          /* Traffic light dots */
          background-image:
            radial-gradient(circle 5px at 16px 50%, #ff5f57 5px, transparent 5px),
            radial-gradient(circle 5px at 32px 50%, #ffbd2e 5px, transparent 5px),
            radial-gradient(circle 5px at 48px 50%, #28c940 5px, transparent 5px);
          background-repeat: no-repeat;
          min-height: 32px;
        }
        .blog-article pre::after {
          content: '0nMCP Console';
          position: absolute;
          top: 0;
          left: 64px;
          padding: 0.625rem 0.75rem;
          font-size: 0.5625rem;
          color: #3a4250;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.05em;
          line-height: 32px;
        }
        .blog-article pre[data-lang]::after {
          content: attr(data-lang) ' — 0nMCP Console';
        }
        .blog-article pre code {
          display: block;
          background: none;
          border: none;
          padding: 1rem 1.25rem 1.25rem;
          font-size: 0.8125rem;
          color: #e2e8f0;
          line-height: 1.7;
          font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
          overflow-x: auto;
        }
        /* ── Copy Code Button (injected by CodeCopyInit) ── */
        .on-copy-code-btn {
          position: absolute;
          top: 6px;
          right: 8px;
          padding: 4px 10px;
          background: var(--border);
          color: #556880;
          font-size: 0.625rem;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.04em;
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 5;
          line-height: 20px;
        }
        .on-copy-code-btn:hover {
          background: rgba(110,224,90,0.12);
          color: #6EE05A;
          border-color: rgba(110,224,90,0.25);
        }
        .on-copy-code-btn.copied {
          background: rgba(110,224,90,0.2);
          color: #6EE05A;
          border-color: rgba(110,224,90,0.3);
        }
        .blog-article ul, .blog-article ol {
          margin: 0 0 1.25rem;
          padding-left: 1.5rem;
        }
        .blog-article li {
          margin-bottom: 0.375rem;
          color: #ffffff;
          line-height: 1.7;
        }
        .blog-article li strong {
          color: #6EE05A;
        }
        .blog-article blockquote {
          border-left: 3px solid #6EE05A;
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: rgba(255,255,255,0.7);
          font-style: italic;
        }
        .blog-article hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 2.5rem 0;
        }
        .blog-article .table-wrap {
          overflow-x: auto;
          margin: 1.5rem 0;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .blog-article table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .blog-article th {
          background: rgba(110,224,90,0.08);
          color: #6EE05A;
          font-weight: 700;
          padding: 0.625rem 0.875rem;
          border-bottom: 2px solid rgba(110,224,90,0.2);
          text-align: left;
          font-size: 0.8rem;
          letter-spacing: 0.02em;
        }
        .blog-article td {
          padding: 0.5rem 0.875rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          color: #ffffff;
          vertical-align: top;
        }
        .blog-article tr:last-child td {
          border-bottom: none;
        }

        /* ─── Tags ─── */
        .blog-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .blog-tag {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 4px 12px;
          border-radius: 6px;
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }
        .blog-tag:hover {
          background: rgba(110,224,90,0.08);
          border-color: rgba(110,224,90,0.2);
          color: #6EE05A;
        }

        /* ─── Author box ─── */
        .blog-author-box {
          margin-top: 2.5rem;
          padding: 1.75rem;
          background: rgba(15,17,23,0.7);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
        }
        .blog-author-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #6EE05A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
          font-weight: 800;
          color: #07080C;
          flex-shrink: 0;
        }
        .blog-author-name {
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.125rem;
        }
        .blog-author-title {
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.5);
          margin: 0 0 0.5rem;
        }
        .blog-author-bio {
          font-size: 0.875rem;
          color: #ffffff;
          line-height: 1.6;
          margin: 0;
        }

        /* ─── Discuss link ─── */
        .blog-discuss {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(15,17,23,0.7);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .blog-discuss h3 {
          font-size: 1.0625rem;
          font-weight: 700;
          background: linear-gradient(135deg, #6EE05A 0%, #14b8a6 50%, #8b5cf6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          margin: 0 0 0.5rem;
        }
        .blog-discuss p {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.7);
          margin: 0 0 1rem;
          line-height: 1.5;
        }
        .blog-discuss a {
          display: inline-block;
          font-size: 0.875rem;
          font-weight: 700;
          color: #6EE05A;
          text-decoration: none;
          transition: color 0.2s;
        }
        .blog-discuss a:hover {
          color: #5cb83a;
        }

        /* ─── Related posts ─── */
        .blog-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
          margin-top: 1.25rem;
        }
        .blog-related-card {
          background: rgba(15,17,23,0.7);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 1.25rem;
          text-decoration: none;
          transition: box-shadow 0.25s, border-color 0.25s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .blog-related-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
          border-color: rgba(110,224,90,0.3);
        }
        .blog-related-card-cat {
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .blog-related-card-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.35;
          margin: 0;
        }
        .blog-related-card-date {
          font-size: 0.6875rem;
          color: rgba(255,255,255,0.4);
          margin-top: 0.5rem;
        }

        /* ─── Left Sidebar (TOC) — Glassmorphic Dark ─── */
        .blog-sidebar-left {
          position: sticky;
          top: 5.5rem;
          max-height: calc(100vh - 6rem);
          overflow-y: auto;
        }
        .sidebar-toc {
          background: rgba(15,17,23,0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 1.25rem 1.375rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .sidebar-toc h4 {
          font-size: 0.6875rem;
          font-weight: 800;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(110,224,90,0.2);
        }
        .sidebar-toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sidebar-toc-list li {
          margin-bottom: 0.125rem;
        }
        .sidebar-toc-list a {
          display: block;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          padding: 0.35rem 0.625rem;
          border-radius: 8px;
          line-height: 1.4;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          border-left: 2px solid transparent;
        }
        .sidebar-toc-list a:hover {
          color: #6EE05A;
          background: rgba(110,224,90,0.06);
          border-left-color: #6EE05A;
          transform: translateX(2px);
        }

        /* ─── Right Sidebar — Glassmorphic Dark ─── */
        .blog-sidebar-right {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .sidebar-card {
          background: rgba(15,17,23,0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 1.25rem 1.375rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .sidebar-card:hover {
          border-color: rgba(110,224,90,0.12);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(110,224,90,0.03);
        }
        .sidebar-card h4 {
          font-size: 0.75rem;
          font-weight: 800;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 1rem;
          padding-bottom: 0.625rem;
          border-bottom: 1px solid rgba(110,224,90,0.15);
        }

        /* ─── CTA Card — Glassmorphic + Green Glow ─── */
        .sidebar-cta {
          background: rgba(15,17,23,0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(110,224,90,0.15);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          position: sticky;
          top: 5.5rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 30px rgba(110,224,90,0.05);
        }
        .sidebar-cta-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(110,224,90,0.1);
          border: 1px solid rgba(110,224,90,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.875rem;
          font-size: 1.25rem;
        }
        .sidebar-cta h4 {
          font-size: 1rem;
          font-weight: 800;
          color: #E8ECF4;
          margin: 0 0 0.5rem;
          border: none;
          padding: 0;
          text-transform: none;
          letter-spacing: -0.01em;
        }
        .sidebar-cta p {
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.4);
          line-height: 1.55;
          margin: 0 0 1rem;
        }
        .sidebar-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.625rem 1.25rem;
          border-radius: 10px;
          background: #6EE05A;
          color: #07080C;
          font-size: 0.8125rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 2px 16px rgba(110,224,90,0.25);
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
          width: 100%;
          justify-content: center;
        }
        .sidebar-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(110,224,90,0.35);
        }
        .sidebar-cta-secondary {
          display: block;
          margin-top: 0.625rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          font-size: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
        }
        .sidebar-cta-secondary:hover {
          border-color: rgba(110,224,90,0.3);
          color: #6EE05A;
          background: rgba(110,224,90,0.05);
        }
        .sidebar-cta-stats {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-cta-stat {
          text-align: center;
        }
        .sidebar-cta-stat-value {
          font-size: 0.875rem;
          font-weight: 800;
          color: #6EE05A;
          font-family: 'JetBrains Mono', monospace;
        }
        .sidebar-cta-stat-label {
          font-size: 0.5625rem;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        /* ─── Categories widget ─── */
        .sidebar-cat-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sidebar-cat-list li {
          margin-bottom: 0.125rem;
        }
        .sidebar-cat-list a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          padding: 0.4rem 0.625rem;
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        .sidebar-cat-list a:hover {
          color: #6EE05A;
          background: rgba(110,224,90,0.06);
          transform: translateX(2px);
        }
        .sidebar-cat-count {
          font-size: 0.6875rem;
          color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.05);
          padding: 2px 8px;
          border-radius: 10px;
        }

        /* ─── Popular posts widget ─── */
        .sidebar-popular-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sidebar-popular-list li {
          margin-bottom: 0.375rem;
        }
        .sidebar-popular-list a {
          display: block;
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          padding: 0.4rem 0.625rem;
          border-radius: 8px;
          line-height: 1.4;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        .sidebar-popular-list a:hover {
          color: #6EE05A;
          background: rgba(110,224,90,0.06);
          transform: translateX(2px);
        }
        .sidebar-popular-date {
          font-size: 0.6875rem;
          color: rgba(255,255,255,0.2);
          margin-top: 0.125rem;
        }

        /* ─── Tags cloud ─── */
        .sidebar-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }
        .sidebar-tag {
          font-size: 0.6875rem;
          color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 4px 12px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .sidebar-tag:hover {
          background: rgba(110,224,90,0.08);
          border-color: rgba(110,224,90,0.2);
          color: #6EE05A;
        }
      `}</style>

      <div className="blog-layout">
        {/* ─── Left Sidebar: Table of Contents ─── */}
        <aside className="blog-sidebar-left">
          {headings.length > 0 && (
            <div className="sidebar-toc">
              <h4>On This Page</h4>
              <ul className="sidebar-toc-list">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* ─── Center: Article Content ─── */}
        <main>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="blog-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span className="current">{post.title}</span>
          </nav>

          {/* Featured image */}
          <div className="blog-hero-img">
            <img
              src={post.image}
              alt={post.title}
              width={800}
              height={450}
            />
          </div>

          {/* Category badge */}
          <span
            className="blog-cat-badge"
            style={{ color: cat.color, background: cat.bg }}
          >
            {cat.label}
          </span>

          {/* Title */}
          <h1 className="blog-title">{post.title}</h1>

          {/* Meta line */}
          <div className="blog-meta">
            <span className="blog-meta-author">{post.author}</span>
            <span className="blog-meta-sep" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="blog-meta-sep" />
            <span>{readingTime} min read</span>
          </div>

          {/* Article body */}
          <article
            className="blog-article"
            dangerouslySetInnerHTML={{ __html: htmlBody }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="blog-tags">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="blog-tag"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Author box */}
          <div className="blog-author-box">
            <div className="blog-author-avatar">
              {post.author.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="blog-author-name">{post.author}</p>
              <p className="blog-author-title">Founder, RocketOpp LLC</p>
              <p className="blog-author-bio">
                Building 0nMCP — the universal AI orchestrator with 900+ tools across 55 services.
                Turning complex business operations into single commands.
              </p>
            </div>
          </div>

          {/* Discuss in forum */}
          <div className="blog-discuss">
            <h3>Leave a Reply</h3>
            <p>Join the conversation in our community forum.</p>
            <Link href="/forum">
              Discuss this post in our community forum &rarr;
            </Link>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: '0 0 0.25rem',
              }}>
                Related Posts
              </h3>
              <div className="blog-related-grid">
                {related.map((rp) => {
                  const rpCat = categoryMeta[rp.category] ?? categoryMeta.default
                  return (
                    <Link
                      key={rp.slug}
                      href={`/blog/${rp.slug}`}
                      className="blog-related-card"
                    >
                      <div
                        className="blog-related-card-cat"
                        style={{ color: rpCat.color }}
                      >
                        {rpCat.label}
                      </div>
                      <p className="blog-related-card-title">{rp.title}</p>
                      <div className="blog-related-card-date">{formatDate(rp.date)}</div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Back to blog */}
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <Link
              href="/blog"
              style={{
                fontSize: '0.875rem',
                color: '#6EE05A',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              &larr; All Posts
            </Link>
          </div>
        </main>

        {/* ─── Right Sidebar: Discovery + CTA (CTA last, sticky) ─── */}
        <aside className="blog-sidebar-right">
          {/* Categories */}
          <div className="sidebar-card">
            <h4>Categories</h4>
            <ul className="sidebar-cat-list">
              {allCategories.map((c) => {
                const cm = categoryMeta[c] ?? categoryMeta.default
                const count = allPosts.filter(p => p.category === c).length
                return (
                  <li key={c}>
                    <Link href={`/blog?category=${encodeURIComponent(c)}`}>
                      <span>{cm.label}</span>
                      <span className="sidebar-cat-count">{count}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Popular Posts */}
          <div className="sidebar-card">
            <h4>Popular Posts</h4>
            <ul className="sidebar-popular-list">
              {popularPosts.map((pp) => (
                <li key={pp.slug}>
                  <Link href={`/blog/${pp.slug}`}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pp.title}</div>
                    <div className="sidebar-popular-date">{formatDate(pp.date)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tags Cloud */}
          <div className="sidebar-card">
            <h4>Tags</h4>
            <div className="sidebar-tags">
              {allTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="sidebar-tag"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Account CTA — Last widget, sticky when scrolled to */}
          <div className="sidebar-cta">
            <div className="sidebar-cta-icon">
              <svg width="24" height="24" fill="none" stroke="#6EE05A" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h4>Get {STATS_DISPLAY.tools} AI Tools</h4>
            <p>
              Install 0nMCP once. Use it everywhere — Claude, Cursor, VS Code, WordPress, and {STATS_DISPLAY.services} more services.
            </p>
            <Link href="/start" className="sidebar-cta-btn">
              Turn It 0n — Free
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <Link href="/signup" className="sidebar-cta-secondary">
              Create Free Account
            </Link>
            <div className="sidebar-cta-stats">
              <div className="sidebar-cta-stat">
                <div className="sidebar-cta-stat-value">{STATS_DISPLAY.tools}</div>
                <div className="sidebar-cta-stat-label">Tools</div>
              </div>
              <div className="sidebar-cta-stat">
                <div className="sidebar-cta-stat-value">{STATS_DISPLAY.services}</div>
                <div className="sidebar-cta-stat-label">Services</div>
              </div>
              <div className="sidebar-cta-stat">
                <div className="sidebar-cta-stat-value">{STATS_DISPLAY.patents}</div>
                <div className="sidebar-cta-stat-label">Patents</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
