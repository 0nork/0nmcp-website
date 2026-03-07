/**
 * SXO Formula Engine
 *
 * Takes structured business input and generates modular content blocks
 * following the SXO formula: Entity → Service Cluster → Problem/Solution →
 * Authority → Location → Portfolio → CTA.
 *
 * Each page outputs:
 *   - page.md (structured markdown)
 *   - schema.json (JSON-LD)
 *   - metadata.json (title, description, og)
 *   - internal-links.json (cross-page links)
 */

// ─── Types ──────────────────────────────────────────────────────

export interface SxoInput {
  brand: string
  industry: string
  services: string[]
  locations: string[]
  cta?: string
  domain?: string
  logo?: string
  primaryColor?: string
  tagline?: string
  phone?: string
  email?: string
}

export interface SxoBlock {
  type: 'entity' | 'service_cluster' | 'problem_solution' | 'authority' | 'location' | 'portfolio' | 'cta'
  heading: string
  content: string
}

export interface SxoPage {
  slug: string
  title: string
  pageType: string
  blocks: SxoBlock[]
  markdown: string
  schema: Record<string, unknown>
  metadata: { title: string; description: string; canonical: string; og: Record<string, string> }
  internalLinks: { text: string; href: string; context: string }[]
}

export interface SxoFormula {
  industry: string
  problemSolutions: { problem: string; solution: string; outcome: string }[]
}

export interface SxoOutput {
  site: { brand: string; domain: string; industry: string }
  pages: SxoPage[]
  totalPages: number
  generatedAt: string
}

// ─── Industry Problem/Solution Templates ────────────────────────

const INDUSTRY_PS: Record<string, { problem: string; solution: string; outcome: string }[]> = {
  contractor: [
    { problem: 'Aging outdoor spaces reducing curb appeal', solution: 'Professional hardscape renovation', outcome: 'Dramatically improved property value' },
    { problem: 'Poor yard drainage causing water damage', solution: 'Engineered grading and drainage', outcome: 'Long-term water control and foundation protection' },
    { problem: 'Crumbling retaining walls and erosion', solution: 'Engineered retaining wall systems', outcome: 'Stable structures built to last decades' },
    { problem: 'Unsafe or outdated walkways', solution: 'Professional paver installation', outcome: 'Safe, attractive, ADA-compliant pathways' },
    { problem: 'No usable outdoor living space', solution: 'Custom patio and outdoor kitchen design', outcome: 'Extended living area that increases home value' },
  ],
  saas: [
    { problem: 'Manual processes eating up team hours', solution: 'Workflow automation and AI integration', outcome: 'Hours saved per week with fewer errors' },
    { problem: 'Scattered tools with no central dashboard', solution: 'Unified platform with single sign-on', outcome: 'One place to manage everything' },
    { problem: 'Losing leads due to slow follow-up', solution: 'Automated lead capture and instant response', outcome: 'Higher conversion rates' },
    { problem: 'No visibility into team performance', solution: 'Real-time analytics and reporting', outcome: 'Data-driven decisions and accountability' },
    { problem: 'Scaling bottlenecks as team grows', solution: 'Enterprise-grade infrastructure', outcome: 'Seamless growth without re-platforming' },
  ],
  agency: [
    { problem: 'Not ranking in local search results', solution: 'Comprehensive local SEO and content strategy', outcome: 'Top-3 rankings within 90 days' },
    { problem: 'Low website conversion rates', solution: 'Conversion rate optimization and UX redesign', outcome: 'Measurable increase in leads and revenue' },
    { problem: 'Inconsistent brand presence online', solution: 'Unified brand strategy across all channels', outcome: 'Stronger recognition and customer trust' },
    { problem: 'Wasting ad budget with poor targeting', solution: 'Data-driven paid media management', outcome: 'Lower cost per acquisition, higher ROAS' },
    { problem: 'No content strategy driving organic traffic', solution: 'SEO content engine with editorial calendar', outcome: 'Compounding organic traffic growth' },
  ],
  ecommerce: [
    { problem: 'Products not appearing in shopping searches', solution: 'Product schema markup and feed optimization', outcome: 'Higher visibility in AI and shopping results' },
    { problem: 'High cart abandonment rates', solution: 'Checkout optimization and retargeting flows', outcome: 'Recovered revenue and lower abandonment' },
    { problem: 'Low repeat purchase rates', solution: 'Email/SMS loyalty and retention campaigns', outcome: 'Higher customer lifetime value' },
    { problem: 'Poor mobile shopping experience', solution: 'Mobile-first UX with accelerated checkout', outcome: 'Increased mobile conversion rate' },
    { problem: 'No social proof driving purchases', solution: 'UGC collection and review integration', outcome: 'Higher trust from new visitors' },
  ],
  realestate: [
    { problem: 'Home not selling after months on market', solution: 'Strategic pricing and professional marketing', outcome: 'Faster sale at optimal price' },
    { problem: 'First-time buyer overwhelmed by process', solution: 'Step-by-step buyer guidance', outcome: 'Confident purchase with no surprises' },
    { problem: 'Not sure what a home is worth', solution: 'Comparative market analysis', outcome: 'Accurate valuation backed by data' },
    { problem: 'Rental property management headaches', solution: 'Full-service property management', outcome: 'Passive income without the stress' },
    { problem: 'Missing off-market opportunities', solution: 'Exclusive network and pocket listing access', outcome: 'First access to deals before they list' },
  ],
}

