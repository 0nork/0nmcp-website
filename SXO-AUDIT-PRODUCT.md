# 0nAudit — AI-Powered SXO Audit Platform
## Product Definition & Agency White-Label Model

**Product:** 0nAudit (part of the 0nMCP ecosystem)
**URL:** audit.0nmcp.com (or 0nmcp.com/audit)
**Target:** Digital agencies, SEO consultants, marketing firms
**Model:** Pay-per-audit with 3 tiers
**Author:** RocketOpp LLC
**Date:** April 2, 2026

---

## 1. What We Have Right Now (Build Inventory)

Before defining the product, here's what already exists and is deployable TODAY:

### Infrastructure (Ready)
| Asset | Status | What It Gives Us |
|-------|--------|-----------------|
| Supabase Auth | Live | Email + Google + LinkedIn + GitHub login |
| Stripe Billing | Live | Pay-per-use metered billing ($0.10/execution already wired) |
| 0nMCP Orchestrator | Live | 1,183 tools across 99 services — the engine that runs audits |
| 0nBrandBuilder | Live | .0n brand file generation — logos, colors, fonts, facts |
| Webflow API | Live | 13 endpoints — can pull site structure, CMS data, publish |
| WordPress API | Live | Posts, pages, media, plugins — can audit WP sites |
| Supabase DB | Live | 7 instances, profiles table, brand_profiles table |
| Vercel Edge | Live | Auto-deploy, edge functions, OG image generation |
| CRM Integration | Live | 245 tools — contact creation, pipeline, email |

### Content/SEO Engine (Ready)
| Asset | Status | What It Gives Us |
|-------|--------|-----------------|
| SXO Living DOM | Live | Dynamic content mutation engine on 0nmcp.com |
| Programmatic SEO | Live | 300+ indexable pages from 4 JSON files |
| Blog with OG | Live | 12 posts, branded code blocks, 3-column layout |
| JSON-LD schemas | Live | BlogPosting, Product, FAQ, HowTo, Organization |
| sitemap.xml | Live | Dynamic, auto-updates with new content |

### AI Capabilities (Ready)
| Asset | Status | What It Gives Us |
|-------|--------|-----------------|
| Anthropic API | Live | Claude Sonnet for AI analysis |
| Web Search tool | Live | Anthropic native web_search_20250305 |
| Brand Extraction | Live | /api/brand/extract — AI pulls brand data from any URL |
| Content Engine | Live | AI content generation, personas, SEO optimization |

### White-Label Infrastructure (Ready)
| Asset | Status | What It Gives Us |
|-------|--------|-----------------|
| .0n Brand Files | Live | Portable brand profiles with colors, logos, fonts |
| OG Image Generator | Live | Dynamic branded OG images via Edge function |
| Sub-location scoping | Live | One brand per sub-location in CRM |
| Stripe Connect | Possible | Split payments for agency → sub-client billing |

---

## 2. The Product: 0nAudit

### 2.1 One-Line Pitch

**"AI-powered website audits that agencies can white-label and sell to their clients."**

### 2.2 Target Audience

| Segment | Who They Are | Why They Pay |
|---------|-------------|-------------|
| **Primary:** Digital Agencies | 10-100 person shops selling SEO/web services | They already run audits manually. We automate + brand it as theirs. |
| **Secondary:** Freelance SEO Consultants | Solo operators doing site audits for clients | Professional-looking reports without enterprise tools. |
| **Tertiary:** Marketing Managers | In-house teams at mid-market companies | Monthly site health monitoring. |

### 2.3 Competitive Landscape

| Tool | Price | Weakness | Our Edge |
|------|-------|----------|----------|
| Semrush | $130-500/mo | Complex, expensive, ugly reports | Beautiful, AI-powered, white-labelable |
| Ahrefs | $99-999/mo | SEO-only, no SXO/CRO | We audit UX, conversion, speed, AND SEO |
| Screaming Frog | $259/yr | Desktop-only, technical | Web-based, AI-summarized, branded |
| GTmetrix | Free-$50/mo | Speed only | Full SXO audit (speed + SEO + UX + conversion) |
| Lighthouse | Free | Raw data, no insights | AI interprets results, gives action items |
| SE Ranking | $44-191/mo | Generic reports | .0n brand file integration, truly white-labeled |

