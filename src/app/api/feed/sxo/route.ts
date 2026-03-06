import { NextRequest, NextResponse } from 'next/server'
import { Feed } from 'feed'
import { renderFeed } from '@/lib/rss'

export const dynamic = 'force-dynamic'

/**
 * SXO White-Label Content Feed
 *
 * Generates RSS feeds of SEO-optimized content blocks that users can
 * white-label and drop into their own blogs. Content is generated from
 * the SXO formula: Entity → Service Cluster → Problem/Solution →
 * Authority → Location → Portfolio → CTA.
 *
 * Query params:
 *   brand     — Business name (required)
 *   industry  — Industry vertical (e.g., "contractor", "saas", "agency")
 *   services  — Comma-separated primary services
 *   location  — Primary service area
 *   cta       — Call to action text
 *   format    — rss | atom | json (default: rss)
 *   domain    — Custom domain for links (default: 0nmcp.com)
 */

interface SxoConfig {
  brand: string
  industry: string
  services: string[]
  location: string
  cta: string
  domain: string
}

/** SXO content block generators — each produces a blog-ready article */

function entityBlock(cfg: SxoConfig): { title: string; slug: string; body: string } {
  const svcList = cfg.services.join(', ')
  return {
    title: `About ${cfg.brand} — ${cfg.industry} Services in ${cfg.location}`,
    slug: `about-${slugify(cfg.brand)}`,
    body: `# About ${cfg.brand}

${cfg.brand} is a professional ${cfg.industry} company serving ${cfg.location} and surrounding areas.

## What We Do

We specialize in ${svcList}. Our team brings years of experience to every project, ensuring quality results that stand the test of time.

## Our Service Area

Based in ${cfg.location}, we serve residential and commercial clients throughout the region. Whether you need ${cfg.services[0] || 'our services'} or ${cfg.services[1] || 'related solutions'}, we have the expertise to deliver.

## Why Choose ${cfg.brand}

- **Local expertise** — We know ${cfg.location} and its unique requirements
- **Full-service** — From consultation to completion
- **Proven track record** — Hundreds of satisfied clients

${cfg.cta}`,
  }
}

function serviceClusterBlock(cfg: SxoConfig, service: string): { title: string; slug: string; body: string } {
  return {
    title: `${service} Services — ${cfg.brand} in ${cfg.location}`,
    slug: `${slugify(service)}-services-${slugify(cfg.location)}`,
    body: `# ${service} Services in ${cfg.location}

${cfg.brand} provides professional ${service.toLowerCase()} services to residential and commercial clients in ${cfg.location}.

## What ${service} Includes

Our ${service.toLowerCase()} service covers the full scope of work — from initial consultation and design through installation and completion. We handle all aspects so you don't have to.

## Related Services

${cfg.services.filter(s => s !== service).map(s => `- ${s}`).join('\n')}

## Service Area

We provide ${service.toLowerCase()} services throughout ${cfg.location} and surrounding communities.

## Get Started

${cfg.cta}`,
  }
}

function problemSolutionBlock(cfg: SxoConfig, problem: string, solution: string, outcome: string): { title: string; slug: string; body: string } {
  return {
    title: `${problem} — How ${cfg.brand} Solves It`,
    slug: `${slugify(problem)}-solution`,
    body: `# ${problem}

Many property owners in ${cfg.location} face the challenge of ${problem.toLowerCase()}. Left unaddressed, this can lead to costly repairs and reduced property value.

## The Solution

${cfg.brand} resolves this with professional ${solution.toLowerCase()}. Our approach is proven, efficient, and built to last.

## The Outcome

${outcome}. Our clients consistently report satisfaction with the quality and durability of our work.

## Ready to Solve This?

${cfg.cta}`,
  }
}

