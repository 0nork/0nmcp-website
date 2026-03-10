/**
 * AI Marketing Builder — Asset Generation Engine
 *
 * Generates production-quality marketing assets via Claude:
 * - Landing pages (hero, features, testimonials, CTA, footer)
 * - Emails (responsive HTML email templates)
 * - Forms (high-conversion with validation)
 * - Product pages (showcase with optional Stripe checkout)
 *
 * Cost: 10 Sparks per generation
 */

import Anthropic from '@anthropic-ai/sdk'

// ── Types ──

export type AssetType = 'landing_page' | 'email' | 'form' | 'product_page'

export interface BuilderConfig {
  assetType: AssetType
  prompt: string
  brandColors?: {
    primary: string
    secondary: string
    accent: string
    bg: string
    text: string
  }
  companyName?: string
  logoUrl?: string
  style?: 'minimal' | 'bold' | 'corporate' | 'creative'
  includeCheckout?: boolean
  checkoutPrice?: number
  crmWebhook?: string
  sections?: string[]
}

export interface BuilderResult {
  html: string
  title: string
  metadata: {
    assetType: AssetType
    sections: string[]
    wordCount: number
    responsive: boolean
    hasForm: boolean
    hasCheckout: boolean
  }
}

// ── Default Brand ──

const DEFAULT_BRAND = {
  primary: '#6366f1',
  secondary: '#06b6d4',
  accent: '#f59e0b',
  bg: '#030712',
  text: '#f1f5f9',
}

// ── Section Templates ──

const SECTION_DEFAULTS: Record<AssetType, string[]> = {
  landing_page: ['hero', 'features', 'social-proof', 'pricing', 'cta', 'footer'],
  email: ['header', 'hero', 'body', 'cta', 'footer'],
  form: ['header', 'fields', 'submit', 'footer'],
  product_page: ['hero', 'gallery', 'details', 'pricing', 'reviews', 'cta', 'footer'],
}

// ── System Prompts ──

function buildSystemPrompt(config: BuilderConfig): string {
  const colors = config.brandColors || DEFAULT_BRAND
  const company = config.companyName || 'Your Company'
  const style = config.style || 'bold'
  const sections = config.sections || SECTION_DEFAULTS[config.assetType]

  const styleGuide: Record<string, string> = {
    minimal: 'Clean, lots of whitespace, subtle animations, thin borders, light shadows. Think Apple/Stripe.',
    bold: 'High contrast, gradient accents, strong CTAs, animated backgrounds, glassmorphism cards. Think Vercel/Linear.',
    corporate: 'Professional, structured grid, conservative colors, trust badges, clear hierarchy. Think Salesforce.',
    creative: 'Playful, unique layouts, bold typography, creative illustrations, scroll animations. Think Notion/Figma.',
  }

  const base = `You are an expert web designer and frontend developer. Generate a COMPLETE, PRODUCTION-READY HTML document.

## Design System
- Primary: ${colors.primary}
- Secondary: ${colors.secondary}
- Accent: ${colors.accent}
- Background: ${colors.bg}
- Text: ${colors.text}
- Font: Inter (Google Fonts) for body, system monospace for code
- Style: ${styleGuide[style]}

## Company: ${company}
${config.logoUrl ? `Logo URL: ${config.logoUrl}` : ''}

## Requirements
- Complete <!DOCTYPE html> document with <head> and <body>
- ALL CSS must be inline in a <style> tag (no external stylesheets except Google Fonts)
- Fully responsive (mobile-first, works at 375px, 768px, 1280px)
- Smooth scroll behavior
- Accessible (proper heading hierarchy, alt text, focus states, semantic HTML)
- Professional animations (CSS only, no JS libraries)
- High-performance (no heavy assets, optimized CSS)
- Include sections: ${sections.join(', ')}

## Critical Rules
- Output ONLY the HTML. No markdown, no code fences, no explanations.
- The HTML must be complete and render perfectly in any browser.
- Use CSS custom properties for colors (--primary, --secondary, etc.)
- Include a <meta name="viewport"> tag for mobile responsiveness.`

  if (config.assetType === 'form' && config.crmWebhook) {
    return base + `

## Form Requirements
- The form must POST to: ${config.crmWebhook}
- Include proper form validation (required fields, email format, phone format)
- Show success/error states after submission
- Include JavaScript for form submission via fetch() with JSON body
- Add loading state on the submit button
- Style the form beautifully with floating labels or outlined inputs`
  }

  if (config.assetType === 'product_page' && config.includeCheckout) {
    return base + `

## Checkout Requirements
- Include a product showcase section with price display
- Price: $${(config.checkoutPrice || 0) / 100}
- Add a "Buy Now" button that opens a checkout modal or redirects
- Include quantity selector if appropriate
- Show trust badges (secure checkout, money-back guarantee)
- The checkout button should call: window.parent.postMessage({ type: '0n_checkout', price: ${config.checkoutPrice || 0} }, '*')`
  }

  if (config.assetType === 'email') {
    return base + `

## Email-Specific Requirements
- Use TABLE-based layout for email client compatibility
- Max width: 600px, centered
- Inline all CSS (email clients strip <style> tags, but include them as fallback)
- Include both HTML and a plain-text preview
- Use web-safe fonts with fallbacks
- All images must have alt text and explicit width/height
- Include an unsubscribe link placeholder at the bottom
- Add preheader text in a hidden div`
  }

  return base
}

