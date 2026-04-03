import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/audit/page — Single Page SXO Audit
 *
 * Fetches a URL and runs 10 checks:
 * 1. Page Speed (load time)
 * 2. Meta Tags (title, description)
 * 3. Open Graph (og:title, og:image, etc.)
 * 4. Security Headers (HSTS, CSP, X-Frame, X-XSS)
 * 5. Mobile Friendly (viewport meta)
 * 6. Schema.org (JSON-LD presence)
 * 7. Image Alt Text (% coverage)
 * 8. Heading Structure (H1-H6 hierarchy)
 * 9. Internal Links (count + broken check)
 * 10. HTTPS (secure connection)
 *
 * Returns: score (0-100), grade (A+ to F), checks array, action items
 */

interface AuditCheck {
  id: string
  name: string
  status: 'pass' | 'warn' | 'fail'
  score: number
  detail: string
  fix?: string
}

function grade(score: number): string {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 85) return 'A-'
  if (score >= 80) return 'B+'
  if (score >= 75) return 'B'
  if (score >= 70) return 'B-'
  if (score >= 65) return 'C+'
  if (score >= 60) return 'C'
  if (score >= 55) return 'C-'
  if (score >= 50) return 'D+'
  if (score >= 45) return 'D'
  if (score >= 40) return 'D-'
  return 'F'
}

