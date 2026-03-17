// apps-sdk/server/index.ts
// 0nMCP — ChatGPT Apps SDK MCP Server
// Wraps the existing 0nmcp.com tool registry with the ext-apps UI layer.
// Exposes tools to ChatGPT at POST/GET https://0nmcp.com/chatgpt/mcp
//
// Stack: @modelcontextprotocol/sdk + @modelcontextprotocol/ext-apps + zod
// Install: npm install @modelcontextprotocol/sdk @modelcontextprotocol/ext-apps zod

import { McpServer }         from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport }
                              from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { registerAppResource } from '@modelcontextprotocol/ext-apps'
import { z }                  from 'zod'
import express                from 'express'
import { readFileSync }       from 'fs'
import { resolve, dirname }   from 'path'
import { fileURLToPath }      from 'url'
import { verifyBearerToken }  from './auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Constants ────────────────────────────────────────────────────────────────

const PORT         = process.env.PORT            ?? 3100
const API_BASE     = process.env.NEXT_PUBLIC_WEB0N_API_BASE ?? 'https://0nmcp.com'
const WIDGET_URL   = `${API_BASE}/chatgpt/widget`
const SPARKS_URL   = `${API_BASE}/sparks`
const MARKETPLACE_URL = process.env.NEXT_PUBLIC_MARKETPLACE_URL ?? 'https://marketplace.rocketclients.com'

// ─── MCP Server ───────────────────────────────────────────────────────────────

const server = new McpServer({
  name:    '0nMCP',
  version: '1.0.0',
})

// ── Register UI resource (points ChatGPT to the widget HTML) ─────────────────
// ext-apps wraps the resource as text/html;profile=mcp-app
// ChatGPT loads this URL in an iframe when any tool fires

registerAppResource(server, {
  name:        '0nMCP Widget',
  description: 'Interactive 0nMCP dashboard — tool browser, build console, Sparks balance',
  uri:         WIDGET_URL,
  // Content-Security-Policy for the iframe sandbox
  csp: {
    // Allow fetching from 0nmcp.com and marketplace only
    defaultSrc: [`'self'`, API_BASE, MARKETPLACE_URL],
    scriptSrc:  [`'self'`, `'unsafe-inline'`],  // inline scripts for vanilla HTML
    styleSrc:   [`'self'`, `'unsafe-inline'`],
    imgSrc:     [`'self'`, 'data:', API_BASE],
    connectSrc: [`'self'`, API_BASE, MARKETPLACE_URL],
  },
})

// ─── Tool: build_website ─────────────────────────────────────────────────────
// Triggers the full 0nMCP → Agent Studio website build pipeline.
// Cost: deducted from user's Sparks balance (1 Spark = 1 build action).