// ── Generator ──

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  }
  return _client
}

/**
 * Generate a marketing asset using Claude.
 */
export async function generateAsset(config: BuilderConfig): Promise<BuilderResult> {
  const client = getClient()
  const systemPrompt = buildSystemPrompt(config)

  const assetLabels: Record<AssetType, string> = {
    landing_page: 'landing page',
    email: 'marketing email',
    form: 'lead capture form',
    product_page: 'product page',
  }

  const userPrompt = `Create a ${assetLabels[config.assetType]} for: ${config.prompt}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  let html = textBlock?.text || ''

  // Strip markdown code fences if present
  html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim()

  // Extract title from the HTML
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  const title = titleMatch?.[1] || h1Match?.[1] || config.prompt.slice(0, 60)

  // Count words in visible text
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = textContent.split(' ').filter(Boolean).length

  const sections = config.sections || SECTION_DEFAULTS[config.assetType]

  return {
    html,
    title,
    metadata: {
      assetType: config.assetType,
      sections,
      wordCount,
      responsive: true,
      hasForm: config.assetType === 'form' || !!config.crmWebhook,
      hasCheckout: !!config.includeCheckout,
    },
  }
}

// ── Export Formats ──

export type ExportFormat = 'html' | 'react' | 'crm_funnel' | 'crm_email'

/**
 * Convert generated HTML to other formats.
 */
export async function exportAsset(html: string, format: ExportFormat): Promise<string> {
  if (format === 'html') return html

  const client = getClient()

  const formatPrompts: Record<ExportFormat, string> = {
    html: '',
    react: `Convert this HTML to a React functional component using TypeScript and Tailwind CSS classes.
- Export as default function component
- Convert inline styles to Tailwind utility classes
- Use proper React patterns (className, onClick, etc.)
- Keep the component self-contained (no external dependencies)
- Output ONLY the TSX code, no explanations.`,

    crm_funnel: `Convert this HTML to a CRM-compatible custom code block:
- Remove the <!DOCTYPE>, <html>, <head>, <body> wrappers
- Keep only the inner content with inline styles
- Ensure all CSS is inlined on elements (no <style> tag)
- Make all URLs absolute
- Output ONLY the HTML fragment, no explanations.`,

    crm_email: `Convert this HTML to an email template compatible with CRM email builders:
- Use TABLE-based layout
- Inline ALL CSS on elements
- Max width 600px
- Replace any JavaScript with static content
- Add {{contact.first_name}} merge tags where a name greeting appears
- Add {{unsubscribe_link}} at the bottom
- Output ONLY the HTML, no explanations.`,
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: `${formatPrompts[format]}\n\nHTML to convert:\n${html}`,
    }],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  let result = textBlock?.text || html

  // Strip code fences
  result = result.replace(/^```(?:tsx?|html|jsx)?\n?/i, '').replace(/\n?```$/i, '').trim()

  return result
}
