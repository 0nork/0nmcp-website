'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { COMMANDS, CATEGORIES, type CommandCategory } from './commands'
import { CommandCard } from './CommandCard'
import { CategoryFilter } from './CategoryFilter'
import { SearchBar } from './SearchBar'

export default function CommandsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<CommandCategory | 'all'>('all')

  const handleSearch = useCallback((q: string) => setSearchQuery(q), [])
  const handleCategory = useCallback((cat: CommandCategory | 'all') => setActiveCategory(cat), [])

  const powerCommands = useMemo(() => COMMANDS.filter(c => c.isPower), [])

  const filteredCommands = useMemo(() => {
    let cmds = COMMANDS
    if (activeCategory !== 'all') {
      cmds = cmds.filter(c => c.category === activeCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      cmds = cmds.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q)) ||
        c.services.some(s => s.toLowerCase().includes(q))
      )
    }
    return cmds
  }, [activeCategory, searchQuery])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary, #07080c)',
      color: 'var(--text-primary, #fff)',
      fontFamily: "var(--font-display, 'Instrument Sans', system-ui, sans-serif)",
    }}>
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '0nMCP Command Library',
        description: `${COMMANDS.length} AI commands across ${Object.keys(CATEGORIES).length} categories. Copy-paste into Claude or Slack.`,
        url: 'https://www.0nmcp.com/commands',
        numberOfItems: COMMANDS.length,
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
          { '@type': 'ListItem', position: 2, name: 'Commands', item: 'https://www.0nmcp.com/commands' },
        ],
      }) }} />

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <div aria-hidden="true" style={{
          position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 600,
          background: 'radial-gradient(ellipse, rgba(110, 224, 90, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', padding: '0 1.5rem' }}>
          <nav style={{
            fontSize: '0.75rem', color: 'var(--text-muted, #555)',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color: '#6EE05A' }}>Commands</span>
          </nav>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(110,224,90,0.08)', border: '1px solid rgba(110,224,90,0.2)',
            borderRadius: 20, padding: '6px 16px',
            fontSize: '0.8125rem', color: '#6EE05A',
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            marginBottom: '1.5rem',
          }}>
            96 services · 1,554 tools · one command
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 6vw, 3.5rem)', fontWeight: 900,
            lineHeight: 1.1, margin: '0 0 1rem', letterSpacing: '-0.02em',
          }}>
            The 0nMCP{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6EE05A, #00d4ff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Command Library
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--text-secondary, rgba(255,255,255,0.5))',
            maxWidth: 640, margin: '0 auto 2rem', lineHeight: 1.6,
          }}>
            Copy any command below. Paste into Claude Desktop, Claude Code, or Slack.
            0nMCP handles the rest — pulling live data from every service in your stack.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {[
              { value: String(COMMANDS.length), label: 'commands' },
              { value: String(Object.keys(CATEGORIES).length), label: 'categories' },
              { value: '96', label: 'services' },
              { value: String(COMMANDS.filter(c => c.isFree).length), label: 'free' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.75rem', fontWeight: 800, color: '#6EE05A',
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.6875rem', color: 'var(--text-muted, #555)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.75rem 1.75rem', background: '#6EE05A', color: '#0a0a0a',
                fontWeight: 700, fontSize: '0.9375rem', borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              Connect Claude Desktop
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
            </Link>
            <a
              href="#library"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.75rem 1.75rem',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
                color: 'var(--text-primary, #fff)', textDecoration: 'none',
                fontSize: '0.9375rem',
              }}
            >
              Browse Commands
            </a>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #555)', marginTop: 12 }}>
            Free to start. No credit card.
          </p>
        </div>
      </section>

      {/* POWER COMMANDS */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <h2 style={{
            fontSize: '0.75rem', fontWeight: 700, color: '#6EE05A',
            textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          }}>
            Power Commands
          </h2>
          <div style={{
            height: 1, flex: 1,
            background: 'linear-gradient(to right, rgba(110,224,90,0.2), transparent)',
          }} />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))',
          gap: 16,
        }}>
          {powerCommands.map(cmd => (
            <CommandCard key={cmd.id} command={cmd} featured />
          ))}
        </div>
      </section>

      {/* FULL LIBRARY */}
      <section id="library" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
          <h2 style={{
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #555)',
            textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          }}>
            All Commands
          </h2>
          <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            fontSize: '0.6875rem', color: 'var(--text-muted, #555)',
          }}>
            {filteredCommands.length} result{filteredCommands.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1.5rem' }}>
          <SearchBar onSearch={handleSearch} />
          <CategoryFilter categories={CATEGORIES} active={activeCategory} onSelect={handleCategory} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))',
          gap: 12,
        }}>
          {filteredCommands.map(cmd => (
            <CommandCard key={cmd.id} command={cmd} />
          ))}
        </div>

        {filteredCommands.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            color: 'var(--text-muted, #555)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 8, opacity: 0.3 }}>
              /
            </div>
            <p style={{ fontSize: '0.875rem' }}>
              No commands match your search. Try a different keyword or category.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