**Our unfair advantage:** We're the only tool that combines AI analysis + white-label branding + the 0nMCP service mesh (99 connected services) in one platform. The audit doesn't just FIND problems — it can FIX them via the same dashboard.

---

## 3. Pricing Tiers

### 3.1 Pay-Per-Audit Model

| Tier | Name | Price | What's Included |
|------|------|-------|----------------|
| **X** | Page Scan | **$2.99** | Single URL audit — speed, meta, OG, headers, mobile, basic SEO. Returns letter grade + 10-point checklist. |
| **Y** | Domain Report | **$14.99** | Full domain crawl (up to 50 pages) — sitemap analysis, internal links, broken links, duplicate content, schema coverage, canonical issues, aggregate score. |
| **Z** | Client Report | **$49.99** | Everything in Y + white-labeled PDF/web report with agency logo, colors, fonts (from .0n brand file), executive summary, competitor comparison (1 competitor), action item priority matrix, shareable client URL. |

### 3.2 Subscription Bundles (Future)

| Plan | Price | Audits/mo | Extra |
|------|-------|-----------|-------|
| Starter | $29/mo | 15 page scans | Dashboard, history |
| Pro | $79/mo | 10 domain reports | + API access, scheduled audits |
| Agency | $199/mo | 5 client reports + unlimited page scans | + White-label, custom domain, Stripe Connect for client billing |
| Enterprise | $499/mo | Unlimited everything | + Dedicated support, custom integrations |

### 3.3 Revenue Math

Conservative: 100 agencies × $79/mo = **$7,900 MRR**
Target: 500 agencies × $199/mo = **$99,500 MRR**
Stretch: 1,000 agencies × mixed = **$150K+ MRR**

Cost per audit: ~$0.02-0.15 (Anthropic API call + compute)
Margin: **90%+**

---

## 4. What Each Tier Audits

### 4.1 Page Scan ($2.99) — The Hook

Runs in < 10 seconds. Designed to be the free-trial gateway.

| Check | Method | Output |
|-------|--------|--------|
| Page Speed | Fetch timing + resource count | Score A-F + load time |
| Meta Tags | Parse `<head>` | Title, description, keywords present/missing |
| Open Graph | Parse og: tags | Image, title, description, type |
| Security Headers | Check response headers | HSTS, CSP, X-Frame, X-XSS |
| Mobile Friendly | Viewport meta + responsive check | Pass/Fail |
| Schema.org | Parse JSON-LD | Types found, validation |
| Image Alt Text | Parse all `<img>` tags | % with alt text |
| Heading Structure | Parse H1-H6 | Proper hierarchy check |
| Internal Links | Parse `<a>` tags | Count, broken link check |
| HTTPS | Check protocol | Secure/Not secure |

**Output:** Letter grade (A+ to F), 10-point checklist, 3 AI-generated action items.

### 4.2 Domain Report ($14.99) — The Workhorse

Crawls up to 50 pages. Takes 30-60 seconds.

Everything in Page Scan PLUS:

| Check | Method | Output |
|-------|--------|--------|
| Sitemap.xml | Fetch + parse | Pages indexed, missing pages |
| Robots.txt | Fetch + parse | Blocked resources, issues |
| Internal Link Graph | Crawl + map | Orphan pages, link depth |
| Duplicate Content | Hash body text | Duplicate title/descriptions |
| Canonical Tags | Check all pages | Missing, conflicting canonicals |
| Schema Coverage | Check all pages | % of pages with JSON-LD |
| 404 Detection | Crawl internal links | Broken internal links list |
| Redirect Chains | Follow redirects | Chains > 2 hops |
| Image Optimization | Check all images | Missing alt, oversized, no lazy-load |
| Core Web Vitals (est.) | Resource analysis | LCP, CLS, FID estimates |
| Content Quality | AI analysis | Thin pages, keyword stuffing, readability |
| Competitor Gap | AI web search | Compare against 1 competitor |

**Output:** Domain score (0-100), category scores, page-by-page breakdown, priority action list.

### 4.3 Client Report ($49.99) — The Money Maker

Everything in Domain Report PLUS:

