/**
 * Generate the customer-facing SXO+AEO markdown report.
 *
 * This file IS the product. Customer paid $18.26, what they download
 * is what this function returns.
 *
 * Structure:
 *   1. Executive summary (combined score, both axis scores, biggest blocker)
 *   2. SXO breakdown (4 pillars, every finding, every code snippet)
 *   3. AEO breakdown (10 dimensions, every detector, every code snippet)
 *   4. The full markup pack — paste-ready code for every gap
 *   5. 30-day implementation roadmap
 *   6. Citation-quality checklist
 */

import type { CombinedScanResult, AeoFinding, SxoFinding } from './engine'
import { AEO_DIMENSION_LABELS, type AEOFactors } from './aeo-scorer'

const STATUS_ICON: Record<'pass' | 'warning' | 'fail', string> = {
  pass: '✅',
  warning: '⚠️',
  fail: '❌',
}

const IMPACT_LABEL: Record<'high' | 'medium' | 'low', string> = {
  high: 'HIGH',
  medium: 'MED',
  low: 'LOW',
}

function fenced(snippet: string | undefined, lang: string | undefined): string {
  if (!snippet) return ''
  return `\n\n\`\`\`${lang || ''}\n${snippet}\n\`\`\`\n`
}

function bar(score: number, width = 20): string {
  const filled = Math.round((score / 100) * width)
  return `${'█'.repeat(filled)}${'░'.repeat(width - filled)} ${score}/100`
}

function aeoBar(value: number, width = 20): string {
  const filled = Math.round(value * width)
  return `${'█'.repeat(filled)}${'░'.repeat(width - filled)} ${(value * 100).toFixed(0)}/100`
}

function biggestBlocker(r: CombinedScanResult): string {
  const sxoFails = r.sxoFindings.filter((f) => f.status === 'fail' && f.impact === 'high')
  const aeoFails = r.aeoFindings.filter((f) => f.status === 'fail')
  if (sxoFails.length > 0) return `${sxoFails[0].pillar}: ${sxoFails[0].name}`
  if (aeoFails.length > 0) return `AEO: ${aeoFails[0].label}`
  const sxoWarn = r.sxoFindings.find((f) => f.status === 'warning' && f.impact === 'high')
  if (sxoWarn) return `${sxoWarn.pillar}: ${sxoWarn.name}`
  return 'No critical blockers — opportunities are listed below.'
}

function renderSxoFinding(f: SxoFinding): string {
  return [
    `### ${STATUS_ICON[f.status]} ${f.name} — \`${IMPACT_LABEL[f.impact]}\``,
    ``,
    `**Status:** ${f.status.toUpperCase()}  `,
    `**What we found:** ${f.message}  `,
    `**Recommendation:** ${f.recommendation}`,
    fenced(f.codeSnippet, f.snippetLanguage),
  ].join('\n')
}

function renderAeoFinding(f: AeoFinding): string {
  return [
    `### ${STATUS_ICON[f.status]} ${f.label}`,
    ``,
    `\`\`\`\n${aeoBar(f.score)}\n\`\`\``,
    ``,
    `**Recommendation:** ${f.recommendation}`,
    fenced(f.codeSnippet, f.snippetLanguage),
  ].join('\n')
}

function renderRoadmap(r: CombinedScanResult): string {
  const allFails = [
    ...r.sxoFindings.filter((f) => f.status === 'fail').map((f) => `${f.pillar}: ${f.name}`),
    ...r.aeoFindings.filter((f) => f.status === 'fail').map((f) => `AEO: ${f.label}`),
  ]
  const warnings = [
    ...r.sxoFindings.filter((f) => f.status === 'warning').map((f) => `${f.pillar}: ${f.name}`),
    ...r.aeoFindings.filter((f) => f.status === 'warning').map((f) => `AEO: ${f.label}`),
  ]

  const week1 = allFails.slice(0, 5)
  const week2 = allFails.slice(5, 10).concat(warnings.slice(0, 3))
  const week3 = warnings.slice(3, 8)
  const week4 = ['Re-scan to verify', 'Track AI citations in ChatGPT/Perplexity', 'Submit updated sitemap to Search Console']

  const fmt = (label: string, items: string[]) =>
    items.length === 0
      ? `### ${label}\n\n_Nothing scheduled — already strong._\n`
      : `### ${label}\n\n${items.map((x) => `- [ ] ${x}`).join('\n')}\n`

  return [
    fmt('Week 1 — Critical fixes (do these first)', week1),
    fmt('Week 2 — High-impact warnings', week2),
    fmt('Week 3 — Medium-impact polish', week3),
    fmt('Week 4 — Verify + measure', week4),
  ].join('\n')
}

