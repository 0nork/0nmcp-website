#!/usr/bin/env node
/**
 * Seed the Automation Liberation Campaign workflow_data into the store listing.
 * Run: node scripts/seed-campaign.mjs
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

const campaignJson = JSON.parse(
  readFileSync(new URL('../src/data/premium-templates/automation-liberation-campaign.json', import.meta.url), 'utf8')
)

console.log(`Campaign: ${campaignJson.$0n.name}`)
console.log(`Type: ${campaignJson.$0n.type}`)
console.log(`Steps: ${campaignJson.steps.length}`)
console.log(`Emails: ${campaignJson.assets.emails.length}`)
console.log(`LinkedIn Posts: ${campaignJson.assets.linkedin_posts.length}`)
console.log(`Facebook Ads: ${campaignJson.assets.facebook_ads.length}`)
console.log('')

// Upsert the listing with full workflow_data
const { data, error } = await supabase
  .from('store_listings')
  .upsert({
    slug: 'automation-liberation-campaign',
    title: 'The Automation Liberation Campaign',
    description: 'Complete 30-day multi-channel marketing campaign. 7 email sequences, 6 LinkedIn posts, 3 Facebook ad sets, CRM automation, embedded onboarding wizard. The first .0n Campaign file.',
    long_description: `# The Automation Liberation Campaign

The **first .0n Campaign file** ever created — a complete, ready-to-launch 30-day marketing campaign.

## What's Inside

- **7 Email Sequences** — Full HTML + plaintext with A/B subject lines
- **6 LinkedIn Posts** — Organic content calendar
- **3 Facebook Ad Sets** — Awareness, retargeting, conversion
- **39 Execution Steps** — Tags, fields, sends, posts, delays, conditions
- **Embedded Onboarding** — 6-step wizard
- **4 Phases** — Wake-Up → Education → Offer → Nurture

## How It Works

1. Purchase → Added to your Vault
2. Open → Onboarding wizard
3. Configure → Company, CRM, budget
4. Review → Visual Builder
5. Launch → Execute via 0nMCP

*The future of marketing automation — in a single portable file.*`,
    category: 'marketing',
    tags: ['campaign', 'email', 'linkedin', 'facebook', 'retargeting', 'automation', 'multi-channel', 'onboarding', '0n-campaign'],
    price: 8900,
    currency: 'usd',
    stripe_product_id: 'prod_U4BgnUURvSKxTq',
    stripe_price_id: 'price_1T63JGHThmAuKVQMNecsu96V',
    services: ['crm', 'linkedin', 'facebook'],
    step_count: campaignJson.steps.length,
    status: 'active',
    workflow_data: campaignJson,
  }, { onConflict: 'slug' })
  .select('id, slug, price, status')
  .single()

if (error) {
  console.error('Error upserting listing:', error)
  process.exit(1)
}

console.log('Store listing upserted:')
console.log(`  ID: ${data.id}`)
console.log(`  Slug: ${data.slug}`)
console.log(`  Price: $${data.price / 100}`)
console.log(`  Status: ${data.status}`)
console.log('')
console.log('Stripe:')
console.log('  Product: prod_U4BgnUURvSKxTq')
console.log('  Price: price_1T63JGHThmAuKVQMNecsu96V ($89.00)')
console.log('  Coupon: NXEsD8wZ (100% off)')
console.log('  Promo Code: TURNIT0N')
console.log('')
console.log('Done! The Automation Liberation Campaign is live in the marketplace.')
