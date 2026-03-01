import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '../auth/route'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/extension/execute — Execute a module action from the Chrome extension
 * Header: Authorization: Bearer <token>
 * Body: { module: string, action: string, data: object }
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
  }

  const userId = verifyToken(token)
  if (!userId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  let body: { module?: string; action?: string; data?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { module: moduleName, action, data } = body

  if (!moduleName || !action) {
    return NextResponse.json({ error: 'module and action required' }, { status: 400 })
  }

  const admin = getAdmin()

  // Verify module access
  const { data: listing } = await admin
    .from('store_listings')
    .select('id, price, workflow_data')
    .eq('category', 'extensions')
    .eq('slug', moduleName)
    .eq('status', 'active')
    .maybeSingle()

  if (!listing) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 })
  }

  // Check if paid module requires purchase
  if (listing.price > 0) {
    const { data: purchase } = await admin
      .from('store_purchases')
      .select('id')
      .eq('buyer_id', userId)
      .eq('listing_id', listing.id)
      .eq('status', 'completed')
      .maybeSingle()

    if (!purchase) {
      return NextResponse.json({ error: 'Module not purchased', upgrade: true }, { status: 403 })
    }
  }

  // Route to module handler
  try {
    switch (moduleName) {
      case 'social-poster':
        return await handleSocialPost(userId, action, data || {}, admin)
      case 'content-writer':
        return await handleContentWriter(action, data || {})
      case 'page-scraper':
        return await handlePageScraper(action, data || {})
      case 'crm-bridge':
        return await handleCrmBridge(userId, action, data || {}, admin)
      case 'seo-analyzer':
        return await handleSeoAnalyzer(action, data || {})
      case 'workflow-runner':
        return await handleWorkflowRunner(action, data || {})
      default:
        return NextResponse.json({ error: 'Unknown module' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Execution failed',
    }, { status: 500 })
  }
}