const DEFAULT_PS = [
  { problem: 'Difficulty reaching customers online', solution: 'Professional digital presence and SEO', outcome: 'Increased visibility and consistent lead flow' },
  { problem: 'Time-consuming manual operations', solution: 'Process automation and optimization', outcome: 'More time for high-value work' },
  { problem: 'Lack of credibility with new prospects', solution: 'Authority-building content and social proof', outcome: 'Higher trust and faster sales cycles' },
]

// ─── Helpers ────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function baseUrl(domain?: string): string {
  if (!domain) return ''
  return domain.startsWith('http') ? domain : `https://${domain}`
}

// ─── Block Generators ───────────────────────────────────────────

function entityBlock(input: SxoInput): SxoBlock {
  const svcList = input.services.join(', ')
  const locList = input.locations.join(', ') || 'your area'
  return {
    type: 'entity',
    heading: `About ${input.brand}`,
    content: `${input.brand} is a professional ${input.industry} company${input.locations.length ? ` serving ${locList}` : ''}.\n\nWe specialize in ${svcList}. Our team brings years of experience to every project, ensuring quality results that stand the test of time.${input.tagline ? `\n\n*${input.tagline}*` : ''}`,
  }
}

function serviceClusterBlock(input: SxoInput, service: string): SxoBlock {
  const related = input.services.filter(s => s !== service)
  return {
    type: 'service_cluster',
    heading: `${service} Services`,
    content: `${input.brand} provides professional ${service.toLowerCase()} services${input.locations.length ? ` throughout ${input.locations[0]}` : ''}.\n\nOur ${service.toLowerCase()} service covers the full scope — from consultation and design through completion.${related.length ? `\n\n**Related Services:** ${related.join(', ')}` : ''}`,
  }
}

function problemSolutionBlock(ps: { problem: string; solution: string; outcome: string }): SxoBlock {
  return {
    type: 'problem_solution',
    heading: ps.problem,
    content: `**Problem:** ${ps.problem}\n\n**Solution:** ${ps.solution}\n\n**Outcome:** ${ps.outcome}`,
  }
}

function authorityBlock(input: SxoInput): SxoBlock {
  return {
    type: 'authority',
    heading: `Why Trust ${input.brand}`,
    content: `**Experience:** Years of hands-on expertise in ${input.services.join(', ').toLowerCase()}${input.locations.length ? ` across ${input.locations[0]}` : ''}.\n\n**Quality:** We partner with industry-leading manufacturers and use premium materials.\n\n**Licensed & Insured:** ${input.brand} is fully licensed and insured for your peace of mind.`,
  }
}

function locationBlock(input: SxoInput, location: string): SxoBlock {
  const svc = input.services[0] || input.industry
  return {
    type: 'location',
    heading: `${svc} in ${location}`,
    content: `Looking for a trusted ${input.industry.toLowerCase()} provider in ${location}? ${input.brand} serves ${location} with professional ${input.services.join(', ').toLowerCase()} services.\n\nWe understand the specific needs of ${location} properties — local building codes, conditions, and requirements are all factored in.`,
  }
}

function ctaBlock(input: SxoInput): SxoBlock {
  return {
    type: 'cta',
    heading: 'Get Started',
    content: input.cta || `Contact ${input.brand} today for a free consultation.${input.phone ? ` Call ${input.phone}` : ''}${input.email ? ` or email ${input.email}` : ''}.`,
  }
}

