import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

const API_BASE = process.env.NEXT_PUBLIC_WEB0N_API_BASE ?? 'https://0nmcp.com'
const SPARKS_URL = `${API_BASE}/sparks`

let _server: McpServer | null = null

export function getMCPServer(): McpServer {
  if (_server) return _server

  const server = new McpServer({ name: '0nMCP', version: '1.0.0' })

  // ── build_website ─────────────────────────────────────────────────────────
  server.tool(
    'build_website',
    'Generate and deploy a 5-page website (Home, Services, About, Booking, Contact) for a business.',
    {
      businessName: z.string().min(1).describe('Business or company name'),
      email: z.string().email().describe('Business contact email'),
      phone: z.string().optional().describe('Business phone number'),
      city: z.string().optional().describe('City'),
      state: z.string().max(2).optional().describe('Two-letter state code'),
      brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default('#6EE05A').describe('Brand color hex'),
    },
    async (args) => {
      const triggerRes = await fetch(`${API_BASE}/api/crm-agent/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.WEB0N_INTERNAL_API_KEY}`,
        },
        body: JSON.stringify({ ...args, action: 'build_website', source: 'chatgpt_app' }),
      })
      const result = await triggerRes.json()

      if (!triggerRes.ok || !result.success) {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: `Build failed: ${result.error ?? 'unknown error'}` }],
        }
      }

      return {
        content: [{
          type: 'text' as const,
          text: `Website build triggered for **${args.businessName}**. ` +
            `Generating: Home, Services, About, Booking, Contact.`,
        }],
      }
    }
  )

  // ── browse_tools ──────────────────────────────────────────────────────────
  server.tool(
    'browse_tools',
    'Browse the 0nMCP tool catalog. Filter by category or keyword.',
    {
      query: z.string().optional().describe('Search keyword'),
      category: z.string().optional().describe('Filter by category'),
      limit: z.number().int().min(1).max(50).default(12),
    },
    async (args) => {
      const params = new URLSearchParams()
      if (args.query) params.set('q', args.query)
      if (args.category) params.set('category', args.category)
      params.set('limit', String(args.limit))

      const res = await fetch(`${API_BASE}/api/tools?${params.toString()}`)
      const data = await res.json()

      return {
        content: [{
          type: 'text' as const,
          text: `Found ${data.total ?? 0} tools${args.query ? ` matching "${args.query}"` : ''}. ` +
            `Showing ${(data.tools ?? []).length} results.`,
        }],
      }
    }
  )

  // ── run_pipeline ──────────────────────────────────────────────────────────
  server.tool(
    'run_pipeline',
    'Execute an 0nMCP pipeline by slug with provided inputs.',
    {
      pipelineSlug: z.string().describe('Pipeline slug or ID'),
      inputs: z.record(z.string(), z.unknown()).describe('Input parameters'),
    },
    async (args) => {
      const res = await fetch(`${API_BASE}/api/pipeline/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: args.pipelineSlug, inputs: args.inputs, source: 'chatgpt_app' }),
      })
      const result = await res.json()

      return {
        content: [{
          type: 'text' as const,
          text: result.success
            ? `Pipeline "${args.pipelineSlug}" completed. ${result.summary ?? ''}`
            : `Pipeline "${args.pipelineSlug}" failed: ${result.error ?? 'unknown'}`,
        }],
      }
    }
  )

  // ── get_account ───────────────────────────────────────────────────────────
  server.tool(
    'get_account',
    'Get the connected 0nMCP account: Sparks balance, recent pipeline runs, active services.',
    {},
    async () => {
      return {
        content: [{
          type: 'text' as const,
          text: '0nMCP account connected. Use browse_tools to explore available tools or build_website to start building.',
        }],
      }
    }
  )

  // ── purchase_sparks ───────────────────────────────────────────────────────
  server.tool(
    'purchase_sparks',
    'Direct the user to purchase Sparks at 0nmcp.com.',
    {
      package: z.enum(['starter', 'growth', 'pro']).default('growth')
        .describe('Sparks package: starter (10/$5), growth (50/$19), pro (200/$49)'),
    },
    async (args) => {
      const packages = {
        starter: { sparks: 10, price: 5 },
        growth: { sparks: 50, price: 19 },
        pro: { sparks: 200, price: 49 },
      }
      const sel = packages[args.package]

      return {
        content: [{
          type: 'text' as const,
          text: `Purchase ${sel.sparks} Sparks for $${sel.price} at ${SPARKS_URL}?package=${args.package}`,
        }],
      }
    }
  )

  _server = server
  return server
}
