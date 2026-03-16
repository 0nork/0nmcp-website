/**
 * web0n AutoBuild Engine — Server-side AI website generation + CRM funnel deployment
 *
 * Flow: Business data → AI generates 5 pages → Deploy to CRM funnel → Live site
 * Based on GHL-AutoBuild (CRO9 methodology)
 *
 * Multi-provider AI with automatic fallback:
 *   Groq (free) → OpenAI → Gemini → Anthropic
 */

const GHL_API = 'https://rest.gohighlevel.com/v1'

interface PageContent {
  name: string
  slug: string
  html: string
}

interface AutoBuildResult {
  funnelId?: string
  funnelUrl?: string
  pages: Array<{ name: string; pageId?: string }>
  error?: string
}

interface BusinessInfo {
  name: string
  type?: string
  services?: string[]
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  website?: string
  brandColor?: string
  tagline?: string
  googleData?: Record<string, unknown>
}

// ==================== AI PROVIDER ABSTRACTION ====================

interface AiProvider {
  name: string
  available: () => boolean
  generate: (system: string, prompt: string) => Promise<string>
}

const providers: AiProvider[] = [
  // 1. Groq — FREE tier, fast, Llama 3.3 70B
  {
    name: 'groq',
    available: () => !!process.env.GROQ_API_KEY,
    generate: async (system: string, prompt: string) => {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 24000,
          temperature: 0.7,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
        }),
      })
      if (!res.ok) throw new Error(`Groq API failed: ${res.status} — ${await res.text()}`)
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  },

  // 2. OpenAI — GPT-4o
  {
    name: 'openai',
    available: () => !!process.env.OPENAI_API_KEY,
    generate: async (system: string, prompt: string) => {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 16000,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
        }),
      })
      if (!res.ok) throw new Error(`OpenAI API failed: ${res.status} — ${await res.text()}`)
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  },

  // 3. Google Gemini — Gemini 2.0 Flash
  {
    name: 'gemini',
    available: () => !!process.env.GOOGLE_GEMINI_API_KEY,
    generate: async (system: string, prompt: string) => {
      const key = process.env.GOOGLE_GEMINI_API_KEY
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 24000, temperature: 0.7 },
          }),
        }
      )
      if (!res.ok) throw new Error(`Gemini API failed: ${res.status} — ${await res.text()}`)
      const data = await res.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    },
  },

  // 4. Anthropic — Claude Sonnet (paid, last resort)
  {
    name: 'anthropic',
    available: () => !!process.env.ANTHROPIC_API_KEY,
    generate: async (system: string, prompt: string) => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 24000,
          system,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!res.ok) throw new Error(`Anthropic API failed: ${res.status} — ${await res.text()}`)
      const data = await res.json()
      return data.content?.[0]?.text || ''
    },
  },
]

/**
 * Call AI with automatic fallback across all configured providers.
 * Order: Groq (free) → OpenAI → Gemini → Anthropic
 */
async function callAI(system: string, prompt: string): Promise<{ text: string; provider: string }> {
  const available = providers.filter(p => p.available())

  if (available.length === 0) {
    throw new Error('No AI providers configured. Set at least one of: GROQ_API_KEY, OPENAI_API_KEY, GOOGLE_GEMINI_API_KEY, ANTHROPIC_API_KEY')
  }

  const errors: string[] = []

  for (const provider of available) {
    try {
      console.log(`[autobuild] Trying ${provider.name}...`)
      const text = await provider.generate(system, prompt)
      if (!text) throw new Error('Empty response')
      console.log(`[autobuild] ${provider.name} succeeded (${text.length} chars)`)
      return { text, provider: provider.name }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`[autobuild] ${provider.name} failed:`, msg.slice(0, 200))
      errors.push(`${provider.name}: ${msg.slice(0, 100)}`)
    }
  }

  throw new Error(`All AI providers failed:\n${errors.join('\n')}`)
}