// ─── Schema Generators ──────────────────────────────────────────

function localBusinessSchema(input: SxoInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: input.brand,
    description: `${input.brand} — professional ${input.industry} services${input.locations.length ? ` in ${input.locations[0]}` : ''}.`,
    ...(input.domain && { url: baseUrl(input.domain) }),
    ...(input.phone && { telephone: input.phone }),
    ...(input.email && { email: input.email }),
    ...(input.logo && { image: input.logo }),
    ...(input.locations.length && {
      areaServed: input.locations.map(l => ({
        '@type': 'City',
        name: l,
      })),
    }),
    makesOffer: input.services.map(s => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s },
    })),
  }
}

function serviceSchema(input: SxoInput, service: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service} — ${input.brand}`,
    provider: { '@type': 'LocalBusiness', name: input.brand },
    ...(input.locations.length && {
      areaServed: { '@type': 'City', name: input.locations[0] },
    }),
    description: `Professional ${service.toLowerCase()} services by ${input.brand}.`,
  }
}

function faqSchema(items: { q: string; a: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  }
}

// ─── Page Generators ────────────────────────────────────────────

function generateEntityPage(input: SxoInput, allPages: { slug: string; title: string }[]): SxoPage {
  const slug = `about-${slugify(input.brand)}`
  const blocks = [entityBlock(input), authorityBlock(input), ctaBlock(input)]
  const markdown = blocks.map(b => `## ${b.heading}\n\n${b.content}`).join('\n\n---\n\n')
  const title = `About ${input.brand} — ${input.industry} Services${input.locations.length ? ` in ${input.locations[0]}` : ''}`

  return {
    slug,
    title,
    pageType: 'entity',
    blocks,
    markdown: `# ${title}\n\n${markdown}`,
    schema: localBusinessSchema(input),
    metadata: {
      title,
      description: `${input.brand} is a professional ${input.industry} company specializing in ${input.services.join(', ')}.`,
      canonical: `${baseUrl(input.domain)}/blog/${slug}`,
      og: { title, type: 'website', image: input.logo || '' },
    },
    internalLinks: allPages.filter(p => p.slug !== slug).slice(0, 5).map(p => ({
      text: p.title,
      href: `/blog/${p.slug}`,
      context: 'Related pages',
    })),
  }
}

function generateServicePage(input: SxoInput, service: string, ps: { problem: string; solution: string; outcome: string }[], allPages: { slug: string; title: string }[]): SxoPage {
  const loc = input.locations[0] || ''
  const slug = loc ? `${slugify(service)}-${slugify(loc)}` : `${slugify(service)}-services`
  const title = `${service} Services${loc ? ` in ${loc}` : ''} — ${input.brand}`

  const blocks: SxoBlock[] = [
    serviceClusterBlock(input, service),
    ...ps.slice(0, 2).map(p => problemSolutionBlock(p)),
    ...(loc ? [locationBlock(input, loc)] : []),
    ctaBlock(input),
  ]

  const markdown = blocks.map(b => `## ${b.heading}\n\n${b.content}`).join('\n\n---\n\n')

  return {
    slug,
    title,
    pageType: 'service',
    blocks,
    markdown: `# ${title}\n\n${markdown}`,
    schema: serviceSchema(input, service),
    metadata: {
      title,
      description: `Professional ${service.toLowerCase()} services by ${input.brand}${loc ? ` in ${loc}` : ''}. Free estimate available.`,
      canonical: `${baseUrl(input.domain)}/blog/${slug}`,
      og: { title, type: 'website', image: input.logo || '' },
    },
    internalLinks: allPages.filter(p => p.slug !== slug).slice(0, 5).map(p => ({
      text: p.title,
      href: `/blog/${p.slug}`,
      context: 'Related pages',
    })),
  }
}

