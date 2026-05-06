/**
 * SXO + AEO combined scan engine.
 *
 * One fetch → two scores. SXO grades how well the page surfaces in
 * traditional search. AEO grades how well it gets cited by AI engines.
 *
 * Returns per-dimension breakdowns + per-finding markup recommendations
 * so the markdown report can include exact code to paste.
 */

import * as cheerio from 'cheerio'
import { scoreAEO, AEOFactors, AEO_DIMENSION_LABELS } from './aeo-scorer'

export interface SxoFinding {
  pillar: 'SEO' | 'UX' | 'CRO' | 'GEO'
  name: string
  status: 'pass' | 'warning' | 'fail'
  message: string
  impact: 'high' | 'medium' | 'low'
  recommendation: string
  codeSnippet?: string
  snippetLanguage?: 'html' | 'json' | 'js' | 'css' | 'text'
}

export interface AeoFinding {
  dimension: keyof AEOFactors
  label: string
  score: number          // 0-1
  status: 'pass' | 'warning' | 'fail'
  message: string
  recommendation: string
  codeSnippet?: string
  snippetLanguage?: 'html' | 'json' | 'js' | 'css' | 'text' | 'markdown'
}

export interface CombinedScanResult {
  url: string
  domain: string
  fetchedAt: string
  pageTitle: string
  pageMeta: string
  wordCount: number

  sxoScore: number
  sxoGrade: string
  sxoBreakdown: {
    seo: number
    ux: number
    cro: number
    geo: number
  }
  sxoFindings: SxoFinding[]

  aeoScore: number
  aeoGrade: string
  aeoFactors: AEOFactors
  aeoFindings: AeoFinding[]

  combinedScore: number       // weighted: 0.45 SXO + 0.55 AEO
  combinedGrade: string

  /** Quick summary numbers used in the executive summary of the MD. */
  pageSnapshot: {
    h1Count: number
    h2Count: number
    h3Count: number
    imgCount: number
    imgWithAlt: number
    internalLinks: number
    externalLinks: number
    jsonLdCount: number
    schemaTypes: string[]
    hasFAQSchema: boolean
    hasArticleSchema: boolean
    hasHowToSchema: boolean
    hasOrgSchema: boolean
    hasLlmsTxt: boolean
    hasSitemap: boolean
    hasRobotsTxt: boolean
  }
}

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

function calculateGrade(score: number): string {
  if (score >= 97) return 'A+'
  if (score >= 93) return 'A'
  if (score >= 90) return 'A-'
  if (score >= 87) return 'B+'
  if (score >= 83) return 'B'
  if (score >= 80) return 'B-'
  if (score >= 77) return 'C+'
  if (score >= 73) return 'C'
  if (score >= 70) return 'C-'
  if (score >= 67) return 'D+'
  if (score >= 63) return 'D'
  if (score >= 60) return 'D-'
  return 'F'
}

function pillarScore(findings: SxoFinding[], pillar: SxoFinding['pillar']): number {
  const own = findings.filter((f) => f.pillar === pillar)
  if (own.length === 0) return 0
  let total = 0
  let weights = 0
  for (const f of own) {
    const w = f.impact === 'high' ? 3 : f.impact === 'medium' ? 2 : 1
    weights += w
    total += (f.status === 'pass' ? 100 : f.status === 'warning' ? 60 : 0) * w
  }
  return Math.round(total / weights)
}

async function headOk(url: string, timeoutMs = 5000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { method: 'HEAD', headers: BROWSER_HEADERS, signal: controller.signal, redirect: 'follow' })
    clearTimeout(t)
    return res.ok
  } catch {
    return false
  }
}