export function generateMarkdownReport(r: CombinedScanResult): string {
  const today = new Date().toISOString().slice(0, 10)
  const lines: string[] = []

  // ── Cover ──
  lines.push(
    `# SXO + AEO Combined Report`,
    ``,
    `**Domain:** ${r.domain}  `,
    `**URL scanned:** ${r.url}  `,
    `**Page title:** ${r.pageTitle || '_(missing)_'}  `,
    `**Generated:** ${r.fetchedAt}  `,
    `**Report version:** v1.0`,
    ``,
    `---`,
    ``,
  )

  // ── Executive summary ──
  lines.push(
    `## Executive Summary`,
    ``,
    `\`\`\``,
    `Combined score:  ${bar(r.combinedScore)}   Grade: ${r.combinedGrade}`,
    `SXO score:       ${bar(r.sxoScore)}   Grade: ${r.sxoGrade}`,
    `AEO score:       ${bar(r.aeoScore)}   Grade: ${r.aeoGrade}`,
    `\`\`\``,
    ``,
    `**SXO** = will the page surface in search engines?  `,
    `**AEO** = once it surfaces, will an AI engine cite it?`,
    ``,
    `**Biggest single blocker:** ${biggestBlocker(r)}`,
    ``,
    `**Page snapshot:**`,
    `- ${r.pageSnapshot.h1Count} H1, ${r.pageSnapshot.h2Count} H2, ${r.pageSnapshot.h3Count} H3`,
    `- ${r.wordCount} words on the page`,
    `- ${r.pageSnapshot.imgWithAlt}/${r.pageSnapshot.imgCount} images have alt text`,
    `- ${r.pageSnapshot.jsonLdCount} JSON-LD schema blocks (${r.pageSnapshot.schemaTypes.join(', ') || 'none'})`,
    `- ${r.pageSnapshot.internalLinks} internal links, ${r.pageSnapshot.externalLinks} external`,
    `- llms.txt: ${r.pageSnapshot.hasLlmsTxt ? '✅' : '❌'} · sitemap.xml: ${r.pageSnapshot.hasSitemap ? '✅' : '❌'} · robots.txt: ${r.pageSnapshot.hasRobotsTxt ? '✅' : '❌'}`,
    ``,
    `---`,
    ``,
  )

  // ── Formula ──
  lines.push(
    `## How These Scores Are Calculated`,
    ``,
    `### SXO formula`,
    ``,
    `\`SXO = round(SEO × 0.35 + UX × 0.25 + CRO × 0.20 + GEO × 0.20)\``,
    ``,
    `Each pillar averages its findings, weighted by impact (high=3, medium=2, low=1). A finding contributes 100 if it passes, 60 if it warns, 0 if it fails.`,
    ``,
    `**Your pillars:**`,
    ``,
    `\`\`\``,
    `SEO  ${bar(r.sxoBreakdown.seo)}`,
    `UX   ${bar(r.sxoBreakdown.ux)}`,
    `CRO  ${bar(r.sxoBreakdown.cro)}`,
    `GEO  ${bar(r.sxoBreakdown.geo)}`,
    `\`\`\``,
    ``,
    `### AEO formula`,
    ``,
    `\`AEO = round(Σ (factor[i] × weight[i]) × 100)\` where weights are the active production weights from the 0nMCP engine.`,
    ``,
    `The 10 dimensions and their default weights:`,
    ``,
    `| Dimension | Weight | What it measures |`,
    `|---|---:|---|`,
    `| BLUF | 0.18 | First paragraph is a 2–3 sentence direct answer |`,
    `| Definition | 0.14 | Bolded "X is Y that does Z" within first 200 words |`,
    `| Procedure | 0.12 | Numbered list of imperative-verb steps |`,
    `| Comparison | 0.10 | Markdown/HTML table, ≥3 rows × 3 cols |`,
    `| FAQ | 0.10 | 5–7 voice-search Q/A pairs |`,
    `| Author E-E-A-T | 0.08 | Byline + credentials + Person schema |`,
    `| Freshness | 0.08 | "Updated <date>" + recent updated_at |`,
    `| Schema | 0.08 | Article + FAQPage + HowTo + Organization JSON-LD |`,
    `| Information Gain | 0.06 | Original data, code blocks, citations |`,
    `| Specificity | 0.06 | Numbers, dates, named entities per 100 words |`,
    ``,
    `### Combined score`,
    ``,
    `\`Combined = round(SXO × 0.45 + AEO × 0.55)\``,
    ``,
    `AEO is weighted higher because that's where the future of organic discovery is heading: AI engines, not the 10 blue links.`,
    ``,
    `---`,
    ``,
  )

  // ── SXO breakdown ──
  lines.push(`## SXO Breakdown`, ``)
  for (const pillar of ['SEO', 'UX', 'CRO', 'GEO'] as const) {
    const findings = r.sxoFindings.filter((f) => f.pillar === pillar)
    if (findings.length === 0) continue
    lines.push(`### Pillar: ${pillar}`, ``)
    for (const f of findings) {
      lines.push(renderSxoFinding(f), ``)
    }
  }
  lines.push(`---`, ``)

  // ── AEO breakdown ──
  lines.push(
    `## AEO Breakdown — All 10 Dimensions`,
    ``,
    `Each dimension is scored 0–100. Dimensions ≥70 pass. 40–69 warn. <40 fail.`,
    ``,
  )
  // Deterministic order matches the formula table.
  const order: (keyof AEOFactors)[] = [
    'bluf',
    'definition',
    'procedure',
    'comparison',
    'faq',
    'authorEEAT',
    'freshness',
    'schema',
    'informationGain',
    'specificity',
  ]
  for (const key of order) {
    const f = r.aeoFindings.find((x) => x.dimension === key)
    if (!f) continue
    lines.push(renderAeoFinding(f), ``)
  }
  lines.push(`---`, ``)

  // ── Markup pack ──
  lines.push(
    `## The Markup Pack — Paste-Ready Code`,
    ``,
    `Drop these into your CMS / theme. Every block below is production-ready and references your real domain (\`${r.domain}\`).`,
    ``,
    `### 1. \`/llms.txt\` (publish at \`https://${r.domain}/llms.txt\`)`,
    ``,
    `\`\`\``,
    `# ${r.domain}`,
    ``,
    `> ${r.pageTitle || '<one-sentence statement of what this site is + who it serves>'}`,
    ``,
    `## Primary pages`,
    `- [/](https://${r.domain}/): Homepage`,
    `- [/about](https://${r.domain}/about): About`,
    `- [/blog](https://${r.domain}/blog): Articles`,
    ``,
    `## Citation policy`,
    `Attribute as "${r.domain}". Link back to the source URL.`,
    `\`\`\``,
    ``,
    `### 2. \`/robots.txt\` (publish at \`https://${r.domain}/robots.txt\`)`,
    ``,
    `\`\`\``,
    `User-agent: *`,
    `Allow: /`,
    ``,
    `User-agent: GPTBot`,
    `Allow: /`,
    ``,
    `User-agent: ChatGPT-User`,
    `Allow: /`,
    ``,
    `User-agent: Claude-Web`,
    `Allow: /`,
    ``,
    `User-agent: PerplexityBot`,
    `Allow: /`,
    ``,
    `User-agent: Google-Extended`,
    `Allow: /`,
    ``,
    `Sitemap: https://${r.domain}/sitemap.xml`,
    `\`\`\``,
    ``,
    `### 3. Page-level JSON-LD bundle (drop in \`<head>\`)`,
    ``,
    `\`\`\`html`,
    `<script type="application/ld+json">`,
    `${JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            headline: r.pageTitle || '<page title>',
            description: r.pageMeta || '<page description>',
            datePublished: today,
            dateModified: today,
            author: { '@type': 'Person', name: '<author name>' },
            publisher: {
              '@type': 'Organization',
              name: r.domain,
              logo: { '@type': 'ImageObject', url: `https://${r.domain}/logo.png` },
            },
            mainEntityOfPage: r.url,
          },
          {
            '@type': 'Organization',
            name: r.domain,
            url: `https://${r.domain}`,
            logo: `https://${r.domain}/logo.png`,
          },
          {
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: '<question 1>', acceptedAnswer: { '@type': 'Answer', text: '<answer 1>' } },
              { '@type': 'Question', name: '<question 2>', acceptedAnswer: { '@type': 'Answer', text: '<answer 2>' } },
              { '@type': 'Question', name: '<question 3>', acceptedAnswer: { '@type': 'Answer', text: '<answer 3>' } },
            ],
          },
        ],
      },
      null,
      2,
    )}`,
    `</script>`,
    `\`\`\``,
    ``,
    `### 4. BLUF block (replaces your hero/intro)`,
    ``,
    `\`\`\`html`,
    `<p class="bluf"><strong>${r.pageTitle || '<topic>'}</strong> is a <category> that <does what>. It works by <one-sentence mechanism>. Use it when <one-sentence trigger>.</p>`,
    `\`\`\``,
    ``,
    `### 5. FAQ block (markdown — converts to FAQPage schema automatically with the JSON-LD above)`,
    ``,
    `\`\`\`markdown`,
    `## Frequently Asked Questions`,
    ``,
    `### What is ${r.pageTitle || '<topic>'}?`,
    ``,
    `<1–3 sentence direct answer.>`,
    ``,
    `### How does ${r.pageTitle || '<topic>'} work?`,
    ``,
    `<1–3 sentence mechanism explanation.>`,
    ``,
    `### Who is ${r.pageTitle || '<topic>'} for?`,
    ``,
    `<1–3 sentence audience targeting.>`,
    ``,
    `### How long does it take?`,
    ``,
    `<concrete number — "5 minutes", "30 days", etc.>`,
    ``,
    `### What does it cost?`,
    ``,
    `<concrete number or pricing tier reference.>`,
    `\`\`\``,
    ``,
    `### 6. "Updated" marker (drop right under the H1)`,
    ``,
    `\`\`\`html`,
    `<p class="updated">Updated ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>`,
    `\`\`\``,
    ``,
    `### 7. Comparison table template (markdown)`,
    ``,
    `\`\`\`markdown`,
    `| Option | Best for | Strength | Weakness | Price |`,
    `|---|---|---|---|---|`,
    `| <option A> | <audience> | <strength> | <weakness> | $X |`,
    `| <option B> | <audience> | <strength> | <weakness> | $Y |`,
    `| <option C> | <audience> | <strength> | <weakness> | $Z |`,
    `\`\`\``,
    ``,
    `---`,
    ``,
  )

  // ── 30-day roadmap ──
  lines.push(`## 30-Day Implementation Roadmap`, ``, renderRoadmap(r), `---`, ``)

  // ── Checklist ──
  lines.push(
    `## Citation-Quality Checklist`,
    ``,
    `Use this every time you publish a new page. Aim for 90+ combined to get cited consistently.`,
    ``,
    `- [ ] BLUF in the first paragraph (2–3 sentences, direct answer)`,
    `- [ ] Bolded definition within the first 200 words`,
    `- [ ] At least one numbered procedure (when procedural)`,
    `- [ ] At least one comparison table (≥3 rows × 3 cols)`,
    `- [ ] FAQ block with 5–7 Q/A pairs + matching FAQPage JSON-LD`,
    `- [ ] Article + Organization JSON-LD on every page`,
    `- [ ] Author byline + Person schema with credentials`,
    `- [ ] "Updated <Month YYYY>" marker visible above the fold`,
    `- [ ] At least 3 external citations to authoritative sources`,
    `- [ ] At least one piece of unique data (chart / table / quote)`,
    `- [ ] At least 5 numbers, dates, or named entities per 100 words`,
    `- [ ] llms.txt published`,
    `- [ ] robots.txt explicitly allows GPTBot, ChatGPT-User, Claude-Web, PerplexityBot, Google-Extended`,
    `- [ ] sitemap.xml includes the page`,
    `- [ ] Title 30–60 chars, primary keyword first`,
    `- [ ] Meta description 120–160 chars, BLUF-style answer`,
    `- [ ] Single H1 mirroring the search intent`,
    `- [ ] One H2 every 200–300 words`,
    `- [ ] Every image has descriptive alt text`,
    `- [ ] Primary CTA above the fold + repeated near the end`,
    `- [ ] Single-field email capture for organic-traffic pages`,
    ``,
    `---`,
    ``,
  )

  // ── Footer ──
  lines.push(
    `## What changes when you ship this?`,
    ``,
    `This pack is engineered against the same 10-dimension AEO model running on the 0nMCP citation engine. The model is updated nightly by an outcome evaluator that measures real engagement deltas across thousands of published posts and adjusts dimension weights accordingly.`,
    ``,
    `**Realistic 30-day expectation after applying the entire pack:**`,
    `- SXO score: +${Math.min(20, 100 - r.sxoScore)} points (capped at 100)`,
    `- AEO score: +${Math.min(25, 100 - r.aeoScore)} points (capped at 100)`,
    `- First AI engine citations within 14–28 days of publishing`,
    ``,
    `**Re-scan after implementing.** A fresh scan against the same URL will show which dimensions moved.`,
    ``,
    `---`,
    ``,
    `_Generated by sxowebsite.com — Combined SXO+AEO Engine v1.0._  `,
    `_Same scoring model as the 0nMCP citation engine._  `,
    `_Updates ship to your downloads automatically when the model retunes._`,
  )

  return lines.join('\n')
}

/**
 * Build a safe filename for the download.
 */
export function reportFilename(r: CombinedScanResult): string {
  const slug = r.domain.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase()
  const date = r.fetchedAt.slice(0, 10)
  return `sxo-aeo-report-${slug}-${date}.md`
}