function generateProblemPage(input: SxoInput, ps: { problem: string; solution: string; outcome: string }, allPages: { slug: string; title: string }[]): SxoPage {
  const slug = `${slugify(ps.problem)}-solution`
  const title = `${ps.problem} — How ${input.brand} Solves It`

  const blocks: SxoBlock[] = [
    problemSolutionBlock(ps),
    authorityBlock(input),
    ctaBlock(input),
  ]

  const markdown = blocks.map(b => `## ${b.heading}\n\n${b.content}`).join('\n\n---\n\n')

  return {
    slug,
    title,
    pageType: 'problem_solution',
    blocks,
    markdown: `# ${title}\n\n${markdown}`,
    schema: faqSchema([{ q: ps.problem, a: `${ps.solution}. Result: ${ps.outcome}.` }]),
    metadata: {
      title,
      description: `${ps.problem}? ${input.brand} offers ${ps.solution.toLowerCase()} for ${ps.outcome.toLowerCase()}.`,
      canonical: `${baseUrl(input.domain)}/blog/${slug}`,
      og: { title, type: 'article', image: input.logo || '' },
    },
    internalLinks: allPages.filter(p => p.slug !== slug).slice(0, 5).map(p => ({
      text: p.title,
      href: `/blog/${p.slug}`,
      context: 'Related pages',
    })),
  }
}

function generateLocationPage(input: SxoInput, location: string, allPages: { slug: string; title: string }[]): SxoPage {
  const svc = input.services[0] || input.industry
  const slug = `${slugify(svc)}-${slugify(location)}`
  const title = `${svc} in ${location} — ${input.brand}`

  const blocks: SxoBlock[] = [
    locationBlock(input, location),
    ...input.services.map(s => serviceClusterBlock(input, s)),
    ctaBlock(input),
  ]

  const markdown = blocks.map(b => `## ${b.heading}\n\n${b.content}`).join('\n\n---\n\n')

  return {
    slug,
    title,
    pageType: 'city',
    blocks,
    markdown: `# ${title}\n\n${markdown}`,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${svc} in ${location}`,
      provider: { '@type': 'LocalBusiness', name: input.brand },
      areaServed: { '@type': 'City', name: location },
    },
    metadata: {
      title,
      description: `Looking for ${svc.toLowerCase()} in ${location}? ${input.brand} provides professional services. Free estimates.`,
      canonical: `${baseUrl(input.domain)}/blog/${slug}`,
      og: { title, type: 'website', image: input.logo || '' },
    },
    internalLinks: allPages.filter(p => p.slug !== slug).slice(0, 5).map(p => ({
      text: p.title,
      href: `/blog/${p.slug}`,
      context: 'Related pages',
    })),
  }
}

// ─── Main Engine ────────────────────────────────────────────────

export function generateSxoPages(input: SxoInput, formula?: SxoFormula): SxoOutput {
  const ps = formula?.problemSolutions
    ?? INDUSTRY_PS[input.industry]
    ?? DEFAULT_PS

  // First pass: collect all page slugs for internal linking
  const pagePreviews: { slug: string; title: string }[] = []

  // Entity page
  pagePreviews.push({
    slug: `about-${slugify(input.brand)}`,
    title: `About ${input.brand}`,
  })

  // Service pages
  for (const svc of input.services) {
    const loc = input.locations[0] || ''
    pagePreviews.push({
      slug: loc ? `${slugify(svc)}-${slugify(loc)}` : `${slugify(svc)}-services`,
      title: `${svc} Services`,
    })
  }

  // Problem pages
  for (const p of ps) {
    pagePreviews.push({
      slug: `${slugify(p.problem)}-solution`,
      title: p.problem,
    })
  }

  // Location pages
  for (const loc of input.locations) {
    const svc = input.services[0] || input.industry
    pagePreviews.push({
      slug: `${slugify(svc)}-${slugify(loc)}`,
      title: `${svc} in ${loc}`,
    })
  }

  // Second pass: generate full pages with internal links
  const pages: SxoPage[] = []

  pages.push(generateEntityPage(input, pagePreviews))

  for (const svc of input.services) {
    pages.push(generateServicePage(input, svc, ps, pagePreviews))
  }

  for (const p of ps) {
    pages.push(generateProblemPage(input, p, pagePreviews))
  }

  for (const loc of input.locations) {
    pages.push(generateLocationPage(input, loc, pagePreviews))
  }

  return {
    site: {
      brand: input.brand,
      domain: input.domain || '',
      industry: input.industry,
    },
    pages,
    totalPages: pages.length,
    generatedAt: new Date().toISOString(),
  }
}

/** Get problem/solutions for an industry */
export function getIndustryFormula(industry: string): SxoFormula {
  return {
    industry,
    problemSolutions: INDUSTRY_PS[industry] ?? DEFAULT_PS,
  }
}

/** List available industries */
export function listIndustries(): string[] {
  return Object.keys(INDUSTRY_PS)
}
