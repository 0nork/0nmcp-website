import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/canvas/scan?url=example.com
 *
 * Live URL crawler — fetches sitemap.xml from any domain,
 * parses the URLs into a hierarchical tree, and returns
 * nodes + edges for React Flow canvas rendering.
 *
 * Falls back to the hardcoded 0nmcp.com tree for local/self scans.
 */

interface RouteNode {
  id: string
  path: string
  label: string
  type: 'page' | 'api' | 'dynamic' | 'group' | 'layout'
  children: RouteNode[]
  depth: number
  lastmod?: string
  priority?: string
}

interface FlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label: string
    path: string
    nodeType: string
    color: string
    childCount: number
    lastmod?: string
    isLive: boolean
  }
}

interface FlowEdge {
  id: string
  source: string
  target: string
  type: string
  animated: boolean
  style: { stroke: string; strokeWidth: number }
}

// ── Sitemap XML Parser (no dependencies) ──

function extractUrlsFromXml(xml: string): Array<{ loc: string; lastmod?: string; priority?: string }> {
  const urls: Array<{ loc: string; lastmod?: string; priority?: string }> = []

  // Handle sitemap index (sitemapindex > sitemap > loc)
  const sitemapIndexMatch = xml.match(/<sitemapindex[\s\S]*?<\/sitemapindex>/i)
  if (sitemapIndexMatch) {
    const locRegex = /<loc>\s*(.*?)\s*<\/loc>/gi
    let match: RegExpExecArray | null
    while ((match = locRegex.exec(sitemapIndexMatch[0])) !== null) {
      urls.push({ loc: match[1].trim() })
    }
    return urls
  }

  // Handle regular sitemap (urlset > url > loc)
  const urlRegex = /<url>([\s\S]*?)<\/url>/gi
  let urlMatch: RegExpExecArray | null
  while ((urlMatch = urlRegex.exec(xml)) !== null) {
    const block = urlMatch[1]
    const locMatch = block.match(/<loc>\s*(.*?)\s*<\/loc>/i)
    if (!locMatch) continue

    const lastmodMatch = block.match(/<lastmod>\s*(.*?)\s*<\/lastmod>/i)
    const priorityMatch = block.match(/<priority>\s*(.*?)\s*<\/priority>/i)

    urls.push({
      loc: locMatch[1].trim(),
      lastmod: lastmodMatch?.[1]?.trim(),
      priority: priorityMatch?.[1]?.trim(),
    })
  }

  return urls
}

function urlsToTree(baseUrl: string, urls: Array<{ loc: string; lastmod?: string; priority?: string }>): RouteNode {
  const hostname = baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const root: RouteNode = {
    id: '/',
    path: '/',
    label: hostname,
    type: 'page',
    depth: 0,
    children: [],
  }

  // Deduplicate and sort paths
  const pathMap = new Map<string, { lastmod?: string; priority?: string }>()
  for (const u of urls) {
    try {
      const parsed = new URL(u.loc)
      const path = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/$/, '')
      if (path === '/') continue
      if (!pathMap.has(path)) {
        pathMap.set(path, { lastmod: u.lastmod, priority: u.priority })
      }
    } catch {
      // Skip invalid URLs
    }
  }

  const sortedPaths = [...pathMap.keys()].sort()

  // Build tree from paths
  for (const path of sortedPaths) {
    const meta = pathMap.get(path)
    const segments = path.split('/').filter(Boolean)
    let current = root

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      const partialPath = '/' + segments.slice(0, i + 1).join('/')
      let child = current.children.find(c => c.path === partialPath)

      if (!child) {
        const isLast = i === segments.length - 1
        const isDynamic = segment.startsWith('[') || segment.includes(':')
        const isApi = segments[0] === 'api'

        child = {
          id: partialPath,
          path: partialPath,
          label: formatLabel(segment),
          type: isDynamic ? 'dynamic' : isApi ? 'api' : 'page',
          depth: i + 1,
          children: [],
          lastmod: isLast ? meta?.lastmod : undefined,
          priority: isLast ? meta?.priority : undefined,
        }
        current.children.push(child)
      }

      current = child
    }
  }

  // Detect groups (nodes that only contain children, typical section parents)
  function markGroups(node: RouteNode): void {
    if (node.children.length >= 3 && node.depth > 0) {
      // Check if this looks like a grouping node
      const hasOwnPage = urls.some(u => {
        try {
          return new URL(u.loc).pathname.replace(/\/$/, '') === node.path
        } catch { return false }
      })
      if (!hasOwnPage && node.type === 'page') {
        node.type = 'group'
      }
    }
    node.children.forEach(markGroups)
  }
  markGroups(root)

  return root
}

