import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/canvas/scan?url=0nmcp.com
 * Scans the site's own route structure from the sitemap or returns
 * a hardcoded tree of the 0nmcp.com architecture.
 * Returns nodes + edges for React Flow canvas.
 */

interface RouteNode {
  id: string
  path: string
  label: string
  type: 'page' | 'api' | 'dynamic' | 'group' | 'layout'
  children: RouteNode[]
  depth: number
}

// 0nmcp.com full route tree — the real architecture
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

function flattenTree(node: RouteNode, parentId: string | null, nodes: any[], edges: any[], x: number, y: number): { maxY: number } {
  const nodeColor = {
    page: '#6EE05A',
    api: '#00d4ff',
    dynamic: '#a78bfa',
    group: '#f59e0b',
    layout: '#6b7280',
  }[node.type] || '#6EE05A'

  nodes.push({
    id: node.id,
    type: 'siteNode',
    position: { x, y },
    data: {
      label: node.label,
      path: node.path,
      nodeType: node.type,
      color: nodeColor,
      childCount: node.children.length,
    },
  })

  if (parentId) {
    edges.push({
      id: `${parentId}->${node.id}`,
      source: parentId,
      target: node.id,
      type: 'smoothstep',
      animated: node.type === 'dynamic',
      style: { stroke: nodeColor + '60', strokeWidth: 2 },
    })
  }

  let currentY = y
  const childSpacing = 100
  const childX = x + 280

  for (const child of node.children) {
    const result = flattenTree(child, node.id, nodes, edges, childX, currentY)
    currentY = result.maxY + childSpacing
  }

  return { maxY: Math.max(y, currentY - childSpacing) }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url') || '0nmcp.com'

  const nodes: any[] = []
  const edges: any[] = []

  // For now, return the hardcoded 0nmcp.com tree
  // Future: fetch sitemap.xml from arbitrary URLs and parse
  flattenTree(SITE_TREE, null, nodes, edges, 50, 50)

  // Generate .0n export format
  const onFile = {
    schema: '0n-sitemap/v1',
    generated: new Date().toISOString(),
    site: url,
    stats: {
      total_pages: nodes.filter(n => n.data.nodeType === 'page').length,
      dynamic_routes: nodes.filter(n => n.data.nodeType === 'dynamic').length,
      groups: nodes.filter(n => n.data.nodeType === 'group').length,
      total_nodes: nodes.length,
      total_edges: edges.length,
    },
    tree: SITE_TREE,
    nodes,
    edges,
  }

  return NextResponse.json(onFile)
}
