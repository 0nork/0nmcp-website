'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import blogData from '@/data/blog-posts.json'

/**
 * 0n Blog Slider — Featured articles carousel for homepage
 * Auto-advances every 5s, manual nav, featured images, read more links
 */

interface BlogPost {
  slug: string
  title: string
  date: string
  category: string
  author: string
  image: string
  excerpt: string
}

const CATEGORY_COLORS: Record<string, string> = {
  security: '#ef4444',
  integration: '#06b6d4',
  comparison: '#f97316',
  release: '#6EE05A',
  'deep-dive': '#a78bfa',
  tutorial: '#00d4ff',
}

export default function BlogSlider() {
  const posts = (blogData.posts as BlogPost[]).slice(0, 6)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % posts.length)
  }, [posts.length])

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + posts.length) % posts.length)
  }, [posts.length])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [paused, next])

  const post = posts[current]
  if (!post) return null
  const catColor = CATEGORY_COLORS[post.category] || '#6EE05A'

  return (
    <section
      className="blog-slider-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        .blog-slider-section {
          padding: 4rem 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .blog-slider-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .blog-slider-title {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted, #9ca3af);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .blog-slider-title::after {
          content: '';
          display: block;
          width: 80px;
          height: 1px;
          background: var(--border, #e5e7eb);
        }
        .blog-slider-nav {
          display: flex;
          gap: 0.5rem;
        }
        .blog-slider-nav button {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #555;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-family: inherit;
        }
        .blog-slider-nav button:hover {
          border-color: #6EE05A;
          color: #6EE05A;
          box-shadow: 0 2px 8px rgba(110,224,90,0.15);
        }

        .blog-slider-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          transition: box-shadow 0.3s;
          min-height: 300px;
        }
        .blog-slider-card:hover {
          box-shadow: 0 8px 40px rgba(0,0,0,0.1);
        }

        .blog-slider-img {
          position: relative;
          overflow: hidden;
          background: #f3f4f6;
          min-height: 300px;
        }
        .blog-slider-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .blog-slider-card:hover .blog-slider-img img {
          transform: scale(1.03);
        }
        .blog-slider-img-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(transparent, rgba(0,0,0,0.3));
        }

        .blog-slider-content {
          padding: 2rem 2rem 2rem 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .blog-slider-cat {
          display: inline-block;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 0.25rem 0.625rem;
          border-radius: 5px;
          margin-bottom: 0.75rem;
          width: fit-content;
        }
        .blog-slider-post-title {
          font-size: clamp(1.125rem, 2.5vw, 1.5rem);
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1.3;
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
        }
        .blog-slider-excerpt {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 1.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-slider-meta {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-bottom: 1.25rem;
        }
        .blog-slider-read {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #6EE05A;
          text-decoration: none;
          transition: gap 0.2s;
        }
        .blog-slider-read:hover {
          gap: 0.625rem;
        }

        /* Dots */
        .blog-slider-dots {
          display: flex;
          justify-content: center;
          gap: 0.375rem;
          margin-top: 1.25rem;
        }
        .blog-slider-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e5e7eb;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s;
        }
        .blog-slider-dot.active {
          background: #6EE05A;
          width: 24px;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .blog-slider-card {
            grid-template-columns: 1fr;
          }
          .blog-slider-img {
            min-height: 200px;
            max-height: 220px;
          }
          .blog-slider-content {
            padding: 1.25rem;
          }
        }
      `}</style>

      <div className="blog-slider-header">
        <span className="blog-slider-title">Featured Articles</span>
        <div className="blog-slider-nav">
          <button onClick={prev} aria-label="Previous article">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={next} aria-label="Next article">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div className="blog-slider-card" key={post.slug}>
        <div className="blog-slider-img">
          <img src={post.image} alt={post.title} width={600} height={400} />
          <div className="blog-slider-img-overlay" />
        </div>
        <div className="blog-slider-content">
          <span className="blog-slider-cat" style={{ color: catColor, background: `${catColor}15` }}>
            {post.category}
          </span>
          <h3 className="blog-slider-post-title">{post.title}</h3>
          <p className="blog-slider-excerpt">{post.excerpt}</p>
          <div className="blog-slider-meta">
            {post.author} &middot; {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <Link href={`/blog/${post.slug}`} className="blog-slider-read">
            Read Article
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </div>

      <div className="blog-slider-dots">
        {posts.map((_, i) => (
          <button
            key={i}
            className={`blog-slider-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
