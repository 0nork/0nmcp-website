#!/usr/bin/env node
/**
 * Seed the 8 Rocket Mods recipes as 0n Marketplace store listings.
 * Run: node scripts/seed-rocket-mods-recipes.mjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Load .env.local manually
const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

function loadTemplate(name) {
  return JSON.parse(
    readFileSync(new URL(`../src/data/premium-templates/${name}.json`, import.meta.url), 'utf8')
  )
}

// ═══════════════════════════════════════════════════
// Recipe definitions — maps template files to store listings
// ═══════════════════════════════════════════════════

const recipes = [
  {
    slug: 'new-lead-full-stack',
    templateFile: 'new-lead-full-stack',
    title: 'New Lead Full Stack',
    description: 'Complete new lead pipeline: Stripe customer, AI welcome message, Slack + Discord notifications, SendGrid onboarding email. 3 phases, 5 parallel actions.',
    long_description: `# New Lead Full Stack Pipeline

The complete new lead automation — fires the moment a contact is created and handles everything in parallel.

## What's Inside

- **Stripe Customer Creation** — Billing-ready from day one
- **AI Welcome Message** — OpenAI generates a personalized welcome
- **Dual Team Notifications** — Slack + Discord alerts simultaneously
- **SendGrid Onboarding Email** — Delivers the AI-crafted welcome

## How It Works

1. Contact created in CRM triggers the pipeline
2. Phase 1: Stripe customer record created
3. Phase 2: AI generates welcome + Slack/Discord notifications fire in parallel
4. Phase 3: Welcome email sent via SendGrid

*5 actions across 3 phases — your entire new lead stack in one .0n file.*`,
    category: 'lead-gen',
    tags: ['lead-gen', 'onboarding', 'stripe', 'slack', 'discord', 'sendgrid', 'openai', 'popular'],
    price: 0,
    services: ['stripe', 'openai', 'slack', 'discord', 'sendgrid'],
  },
  {
    slug: 'deal-closed-celebration',
    templateFile: 'deal-closed-celebration',
    title: 'Deal Closed Celebration',
    description: 'When a deal is won: Stripe invoice, Slack celebration, Notion log, Airtable record. Complete sales close automation.',
    long_description: `# Deal Closed Celebration

Automate your sales close process — invoice, celebrate, and log everything the moment a deal closes.

## What's Inside

- **Stripe Invoice** — Auto-generated with deal amount and metadata
- **Slack Celebration** — Team announcement with deal details
- **Notion Page** — Permanent record in your workspace
- **Airtable Log** — Structured data for reporting

## How It Works

1. Opportunity marked as "Won" triggers the pipeline
2. Phase 1: Stripe invoice created with full deal metadata
3. Phase 2: Notion page, Airtable record, and Slack celebration fire in parallel

*Never miss a close again — every system updated automatically.*`,
    category: 'sales',
    tags: ['sales', 'stripe', 'slack', 'notion', 'airtable', 'invoicing', 'popular'],
    price: 0,
    services: ['stripe', 'slack', 'notion', 'airtable'],
  },
  {
    slug: 'ai-content-pipeline',
    templateFile: 'ai-content-pipeline',
    title: 'AI Content Pipeline',
    description: 'AI generates blog post + header image, publishes to Notion, notifies Slack, sends email promotion via SendGrid.',
    long_description: `# AI Content Pipeline

End-to-end content creation and distribution — from AI generation to multi-channel publishing.

## What's Inside

- **GPT-4o Blog Post** — Full article with SEO optimization
- **DALL-E 3 Header Image** — HD 16:9 cover art
- **Notion Publishing** — Auto-published with cover image
- **Slack Notification** — Team alert with content link
- **SendGrid Promotion** — Email blast to subscribers

## How It Works

1. Tag a contact with "generate-content" in your CRM
2. Phase 1: AI generates blog post + header image in parallel
3. Phase 2: Notion page created, Slack notified, promotional email sent

*Content marketing on autopilot — tag to publish in minutes.*`,
    category: 'content',
    tags: ['content', 'ai', 'openai', 'notion', 'slack', 'sendgrid', 'blog', 'dall-e'],
    price: 0,
    services: ['openai', 'notion', 'slack', 'sendgrid'],
  },
  {
    slug: 'abandoned-cart-recovery',
    templateFile: 'abandoned-cart-recovery',
    title: 'Abandoned Cart Recovery',
    description: 'AI-powered cart recovery: fetches Shopify cart, generates personalized recovery messages, delivers via email + SMS.',
    long_description: `# Abandoned Cart Recovery

Win back abandoned carts with AI-personalized outreach across email and SMS.

## What's Inside

- **Shopify Cart Analysis** — Fetches full cart details and customer history
- **AI Recovery Messages** — GPT-4o generates personalized email + SMS versions
- **SendGrid Email** — HTML recovery email with cart summary and urgency
- **Twilio SMS** — Concise text message with direct link back to cart

## How It Works

1. Shopify abandoned checkout webhook fires
2. Phase 1: Cart details fetched, AI generates dual-format recovery messages
3. Phase 2: Email and SMS sent simultaneously

*Recovers 10-15% of abandoned carts with personalized AI outreach.*`,
    category: 'ecommerce',
    tags: ['ecommerce', 'shopify', 'recovery', 'openai', 'sendgrid', 'twilio', 'sms'],
    price: 2900,
    services: ['shopify', 'openai', 'sendgrid', 'twilio'],
  },
  {
    slug: 'ai-lead-scorer',
    templateFile: 'ai-lead-scorer',
    title: 'AI Lead Scorer',
    description: 'AI scores every new lead 0-100, classifies into tiers, routes high-value leads to team via Slack, logs all scores to Airtable.',
    long_description: `# AI Lead Scorer

Instant AI lead qualification the moment a contact enters your CRM.

## What's Inside

- **GPT-4o Lead Scoring** — 0-100 score across 5 weighted dimensions
- **Tier Classification** — Hot / Warm / Cool / Cold based on score thresholds
- **Slack Routing** — High-value leads instantly alerted to sales team
- **Airtable Logging** — Every score recorded for analysis

## Scoring Rubric

| Dimension | Weight |
|-----------|--------|
| Title/Role Authority | 25 |
| Company Fit | 25 |
| Engagement Signals | 20 |
| Contact Completeness | 15 |
| Timing/Source Quality | 15 |

*No more manual qualification — every lead scored in seconds.*`,
    category: 'lead-gen',
    tags: ['lead-gen', 'ai', 'scoring', 'openai', 'slack', 'airtable', 'qualification'],
    price: 1900,
    services: ['openai', 'slack', 'airtable'],
  },
  {
    slug: 'smart-review-request',
    templateFile: 'smart-review-request',
    title: 'Smart Review Request',
    description: 'AI generates personalized review requests that avoid generic language. Delivers via email + SMS after service delivery.',
    long_description: `# Smart Review Request

Get more 5-star reviews with AI-personalized ask messages that feel genuine.

## What's Inside

- **GPT-4o Personalization** — References specific service delivered, avoids generic phrases
- **Dual Delivery** — Email via SendGrid + SMS via Twilio
- **Anti-Spam Intelligence** — Limits word "review" usage, bans generic openers

## How It Works

1. Tag a contact with "request-review" in your CRM
2. AI generates personalized email + SMS versions
3. Both channels fire simultaneously

*Triple your review rate with messages that don't sound like templates.*`,
    category: 'reputation',
    tags: ['reviews', 'reputation', 'openai', 'sendgrid', 'twilio', 'sms', 'email'],
    price: 0,
    services: ['openai', 'sendgrid', 'twilio'],
  },
  {
    slug: 'no-show-recovery',
    templateFile: 'no-show-recovery',
    title: 'No-Show Recovery',
    description: 'Automated no-show recovery: AI generates empathetic rescheduling messages, sends SMS + email, notifies team on Slack.',
    long_description: `# No-Show Recovery

Recover no-shows with empathetic AI messaging — SMS, email, and team notification.

## What's Inside

- **Empathetic AI Messaging** — GPT-4o generates recovery messages that never say "no-show"
- **SMS First** — Twilio text fires first for fastest reach
- **Email Follow-Up** — SendGrid delivers longer-form recovery
- **Team Alert** — Slack notification with recovery status and suggested follow-up SLA

## How It Works

1. Appointment status changes to "no-show"
2. AI generates empathetic dual-format recovery messages
3. SMS fires immediately, email follows, team notified on Slack

*Recover 30-40% of no-shows with messages that feel human.*`,
    category: 'scheduling',
    tags: ['scheduling', 'appointments', 'recovery', 'openai', 'twilio', 'sendgrid', 'slack'],
    price: 900,
    services: ['openai', 'sendgrid', 'twilio', 'slack'],
  },
  {
    slug: 'competitor-monitor',
    templateFile: 'competitor-monitor',
    title: 'Competitor Monitor',
    description: 'Weekly AI competitor analysis: generates strategic report, publishes to Notion, sends summary briefing to Slack.',
    long_description: `# Competitor Monitor

Automated weekly competitive intelligence — AI analysis, Notion reports, Slack briefings.

## What's Inside

- **GPT-4o Deep Analysis** — 6-section competitive intelligence report
- **Notion Report Archive** — Historical reports for trend tracking
- **Slack Briefing** — Executive summary every Monday morning

## Report Sections

1. Executive Summary with threat levels
2. Per-Competitor Analysis (strengths, weaknesses, recent moves)
3. Market Gaps and Opportunities
4. Threat Assessment
5. Recommended Strategic Actions
6. Market Signals to Watch

## How It Works

1. Runs on schedule: Every Monday at 8:00 AM ET
2. AI analyzes your competitors against your product
3. Full report published to Notion, summary sent to Slack

*Never be caught off guard — weekly intelligence on autopilot.*`,
    category: 'analytics',
    tags: ['analytics', 'competitor', 'openai', 'notion', 'slack', 'intelligence', 'weekly'],
    price: 999,
    services: ['openai', 'notion', 'slack'],
  },
]

// ═══════════════════════════════════════════════════
// Seed all recipes
// ═══════════════════════════════════════════════════

console.log(`Seeding ${recipes.length} recipes to marketplace...\n`)

let successCount = 0

for (const recipe of recipes) {
  const templateJson = loadTemplate(recipe.templateFile)

  const stepCount = templateJson.steps?.length || 0

  const { data, error } = await supabase
    .from('store_listings')
    .upsert({
      slug: recipe.slug,
      title: recipe.title,
      description: recipe.description,
      long_description: recipe.long_description,
      category: recipe.category,
      tags: recipe.tags,
      price: recipe.price,
      currency: 'usd',
      services: recipe.services,
      step_count: stepCount,
      status: 'active',
      workflow_data: templateJson,
    }, { onConflict: 'slug' })
    .select('id, slug, price, status')
    .single()

  if (error) {
    console.error(`  FAIL: ${recipe.slug}`, error.message)
  } else {
    console.log(`  OK: ${recipe.slug} — $${(data.price / 100).toFixed(2)} — ${stepCount} steps`)
    successCount++
  }
}

console.log(`\nDone! ${successCount}/${recipes.length} recipes seeded to marketplace.`)
console.log('Visit: https://0nmcp.com/console → Store to see them.')
