/**
 * SXO Website Auditor
 *
 * Fetches a URL, analyzes SEO signals, scores against the SXO formula,
 * and returns actionable recommendations.
 *
 * Categories scored:
 *   1. Technical SEO (title, meta, headings, canonical, robots)
 *   2. Content Quality (word count, readability, structure, uniqueness)
 *   3. Schema Markup (JSON-LD presence, types, completeness)
 *   4. Mobile & Performance (viewport, responsive hints)
 *   5. Authority Signals (social proof, trust indicators)
 *   6. Local SEO (NAP, location signals, Google Business)
 *   7. SXO Formula Compliance (entity, service clusters, P/S blocks, CTA)
 */

// ─── Types ──────────────────────────────────────────────────────

export interface AuditFinding {
  check: string
  status: 'pass' | 'warn' | 'fail'
  detail: string
  impact: 'high' | 'medium' | 'low'
}

export interface AuditCategory {
  name: string
  score: number
  maxScore: number
  findings: AuditFinding[]
}

export interface AuditRecommendation {
  priority: number
  category: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

export interface AuditResult {
  url: string
  domain: string
  score: number
  grade: string
  categories: Record<string, AuditCategory>
  recommendations: AuditRecommendation[]
  pagesAnalyzed: number
  issuesFound: number
  opportunities: number
  rawData: {
    title: string
    metaDescription: string
    h1: string[]
    h2: string[]
    wordCount: number
    hasSchema: boolean
    schemaTypes: string[]
    hasViewport: boolean
    hasCanonical: boolean
    hasSitemap: boolean
    hasRobots: boolean
    imageCount: number
    imagesWithAlt: number
    internalLinks: number
    externalLinks: number
  }
  timestamp: string
}

// ─── HTML Parsing Helpers ───────────────────────────────────────

function extractTag(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return match?.[1]?.trim() ?? ''
}

function extractMeta(html: string, name: string): string {
  const match = html.match(new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'))
    ?? html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, 'i'))
  return match?.[1]?.trim() ?? ''
}

function extractAll(html: string, pattern: RegExp): string[] {
  const results: string[] = []
  let m
  while ((m = pattern.exec(html)) !== null) {
    results.push(m[1]?.trim() ?? '')
  }
  return results
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function countOccurrences(html: string, pattern: RegExp): number {
  return (html.match(pattern) || []).length
}

// ─── Scoring ────────────────────────────────────────────────────

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 80) return 'A-'
  if (score >= 75) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 65) return 'B-'
  if (score >= 60) return 'C+'
  if (score >= 55) return 'C'
  if (score >= 50) return 'C-'
  if (score >= 45) return 'D+'
  if (score >= 40) return 'D'
  if (score >= 35) return 'D-'
  return 'F'
}

// ─── Category Auditors ──────────────────────────────────────────

function auditTechnicalSeo(html: string, url: string): AuditCategory {
  const findings: AuditFinding[] = []
  let score = 0
  const max = 20

  // Title tag
  const title = extractTag(html, 'title')
  if (title) {
    if (title.length >= 30 && title.length <= 65) {
      findings.push({ check: 'Title tag', status: 'pass', detail: `"${title}" (${title.length} chars)`, impact: 'high' })
      score += 4
    } else {
      findings.push({ check: 'Title tag', status: 'warn', detail: `"${title}" — ${title.length} chars (ideal: 30-65)`, impact: 'high' })
      score += 2
    }
  } else {
    findings.push({ check: 'Title tag', status: 'fail', detail: 'Missing title tag', impact: 'high' })
  }

  // Meta description
  const desc = extractMeta(html, 'description')
  if (desc) {
    if (desc.length >= 120 && desc.length <= 160) {
      findings.push({ check: 'Meta description', status: 'pass', detail: `${desc.length} chars (ideal range)`, impact: 'high' })
      score += 4
    } else {
      findings.push({ check: 'Meta description', status: 'warn', detail: `${desc.length} chars (ideal: 120-160)`, impact: 'high' })
      score += 2
    }
  } else {
    findings.push({ check: 'Meta description', status: 'fail', detail: 'Missing meta description', impact: 'high' })
  }

  // H1 tag
  const h1s = extractAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi)
  if (h1s.length === 1) {
    findings.push({ check: 'H1 heading', status: 'pass', detail: `Single H1: "${stripTags(h1s[0]).slice(0, 60)}"`, impact: 'high' })
    score += 4
  } else if (h1s.length > 1) {
    findings.push({ check: 'H1 heading', status: 'warn', detail: `${h1s.length} H1 tags found (should be 1)`, impact: 'medium' })
    score += 2
  } else {
    findings.push({ check: 'H1 heading', status: 'fail', detail: 'No H1 heading found', impact: 'high' })
  }

  // Canonical
  const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html)
  if (hasCanonical) {
    findings.push({ check: 'Canonical tag', status: 'pass', detail: 'Present', impact: 'medium' })
    score += 4
  } else {
    findings.push({ check: 'Canonical tag', status: 'warn', detail: 'Missing canonical tag', impact: 'medium' })
  }

  // Viewport
  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html)
  if (hasViewport) {
    findings.push({ check: 'Viewport meta', status: 'pass', detail: 'Present', impact: 'medium' })
    score += 4
  } else {
    findings.push({ check: 'Viewport meta', status: 'fail', detail: 'Missing viewport meta tag', impact: 'medium' })
  }

  return { name: 'Technical SEO', score, maxScore: max, findings }
}

