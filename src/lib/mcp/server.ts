// lib/mcp/server.ts
// 0nMCP ChatGPT Apps SDK — MCP Server singleton
// Registers 5 tools: build_website, browse_tools, run_pipeline, get_account, purchase_sparks
// Every tool returns structuredContent + _meta for widget rendering

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

const API_BASE = process.env.NEXT_PUBLIC_WEB0N_API_BASE ?? 'https://0nmcp.com'
const WIDGET_URL = `${API_BASE}/chatgpt/widget`
const SPARKS_URL = `${API_BASE}/sparks`

let _server: McpServer | null = null

export function getMCPServer(): McpServer {
  if (_server) return _server

  const server = new McpServer({ name: '0nMCP', version: '1.0.0' })

  // ── build_website ─────────────────────────────────────────────────────────
  server.tool(
    'build_website',
    'Generate and deploy a 5-page website (Home, Services, About, Booking, Contact) ' +
    'for a business. Requires: business name and email. Optional: phone, address, city, ' +
    'state, zip, current website URL, brand hex color. Returns build status and funnel URL.',
    {
      businessName: z.string().min(1).describe('Business or company name'),
      email: z.string().email().describe('Business contact email'),
      phone: z.string().optional().describe('Business phone number'),
      address: z.string().optional().describe('Street address'),
      city: z.string().optional().describe('City'),
      state: z.string().max(2).optional().describe('Two-letter state code'),
      zip: z.string().optional().describe('ZIP code'),
      website: z.string().url().optional().describe('Existing website URL if any'),
      brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
        .default('#6EE05A').describe('Brand color hex code'),
      locationId: z.string().optional()
        .describe('CRM location ID — leave blank to use default'),
    },
    async (args, extra) => {
      const userId = (extra as Record<string, unknown>)?.authInfo
        ? ((extra as Record<string, unknown>).authInfo as Record<string, string>)?.userId
        : undefined

      // Verify Sparks balance before firing
      const balanceRes = await fetch(`${API_BASE}/api/skill/sparks`, {
        headers: {
          Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}`,
          'Content-Type': 'application/json',
        },
      })

      if (!balanceRes.ok) {
        return {
          isError: true,
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
          isError: false,
          structuredContent: {
            status: 'insufficient_sparks',
            sparks_balance: sparks,
            sparks_url: SPARKS_URL,
            message: 'Not enough Sparks to trigger a build. Purchase more at 0nmcp.com/sparks.',
          },
          content: [{
            type: 'text' as const,
            text: `You need at least 1 Spark to build a website. Your balance: ${sparks}. Get more at ${SPARKS_URL}`,
          }],
          _meta: { ui: { resource: WIDGET_URL, view: 'sparks_low', data: { sparks, sparks_url: SPARKS_URL } } },
        }
      }

      // Fire the trigger route
      const triggerRes = await fetch(`${API_BASE}/api/crm-agent/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.WEB0N_INTERNAL_API_KEY}`,
        },
        body: JSON.stringify({
          ...args,
          action: 'build_website',
          source: 'chatgpt_app',
          userId,
        }),
      })

      const result = await triggerRes.json()

      if (!triggerRes.ok || !result.success) {
        return {
          isError: true,
          structuredContent: {
            status: 'error',
            message: result.error ?? 'Build trigger failed',
          },
          content: [{ type: 'text' as const, text: `Build failed: ${result.error ?? 'unknown error'}` }],
          _meta: { ui: { resource: WIDGET_URL, view: 'error', data: result } },
        }
      }

      const structuredResult = {
        status: 'triggered',
        business_name: args.businessName,
        pages: ['Home', 'Services', 'About', 'Booking', 'Contact'],
        conversation_id: result.conversationId,
        contact_id: result.contactId,
        location_id: result.locationId,
        sparks_used: 1,
        sparks_remaining: sparks - 1,
        message: `Website build triggered for ${args.businessName}. 5 pages are being generated and deployed.`,
      }

      return {
        structuredContent: structuredResult,
        content: [{
          type: 'text' as const,
          text: `Website build triggered for **${args.businessName}**. ` +
            `Generating and deploying: Home, Services, About, Booking, Contact. ` +
            `Sparks used: 1 (${sparks - 1} remaining).`,
        }],
        _meta: { ui: { resource: WIDGET_URL, view: 'build_status', data: structuredResult } },
      }
    }
  )

  // ── browse_tools ──────────────────────────────────────────────────────────
  server.tool(
    'browse_tools',
    'Browse the 0nMCP tool catalog. Returns available tools, categories, and Spark costs. ' +
    'Supports filtering by category (e.g. "CRM", "LinkedIn", "Email") or keyword search.',
    {
      query: z.string().optional().describe('Search keyword — e.g. "email", "LinkedIn", "CRM"'),
      category: z.string().optional().describe('Filter by category'),
      limit: z.number().int().min(1).max(50).default(12),
    },
    async (args, extra) => {
      const params = new URLSearchParams()
      if (args.query) params.set('q', args.query)
      if (args.category) params.set('category', args.category)
      params.set('limit', String(args.limit))

      const res = await fetch(`${API_BASE}/api/tools?${params.toString()}`, {
        headers: { Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}` },
      })

      const data = await res.json()

      return {
        structuredContent: {
          tools: data.tools ?? [],
          total: data.total ?? 0,
          categories: data.categories ?? [],
          query: args.query,
          category: args.category,
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

  // ── run_pipeline ──────────────────────────────────────────────────────────
  server.tool(
    'run_pipeline',
    'Execute an 0nMCP pipeline. Provide the pipeline slug (e.g. "web0n-site-builder", ' +
    '"linkedin-post", "crm-contact-sync") and its required input fields. ' +
    'Returns execution results and Sparks used.',
    {
      pipelineSlug: z.string().describe('Pipeline slug or ID — browse_tools to discover slugs'),
      inputs: z.record(z.string(), z.unknown()).describe('Input fields required by the pipeline'),
    },
    async (args, extra) => {
      const res = await fetch(`${API_BASE}/api/pipeline/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}`,
        },
        body: JSON.stringify({
          slug: args.pipelineSlug,
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

  // ── get_account ───────────────────────────────────────────────────────────
  server.tool(
    'get_account',
    'Get the connected 0nMCP account details: Sparks balance, recent pipeline runs, ' +
    'active services, and purchase history. Call this to show the user their dashboard.',
    {},
    async (_args, extra) => {
      const res = await fetch(`${API_BASE}/api/account`, {
        headers: { Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}` },
      })

      if (!res.ok) {
        return {
          isError: true,
          structuredContent: { error: 'Account not found. Connect your 0nMCP account first.' },
          content: [{ type: 'text' as const, text: 'Connect your 0nMCP account to continue.' }],
          _meta: { ui: { resource: WIDGET_URL, view: 'connect' } },
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

  // ── purchase_sparks ───────────────────────────────────────────────────────
  server.tool(
    'purchase_sparks',
    'Direct the user to purchase more Sparks at 0nmcp.com. ' +
    'Sparks are the 0nMCP execution currency — each pipeline run costs 1-5 Sparks. ' +
    'Returns an external checkout URL.',
    {
      package: z.enum(['starter', 'growth', 'pro']).default('growth')
        .describe('Sparks package: starter (10), growth (50), pro (200)'),
    },
    async (args) => {
      const packages = {
        starter: { sparks: 10, price_usd: 5, url: `${SPARKS_URL}?package=starter` },
        growth: { sparks: 50, price_usd: 19, url: `${SPARKS_URL}?package=growth` },
        pro: { sparks: 200, price_usd: 49, url: `${SPARKS_URL}?package=pro` },
      }

      const selected = packages[args.package]

      return {
        structuredContent: {
          package: args.package,
          sparks: selected.sparks,
          price_usd: selected.price_usd,
          checkout_url: selected.url,
          message: `Visit ${selected.url} to purchase ${selected.sparks} Sparks for $${selected.price_usd}.`,
        },
        content: [{
          type: 'text' as const,
          text: `Purchase ${selected.sparks} Sparks for $${selected.price_usd} at ${selected.url}`,
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

  // ── search_contacts ───────────────────────────────────────────────────────
  server.tool(
    'search_contacts',
    'Search CRM contacts by name, email, or phone. Returns matching contacts with details. ' +
    'Use this when users ask about contacts, leads, or customers.',
    {
      query: z.string().describe('Search term — name, email, or phone number'),
      limit: z.number().int().min(1).max(50).default(10),
    },
    async (args, extra) => {
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}`,
        },
        body: JSON.stringify({ action: 'search_crm_contacts', params: args, source: 'chatgpt_app' }),
      })
      const result = await res.json()
      return {
        structuredContent: result,
        content: [{ type: 'text' as const, text: result.success ? `Found ${result.data?.length ?? 0} contacts matching "${args.query}"` : `Search failed: ${result.error}` }],
      }
    }
  )

  // ── create_contact ───────────────────────────────────────────────────────
  server.tool(
    'create_contact',
    'Create a new contact in the CRM. Requires at least an email. ' +
    'Automatically tags and adds to pipeline.',
    {
      email: z.string().email().describe('Contact email address'),
      firstName: z.string().optional().describe('First name'),
      lastName: z.string().optional().describe('Last name'),
      phone: z.string().optional().describe('Phone number'),
      tags: z.array(z.string()).optional().describe('Tags to apply'),
    },
    async (args, extra) => {
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}`,
        },
        body: JSON.stringify({ action: 'create_crm_contact', params: args, source: 'chatgpt_app' }),
      })
      const result = await res.json()
      return {
        structuredContent: result,
        content: [{ type: 'text' as const, text: result.success ? `Contact created: ${args.firstName || ''} ${args.lastName || ''} (${args.email})` : `Failed: ${result.error}` }],
      }
    }
  )

  // ── get_pipeline ─────────────────────────────────────────────────────────
  server.tool(
    'get_pipeline',
    'Get CRM sales pipeline stages and opportunities. Shows deal flow and revenue.',
    {},
    async (_args, extra) => {
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}`,
        },
        body: JSON.stringify({ action: 'get_crm_pipelines', params: {}, source: 'chatgpt_app' }),
      })
      const result = await res.json()
      return {
        structuredContent: result,
        content: [{ type: 'text' as const, text: result.success ? `Pipeline loaded with ${result.data?.length ?? 0} stages` : `Failed: ${result.error}` }],
      }
    }
  )

  // ── get_revenue ──────────────────────────────────────────────────────────
  server.tool(
    'get_revenue',
    'Get Stripe revenue summary — total charges, breakdown by status, recent transactions. ' +
    'Use for financial reporting and revenue questions.',
    {
      period: z.enum(['today', 'week', 'month', 'year']).default('month').describe('Time period'),
    },
    async (args, extra) => {
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}`,
        },
        body: JSON.stringify({ action: 'get_stripe_revenue', params: args, source: 'chatgpt_app' }),
      })
      const result = await res.json()
      return {
        structuredContent: result,
        content: [{ type: 'text' as const, text: result.success ? `Revenue data loaded for ${args.period}` : `Failed: ${result.error}` }],
      }
    }
  )

  // ── get_balance ──────────────────────────────────────────────────────────
  server.tool(
    'get_balance',
    'Get current Stripe account balance — available and pending funds.',
    {},
    async (_args, extra) => {
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}`,
        },
        body: JSON.stringify({ action: 'get_stripe_balance', params: {}, source: 'chatgpt_app' }),
      })
      const result = await res.json()
      return {
        structuredContent: result,
        content: [{ type: 'text' as const, text: result.success ? `Balance loaded` : `Failed: ${result.error}` }],
      }
    }
  )

  // ── list_customers ───────────────────────────────────────────────────────
  server.tool(
    'list_customers',
    'List Stripe customers with email, name, and subscription status.',
    {
      limit: z.number().int().min(1).max(100).default(20),
      email: z.string().optional().describe('Filter by email'),
    },
    async (args, extra) => {
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}`,
        },
        body: JSON.stringify({ action: 'list_stripe_customers', params: args, source: 'chatgpt_app' }),
      })
      const result = await res.json()
      return {
        structuredContent: result,
        content: [{ type: 'text' as const, text: result.success ? `${result.data?.length ?? 0} customers loaded` : `Failed: ${result.error}` }],
      }
    }
  )

  // ── send_email ───────────────────────────────────────────────────────────
  server.tool(
    'send_email',
    'Send an email to a CRM contact. Requires contact ID, subject, and body (HTML supported). ' +
    'Use search_contacts first to find the contact ID.',
    {
      contactId: z.string().describe('CRM contact ID (use search_contacts to find)'),
      subject: z.string().describe('Email subject line'),
      body: z.string().describe('Email body — HTML supported'),
    },
    async (args, extra) => {
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}`,
        },
        body: JSON.stringify({ action: 'send_email', params: args, source: 'chatgpt_app' }),
      })
      const result = await res.json()
      return {
        structuredContent: result,
        content: [{ type: 'text' as const, text: result.success ? `Email sent: "${args.subject}"` : `Failed: ${result.error}` }],
      }
    }
  )

  // ── post_to_slack ────────────────────────────────────────────────────────
  server.tool(
    'post_to_slack',
    'Post a message to a Slack channel. Useful for team notifications, announcements, and alerts.',
    {
      channel: z.string().describe('Channel name (e.g. "#general") or channel ID'),
      message: z.string().describe('Message text — supports Slack mrkdwn formatting'),
    },
    async (args, extra) => {
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}`,
        },
        body: JSON.stringify({ action: 'post_to_slack', params: args, source: 'chatgpt_app' }),
      })
      const result = await res.json()
      return {
        structuredContent: result,
        content: [{ type: 'text' as const, text: result.success ? `Posted to ${args.channel}` : `Failed: ${result.error}` }],
      }
    }
  )

  // ── ask_ai ───────────────────────────────────────────────────────────────
  server.tool(
    'ask_ai',
    'Ask the 0nMCP AI brain a question. Uses the knowledge base, connected service data, ' +
    'and CRM context to provide informed answers. For complex multi-step tasks, use run_pipeline instead.',
    {
      question: z.string().describe('Your question or task description'),
    },
    async (args, extra) => {
      const res = await fetch(`${API_BASE}/api/console/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}`,
        },
        body: JSON.stringify({ message: args.question, source: 'chatgpt_app' }),
      })
      const result = await res.json()
      return {
        structuredContent: result,
        content: [{ type: 'text' as const, text: result.reply || result.text || 'No response generated.' }],
      }
    }
  )

  // ── list_integrations ────────────────────────────────────────────────────
  server.tool(
    'list_integrations',
    'List all connected service integrations and their status. Shows which services are active, ' +
    'their capabilities, and whether they are wired to CRM agent workflows.',
    {},
    async (_args, extra) => {
      const res = await fetch(`${API_BASE}/api/console/integrations`, {
        headers: { Authorization: `Bearer ${((extra as Record<string, unknown>)?.authInfo as Record<string, string>)?.token ?? ''}` },
      })
      const data = await res.json()
      return {
        structuredContent: data,
        content: [{ type: 'text' as const, text: `${data.integrations?.length ?? 0} services connected across ${data.categories?.length ?? 0} categories.` }],
      }
    }
  )

  // ── list_commands ────────────────────────────────────────────────────────
  server.tool(
    'list_commands',
    'List all available 0nMCP universal commands. Shows what you can do across all surfaces ' +
    '(Console, CLI, Slack, Telegram, ChatGPT, API). Includes free and premium add-on commands.',
    {
      category: z.string().optional().describe('Filter by category: core, workflows, ai, crm, services, content, tools'),
    },
    async () => {
      const res = await fetch(`${API_BASE}/api/commands`)
      const data = await res.json()
      return {
        structuredContent: data,
        content: [{ type: 'text' as const, text: `${data.commands?.length ?? 35} universal commands available across 8 surfaces.` }],
      }
    }
  )

  _server = server
  return server
}