| Feature | Description |
|---------|------------|
| White-Label Branding | Agency logo, colors, fonts from .0n brand file |
| Executive Summary | AI-written 3-paragraph summary for client stakeholders |
| Competitor Comparison | Side-by-side with 1 competitor (speed, SEO, schema) |
| Action Item Matrix | Priority × Impact grid with estimated hours |
| Shareable URL | Unique branded URL: `audit.0nmcp.com/r/{reportId}` |
| PDF Export | Downloadable branded PDF |
| Client Portal | Client can view report without logging in |
| Revision History | Re-run audit monthly, show trends |
| CRM Integration | Auto-create contact + opportunity in agency's CRM |

---

## 5. Technical Architecture

### 5.1 User Flow

```
Agency signs up (Google OAuth)
    ↓
Dashboard → "New Audit"
    ↓
Enter URL → Select tier (Page/Domain/Client)
    ↓
If Client tier → Select brand profile (.0n file) or create one
    ↓
Payment (Stripe) → Audit runs
    ↓
Results displayed → Share/Export/Download
    ↓
History saved → Re-run monthly (subscription)
```

### 5.2 API Routes Needed

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/audit/page` | POST | Run single-page audit |
| `/api/audit/domain` | POST | Run domain crawl audit |
| `/api/audit/report` | POST | Generate client report |
| `/api/audit/[id]` | GET | Fetch audit results |
| `/api/audit/pdf` | POST | Generate PDF export |
| `/api/audit/checkout` | POST | Stripe checkout for audit |
| `/api/audit/history` | GET | User's audit history |

### 5.3 Database Tables

```sql
-- Audit runs
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  url TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('page', 'domain', 'client')),
  status TEXT DEFAULT 'pending',
  score INTEGER,
  grade TEXT,
  results JSONB,
  brand_profile JSONB,  -- .0n brand file for white-label
  share_token TEXT UNIQUE,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit pages (for domain crawl)
CREATE TABLE audit_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  score INTEGER,
  checks JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.4 Audit Engine (What Runs)

The audit engine is a serverless function that:

1. **Fetches the URL** via `fetch()` with timing
2. **Parses HTML** with regex/DOM parsing (no headless browser needed for v1)
3. **Checks response headers** for security
4. **Parses meta/OG/schema** from the `<head>`
5. **Counts and validates** images, links, headings
6. **Sends to Claude** for AI analysis (optional for Page tier, required for Domain/Client)
7. **Scores each category** on a 0-100 scale
8. **Computes letter grade** from aggregate
9. **Generates action items** via AI
10. **Saves to Supabase** + returns results

**Cost per audit:**
- Page Scan: ~$0.02 (1 fetch + basic parsing, no AI call needed)
- Domain Report: ~$0.08 (50 fetches + 1 AI call)
- Client Report: ~$0.15 (50 fetches + 2 AI calls + PDF generation)

### 5.5 White-Label System

The Client tier loads the agency's `.0n` brand file and applies:

| Brand Token | Applied To |
|-------------|-----------|
| `identity.logos.primary` | Report header, PDF cover |
| `identity.logos.icon` | Favicon on shared URL |
| `identity.colors.primary` | Headings, score bars |
| `identity.colors.accent` | CTAs, highlights |
| `identity.colors.background` | Report background |
| `identity.fonts.display` | Report headings |
| `identity.fonts.body` | Report body text |
| `business.name` | "Powered by {agency}" footer |
| `business.tagline` | Report subtitle |
| `business.contact_url` | "Get help" CTA link |

The shared report URL (`audit.0nmcp.com/r/{id}`) renders with the agency's branding — their client never sees "0nMCP" anywhere.

---

## 6. Go-To-Market Strategy

### 6.1 Organic (Free Traffic)

| Channel | Play |
|---------|------|
| **SEO** | Rank for "free website audit", "SEO audit tool", "site speed test" — programmatic landing pages per check type |
| **Blog** | "How to audit a website in 2026", "Best SEO audit tools compared", etc. |
| **0nmcp.com/audit** | Free page scan (no login) → captures email for full report |
| **sxowebsite.com** | SXO-focused positioning, links back to 0nAudit |
| **Shareable reports** | Every audit generates a unique URL → indexable → organic backlinks |
| **Dev.to / LinkedIn** | "We built an AI-powered audit tool" launch posts |