// ── Social Poster ────────────────────────────────────────────
async function handleSocialPost(
  userId: string,
  action: string,
  data: Record<string, unknown>,
  admin: ReturnType<typeof getAdmin>
) {
  if (action !== 'post') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { content, platforms, hashtags } = data as {
    content?: string
    platforms?: string[]
    hashtags?: string[]
  }

  if (!content || !platforms?.length) {
    return NextResponse.json({ error: 'content and platforms required' }, { status: 400 })
  }

  // Proxy to the existing social post API
  const fullContent = content + (hashtags?.length ? '\n\n' + hashtags.map((t) => `#${t}`).join(' ') : '')
  const results: { platform: string; success: boolean; url?: string; error?: string }[] = []

  for (const platform of platforms) {
    if (platform === 'linkedin') {
      const { data: member } = await admin
        .from('linkedin_members')
        .select('linkedin_id, linkedin_access_token, token_expires_at')
        .eq('user_id', userId)
        .maybeSingle()

      if (!member?.linkedin_access_token) {
        results.push({ platform: 'linkedin', success: false, error: 'LinkedIn not connected' })
        continue
      }

      if (member.token_expires_at && new Date(member.token_expires_at) < new Date()) {
        results.push({ platform: 'linkedin', success: false, error: 'LinkedIn token expired' })
        continue
      }

      const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${member.linkedin_access_token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: `urn:li:person:${member.linkedin_id}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: fullContent },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        }),
      })

      results.push({
        platform: 'linkedin',
        success: res.ok,
        ...(res.ok ? { url: `https://www.linkedin.com/feed/` } : { error: `API ${res.status}` }),
      })
    } else if (platform === 'reddit') {
      const { data: conn } = await admin
        .from('social_connections')
        .select('access_token, platform_metadata')
        .eq('user_id', userId)
        .eq('platform', 'reddit')
        .eq('is_connected', true)
        .maybeSingle()

      if (!conn?.access_token) {
        results.push({ platform: 'reddit', success: false, error: 'Reddit not connected' })
        continue
      }

      const subreddits = (conn.platform_metadata as { subreddits?: string[] })?.subreddits || ['ClaudeAI']
      const subreddit = subreddits[0]
      const title = fullContent.split('\n')[0].slice(0, 120)

      const res = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          Authorization: `bearer ${conn.access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': '0nMCP/3.0 (by /u/0nork)',
        },
        body: new URLSearchParams({ sr: subreddit, kind: 'self', title, text: fullContent, resubmit: 'true' }),
      })

      const resData = res.ok ? await res.json() : null
      results.push({
        platform: 'reddit',
        success: res.ok,
        ...(res.ok ? { url: resData?.json?.data?.url } : { error: `API ${res.status}` }),
      })
    } else if (platform === 'dev_to') {
      const { data: conn } = await admin
        .from('social_connections')
        .select('access_token')
        .eq('user_id', userId)
        .eq('platform', 'dev_to')
        .eq('is_connected', true)
        .maybeSingle()

      if (!conn?.access_token) {
        results.push({ platform: 'dev_to', success: false, error: 'Dev.to not connected' })
        continue
      }

      const title = fullContent.split('\n')[0].slice(0, 120) || '0nMCP Update'
      const res = await fetch('https://dev.to/api/articles', {
        method: 'POST',
        headers: { 'api-key': conn.access_token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: { title, body_markdown: fullContent, published: false } }),
      })

      const resData = res.ok ? await res.json() : null
      results.push({
        platform: 'dev_to',
        success: res.ok,
        ...(res.ok ? { url: resData?.url } : { error: `API ${res.status}` }),
      })
    } else {
      results.push({ platform, success: false, error: `${platform} not supported yet` })
    }
  }

  return NextResponse.json({ success: results.some((r) => r.success), results })
}

// ── Content Writer ───────────────────────────────────────────
async function handleContentWriter(action: string, data: Record<string, unknown>) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  const { pageContent, pageTitle, pageUrl, platform } = data as {
    pageContent?: string
    pageTitle?: string
    pageUrl?: string
    platform?: string
  }

  const platformPrompts: Record<string, string> = {
    linkedin: 'Write a professional LinkedIn post. Use a hook opening, provide value, and end with a call to action. Keep it under 1300 characters.',
    reddit: 'Write a Reddit post. Be authentic and conversational. Start with a compelling title, then provide valuable content.',
    dev_to: 'Write a Dev.to blog post in markdown. Include a catchy title, introduction, main content with code examples if relevant, and conclusion.',
    twitter: 'Write a tweet thread (max 5 tweets). Each tweet under 280 characters. Use engaging hooks.',
    generic: 'Write a social media post. Be engaging and provide value.',
  }

  const prompt = `Based on this webpage content, ${platformPrompts[platform || 'generic']}

Page: "${pageTitle || 'Untitled'}"
URL: ${pageUrl || 'N/A'}
Content: ${(pageContent || '').slice(0, 3000)}

Generate the post now:`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: `AI error: ${res.status}` }, { status: 502 })
  }

  const result = await res.json()
  const text = result.content?.[0]?.text || ''

  return NextResponse.json({ success: true, content: text, platform: platform || 'generic' })
}

// ── Page Scraper ─────────────────────────────────────────────
async function handlePageScraper(action: string, data: Record<string, unknown>) {
  const { pageContent, pageTitle, pageUrl } = data as {
    pageContent?: string
    pageTitle?: string
    pageUrl?: string
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  const prompts: Record<string, string> = {
    contacts: `Extract all contact information from this page. Return JSON with arrays for: emails, phones, names, companies, addresses.`,
    structured: `Extract all structured data from this page. Return JSON with: title, description, key_points, entities, metadata.`,
    prices: `Extract all pricing information from this page. Return JSON with array of: item, price, currency, details.`,
    links: `Extract and categorize all important links mentioned. Return JSON with: navigation, external, social, resources.`,
  }

  const prompt = `${prompts[action] || prompts.structured}

Page: "${pageTitle || 'Untitled'}"
URL: ${pageUrl || 'N/A'}
Content: ${(pageContent || '').slice(0, 4000)}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: `AI error: ${res.status}` }, { status: 502 })
  }

  const result = await res.json()
  const text = result.content?.[0]?.text || ''

  // Try to parse as JSON if possible
  try {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0])
      return NextResponse.json({ success: true, data: parsed, raw: text })
    }
  } catch {}

  return NextResponse.json({ success: true, data: null, raw: text })
}