function formatLabel(segment: string): string {
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\[.*?\]/g, (m) => m)
    .replace(/\b\w/g, c => c.toUpperCase())
}

async function fetchSitemap(baseUrl: string): Promise<{ tree: RouteNode; urlCount: number; isLive: boolean }> {
  const normalizedBase = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  const hostname = normalizedBase.replace(/\/$/, '')

  // Try multiple sitemap locations
  const sitemapPaths = ['/sitemap.xml', '/sitemap_index.xml', '/sitemap-0.xml']
  let allUrls: Array<{ loc: string; lastmod?: string; priority?: string }> = []

  for (const sitemapPath of sitemapPaths) {
    try {
      const res = await fetch(`${hostname}${sitemapPath}`, {
        headers: { 'User-Agent': '0nCanvas/1.0 (Site Architecture Scanner)' },
        signal: AbortSignal.timeout(8000),
      })

      if (!res.ok) continue

      const xml = await res.text()
      const urls = extractUrlsFromXml(xml)

      if (urls.length === 0) continue

      // Check if this is a sitemap index
      const isSitemapIndex = xml.includes('<sitemapindex')
      if (isSitemapIndex) {
        // Fetch child sitemaps (limit to 5 to avoid timeout)
        const childSitemaps = urls.slice(0, 5)
        for (const child of childSitemaps) {
          try {
            const childRes = await fetch(child.loc, {
              headers: { 'User-Agent': '0nCanvas/1.0 (Site Architecture Scanner)' },
              signal: AbortSignal.timeout(5000),
            })
            if (childRes.ok) {
              const childXml = await childRes.text()
              const childUrls = extractUrlsFromXml(childXml)
              allUrls.push(...childUrls)
            }
          } catch {
            // Skip failed child sitemaps
          }
        }
      } else {
        allUrls = urls
      }

      if (allUrls.length > 0) break
    } catch {
      continue
    }
  }

  // Cap at 500 URLs to keep the canvas performant
  if (allUrls.length > 500) {
    allUrls = allUrls.slice(0, 500)
  }

  if (allUrls.length > 0) {
    return { tree: urlsToTree(hostname, allUrls), urlCount: allUrls.length, isLive: true }
  }

  // Fallback: try to parse robots.txt for sitemap reference
  try {
    const robotsRes = await fetch(`${hostname}/robots.txt`, {
      headers: { 'User-Agent': '0nCanvas/1.0' },
      signal: AbortSignal.timeout(5000),
    })
    if (robotsRes.ok) {
      const robots = await robotsRes.text()
      const sitemapMatch = robots.match(/Sitemap:\s*(\S+)/i)
      if (sitemapMatch) {
        const res = await fetch(sitemapMatch[1], {
          headers: { 'User-Agent': '0nCanvas/1.0' },
          signal: AbortSignal.timeout(5000),
        })
        if (res.ok) {
          const xml = await res.text()
          const urls = extractUrlsFromXml(xml)
          if (urls.length > 0) {
            return { tree: urlsToTree(hostname, urls.slice(0, 500)), urlCount: Math.min(urls.length, 500), isLive: true }
          }
        }
      }
    }
  } catch {
    // Ignore
  }

  return { tree: getFallbackTree(hostname), urlCount: 0, isLive: false }
}