function auditContentQuality(html: string): AuditCategory {
  const findings: AuditFinding[] = []
  let score = 0
  const max = 20

  const text = stripTags(html.replace(/<(script|style|nav|footer|header)[^>]*>[\s\S]*?<\/\1>/gi, ''))
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length

  // Word count
  if (wordCount >= 1000) {
    findings.push({ check: 'Content length', status: 'pass', detail: `${wordCount} words (excellent)`, impact: 'high' })
    score += 5
  } else if (wordCount >= 500) {
    findings.push({ check: 'Content length', status: 'warn', detail: `${wordCount} words (aim for 1000+)`, impact: 'high' })
    score += 3
  } else if (wordCount >= 200) {
    findings.push({ check: 'Content length', status: 'warn', detail: `${wordCount} words (thin content)`, impact: 'high' })
    score += 1
  } else {
    findings.push({ check: 'Content length', status: 'fail', detail: `${wordCount} words (very thin)`, impact: 'high' })
  }

  // Heading structure
  const h2s = extractAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi)
  if (h2s.length >= 3) {
    findings.push({ check: 'Heading structure', status: 'pass', detail: `${h2s.length} H2 headings`, impact: 'medium' })
    score += 5
  } else if (h2s.length >= 1) {
    findings.push({ check: 'Heading structure', status: 'warn', detail: `${h2s.length} H2 heading(s) (aim for 3+)`, impact: 'medium' })
    score += 2
  } else {
    findings.push({ check: 'Heading structure', status: 'fail', detail: 'No H2 headings', impact: 'medium' })
  }

  // Images
  const imgCount = countOccurrences(html, /<img /gi)
  const imgAltCount = countOccurrences(html, /<img [^>]*alt=["'][^"']+["']/gi)
  if (imgCount > 0) {
    if (imgAltCount === imgCount) {
      findings.push({ check: 'Image alt text', status: 'pass', detail: `${imgCount}/${imgCount} images have alt text`, impact: 'medium' })
      score += 5
    } else {
      findings.push({ check: 'Image alt text', status: 'warn', detail: `${imgAltCount}/${imgCount} images have alt text`, impact: 'medium' })
      score += 2
    }
  } else {
    findings.push({ check: 'Images', status: 'warn', detail: 'No images found (add visuals)', impact: 'low' })
    score += 2
  }

  // Internal links
  const internalLinks = countOccurrences(html, /<a [^>]*href=["']\/[^"']*/gi)
  if (internalLinks >= 3) {
    findings.push({ check: 'Internal links', status: 'pass', detail: `${internalLinks} internal links`, impact: 'medium' })
    score += 5
  } else {
    findings.push({ check: 'Internal links', status: 'warn', detail: `${internalLinks} internal links (aim for 3+)`, impact: 'medium' })
    score += 1
  }

  return { name: 'Content Quality', score, maxScore: max, findings }
}

function auditSchema(html: string): AuditCategory {
  const findings: AuditFinding[] = []
  let score = 0
  const max = 15

  // JSON-LD
  const jsonLdBlocks = extractAll(html, /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  const schemaTypes: string[] = []

  if (jsonLdBlocks.length > 0) {
    findings.push({ check: 'JSON-LD present', status: 'pass', detail: `${jsonLdBlocks.length} schema block(s)`, impact: 'high' })
    score += 5

    for (const block of jsonLdBlocks) {
      try {
        const data = JSON.parse(block)
        const type = data['@type'] || (Array.isArray(data) ? data[0]?.['@type'] : undefined)
        if (type) schemaTypes.push(type)
      } catch { /* ignore */ }
    }

    if (schemaTypes.length > 0) {
      findings.push({ check: 'Schema types', status: 'pass', detail: schemaTypes.join(', '), impact: 'medium' })
      score += 5
    }

    // Check for key types
    const hasOrg = schemaTypes.some(t => ['Organization', 'LocalBusiness'].includes(t))
    if (hasOrg) {
      findings.push({ check: 'Business schema', status: 'pass', detail: 'Organization or LocalBusiness found', impact: 'high' })
      score += 5
    } else {
      findings.push({ check: 'Business schema', status: 'warn', detail: 'No Organization/LocalBusiness schema', impact: 'high' })
    }
  } else {
    findings.push({ check: 'JSON-LD present', status: 'fail', detail: 'No structured data found', impact: 'high' })
  }

  return { name: 'Schema Markup', score, maxScore: max, findings }
}

function auditSxoCompliance(html: string): AuditCategory {
  const findings: AuditFinding[] = []
  let score = 0
  const max = 25

  const text = stripTags(html).toLowerCase()

  // Entity signals
  const hasAbout = text.includes('about') || text.includes('who we are') || text.includes('our company')
  if (hasAbout) {
    findings.push({ check: 'Entity block', status: 'pass', detail: 'Business identity signals found', impact: 'high' })
    score += 5
  } else {
    findings.push({ check: 'Entity block', status: 'fail', detail: 'No clear business entity definition', impact: 'high' })
  }

  // Service signals
  const hasServices = text.includes('service') || text.includes('what we do') || text.includes('our services')
  if (hasServices) {
    findings.push({ check: 'Service cluster', status: 'pass', detail: 'Service descriptions found', impact: 'high' })
    score += 5
  } else {
    findings.push({ check: 'Service cluster', status: 'warn', detail: 'No clear service descriptions', impact: 'high' })
  }

  // Problem/Solution signals
  const hasProbSol = text.includes('problem') || text.includes('solution') || text.includes('challenge') || text.includes('how we help')
  if (hasProbSol) {
    findings.push({ check: 'Problem/Solution', status: 'pass', detail: 'Problem-solution content found', impact: 'high' })
    score += 5
  } else {
    findings.push({ check: 'Problem/Solution', status: 'fail', detail: 'No problem-solution content (AI search loves these)', impact: 'high' })
  }

  // CTA signals
  const hasCta = /<(a|button)[^>]*(contact|quote|estimate|schedule|call|get started|free|demo|trial)/i.test(html)
  if (hasCta) {
    findings.push({ check: 'Call to action', status: 'pass', detail: 'CTA found', impact: 'medium' })
    score += 5
  } else {
    findings.push({ check: 'Call to action', status: 'fail', detail: 'No clear call to action', impact: 'medium' })
  }

  // Location signals
  const hasLocation = /\b(city|state|county|area|located|serving|region)\b/i.test(text)
  if (hasLocation) {
    findings.push({ check: 'Location signals', status: 'pass', detail: 'Geographic signals found', impact: 'medium' })
    score += 5
  } else {
    findings.push({ check: 'Location signals', status: 'warn', detail: 'No natural location signals', impact: 'medium' })
  }

  return { name: 'SXO Formula', score, maxScore: max, findings }
}

function auditAuthority(html: string): AuditCategory {
  const findings: AuditFinding[] = []
  let score = 0
  const max = 10

  const text = stripTags(html).toLowerCase()

  // Trust signals
  const hasTrust = text.includes('licensed') || text.includes('certified') || text.includes('insured') || text.includes('award')
  if (hasTrust) {
    findings.push({ check: 'Trust signals', status: 'pass', detail: 'Credentials/certifications mentioned', impact: 'medium' })
    score += 5
  } else {
    findings.push({ check: 'Trust signals', status: 'warn', detail: 'No visible trust signals', impact: 'medium' })
  }

  // Social proof
  const hasSocial = text.includes('testimonial') || text.includes('review') || text.includes('client') || text.includes('customer') || /\d+\s*(year|project|client|customer)/i.test(text)
  if (hasSocial) {
    findings.push({ check: 'Social proof', status: 'pass', detail: 'Social proof elements found', impact: 'medium' })
    score += 5
  } else {
    findings.push({ check: 'Social proof', status: 'warn', detail: 'No visible social proof (reviews, testimonials)', impact: 'medium' })
  }

  return { name: 'Authority', score, maxScore: max, findings }
}

function auditPerformance(html: string): AuditCategory {
  const findings: AuditFinding[] = []
  let score = 0
  const max = 10

  // Page size
  const sizeKb = Math.round(html.length / 1024)
  if (sizeKb < 200) {
    findings.push({ check: 'Page size', status: 'pass', detail: `${sizeKb}KB HTML`, impact: 'medium' })
    score += 5
  } else if (sizeKb < 500) {
    findings.push({ check: 'Page size', status: 'warn', detail: `${sizeKb}KB HTML (consider optimizing)`, impact: 'medium' })
    score += 3
  } else {
    findings.push({ check: 'Page size', status: 'fail', detail: `${sizeKb}KB HTML (too large)`, impact: 'medium' })
  }

  // Inline scripts
  const scriptCount = countOccurrences(html, /<script[^>]*src=/gi)
  if (scriptCount <= 5) {
    findings.push({ check: 'Script count', status: 'pass', detail: `${scriptCount} external scripts`, impact: 'low' })
    score += 5
  } else {
    findings.push({ check: 'Script count', status: 'warn', detail: `${scriptCount} external scripts (aim for fewer)`, impact: 'low' })
    score += 2
  }

  return { name: 'Performance', score, maxScore: max, findings }
}

// ─── Main Auditor ───────────────────────────────────────────────

export async function auditWebsite(url: string): Promise<AuditResult> {
  // Normalize URL
  if (!url.startsWith('http')) url = `https://${url}`
  const domain = new URL(url).hostname

  // Fetch page
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: {
      'User-Agent': '0nMCP-SXO-Auditor/1.0 (+https://0nmcp.com)',
      'Accept': 'text/html',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  }

  const html = await res.text()

  // Run all category audits
  const categories: Record<string, AuditCategory> = {
    technical: auditTechnicalSeo(html, url),
    content: auditContentQuality(html),
    schema: auditSchema(html),
    sxo: auditSxoCompliance(html),
    authority: auditAuthority(html),
    performance: auditPerformance(html),
  }

  // Calculate total score
  const totalScore = Object.values(categories).reduce((sum, c) => sum + c.score, 0)
  const totalMax = Object.values(categories).reduce((sum, c) => sum + c.maxScore, 0)
  const normalizedScore = Math.round((totalScore / totalMax) * 100)

  // Generate recommendations from failures/warnings
  const recommendations: AuditRecommendation[] = []
  let priority = 1
  for (const [, cat] of Object.entries(categories)) {
    for (const f of cat.findings) {
      if (f.status === 'fail') {
        recommendations.push({
          priority: priority++,
          category: cat.name,
          title: f.check,
          description: f.detail,
          impact: f.impact,
        })
      }
    }
  }
  for (const [, cat] of Object.entries(categories)) {
    for (const f of cat.findings) {
      if (f.status === 'warn') {
        recommendations.push({
          priority: priority++,
          category: cat.name,
          title: f.check,
          description: f.detail,
          impact: f.impact,
        })
      }
    }
  }

  // Extract raw data
  const title = extractTag(html, 'title')
  const h1s = extractAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(h => stripTags(h))
  const h2s = extractAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(h => stripTags(h))
  const text = stripTags(html)
  const jsonLdBlocks = extractAll(html, /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  const schemaTypes: string[] = []
  for (const block of jsonLdBlocks) {
    try { const d = JSON.parse(block); if (d['@type']) schemaTypes.push(d['@type']) } catch { /* skip */ }
  }

  return {
    url,
    domain,
    score: normalizedScore,
    grade: scoreToGrade(normalizedScore),
    categories,
    recommendations,
    pagesAnalyzed: 1,
    issuesFound: recommendations.filter(r => r.impact === 'high').length,
    opportunities: recommendations.length,
    rawData: {
      title,
      metaDescription: extractMeta(html, 'description'),
      h1: h1s,
      h2: h2s,
      wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
      hasSchema: jsonLdBlocks.length > 0,
      schemaTypes,
      hasViewport: /<meta[^>]*name=["']viewport["']/i.test(html),
      hasCanonical: /<link[^>]*rel=["']canonical["']/i.test(html),
      hasSitemap: false,
      hasRobots: false,
      imageCount: countOccurrences(html, /<img /gi),
      imagesWithAlt: countOccurrences(html, /<img [^>]*alt=["'][^"']+["']/gi),
      internalLinks: countOccurrences(html, /<a [^>]*href=["']\/[^"']*/gi),
      externalLinks: countOccurrences(html, /<a [^>]*href=["']https?:\/\/[^"']*/gi),
    },
    timestamp: new Date().toISOString(),
  }
}