server.tool(
  'build_website',
  'Generate and deploy a 5-page website (Home, Services, About, Booking, Contact) ' +
  'for a business. Requires: business name and email. Optional: phone, address, city, ' +
  'state, zip, current website URL, brand hex color. Returns build status and funnel URL.',
  {
    businessName: z.string().min(1).describe('Business or company name'),
    email:        z.string().email().describe('Business contact email'),
    phone:        z.string().optional().describe('Business phone number'),
    address:      z.string().optional().describe('Street address'),
    city:         z.string().optional().describe('City'),
    state:        z.string().max(2).optional().describe('Two-letter state code'),
    zip:          z.string().optional().describe('ZIP code'),
    website:      z.string().url().optional().describe('Existing website URL if any'),
    brandColor:   z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
                    .default('#6EE05A').describe('Brand color hex code'),
    locationId:   z.string().optional()
                    .describe('CRM location ID — leave blank to use default'),
  },
  async (args, extra) => {
    const userId = extra?.authInfo?.userId

    // ── Verify Sparks balance before firing ───────────────────────────────────
    const balanceRes = await fetch(`${API_BASE}/api/skill/sparks`, {
      headers: {
        Authorization: `Bearer ${extra?.authInfo?.token ?? ''}`,
        'Content-Type': 'application/json',
      },
    })

    if (!balanceRes.ok) {
      return {
        isError:         true,
        structuredContent: { error: 'Unable to verify Sparks balance. Connect your 0nMCP account.' },
        content: [{
          type: 'text' as const,
          text: 'Could not verify your Sparks balance. Make sure your 0nMCP account is connected.',
        }],
        _meta: { ui: { resource: WIDGET_URL, view: 'connect' } },
      }
    }

    const { sparks } = await balanceRes.json()

    if (sparks < 1) {
      return {
        isError:         false,
        structuredContent: {
          status:      'insufficient_sparks',
          sparks_balance: sparks,
          sparks_url:  SPARKS_URL,
          message:     'Not enough Sparks to trigger a build. Purchase more at 0nmcp.com/sparks.',
        },
        content: [{
          type: 'text' as const,
          text: `You need at least 1 Spark to build a website. Your balance: ${sparks}. Get more at ${SPARKS_URL}`,
        }],
        _meta: { ui: { resource: WIDGET_URL, view: 'sparks_low', data: { sparks, sparks_url: SPARKS_URL } } },
      }
    }

    // ── Fire the trigger route ────────────────────────────────────────────────
    const triggerRes = await fetch(`${API_BASE}/api/crm-agent/trigger`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.WEB0N_INTERNAL_API_KEY}`,
      },
      body: JSON.stringify({
        ...args,
        action:    'build_website',
        source:    'chatgpt_app',
        userId,
      }),
    })

    const result = await triggerRes.json()

    if (!triggerRes.ok || !result.success) {
      return {
        isError: true,
        structuredContent: {
          status:  'error',
          message: result.error ?? 'Build trigger failed',
        },
        content: [{ type: 'text' as const, text: `Build failed: ${result.error ?? 'unknown error'}` }],
        _meta:   { ui: { resource: WIDGET_URL, view: 'error', data: result } },
      }
    }

    const structuredResult = {
      status:          'triggered',
      business_name:   args.businessName,
      pages:           ['Home', 'Services', 'About', 'Booking', 'Contact'],
      conversation_id: result.conversationId,
      contact_id:      result.contactId,
      location_id:     result.locationId,
      sparks_used:     1,
      sparks_remaining: sparks - 1,
      message:         `Website build triggered for ${args.businessName}. 5 pages are being generated and deployed.`,
    }

    return {
      structuredContent: structuredResult,
      content: [{
        type: 'text' as const,
        text: `✅ Website build triggered for **${args.businessName}**. ` +
              `Generating and deploying: Home, Services, About, Booking, Contact. ` +
              `Sparks used: 1 (${sparks - 1} remaining).`,
      }],
      _meta: { ui: { resource: WIDGET_URL, view: 'build_status', data: structuredResult } },
    }
  }
)

// ─── Tool: browse_tools ──────────────────────────────────────────────────────
// Returns the 0nMCP tool catalog filterable by category or keyword.

server.tool(
  'browse_tools',
  'Browse the 0nMCP tool catalog. Returns available tools, categories, and Spark costs. ' +
  'Supports filtering by category (e.g. "CRM", "LinkedIn", "Email") or keyword search.',
  {
    query:    z.string().optional().describe('Search keyword — e.g. "email", "LinkedIn", "CRM"'),
    category: z.string().optional().describe('Filter by category'),
    limit:    z.number().int().min(1).max(50).default(12),
  },
  async (args, extra) => {
    const params = new URLSearchParams()
    if (args.query)    params.set('q',        args.query)
    if (args.category) params.set('category', args.category)
    params.set('limit', String(args.limit))

    const res = await fetch(`${API_BASE}/api/tools?${params.toString()}`, {
      headers: { Authorization: `Bearer ${extra?.authInfo?.token ?? ''}` },
    })

    const data = await res.json()

    return {
      structuredContent: {
        tools:      data.tools ?? [],
        total:      data.total ?? 0,
        categories: data.categories ?? [],
        query:      args.query,
        category:   args.category,
      },
      content: [{
        type: 'text' as const,
        text: `Found ${data.total ?? 0} tools${args.query ? ` matching "${args.query}"` : ''}. ` +
              `Showing ${(data.tools ?? []).length} results.`,
      }],
      _meta: { ui: { resource: WIDGET_URL, view: 'tool_catalog', data } },
    }
  }
)

// ─── Tool: run_pipeline ──────────────────────────────────────────────────────
// Executes an existing 0nMCP pipeline by slug or ID with provided inputs.

server.tool(
  'run_pipeline',
  'Execute an 0nMCP pipeline. Provide the pipeline slug (e.g. "web0n-site-builder", ' +
  '"linkedin-post", "crm-contact-sync") and its required input fields. ' +
  'Returns execution results and Sparks used.',
  {
    pipelineSlug: z.string().describe('Pipeline slug or ID — browse_tools to discover slugs'),
    inputs:       z.record(z.unknown()).describe('Input fields required by the pipeline'),
  },
  async (args, extra) => {
    const res = await fetch(`${API_BASE}/api/pipeline/execute`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${extra?.authInfo?.token ?? ''}`,
      },
      body: JSON.stringify({
        slug:   args.pipelineSlug,
        inputs: args.inputs,
        source: 'chatgpt_app',
      }),
    })

    const result = await res.json()

    return {
      structuredContent: result,
      content: [{
        type: 'text' as const,
        text: result.success
          ? `Pipeline "${args.pipelineSlug}" completed. ${result.summary ?? ''}`
          : `Pipeline "${args.pipelineSlug}" failed: ${result.error ?? 'unknown error'}`,
      }],
      _meta: { ui: { resource: WIDGET_URL, view: 'pipeline_result', data: result } },
    }
  }
)

// ─── Tool: get_account ───────────────────────────────────────────────────────
// Returns the authenticated user's 0nMCP account — Sparks balance, recent builds,
// installed services. Used by the widget on load and for contextual display.