function locationBlock(cfg: SxoConfig, area: string): { title: string; slug: string; body: string } {
  const primaryService = cfg.services[0] || cfg.industry
  return {
    title: `${primaryService} in ${area} — ${cfg.brand}`,
    slug: `${slugify(primaryService)}-${slugify(area)}`,
    body: `# ${primaryService} in ${area}

Looking for a trusted ${cfg.industry.toLowerCase()} provider in ${area}? ${cfg.brand} has been serving the ${area} area with professional ${primaryService.toLowerCase()} services.

## Our ${area} Services

${cfg.services.map(s => `- **${s}** — Professional installation and service`).join('\n')}

## Why ${area} Residents Choose ${cfg.brand}

We understand the specific needs of ${area} properties. Local building codes, soil conditions, weather patterns — we factor everything in so your project is done right the first time.

## Get a Free Estimate

${cfg.cta}`,
  }
}

function authorityBlock(cfg: SxoConfig): { title: string; slug: string; body: string } {
  return {
    title: `Why Trust ${cfg.brand} — Our Credentials and Experience`,
    slug: `why-trust-${slugify(cfg.brand)}`,
    body: `# Why Trust ${cfg.brand}

Choosing a ${cfg.industry.toLowerCase()} company is a significant decision. Here's why ${cfg.location} residents and businesses trust ${cfg.brand}.

## Experience

Years of hands-on experience in ${cfg.services.join(', ').toLowerCase()} across ${cfg.location} and the surrounding region.

## Quality Materials

We partner with industry-leading manufacturers to ensure every project uses premium materials backed by manufacturer warranties.

## Client Satisfaction

Our reputation is built on delivering results. From the initial consultation to project completion, we prioritize clear communication and quality workmanship.

## Licensed and Insured

${cfg.brand} is fully licensed and insured, giving you peace of mind throughout every project.

${cfg.cta}`,
  }
}