// ── CRM Bridge ───────────────────────────────────────────────
async function handleCrmBridge(
  userId: string,
  action: string,
  data: Record<string, unknown>,
  admin: ReturnType<typeof getAdmin>
) {
  // Get user's CRM connection
  const { data: conn } = await admin
    .from('social_connections')
    .select('access_token, platform_metadata')
    .eq('user_id', userId)
    .eq('platform', 'crm')
    .eq('is_connected', true)
    .maybeSingle()

  if (!conn?.access_token) {
    return NextResponse.json({ error: 'CRM not connected. Connect in Console settings.' }, { status: 400 })
  }

  const CRM_API = 'https://services.leadconnectorhq.com'
  const headers = {
    Authorization: `Bearer ${conn.access_token}`,
    'Content-Type': 'application/json',
    Version: '2021-07-28',
  }

  if (action === 'create_contact') {
    const { name, email, phone, company, tags } = data as {
      name?: string; email?: string; phone?: string; company?: string; tags?: string[]
    }

    const locationId = (conn.platform_metadata as { location_id?: string })?.location_id
    if (!locationId) {
      return NextResponse.json({ error: 'CRM location not configured' }, { status: 400 })
    }

    const res = await fetch(`${CRM_API}/contacts/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        locationId,
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        companyName: company || undefined,
        tags: tags || ['0n-extension'],
      }),
    })

    const result = await res.json()
    return NextResponse.json({
      success: res.ok,
      contact: res.ok ? result.contact : null,
      error: res.ok ? undefined : result.message,
    })
  }

  if (action === 'add_note') {
    const { contactId, note } = data as { contactId?: string; note?: string }
    if (!contactId || !note) {
      return NextResponse.json({ error: 'contactId and note required' }, { status: 400 })
    }

    const res = await fetch(`${CRM_API}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: note }),
    })

    return NextResponse.json({ success: res.ok })
  }

  return NextResponse.json({ error: 'Unknown CRM action' }, { status: 400 })
}

// ── SEO Analyzer ─────────────────────────────────────────────
async function handleSeoAnalyzer(action: string, data: Record<string, unknown>) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  const { pageContent, pageTitle, pageUrl, metaDescription, headings } = data as {
    pageContent?: string
    pageTitle?: string
    pageUrl?: string
    metaDescription?: string
    headings?: string[]
  }

  const prompt = `Analyze this webpage for SEO and return a JSON report with:
- score (0-100)
- title_analysis: { text, length, verdict }
- meta_analysis: { text, length, verdict }
- heading_analysis: { h1_count, structure, issues }
- content_analysis: { word_count, readability, keyword_density }
- recommendations: string[] (top 5 actionable improvements)
- technical: { url_structure, mobile_hints }

Page: "${pageTitle || 'Untitled'}"
URL: ${pageUrl || 'N/A'}
Meta: ${metaDescription || 'None'}
Headings: ${(headings || []).join(', ') || 'None detected'}
Content (first 3000 chars): ${(pageContent || '').slice(0, 3000)}

Return ONLY valid JSON, no markdown.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: `AI error: ${res.status}` }, { status: 502 })
  }

  const result = await res.json()
  const text = result.content?.[0]?.text || ''

  try {
    const parsed = JSON.parse(text)
    return NextResponse.json({ success: true, report: parsed })
  } catch {
    return NextResponse.json({ success: true, report: null, raw: text })
  }
}

// ── Workflow Runner ──────────────────────────────────────────
async function handleWorkflowRunner(action: string, data: Record<string, unknown>) {
  // Proxy to the 0nMCP HTTP server or execute locally
  const { workflowId, inputs } = data as { workflowId?: string; inputs?: Record<string, string> }

  if (!workflowId) {
    return NextResponse.json({ error: 'workflowId required' }, { status: 400 })
  }

  if (action === 'list') {
    // Return available workflows — in future, query from DB
    return NextResponse.json({ success: true, workflows: [] })
  }

  if (action === 'run') {
    // Try to connect to local 0nMCP server
    try {
      const res = await fetch('http://localhost:3939/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: workflowId, inputs: inputs || {} }),
      })

      if (res.ok) {
        const result = await res.json()
        return NextResponse.json({ success: true, result })
      }

      return NextResponse.json({ error: 'Workflow execution failed', status: res.status }, { status: 502 })
    } catch {
      return NextResponse.json({
        error: 'Local 0nMCP server not running. Start with: 0nmcp serve',
      }, { status: 503 })
    }
  }

  return NextResponse.json({ error: 'Unknown workflow action' }, { status: 400 })
}