export async function runCombinedScan(rawUrl: string): Promise<CombinedScanResult> {
  // Normalize URL
  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
  const parsed = new URL(url)
  const domain = parsed.hostname

  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 15_000)
  let html: string
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: controller.signal, redirect: 'follow' })
    clearTimeout(t)
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    html = await res.text()
  } catch (err) {
    clearTimeout(t)
    throw new Error(`Could not fetch ${url}: ${(err as Error).message}`)
  }

  const $ = cheerio.load(html)
  const title = $('title').text().trim()
  const meta = $('meta[name="description"]').attr('content') || ''
  const h1s = $('h1').map((_, el) => $(el).text().trim()).get()
  const h2s = $('h2').map((_, el) => $(el).text().trim()).get()
  const h3s = $('h3').map((_, el) => $(el).text().trim()).get()
  const images = $('img').map((_, el) => ({ src: $(el).attr('src'), alt: $(el).attr('alt') || '' })).get()
  const links = $('a[href]').map((_, el) => $(el).attr('href')).get()
  const internalLinks = links.filter((l) => l && (l.startsWith('/') || l.includes(domain)))
  const externalLinks = links.filter((l) => l && l.startsWith('http') && !l.includes(domain))
  const jsonLdScripts = $('script[type="application/ld+json"]').map((_, el) => $(el).html() || '').get()

  // Parse schema types
  const schemaTypes = new Set<string>()
  for (const raw of jsonLdScripts) {
    try {
      const parsed = JSON.parse(raw)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const it of items) {
        const types = it['@graph'] ? it['@graph'].map((x: { '@type': string | string[] }) => x['@type']) : [it['@type']]
        for (const tt of types.flat()) if (tt) schemaTypes.add(String(tt))
      }
    } catch {
      // ignore
    }
  }
  const hasFAQSchema = schemaTypes.has('FAQPage')
  const hasArticleSchema = schemaTypes.has('Article') || schemaTypes.has('BlogPosting') || schemaTypes.has('NewsArticle')
  const hasHowToSchema = schemaTypes.has('HowTo')
  const hasOrgSchema = schemaTypes.has('Organization')
  const hasPersonSchema = schemaTypes.has('Person')

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length
  const hasTable = $('table').length > 0
  const buttons = $("button, [role='button'], .btn, .button, a.cta").length
  const forms = $('form').length
  const hasEmailInput = $('input[type="email"]').length > 0

  // External fetch checks (parallel)
  const [hasLlmsTxt, hasSitemap, hasRobotsTxt] = await Promise.all([
    headOk(`${parsed.origin}/llms.txt`),
    headOk(`${parsed.origin}/sitemap.xml`),
    headOk(`${parsed.origin}/robots.txt`),
  ])

  const imgWithAlt = images.filter((i) => i.alt && i.alt.length > 0).length

  // ── SXO findings ──
  const sxoFindings: SxoFinding[] = [
    {
      pillar: 'SEO',
      name: 'Title tag',
      status: title.length >= 30 && title.length <= 60 ? 'pass' : title.length > 0 ? 'warning' : 'fail',
      message: title ? `Title is ${title.length} chars` : 'No title tag found',
      impact: 'high',
      recommendation: 'Title 30–60 chars, primary keyword in the first 50 chars, brand last.',
      codeSnippet: '<title>Primary Keyword | Secondary Phrase | Brand</title>',
      snippetLanguage: 'html',
    },
    {
      pillar: 'SEO',
      name: 'Meta description',
      status: meta.length >= 120 && meta.length <= 160 ? 'pass' : meta.length > 0 ? 'warning' : 'fail',
      message: meta ? `${meta.length} chars` : 'No meta description',
      impact: 'high',
      recommendation: '120–160 chars. Lead with the answer to the search intent. End with a soft CTA.',
      codeSnippet: '<meta name="description" content="Direct answer to the query in 1 sentence. Specific benefit. Subtle CTA." />',
      snippetLanguage: 'html',
    },
    {
      pillar: 'SEO',
      name: 'H1',
      status: h1s.length === 1 ? 'pass' : h1s.length > 1 ? 'warning' : 'fail',
      message: h1s.length === 1 ? `Single H1 — "${h1s[0]?.slice(0, 60)}"` : h1s.length > 1 ? `${h1s.length} H1s` : 'No H1',
      impact: 'high',
      recommendation: 'Exactly one H1 that mirrors the search intent and contains the primary keyword.',
      codeSnippet: '<h1>The exact phrase users type into search</h1>',
      snippetLanguage: 'html',
    },
    {
      pillar: 'SEO',
      name: 'Heading hierarchy',
      status: h2s.length >= 3 ? 'pass' : h2s.length >= 1 ? 'warning' : 'fail',
      message: `${h2s.length} H2s, ${h3s.length} H3s`,
      impact: 'medium',
      recommendation: 'At least 3 H2s for >800-word pages. One H2 every 180–260 words. Use question-format on at least one.',
    },
    {
      pillar: 'SEO',
      name: 'Image alt text',
      status: images.length === 0 ? 'warning' : imgWithAlt === images.length ? 'pass' : imgWithAlt / images.length >= 0.7 ? 'warning' : 'fail',
      message: `${imgWithAlt}/${images.length} images have alt text`,
      impact: 'medium',
      recommendation: 'Every image gets descriptive alt text. Decorative images use alt="".',
    },
    {
      pillar: 'SEO',
      name: 'Schema (JSON-LD)',
      status: jsonLdScripts.length > 0 ? 'pass' : 'fail',
      message: jsonLdScripts.length > 0 ? `${jsonLdScripts.length} JSON-LD blocks (${[...schemaTypes].join(', ')})` : 'No JSON-LD',
      impact: 'high',
      recommendation: 'Always ship Article + Organization. Add FAQPage and HowTo when applicable.',
      codeSnippet: JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: '<page title>',
          datePublished: new Date().toISOString().slice(0, 10),
          author: { '@type': 'Person', name: '<author name>' },
          publisher: { '@type': 'Organization', name: '<brand>', logo: { '@type': 'ImageObject', url: 'https://<domain>/logo.png' } },
        },
        null,
        2,
      ),
      snippetLanguage: 'json',
    },
    {
      pillar: 'SEO',
      name: 'Sitemap',
      status: hasSitemap ? 'pass' : 'fail',
      message: hasSitemap ? '/sitemap.xml found' : 'Missing /sitemap.xml',
      impact: 'medium',
      recommendation: 'Serve a real sitemap.xml at /sitemap.xml. List every indexable URL.',
    },
    {
      pillar: 'SEO',
      name: 'robots.txt',
      status: hasRobotsTxt ? 'pass' : 'warning',
      message: hasRobotsTxt ? '/robots.txt found' : 'Missing /robots.txt',
      impact: 'low',
      recommendation: 'Allow GPTBot, ChatGPT-User, Claude-Web, PerplexityBot. Reference your sitemap.',
      codeSnippet: 'User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: Claude-Web\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nSitemap: https://<domain>/sitemap.xml',
      snippetLanguage: 'text',
    },
    // UX
    {
      pillar: 'UX',
      name: 'Content depth',
      status: wordCount >= 1000 ? 'pass' : wordCount >= 500 ? 'warning' : 'fail',
      message: `${wordCount} words on the page`,
      impact: 'medium',
      recommendation: '1000+ words for primary topic pages. AI engines preferentially cite comprehensive sources.',
    },
    {
      pillar: 'UX',
      name: 'Question-format headings',
      status:
        h2s.filter((h) => h.includes('?') || /^(what|how|why|when|where|can|is|are|do|does)/i.test(h)).length >= 2 ? 'pass' : 'warning',
      message: `${h2s.filter((h) => h.includes('?')).length} H2s framed as questions`,
      impact: 'medium',
      recommendation: 'Reframe at least 2 H2s as the literal questions users type into ChatGPT/Perplexity.',
    },
    {
      pillar: 'UX',
      name: 'Scannable content',
      status: (h2s.length + h3s.length) >= Math.floor(wordCount / 300) ? 'pass' : 'warning',
      message: `${h2s.length + h3s.length} subheadings for ${wordCount} words`,
      impact: 'medium',
      recommendation: 'One subheading every 200–300 words minimum.',
    },
    {
      pillar: 'UX',
      name: 'Comparison table',
      status: hasTable ? 'pass' : 'warning',
      message: hasTable ? 'Table present' : 'No table found',
      impact: 'low',
      recommendation: 'Include a 3+ row × 3+ column comparison table — AI engines preferentially extract tables.',
    },
    // CRO
    {
      pillar: 'CRO',
      name: 'CTA elements',
      status: buttons >= 2 ? 'pass' : buttons >= 1 ? 'warning' : 'fail',
      message: `${buttons} CTA elements`,
      impact: 'high',
      recommendation: 'At least one primary CTA above the fold + one repeated near the end.',
    },
    {
      pillar: 'CRO',
      name: 'Lead capture',
      status: forms > 0 && hasEmailInput ? 'pass' : forms > 0 ? 'warning' : 'fail',
      message: forms > 0 ? `${forms} form(s)` : 'No forms',
      impact: 'high',
      recommendation: 'A single-field email capture is non-negotiable for organic-traffic pages.',
    },
    {
      pillar: 'CRO',
      name: 'Trust signals',
      status:
        bodyText.toLowerCase().includes('testimonial') ||
        bodyText.toLowerCase().includes('reviews') ||
        $('[class*="testimonial"], [class*="review"]').length > 0
          ? 'pass'
          : 'warning',
      message: 'Checking testimonials/reviews/badges',
      impact: 'medium',
      recommendation: 'Show 3+ named testimonials with role/company. AI engines weight pages with cite-able social proof.',
    },
    // GEO
    {
      pillar: 'GEO',
      name: 'llms.txt',
      status: hasLlmsTxt ? 'pass' : 'fail',
      message: hasLlmsTxt ? '/llms.txt found' : 'Missing /llms.txt',
      impact: 'high',
      recommendation: 'Publish /llms.txt — the AI-citation analog of robots.txt.',
      codeSnippet: `# ${domain}\n\n> One-sentence statement of what this site is + who it serves.\n\n## Primary pages\n- [/](https://${domain}/): Homepage\n- [/about](https://${domain}/about): About\n- [/blog](https://${domain}/blog): Articles\n\n## Citation policy\nAttribute as "${domain}". Link back to the source URL.`,
      snippetLanguage: 'text',
    },
    {
      pillar: 'GEO',
      name: 'External citations',
      status: externalLinks.length >= 3 ? 'pass' : externalLinks.length >= 1 ? 'warning' : 'fail',
      message: `${externalLinks.length} outbound links`,
      impact: 'medium',
      recommendation: 'Cite 3+ authoritative external sources. AI engines reward content that itself cites well.',
    },
    {
      pillar: 'GEO',
      name: 'Information gain',
      status: hasTable || jsonLdScripts.length >= 2 ? 'pass' : 'warning',
      message: hasTable ? 'Has unique data structure' : 'Add unique data — original tables, internal stats, screenshots',
      impact: 'high',
      recommendation: 'AI engines penalize "me-too" pages. Ship at least one fact, table, or chart competitors do not have.',
    },
  ]

  // ── AEO findings ── (run scorer against the rendered text + html for schema/structure cues)
  const scoredAEO = scoreAEO({
    text: html, // raw HTML so detectors can see <h2>, tables, JSON-LD, bolded definitions
    hasArticle: hasArticleSchema,
    hasFAQ: hasFAQSchema,
    hasHowTo: hasHowToSchema,
    hasOrganization: hasOrgSchema,
  })

  const aeoFindings: AeoFinding[] = []

  function pushAEO(
    dimension: keyof AEOFactors,
    recommendation: string,
    snippet?: string,
    snippetLanguage?: AeoFinding['snippetLanguage'],
  ) {
    const v = scoredAEO.factors[dimension]
    aeoFindings.push({
      dimension,
      label: AEO_DIMENSION_LABELS[dimension],
      score: v,
      status: v >= 0.7 ? 'pass' : v >= 0.4 ? 'warning' : 'fail',
      message: `Score: ${(v * 100).toFixed(0)}/100`,
      recommendation,
      codeSnippet: snippet,
      snippetLanguage,
    })
  }

  pushAEO(
    'bluf',
    'Open with a 2–3 sentence direct answer to the page\'s primary query. No setup, no "in this post we will". This is the single most-cited block.',
    `<p class="bluf"><strong>${title || '<topic>'}</strong> is a <category> that <does what>. It works by <one-sentence mechanism>. Use it when <one-sentence trigger>.</p>`,
    'html',
  )
  pushAEO(
    'definition',
    'Within the first 200 words, include a bolded definition: **X is Y that does Z.** AI engines extract this for "What is X?" queries.',
    '**[Topic] is a [category] that [primary capability], used by [audience] to [outcome].**',
    'markdown',
  )
  pushAEO(
    'procedure',
    'Add a numbered list of imperative-verb steps when the page is procedural. Each line must start with a verb (Click / Add / Configure / Verify).',
    '1. Install the package.\n2. Configure the API key.\n3. Run the first scan.\n4. Verify the score appears in the dashboard.',
    'markdown',
  )
  pushAEO(
    'comparison',
    'Add a comparison table with at least 3 rows × 3 columns. Include "Best for" / "When to choose" / "Pros" — AI engines extract tables verbatim.',
    '| Option | Best for | Strength | Weakness |\n|---|---|---|---|\n| A | small teams | fast setup | limited scale |\n| B | enterprises | full audit | slower |\n| C | agencies | white-label | higher cost |',
    'markdown',
  )
  pushAEO(
    'faq',
    'Add a FAQ block with 5–7 voice-search-natural Q/A pairs and matching FAQPage JSON-LD.',
    JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is X?', acceptedAnswer: { '@type': 'Answer', text: 'X is …' } },
          { '@type': 'Question', name: 'How does X work?', acceptedAnswer: { '@type': 'Answer', text: 'X works by …' } },
        ],
      },
      null,
      2,
    ),
    'json',
  )
  pushAEO(
    'authorEEAT',
    'Show a real byline + credential (years experience, certification, role). Include Person schema.',
    JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: '<author name>',
        jobTitle: '<role>',
        worksFor: { '@type': 'Organization', name: '<brand>' },
        knowsAbout: ['<topic 1>', '<topic 2>'],
      },
      null,
      2,
    ),
    'json',
  )
  pushAEO(
    'freshness',
    'Add an explicit "Updated <Month YYYY>" marker near the title. Re-publish with a fresh `updated_at` whenever you revise.',
    `<p class="updated">Updated ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>`,
    'html',
  )
  pushAEO(
    'schema',
    'Ship Article + Organization on every page. Add FAQPage / HowTo when content matches.',
    JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title || '<title>',
        author: { '@type': 'Person', name: '<author>' },
        publisher: { '@type': 'Organization', name: '<brand>' },
        datePublished: new Date().toISOString().slice(0, 10),
        dateModified: new Date().toISOString().slice(0, 10),
      },
      null,
      2,
    ),
    'json',
  )
  pushAEO(
    'informationGain',
    'Include at least one unique data point: a chart, a screenshot of internal data, an original table, or a quoted source. AI engines penalize "me-too" content.',
  )
  pushAEO(
    'specificity',
    'Replace vague qualifiers with numbers, dates, and named entities. "Many users" → "73% of agencies surveyed in Q1 2026". This is the single biggest gain on most pages.',
  )

  // ── Compose ──
  const seo = pillarScore(sxoFindings, 'SEO')
  const ux = pillarScore(sxoFindings, 'UX')
  const cro = pillarScore(sxoFindings, 'CRO')
  const geo = pillarScore(sxoFindings, 'GEO')
  const sxoOverall = Math.round(seo * 0.35 + ux * 0.25 + cro * 0.2 + geo * 0.2)

  const aeoOverall = scoredAEO.score
  // Combined: AEO weighted slightly higher because the marriage's whole point is
  // citation-grade content. Not a default-equal split.
  const combinedScore = Math.round(sxoOverall * 0.45 + aeoOverall * 0.55)

  return {
    url,
    domain,
    fetchedAt: new Date().toISOString(),
    pageTitle: title,
    pageMeta: meta,
    wordCount,

    sxoScore: sxoOverall,
    sxoGrade: calculateGrade(sxoOverall),
    sxoBreakdown: { seo, ux, cro, geo },
    sxoFindings,

    aeoScore: aeoOverall,
    aeoGrade: calculateGrade(aeoOverall),
    aeoFactors: scoredAEO.factors,
    aeoFindings,

    combinedScore,
    combinedGrade: calculateGrade(combinedScore),

    pageSnapshot: {
      h1Count: h1s.length,
      h2Count: h2s.length,
      h3Count: h3s.length,
      imgCount: images.length,
      imgWithAlt,
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      jsonLdCount: jsonLdScripts.length,
      schemaTypes: [...schemaTypes],
      hasFAQSchema,
      hasArticleSchema,
      hasHowToSchema,
      hasOrgSchema,
      hasLlmsTxt,
      hasSitemap,
      hasRobotsTxt,
    },
  }
}
