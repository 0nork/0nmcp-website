-- Migration: Insert "The Automation Liberation Campaign" store listing
-- The first .0n Campaign file ever created
-- Price: $89 (8900 cents) | Stripe Product: prod_U4BgnUURvSKxTq | Price: price_1T63JGHThmAuKVQMNecsu96V
-- Promo Code: TURNIT0N (100% off, 5 uses max)
-- Note: The workflow_data JSON is inserted via the seed script at scripts/seed-campaign.mjs
-- This migration just ensures the listing row exists with correct metadata

INSERT INTO store_listings (
  title,
  slug,
  description,
  long_description,
  category,
  tags,
  price,
  currency,
  stripe_product_id,
  stripe_price_id,
  services,
  step_count,
  status
) VALUES (
  'The Automation Liberation Campaign',
  'automation-liberation-campaign',
  'Complete 30-day multi-channel marketing campaign. 7 email sequences, 6 LinkedIn posts, 3 Facebook ad sets, CRM automation, embedded onboarding wizard. The first .0n Campaign file.',
  E'# The Automation Liberation Campaign\n\nThe **first .0n Campaign file** ever created — a complete, ready-to-launch 30-day marketing campaign targeting business owners.\n\n## What''s Inside\n\n- **7 Email Sequences** — Full HTML + plaintext with A/B subject lines\n- **6 LinkedIn Posts** — Organic content calendar with engagement hooks\n- **3 Facebook Ad Sets** — Awareness, retargeting, and conversion campaigns\n- **39 Execution Steps** — CRM tags, custom fields, sends, posts, delays, conditions\n- **Embedded Onboarding** — 6-step wizard configures everything\n- **4 Campaign Phases** — Wake-Up, Education, Offer, Nurture\n\n## How It Works\n\n1. **Purchase** → File added to your Vault\n2. **Open** → Onboarding walks you through setup\n3. **Configure** → Company details, CRM connection, budget\n4. **Review** → Opens in Visual Builder\n5. **Launch** → Execute through 0nMCP\n\n## Expected Results\n\n- 35%+ email open rate\n- 8%+ click rate\n- 3%+ conversion on engaged audience\n\n*The future of marketing automation — in a single portable file.*',
  'marketing',
  ARRAY['campaign', 'email', 'linkedin', 'facebook', 'retargeting', 'automation', 'multi-channel', 'onboarding', '0n-campaign'],
  8900,
  'usd',
  'prod_U4BgnUURvSKxTq',
  'price_1T63JGHThmAuKVQMNecsu96V',
  ARRAY['crm', 'linkedin', 'facebook'],
  39,
  'active'
) ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  stripe_product_id = EXCLUDED.stripe_product_id,
  stripe_price_id = EXCLUDED.stripe_price_id,
  description = EXCLUDED.description,
  long_description = EXCLUDED.long_description,
  step_count = EXCLUDED.step_count,
  updated_at = now();