// ==================== AI PAGE GENERATION ====================

const SYSTEM_PROMPT = `You are CRO9, an elite website copywriter and conversion rate optimization specialist. You generate complete, production-ready HTML pages for small business websites.

Rules:
- Write compelling, SEO-optimized copy that converts visitors into customers
- Use semantic HTML5 with inline styles (no external CSS needed)
- Mobile-responsive design using modern CSS (flexbox, grid, clamp)
- Dark professional theme: background #0a0a0f, text #e8e8ef, accent provided by user
- Include proper meta tags, Open Graph, and structured data (JSON-LD)
- Every page must have clear CTAs (call, book, contact)
- Write real, specific copy — not lorem ipsum or generic filler
- Include the business phone, email, and address where relevant
- Each page should be a complete, standalone HTML document`

function buildPrompt(biz: BusinessInfo): string {
  const services = biz.services?.length ? biz.services.join(', ') : biz.type || 'professional services'
  const location = [biz.city, biz.state].filter(Boolean).join(', ')
  const color = biz.brandColor || '#7ed957'

  let googleContext = ''
  if (biz.googleData) {
    const gd = biz.googleData as Record<string, unknown>
    if (gd.rating) googleContext += `\nGoogle Rating: ${gd.rating}/5`
    if (gd.userRatingsTotal) googleContext += ` (${gd.userRatingsTotal} reviews)`
    if (gd.openingHours) googleContext += `\nHours: ${JSON.stringify(gd.openingHours)}`
  }

  return `Generate 5 complete HTML pages for this business:

Business: ${biz.name}
Industry: ${biz.type || 'Local Business'}
Services: ${services}
Location: ${location || 'United States'}
Phone: ${biz.phone || ''}
Email: ${biz.email || ''}
Address: ${[biz.address, biz.city, biz.state, biz.zip].filter(Boolean).join(', ')}
Tagline: ${biz.tagline || ''}
Brand Accent Color: ${color}${googleContext}

Generate these 5 pages as complete HTML documents:
1. HOME — Hero section, intro, services preview, testimonial area, CTA
2. SERVICES — Detailed service list with descriptions, benefits, pricing hints
3. ABOUT — Company story, team/expertise, values, why choose us
4. BOOKING — Online scheduling page with a clean, functional calendar widget built in pure HTML/CSS/JS (no external dependencies). Show a monthly calendar grid where users can select a date, then pick from available time slots (9am-5pm, 30-min intervals). Include a booking form (name, email, phone, service dropdown using the business services list, preferred date/time). Style it to match the site theme. Add a confirmation message on submit. The calendar should be interactive with JavaScript — clicking a date highlights it and shows time slots for that day.
5. CONTACT — Contact form (action="#"), hours, address, embedded map placeholder, CTA

Return ONLY a JSON array with 5 objects:
[
  {"name": "Home", "slug": "/", "html": "<!DOCTYPE html>..."},
  {"name": "Services", "slug": "/services", "html": "<!DOCTYPE html>..."},
  {"name": "About", "slug": "/about", "html": "<!DOCTYPE html>..."},
  {"name": "Booking", "slug": "/booking", "html": "<!DOCTYPE html>..."},
  {"name": "Contact", "slug": "/contact", "html": "<!DOCTYPE html>..."}
]

Return ONLY the JSON array. No markdown, no code fences, no explanation.`
}

/**
 * Generate 5 website pages using AI (CRO9 methodology)
 * Automatic fallback: Groq (free) → OpenAI → Gemini → Anthropic
 */