server.tool(
  'get_account',
  'Get the connected 0nMCP account details: Sparks balance, recent pipeline runs, ' +
  'active services, and purchase history. Call this to show the user their dashboard.',
  {},
  async (_args, extra) => {
    const res = await fetch(`${API_BASE}/api/account`, {
      headers: { Authorization: `Bearer ${extra?.authInfo?.token ?? ''}` },
    })

    if (!res.ok) {
      return {
        isError: true,
        structuredContent: { error: 'Account not found. Connect your 0nMCP account first.' },
        content: [{ type: 'text' as const, text: 'Connect your 0nMCP account to continue.' }],
        _meta:   { ui: { resource: WIDGET_URL, view: 'connect' } },
      }
    }

    const account = await res.json()

    return {
      structuredContent: account,
      content: [{
        type: 'text' as const,
        text: `0nMCP account: ${account.email}. Sparks balance: ${account.sparks}. ` +
              `Active services: ${account.services?.length ?? 0}. ` +
              `Recent builds: ${account.recent_builds?.length ?? 0}.`,
      }],
      _meta: { ui: { resource: WIDGET_URL, view: 'dashboard', data: account } },
    }
  }
)

// ─── Tool: purchase_sparks ───────────────────────────────────────────────────
// External checkout — directs user to 0nmcp.com/sparks for Stripe purchase.
// (Instant Checkout in ChatGPT pending OpenAI partner approval.)

server.tool(
  'purchase_sparks',
  'Direct the user to purchase more Sparks at 0nmcp.com. ' +
  'Sparks are the 0nMCP execution currency — each pipeline run costs 1–5 Sparks. ' +
  'Returns an external checkout URL.',
  {
    package: z.enum(['starter', 'growth', 'pro']).default('growth')
               .describe('Sparks package: starter (10), growth (50), pro (200)'),
  },
  async (args) => {
    const packages = {
      starter: { sparks: 10,  price_usd: 5,  url: `${SPARKS_URL}?package=starter` },
      growth:  { sparks: 50,  price_usd: 19, url: `${SPARKS_URL}?package=growth` },
      pro:     { sparks: 200, price_usd: 49, url: `${SPARKS_URL}?package=pro` },
    }

    const selected = packages[args.package]

    return {
      structuredContent: {
        package:    args.package,
        sparks:     selected.sparks,
        price_usd:  selected.price_usd,
        checkout_url: selected.url,
        message:    `Visit ${selected.url} to purchase ${selected.sparks} Sparks for $${selected.price_usd}.`,
      },
      content: [{
        type: 'text' as const,
        text: `Purchase ${selected.sparks} Sparks for $${selected.price_usd} → ${selected.url}`,
      }],
      _meta: {
        ui: {
          resource: WIDGET_URL,
          view: 'external_checkout',
          data: selected,
        },
      },
    }
  }
)

// ─── Express app ──────────────────────────────────────────────────────────────

const app = express()
app.use(express.json())

// CORS — allow ChatGPT and Codex origins
app.use((req, res, next) => {
  const allowed = ['https://chatgpt.com', 'https://chat.openai.com']
  const origin  = req.headers.origin ?? ''
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin',  origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, MCP-Protocol-Version')
    res.setHeader('Access-Control-Max-Age',       '86400')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// Health / 404 suppressor for OAuth discovery routes we don't implement yet
app.get('/', (_req, res) => res.json({ status: 'ok', app: '0nMCP', version: '1.0.0' }))

// MCP endpoint — Streamable HTTP (recommended over SSE)
app.all('/chatgpt/mcp', async (req, res) => {
  // Verify Bearer token on every request
  const authHeader = req.headers.authorization
  const token      = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const authInfo   = token ? await verifyBearerToken(token) : null

  if (!authInfo) {
    res.setHeader('WWW-Authenticate',
      `Bearer realm="0nMCP", error="invalid_token", ` +
      `resource_metadata="${process.env.NEXT_PUBLIC_WEB0N_API_BASE}/.well-known/oauth-protected-resource"`)
    return res.status(401).json({ error: 'unauthorized', message: 'Valid Bearer token required.' })
  }

  // Attach auth info for tools to read via extra.authInfo
  ;(req as any)._authInfo = authInfo

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
  })

  res.on('close', () => transport.close())

  await server.connect(transport)
  await transport.handleRequest(req, res, req.body)
})

// Serve the widget HTML at /chatgpt/widget
app.get('/chatgpt/widget', (_req, res) => {
  const widgetPath = resolve(__dirname, '../web/widget.html')
  res.setHeader('Content-Type', 'text/html;profile=mcp-app')
  res.setHeader('X-Frame-Options',           'ALLOW-FROM https://chatgpt.com')
  res.setHeader('Content-Security-Policy',
    "default-src 'self' https://0nmcp.com https://marketplace.rocketclients.com; " +
    "script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https://0nmcp.com;")
  res.send(readFileSync(widgetPath, 'utf8'))
})

app.listen(PORT, () => {
  console.log(`[0nMCP ChatGPT App] listening on port ${PORT}`)
  console.log(`  MCP endpoint: ${API_BASE}/chatgpt/mcp`)
  console.log(`  Widget:       ${API_BASE}/chatgpt/widget`)
  console.log(`  OAuth disco:  ${API_BASE}/.well-known/oauth-protected-resource`)
})

export default app