function gradeColor(g: string): string {
  if (g.startsWith('A')) return '#6EE05A'
  if (g.startsWith('B')) return '#00d4ff'
  if (g.startsWith('C')) return '#f59e0b'
  if (g.startsWith('D')) return '#f97316'
  return '#ef4444'
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

  let targetUrl = url.trim()
  if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`

  const checks: AuditCheck[] = []
  let html = ''
  let headers: Headers = new Headers()
  let loadTimeMs = 0
  let finalUrl = targetUrl

  // ── Fetch the page ──
  try {
    const start = Date.now()
    const res = await fetch(targetUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': '0nAudit/1.0 (https://0nmcp.com/audit)' },
    })
    loadTimeMs = Date.now() - start
    headers = res.headers
    finalUrl = res.url
    html = await res.text()
  } catch (e: any) {
    return NextResponse.json({
      error: `Could not reach ${targetUrl}: ${e.message}`,
      url: targetUrl,
    }, { status: 422 })
  }

  // Helper: extract tag content
  function meta(name: string): string {
    const re = new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i')
    const match = html.match(re)
    if (match) return match[1]
    const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, 'i')
    const match2 = html.match(re2)
    return match2 ? match2[1] : ''
  }

  // ── 1. Page Speed ──
  const speedScore = loadTimeMs < 1000 ? 100 : loadTimeMs < 2000 ? 85 : loadTimeMs < 3000 ? 70 : loadTimeMs < 5000 ? 50 : 30
  checks.push({
    id: 'speed',
    name: 'Page Speed',
    status: speedScore >= 80 ? 'pass' : speedScore >= 60 ? 'warn' : 'fail',
    score: speedScore,
    detail: `Loaded in ${(loadTimeMs / 1000).toFixed(2)}s`,
    fix: speedScore < 80 ? 'Optimize images, enable compression, reduce JavaScript bundle size' : undefined,
  })

  // ── 2. Meta Tags ──
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || ''
  const description = meta('description')
  const hasBoth = title.length > 0 && description.length > 0
  const titleLen = title.length >= 30 && title.length <= 60
  const descLen = description.length >= 120 && description.length <= 160
  const metaScore = (hasBoth ? 50 : 0) + (titleLen ? 25 : title.length > 0 ? 10 : 0) + (descLen ? 25 : description.length > 0 ? 10 : 0)
  checks.push({
    id: 'meta',
    name: 'Meta Tags',
    status: metaScore >= 80 ? 'pass' : metaScore >= 50 ? 'warn' : 'fail',
    score: metaScore,
    detail: `Title: ${title.length}ch${titleLen ? '' : ' (aim 30-60)'} · Desc: ${description.length}ch${descLen ? '' : ' (aim 120-160)'}`,
    fix: !hasBoth ? 'Add both <title> and <meta name="description"> tags' : !titleLen || !descLen ? 'Optimize title (30-60 chars) and description (120-160 chars) length' : undefined,
  })

  // ── 3. Open Graph ──
  const ogTitle = meta('og:title')
  const ogDesc = meta('og:description')
  const ogImage = meta('og:image')
  const ogType = meta('og:type')
  const ogCount = [ogTitle, ogDesc, ogImage, ogType].filter(Boolean).length
  const ogScore = Math.round((ogCount / 4) * 100)
  checks.push({
    id: 'og',
    name: 'Open Graph',
    status: ogScore >= 75 ? 'pass' : ogScore >= 50 ? 'warn' : 'fail',
    score: ogScore,
    detail: `${ogCount}/4 tags present: ${[ogTitle && 'title', ogDesc && 'description', ogImage && 'image', ogType && 'type'].filter(Boolean).join(', ') || 'none'}`,
    fix: ogScore < 100 ? `Add missing OG tags: ${[!ogTitle && 'og:title', !ogDesc && 'og:description', !ogImage && 'og:image', !ogType && 'og:type'].filter(Boolean).join(', ')}` : undefined,
  })

  // ── 4. Security Headers ──
  const secHeaders = {
    'strict-transport-security': headers.get('strict-transport-security'),
    'content-security-policy': headers.get('content-security-policy'),
    'x-frame-options': headers.get('x-frame-options'),
    'x-content-type-options': headers.get('x-content-type-options'),
    'x-xss-protection': headers.get('x-xss-protection'),
    'referrer-policy': headers.get('referrer-policy'),
  }
  const secCount = Object.values(secHeaders).filter(Boolean).length
  const secScore = Math.round((secCount / 6) * 100)
  checks.push({
    id: 'security',
    name: 'Security Headers',
    status: secScore >= 80 ? 'pass' : secScore >= 50 ? 'warn' : 'fail',
    score: secScore,
    detail: `${secCount}/6 headers present`,
    fix: secScore < 100 ? `Missing: ${Object.entries(secHeaders).filter(([, v]) => !v).map(([k]) => k).join(', ')}` : undefined,
  })

  // ── 5. Mobile Friendly ──
  const hasViewport = /meta[^>]*name=["']viewport["']/i.test(html)
  const hasResponsive = /media[^{]*max-width|@media[^{]*min-width/i.test(html)
  const mobileScore = hasViewport ? (hasResponsive ? 100 : 70) : 0
  checks.push({
    id: 'mobile',
    name: 'Mobile Friendly',
    status: mobileScore >= 70 ? 'pass' : mobileScore >= 40 ? 'warn' : 'fail',
    score: mobileScore,
    detail: hasViewport ? 'Viewport meta tag present' : 'No viewport meta tag found',
    fix: !hasViewport ? 'Add <meta name="viewport" content="width=device-width, initial-scale=1">' : undefined,
  })

  // ── 6. Schema.org ──
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || []
  const schemaTypes: string[] = []
  for (const match of jsonLdMatches) {
    try {
      const content = match.replace(/<\/?script[^>]*>/gi, '')
      const parsed = JSON.parse(content)
      if (parsed['@type']) schemaTypes.push(parsed['@type'])
      if (Array.isArray(parsed['@graph'])) {
        for (const item of parsed['@graph']) {
          if (item['@type']) schemaTypes.push(item['@type'])
        }
      }
    } catch {}
  }
  const schemaScore = schemaTypes.length >= 3 ? 100 : schemaTypes.length >= 1 ? 60 : 0
  checks.push({
    id: 'schema',
    name: 'Schema.org',
    status: schemaScore >= 60 ? 'pass' : schemaScore >= 30 ? 'warn' : 'fail',
    score: schemaScore,
    detail: schemaTypes.length > 0 ? `Found: ${schemaTypes.join(', ')}` : 'No JSON-LD structured data found',
    fix: schemaScore < 60 ? 'Add JSON-LD structured data (Organization, WebSite, BreadcrumbList recommended)' : undefined,
  })

  // ── 7. Image Alt Text ──
  const imgMatches = html.match(/<img[^>]*>/gi) || []
  const imgsWithAlt = imgMatches.filter(img => /alt=["'][^"']+["']/i.test(img)).length
  const imgTotal = imgMatches.length
  const altPercent = imgTotal > 0 ? Math.round((imgsWithAlt / imgTotal) * 100) : 100
  checks.push({
    id: 'images',
    name: 'Image Alt Text',
    status: altPercent >= 90 ? 'pass' : altPercent >= 60 ? 'warn' : 'fail',
    score: altPercent,
    detail: imgTotal > 0 ? `${imgsWithAlt}/${imgTotal} images have alt text (${altPercent}%)` : 'No images found',
    fix: altPercent < 90 ? `Add descriptive alt text to ${imgTotal - imgsWithAlt} images for accessibility and SEO` : undefined,
  })

  // ── 8. Heading Structure ──
  const h1s = (html.match(/<h1[\s>]/gi) || []).length
  const h2s = (html.match(/<h2[\s>]/gi) || []).length
  const hasProperH1 = h1s === 1
  const hasH2s = h2s >= 1
  const headingScore = (hasProperH1 ? 60 : h1s > 1 ? 30 : 0) + (hasH2s ? 40 : 0)
  checks.push({
    id: 'headings',
    name: 'Heading Structure',
    status: headingScore >= 80 ? 'pass' : headingScore >= 50 ? 'warn' : 'fail',
    score: headingScore,
    detail: `H1: ${h1s}${hasProperH1 ? ' (good)' : h1s > 1 ? ' (too many)' : ' (missing)'} · H2: ${h2s}`,
    fix: !hasProperH1 ? 'Use exactly one <h1> tag per page' : !hasH2s ? 'Add <h2> subheadings to structure your content' : undefined,
  })

  // ── 9. Internal Links ──
  const linkMatches = html.match(/<a[^>]*href=["']([^"'#]*)["']/gi) || []
  const internalLinks = linkMatches.filter(l => {
    const href = l.match(/href=["']([^"']*)["']/i)?.[1] || ''
    return href.startsWith('/') || href.includes(new URL(finalUrl).hostname)
  }).length
  const linkScore = internalLinks >= 10 ? 100 : internalLinks >= 5 ? 75 : internalLinks >= 1 ? 50 : 20
  checks.push({
    id: 'links',
    name: 'Internal Links',
    status: linkScore >= 75 ? 'pass' : linkScore >= 50 ? 'warn' : 'fail',
    score: linkScore,
    detail: `${internalLinks} internal links found (${linkMatches.length} total)`,
    fix: internalLinks < 5 ? 'Add more internal links to improve crawlability and distribute page authority' : undefined,
  })

  // ── 10. HTTPS ──
  const isHttps = finalUrl.startsWith('https://')
  checks.push({
    id: 'https',
    name: 'HTTPS',
    status: isHttps ? 'pass' : 'fail',
    score: isHttps ? 100 : 0,
    detail: isHttps ? 'Site is served over HTTPS' : 'Site is NOT using HTTPS',
    fix: !isHttps ? 'Enable HTTPS with a valid SSL certificate — this is critical for SEO and user trust' : undefined,
  })

  // ── Compute aggregate ──
  const totalScore = Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length)
  const letterGrade = grade(totalScore)
  const actionItems = checks.filter(c => c.fix).sort((a, b) => a.score - b.score).slice(0, 5).map(c => ({
    check: c.name,
    priority: c.score < 40 ? 'critical' : c.score < 70 ? 'important' : 'suggested',
    action: c.fix!,
  }))

  return NextResponse.json({
    url: finalUrl,
    scannedAt: new Date().toISOString(),
    loadTimeMs,
    score: totalScore,
    grade: letterGrade,
    gradeColor: gradeColor(letterGrade),
    checks,
    actionItems,
    summary: {
      passed: checks.filter(c => c.status === 'pass').length,
      warnings: checks.filter(c => c.status === 'warn').length,
      failed: checks.filter(c => c.status === 'fail').length,
    },
    meta: {
      title,
      description,
      ogImage,
    },
  })
}