export async function generatePages(biz: BusinessInfo): Promise<PageContent[]> {
  console.log('[autobuild] Generating pages for:', biz.name)

  const { text, provider } = await callAI(SYSTEM_PROMPT, buildPrompt(biz))

  // Parse JSON from response (handle potential markdown fences)
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  let pages: PageContent[]
  try {
    pages = JSON.parse(jsonStr)
  } catch {
    // Try to extract JSON array from the response
    const match = jsonStr.match(/\[[\s\S]*\]/)
    if (!match) throw new Error(`${provider} returned non-JSON response: ${jsonStr.slice(0, 200)}`)
    pages = JSON.parse(match[0])
  }

  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error(`${provider} returned invalid page data`)
  }

  console.log(`[autobuild] Generated ${pages.length} pages via ${provider}`)
  return pages
}

// ==================== CRM FUNNEL DEPLOYMENT ====================

async function ghlRequest(path: string, method: string, body: Record<string, unknown>, apiKey: string) {
  const res = await fetch(`${GHL_API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: method === 'GET' ? undefined : JSON.stringify(body),
  })
  return res.json()
}

/**
 * Deploy generated pages to a CRM funnel
 * Requires a location-level API key with Funnels write permission
 */
export async function deployToFunnel(
  pages: PageContent[],
  locationId: string,
  businessName: string,
  apiKey: string
): Promise<AutoBuildResult> {
  console.log('[autobuild] Deploying to CRM funnel for:', businessName)

  // 1. Create the funnel (website type)
  const funnelRes = await ghlRequest('/funnels/', 'POST', {
    locationId,
    name: `${businessName} Website`,
    type: 'website',
  }, apiKey)

  const funnelId = funnelRes.funnel?.id
  if (!funnelId) {
    return {
      pages: [],
      error: `Funnel creation failed: ${JSON.stringify(funnelRes).slice(0, 200)}`,
    }
  }

  console.log('[autobuild] Funnel created:', funnelId)

  // 2. Deploy each page
  const deployedPages: Array<{ name: string; pageId?: string }> = []
  for (const page of pages) {
    try {
      const pageRes = await ghlRequest(`/funnels/${funnelId}/pages`, 'POST', {
        locationId,
        name: page.name,
        pathSlug: page.slug === '/' ? '' : page.slug.replace(/^\//, ''),
        html: page.html,
      }, apiKey)

      const pageId = pageRes.page?.id
      deployedPages.push({ name: page.name, pageId })
      console.log('[autobuild] Page deployed:', page.name, pageId || '(no id)')
    } catch (err) {
      console.error('[autobuild] Page deploy failed:', page.name, err)
      deployedPages.push({ name: page.name })
    }
  }

  // 3. Get funnel URL
  let funnelUrl: string | undefined
  try {
    const funnelDetail = await ghlRequest(`/funnels/${funnelId}`, 'GET', {}, apiKey)
    funnelUrl = funnelDetail.funnel?.url || funnelDetail.funnel?.publishedUrl
  } catch {
    // non-fatal
  }

  return {
    funnelId,
    funnelUrl,
    pages: deployedPages,
  }
}

// ==================== FULL AUTOBUILD PIPELINE ====================

/**
 * Full autobuild: generate pages with AI + deploy to CRM funnel
 * Called from runDepositPaidAutomation() after sub-account is created
 *
 * Uses automatic provider fallback: Groq (free) → OpenAI → Gemini → Anthropic
 */
export async function runAutoBuild(params: {
  businessName: string
  businessType?: string
  services?: string[]
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  website?: string
  brandColor?: string
  tagline?: string
  googleData?: Record<string, unknown>
  locationId: string
  locationApiKey: string
}): Promise<AutoBuildResult> {
  // 1. Generate pages
  const pages = await generatePages({
    name: params.businessName,
    type: params.businessType,
    services: params.services,
    phone: params.phone,
    email: params.email,
    address: params.address,
    city: params.city,
    state: params.state,
    zip: params.zip,
    website: params.website,
    brandColor: params.brandColor,
    tagline: params.tagline,
    googleData: params.googleData,
  })

  // 2. Deploy to funnel
  const result = await deployToFunnel(
    pages,
    params.locationId,
    params.businessName,
    params.locationApiKey
  )

  return result
}