// ── Hardcoded 0nmcp.com tree as fallback ──

function getFallbackTree(hostname: string): RouteNode {
  if (hostname.includes('0nmcp.com')) {
    return SITE_TREE
  }
  // Return a minimal tree with just the root
  return {
    id: '/',
    path: '/',
    label: hostname.replace(/^https?:\/\//, ''),
    type: 'page',
    depth: 0,
    children: [],
  }
}

const SITE_TREE: RouteNode = {
  id: '/', path: '/', label: '0nmcp.com', type: 'page', depth: 0,
  children: [
    { id: '/start', path: '/start', label: 'Start (Install)', type: 'page', depth: 1, children: [] },
    { id: '/subscribe', path: '/subscribe', label: 'Subscribe', type: 'page', depth: 1, children: [] },
    { id: '/signup', path: '/signup', label: 'Sign Up', type: 'page', depth: 1, children: [] },
    { id: '/login', path: '/login', label: 'Login', type: 'page', depth: 1, children: [] },
    { id: '/0nboarding', path: '/0nboarding', label: 'Onboarding', type: 'page', depth: 1, children: [] },
    {
      id: '/blog', path: '/blog', label: 'Blog', type: 'page', depth: 1,
      children: [
        { id: '/blog/[slug]', path: '/blog/[slug]', label: 'Blog Post', type: 'dynamic', depth: 2, children: [] },
      ],
    },
    {
      id: '/compare', path: '/compare', label: 'Compare', type: 'page', depth: 1,
      children: [
        { id: '/compare/[slug]', path: '/compare/[slug]', label: 'vs Competitor', type: 'dynamic', depth: 2, children: [] },
        { id: '/compare/interactive', path: '/compare/interactive', label: 'Interactive', type: 'page', depth: 2, children: [] },
      ],
    },
    {
      id: '/integrations', path: '/integrations', label: 'Integrations', type: 'page', depth: 1,
      children: [
        { id: '/integrations/[slug]', path: '/integrations/[slug]', label: 'Service Page', type: 'dynamic', depth: 2, children: [] },
      ],
    },
    {
      id: '/turn-it-on', path: '/turn-it-on', label: 'Turn It 0n', type: 'page', depth: 1,
      children: [
        { id: '/turn-it-on/[slug]', path: '/turn-it-on/[slug]', label: 'Service Hub', type: 'dynamic', depth: 2, children: [] },
      ],
    },
    {
      id: '/glossary', path: '/glossary', label: 'Glossary', type: 'page', depth: 1,
      children: [
        { id: '/glossary/[term]', path: '/glossary/[term]', label: 'Term', type: 'dynamic', depth: 2, children: [] },
      ],
    },
    {
      id: '/forum', path: '/forum', label: 'Forum', type: 'page', depth: 1,
      children: [
        { id: '/forum/[slug]', path: '/forum/[slug]', label: 'Thread', type: 'dynamic', depth: 2, children: [] },
        { id: '/forum/c/[group]', path: '/forum/c/[group]', label: 'Group', type: 'dynamic', depth: 2, children: [] },
        { id: '/forum/new', path: '/forum/new', label: 'New Thread', type: 'page', depth: 2, children: [] },
      ],
    },
    {
      id: '/learn', path: '/learn', label: 'Learn', type: 'page', depth: 1,
      children: [
        { id: '/learn/[slug]', path: '/learn/[slug]', label: 'Course', type: 'dynamic', depth: 2, children: [] },
      ],
    },
    {
      id: '/downloads', path: '/downloads', label: 'Downloads', type: 'page', depth: 1,
      children: [
        { id: '/downloads/onclaude', path: '/downloads/onclaude', label: '0nClaude', type: 'page', depth: 2, children: [] },
        { id: '/downloads/ongpt', path: '/downloads/ongpt', label: '0nGPT', type: 'page', depth: 2, children: [] },
        { id: '/downloads/ongram', path: '/downloads/ongram', label: '0nGram', type: 'page', depth: 2, children: [] },
      ],
    },
    {
      id: '/convert', path: '/convert', label: 'Convert', type: 'page', depth: 1,
      children: [
        { id: '/convert/openai', path: '/convert/openai', label: 'OpenAI', type: 'page', depth: 2, children: [] },
        { id: '/convert/gemini', path: '/convert/gemini', label: 'Gemini', type: 'page', depth: 2, children: [] },
        { id: '/convert/openclaw', path: '/convert/openclaw', label: 'OpenClaw', type: 'page', depth: 2, children: [] },
      ],
    },
    {
      id: '/console', path: '/console', label: 'Console (Dashboard)', type: 'group', depth: 1,
      children: [
        { id: '/console/integrations', path: '/console/integrations', label: 'API Keys', type: 'page', depth: 2, children: [] },
        { id: '/console/linkedin', path: '/console/linkedin', label: 'LinkedIn', type: 'page', depth: 2, children: [] },
        { id: '/console/migrate', path: '/console/migrate', label: 'Migrate', type: 'page', depth: 2, children: [] },
      ],
    },
    {
      id: '/products', path: '/products', label: 'Products', type: 'group', depth: 1,
      children: [
        { id: '/products/social0n', path: '/products/social0n', label: 'social0n', type: 'page', depth: 2, children: [] },
        { id: '/products/app0n', path: '/products/app0n', label: 'app0n', type: 'page', depth: 2, children: [] },
        { id: '/products/web0n', path: '/products/web0n', label: 'web0n', type: 'page', depth: 2, children: [] },
      ],
    },
    { id: '/community', path: '/community', label: 'Community', type: 'page', depth: 1, children: [] },
    { id: '/u/[id]', path: '/u/[id]', label: 'User Profile', type: 'dynamic', depth: 1, children: [] },
    { id: '/secure-claude', path: '/secure-claude', label: 'Secure Claude', type: 'page', depth: 1, children: [] },
    { id: '/partners', path: '/partners', label: 'Partners', type: 'page', depth: 1, children: [] },
    { id: '/sponsor', path: '/sponsor', label: 'Sponsor', type: 'page', depth: 1, children: [] },
    { id: '/examples', path: '/examples', label: 'Examples', type: 'page', depth: 1, children: [] },
    { id: '/0n-standard', path: '/0n-standard', label: '.0n Standard', type: 'page', depth: 1, children: [] },
    { id: '/builder', path: '/builder', label: 'Workflow Builder', type: 'page', depth: 1, children: [] },
    { id: '/canvas', path: '/canvas', label: 'Canvas', type: 'page', depth: 1, children: [] },
    { id: '/app', path: '/app', label: 'PWA Shell', type: 'page', depth: 1, children: [] },
    {
      id: '/admin', path: '/admin', label: 'Admin', type: 'group', depth: 1,
      children: [
        { id: '/admin/content', path: '/admin/content', label: 'Content', type: 'page', depth: 2, children: [] },
        { id: '/admin/forum', path: '/admin/forum', label: 'Forum Mod', type: 'page', depth: 2, children: [] },
        { id: '/admin/personas', path: '/admin/personas', label: 'Personas', type: 'page', depth: 2, children: [] },
        { id: '/admin/users', path: '/admin/users', label: 'Users', type: 'page', depth: 2, children: [] },
        { id: '/admin/patent-intel', path: '/admin/patent-intel', label: 'Patent Intel', type: 'page', depth: 2, children: [] },
      ],
    },
  ],
}

// ── Layout Engine ──

function flattenTree(
  node: RouteNode,
  parentId: string | null,
  nodes: FlowNode[],
  edges: FlowEdge[],
  x: number,
  y: number,
  isLive: boolean
): { maxY: number } {
  const nodeColor: Record<string, string> = {
    page: '#6EE05A',
    api: '#00d4ff',
    dynamic: '#a78bfa',
    group: '#f59e0b',
    layout: '#6b7280',
  }
  const color = nodeColor[node.type] || '#6EE05A'

  nodes.push({
    id: node.id,
    type: 'siteNode',
    position: { x, y },
    data: {
      label: node.label,
      path: node.path,
      nodeType: node.type,
      color,
      childCount: node.children.length,
      lastmod: node.lastmod,
      isLive,
    },
  })

  if (parentId) {
    edges.push({
      id: `${parentId}->${node.id}`,
      source: parentId,
      target: node.id,
      type: 'smoothstep',
      animated: node.type === 'dynamic',
      style: { stroke: color + '60', strokeWidth: 2 },
    })
  }

  let currentY = y
  const childSpacing = 100
  const childX = x + 300

  for (const child of node.children) {
    const result = flattenTree(child, node.id, nodes, edges, childX, currentY, isLive)
    currentY = result.maxY + childSpacing
  }

  return { maxY: Math.max(y, currentY - childSpacing) }
}

// ── .0n SWITCH file generator ──

function generateSwitchFile(tree: RouteNode, site: string, urlCount: number): string {
  const timestamp = new Date().toISOString()

  function collectPaths(node: RouteNode): string[] {
    const paths = [node.path]
    for (const child of node.children) {
      paths.push(...collectPaths(child))
    }
    return paths
  }

  const allPaths = collectPaths(tree)
  const pages = allPaths.filter(p => !p.includes('[') && !p.startsWith('/api'))
  const dynamicRoutes = allPaths.filter(p => p.includes('['))
  const apiRoutes = allPaths.filter(p => p.startsWith('/api'))

  function treeToSteps(node: RouteNode, prefix: string): string {
    let result = ''
    for (const child of node.children) {
      result += `${prefix}- path: "${child.path}"\n`
      result += `${prefix}  label: "${child.label}"\n`
      result += `${prefix}  type: ${child.type}\n`
      if (child.lastmod) {
        result += `${prefix}  lastmod: "${child.lastmod}"\n`
      }
      if (child.children.length > 0) {
        result += `${prefix}  children:\n`
        result += treeToSteps(child, prefix + '    ')
      }
    }
    return result
  }

  return `# 0n SWITCH File — Site Blueprint
# Generated by 0nCanvas
# ${timestamp}

schema: "0n-sitemap/v2"
version: "1.0.0"
generated: "${timestamp}"
generator: "0nCanvas"

site:
  url: "${site}"
  scanned_urls: ${urlCount}

stats:
  total_pages: ${pages.length}
  dynamic_routes: ${dynamicRoutes.length}
  api_routes: ${apiRoutes.length}
  max_depth: ${Math.max(...allPaths.map(p => p.split('/').filter(Boolean).length), 0)}

structure:
  root:
    path: "/"
    label: "${tree.label}"
    children:
${treeToSteps(tree, '      ')}
pages:
${pages.map(p => `  - "${p}"`).join('\n')}

dynamic_routes:
${dynamicRoutes.length > 0 ? dynamicRoutes.map(p => `  - "${p}"`).join('\n') : '  []'}

api_routes:
${apiRoutes.length > 0 ? apiRoutes.map(p => `  - "${p}"`).join('\n') : '  []'}
`
}

// ── Google-Optimized Sitemap XML generator ──

function getChangefreq(path: string): string {
  if (path === '/') return 'daily'
  if (path.startsWith('/blog/') && path !== '/blog') return 'weekly'
  if (['/about', '/legal', '/privacy', '/terms', '/imprint'].some(p => path === p)) return 'monthly'
  if (path.startsWith('/integrations/') || path.startsWith('/turn-it-on/') || path.startsWith('/glossary/')) return 'weekly'
  return 'weekly'
}

function getPriority(path: string): string {
  if (path === '/') return '1.0'
  // Blog posts get 0.7
  if (path.startsWith('/blog/') && path !== '/blog') return '0.7'
  // Count depth by segments
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 1) return '0.8'
  if (segments.length === 2) return '0.6'
  return '0.4'
}

