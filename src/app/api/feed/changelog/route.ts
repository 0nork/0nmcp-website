import { NextRequest, NextResponse } from 'next/server'
import { createBaseFeed, renderFeed, SITE_URL } from '@/lib/rss'

export const dynamic = 'force-dynamic'

/** 0nMCP platform changelog feed */
const CHANGELOG = [
  {
    version: '2.3.0',
    date: '2026-03-06',
    title: '0nMCP v2.3.0 — 877 Tools, 54 Services, RSS Engine',
    body: `Added RSS feed infrastructure (inbound + outbound), 0nMonitor + 0nUpdater agents, white-label SXO content feeds, and 6 new services. Total: 877 tools across 54 services.`,
    tags: ['release', 'rss', 'monitoring', 'sxo'],
  },
  {
    version: '2.2.0',
    date: '2026-03-01',
    title: '0nMCP v2.2.0 — 819 Tools Across 48 Services',
    body: `The biggest release in 0nMCP history. From 26 services to 48. From 558 tools to 819. Added Resend expansion (3→67 endpoints), Cloudflare, Vercel, Railway, and more.`,
    tags: ['release', 'services', 'tools'],
  },
  {
    version: '2.1.0',
    date: '2026-02-28',
    title: '0nMCP v2.1.0 — Business Deed Transfer System',
    body: `6 new deed tools for packaging, transferring, and importing entire business operations. Chain of custody tracking, auto-detection of credentials, complete lifecycle management.`,
    tags: ['release', 'deed', 'vault', 'security'],
  },
  {
    version: '2.0.0',
    date: '2026-02-24',
    title: '0nMCP v2.0.0 — 0nVault Container System (Patent Pending)',
    body: `Patent-pending vault container system (US #63/990,046). 7 semantic layers, multi-party escrow, Seal of Truth, Ed25519 signatures. 48/48 tests pass.`,
    tags: ['release', 'vault', 'patent', 'security'],
  },
]

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format')

  const feed = createBaseFeed({
    title: '0nMCP Changelog',
    description: 'Release notes and version history for 0nMCP — the universal AI API orchestrator.',
    feedPath: '/api/feed/changelog',
  })

  for (const entry of CHANGELOG) {
    feed.addItem({
      title: entry.title,
      id: `${SITE_URL}/blog/0nmcp-v${entry.version.replace(/\./g, '-')}-release`,
      link: `${SITE_URL}/blog`,
      description: entry.body,
      content: `<h1>${entry.title}</h1><p>${entry.body}</p>`,
      date: new Date(entry.date + 'T12:00:00Z'),
      category: entry.tags.map(t => ({ name: t })),
      author: [{ name: '0nMCP Team' }],
    })
  }

  const { body, contentType } = renderFeed(feed, format)

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