/** Pre-built problem/solution templates by industry */
const INDUSTRY_PROBLEMS: Record<string, { problem: string; solution: string; outcome: string }[]> = {
  contractor: [
    { problem: 'Aging outdoor spaces that reduce curb appeal', solution: 'Professional hardscape and landscape renovation', outcome: 'Dramatically improved property appearance and value' },
    { problem: 'Poor yard drainage causing water damage', solution: 'Professional grading and drainage installation', outcome: 'Long-term water control and foundation protection' },
    { problem: 'Crumbling retaining walls and erosion', solution: 'Engineered retaining wall systems', outcome: 'Stable, attractive structures that last decades' },
  ],
  saas: [
    { problem: 'Manual processes eating up team hours', solution: 'Workflow automation and AI integration', outcome: 'Hours saved per week, fewer errors, faster delivery' },
    { problem: 'Scattered tools with no central dashboard', solution: 'Unified platform with single-sign-on', outcome: 'One place to manage everything, better visibility' },
    { problem: 'Losing leads due to slow follow-up', solution: 'Automated lead capture and instant response', outcome: 'Higher conversion rates and no missed opportunities' },
  ],
  agency: [
    { problem: 'Clients not ranking in local search', solution: 'Comprehensive local SEO and content strategy', outcome: 'Top-3 rankings for target keywords within 90 days' },
    { problem: 'Low website conversion rates', solution: 'Conversion rate optimization and UX redesign', outcome: 'Measurable increase in leads and revenue' },
    { problem: 'Inconsistent brand presence online', solution: 'Unified brand strategy across all channels', outcome: 'Stronger brand recognition and customer trust' },
  ],
  default: [
    { problem: 'Difficulty reaching potential customers online', solution: 'Professional digital presence and SEO', outcome: 'Increased visibility and consistent lead flow' },
    { problem: 'Time-consuming manual operations', solution: 'Process automation and optimization', outcome: 'More time for high-value work, reduced overhead' },
    { problem: 'Lack of credibility with new prospects', solution: 'Authority-building content and social proof', outcome: 'Higher trust signals and faster sales cycles' },
  ],
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const brand = params.get('brand')

  if (!brand) {
    return NextResponse.json({
      error: 'Missing required parameter: brand',
      usage: '/api/feed/sxo?brand=YourBusiness&industry=contractor&services=paving,landscaping&location=Pittsburgh&format=rss',
      params: {
        brand: 'Business name (required)',
        industry: 'Industry vertical: contractor, saas, agency, or any custom',
        services: 'Comma-separated services',
        location: 'Primary service area',
        cta: 'Call to action text',
        domain: 'Your domain for canonical links',
        format: 'rss | atom | json (default: rss)',
      },
    }, { status: 400 })
  }

  const cfg: SxoConfig = {
    brand,
    industry: params.get('industry') || 'business',
    services: (params.get('services') || '').split(',').map(s => s.trim()).filter(Boolean),
    location: params.get('location') || '',
    cta: params.get('cta') || `Contact ${brand} today for a free consultation.`,
    domain: params.get('domain') || '0nmcp.com',
  }

  if (cfg.services.length === 0) cfg.services = [cfg.industry]
  if (!cfg.location) cfg.location = 'your area'

  const format = params.get('format')
  const baseUrl = cfg.domain.startsWith('http') ? cfg.domain : `https://${cfg.domain}`

  const feed = new Feed({
    title: `${cfg.brand} — ${cfg.industry} Blog`,
    description: `SEO-optimized content for ${cfg.brand}. Powered by 0nMCP SXO Engine.`,
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    copyright: `Copyright ${new Date().getFullYear()} ${cfg.brand}`,
    generator: '0nMCP SXO Engine',
    feedLinks: {
      rss2: `https://0nmcp.com/api/feed/sxo?brand=${encodeURIComponent(brand)}&format=rss`,
      atom: `https://0nmcp.com/api/feed/sxo?brand=${encodeURIComponent(brand)}&format=atom`,
    },
    author: { name: cfg.brand, link: baseUrl },
  })

  // Generate all content blocks
  const articles: { title: string; slug: string; body: string; date: Date }[] = []
  const now = Date.now()
  let dayOffset = 0

  // 1. Entity block
  const entity = entityBlock(cfg)
  articles.push({ ...entity, date: new Date(now - dayOffset++ * 86400000) })

  // 2. Service cluster blocks (one per service)
  for (const svc of cfg.services) {
    const cluster = serviceClusterBlock(cfg, svc)
    articles.push({ ...cluster, date: new Date(now - dayOffset++ * 86400000) })
  }

  // 3. Problem/Solution blocks
  const problems = INDUSTRY_PROBLEMS[cfg.industry] ?? INDUSTRY_PROBLEMS.default
  for (const ps of problems) {
    const psBlock = problemSolutionBlock(cfg, ps.problem, ps.solution, ps.outcome)
    articles.push({ ...psBlock, date: new Date(now - dayOffset++ * 86400000) })
  }

  // 4. Authority block
  const auth = authorityBlock(cfg)
  articles.push({ ...auth, date: new Date(now - dayOffset++ * 86400000) })

  // 5. Location blocks (if location provided, generate for main + surrounding)
  if (cfg.location && cfg.location !== 'your area') {
    const locBlock = locationBlock(cfg, cfg.location)
    articles.push({ ...locBlock, date: new Date(now - dayOffset++ * 86400000) })
  }

  // Add all articles to feed
  for (const article of articles) {
    feed.addItem({
      title: article.title,
      id: `${baseUrl}/blog/${article.slug}`,
      link: `${baseUrl}/blog/${article.slug}`,
      description: article.body.split('\n').find(l => l && !l.startsWith('#'))?.trim() || article.title,
      content: article.body,
      author: [{ name: cfg.brand }],
      date: article.date,
    })
  }

  const { body, contentType } = renderFeed(feed, format)

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      'X-Powered-By': '0nMCP SXO Engine',
    },
  })
}