function generateSitemapXml(tree: RouteNode, site: string): string {
  const hostname = site.startsWith('http') ? site : `https://${site}`
  const normalizedHost = hostname.replace(/\/$/, '')

  function collectUrls(node: RouteNode): Array<{ path: string; lastmod?: string }> {
    const urls: Array<{ path: string; lastmod?: string }> = []
    // Skip dynamic routes, API routes, query params, and fragments for XML sitemap
    if (!node.path.includes('[') && !node.path.startsWith('/api')) {
      // Clean path: no query params, no fragments
      let cleanPath = node.path.split('?')[0].split('#')[0]
      // Remove trailing slash (except root)
      if (cleanPath !== '/' && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.replace(/\/+$/, '')
      }
      urls.push({
        path: cleanPath,
        lastmod: node.lastmod,
      })
    }
    for (const child of node.children) {
      urls.push(...collectUrls(child))
    }
    return urls
  }

  const rawUrls = collectUrls(tree)

  // Deduplicate by path
  const seen = new Set<string>()
  const uniqueUrls: Array<{ path: string; lastmod?: string }> = []
  for (const u of rawUrls) {
    if (!seen.has(u.path)) {
      seen.add(u.path)
      uniqueUrls.push(u)
    }
  }

  // Sort: homepage first, then alphabetically
  uniqueUrls.sort((a, b) => {
    if (a.path === '/') return -1
    if (b.path === '/') return 1
    return a.path.localeCompare(b.path)
  })

  // Google limit: 50,000 URLs per sitemap
  const capped = uniqueUrls.slice(0, 50000)

  const today = new Date().toISOString().slice(0, 10)

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  for (const url of capped) {
    const loc = url.path === '/' ? `${normalizedHost}/` : `${normalizedHost}${url.path}`
    const lastmod = url.lastmod ? url.lastmod.slice(0, 10) : today
    const changefreq = getChangefreq(url.path)
    const priority = getPriority(url.path)

    xml += '  <url>\n'
    xml += `    <loc>${loc}</loc>\n`
    xml += `    <lastmod>${lastmod}</lastmod>\n`
    xml += `    <changefreq>${changefreq}</changefreq>\n`
    xml += `    <priority>${priority}</priority>\n`
    xml += '  </url>\n'
  }

  xml += '</urlset>\n'
  return xml
}