### 6.2 Paid (When Ready)

| Channel | Targeting |
|---------|----------|
| Google Ads | "website audit tool", "SEO audit", "site speed test" |
| LinkedIn Ads | Agency owners, SEO consultants, marketing managers |
| Facebook/Instagram | Retarget visitors who ran free audits |

### 6.3 Agency Acquisition

| Tactic | Description |
|--------|------------|
| Free tier | Unlimited page scans (login required) → upsell to domain/client |
| Agency onboarding | White-glove setup: import brand, configure CRM, first audit free |
| Affiliate program | 30% recurring for agency referrals (already built) |
| CRM marketplace | Install 0nAudit as a CRM marketplace app |
| Partner program | "Certified 0nAudit Partner" badge for agencies |

---

## 7. Build Priority (What to Ship First)

### Phase 1 — The Hook (Ship in 1 session)
- [ ] `/audit` page — enter URL, run free page scan, see results
- [ ] `/api/audit/page` — single-page audit engine
- [ ] Beautiful results page with letter grade, 10 checks, 3 AI action items
- [ ] Email capture to save/share results
- [ ] Shareable report URL

### Phase 2 — The Revenue (Ship in 2-3 sessions)
- [ ] Stripe checkout for Domain + Client tiers
- [ ] Domain crawl engine (up to 50 pages)
- [ ] Audit history dashboard
- [ ] PDF export for Client tier
- [ ] .0n brand file integration for white-label

### Phase 3 — The Platform (Ship in 1-2 weeks)
- [ ] Agency dashboard with client management
- [ ] Scheduled monthly re-audits
- [ ] Competitor comparison engine
- [ ] CRM auto-contact creation
- [ ] Custom domain support for white-label
- [ ] Subscription billing (monthly plans)

### Phase 4 — The Moat
- [ ] API access for programmatic audits
- [ ] WordPress plugin (audit from wp-admin)
- [ ] Chrome extension (audit any page)
- [ ] Slack bot integration
- [ ] "Fix it" buttons that execute fixes via 0nMCP

---

## 8. Differentiation: Why 0nAudit Wins

| Feature | Them | Us |
|---------|------|-----|
| AI-powered insights | Basic rules | Claude AI analyzes context, intent, quality |
| White-label | Logo swap only | Full .0n brand file (colors, fonts, voice, facts) |
| Fix integration | "Here's what's broken" | "Click to fix" via 0nMCP (99 services) |
| Speed | 30-60 seconds | Page scan in < 5 seconds |
| Price | $100-500/mo subscriptions | $2.99 per audit, pay as you go |
| CRM integration | None | Auto-creates contacts + opportunities |
| Portable results | Locked in platform | .0n file export, shareable URLs |
| SXO focus | SEO only | Search Experience Optimization — UX + speed + SEO + conversion |

---

## 9. Revenue Projection (12 months)

| Month | Users | Audits/mo | Revenue |
|-------|-------|-----------|---------|
| 1 | 50 | 200 | $1,200 |
| 2 | 150 | 800 | $5,400 |
| 3 | 400 | 2,500 | $14,000 |
| 6 | 1,200 | 10,000 | $52,000 |
| 9 | 2,500 | 25,000 | $110,000 |
| 12 | 5,000 | 60,000 | $250,000 |

Assumptions: 60% page scans ($2.99), 30% domain ($14.99), 10% client ($49.99). Conservative growth.

---

## 10. The Name

**0nAudit** — or position it under the SXO brand:

| Option | Domain | Positioning |
|--------|--------|-------------|
| **0nAudit** | audit.0nmcp.com | Technical, developer-focused |
| **SXO Audit** | sxowebsite.com/audit | Marketing-focused, agency-friendly |
| **Both** | Same engine, different branding | 0nAudit = tool, SXO Audit = white-label product |

Recommendation: **Build it as 0nAudit on 0nmcp.com, market it as SXO Audit on sxowebsite.com.** Same backend, different frontend branding. The agency-facing product is SXO Audit. The developer-facing tool is 0nAudit.

---

*RocketOpp LLC · 0nMCP · 5 Patents Pending · April 2026*