// ── Handler ──

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get('url') || '0nmcp.com'
  const exportFormat = searchParams.get('export')

  const { tree, urlCount, isLive } = await fetchSitemap(rawUrl)

  // Handle export requests
  if (exportFormat === 'xml') {
    const xml = generateSitemapXml(tree, rawUrl)
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="${rawUrl.replace(/[^a-z0-9.]/gi, '-')}-sitemap.xml"`,
      },
    })
  }

  if (exportFormat === 'switch') {
    const switchFile = generateSwitchFile(tree, rawUrl, urlCount)
    return new NextResponse(switchFile, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${rawUrl.replace(/[^a-z0-9.]/gi, '-')}.0n"`,
      },
    })
  }

  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []

  flattenTree(tree, null, nodes, edges, 50, 50, isLive)

  function countByType(node: RouteNode, type: string): number {
    let count = node.type === type ? 1 : 0
    for (const child of node.children) {
      count += countByType(child, type)
    }
    return count
  }

  const response = {
    schema: '0n-sitemap/v2',
    generated: new Date().toISOString(),
    site: rawUrl,
    isLive,
    urlCount,
    stats: {
      total_pages: countByType(tree, 'page'),
      dynamic_routes: countByType(tree, 'dynamic'),
      groups: countByType(tree, 'group'),
      api_routes: countByType(tree, 'api'),
      total_nodes: nodes.length,
      total_edges: edges.length,
    },
    tree,
    nodes,
    edges,
  }

  return NextResponse.json(response)
}
