-- 0n Console Store — Marketplace Tables
-- Purchasable .0n workflows, purchases, and the first listing (LinkedIn Agentic Onboarding)

-- ═══════════════════════════════════════════
-- 1. Store Listings
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS store_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  category TEXT NOT NULL DEFAULT 'custom',
  tags TEXT[] DEFAULT '{}',
  price INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  cover_image_url TEXT,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  workflow_id UUID REFERENCES workflow_files(id) ON DELETE SET NULL,
  workflow_data JSONB,
  services TEXT[] DEFAULT '{}',
  step_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  total_purchases INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_store_listings_slug ON store_listings(slug);
CREATE INDEX IF NOT EXISTS idx_store_listings_status ON store_listings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_store_listings_category ON store_listings(category);

-- ═══════════════════════════════════════════
-- 2. Store Purchases
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS store_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES store_listings(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflow_files(id) ON DELETE SET NULL,
  stripe_session_id TEXT,
  amount INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(buyer_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_store_purchases_buyer ON store_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_store_purchases_listing ON store_purchases(listing_id);

-- ═══════════════════════════════════════════
-- 3. Row Level Security
-- ═══════════════════════════════════════════
ALTER TABLE store_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_purchases ENABLE ROW LEVEL SECURITY;

-- Anyone can read active listings
CREATE POLICY "Public read active listings"
  ON store_listings FOR SELECT
  USING (status = 'active');

-- Service role full access on listings (API routes use service role)
CREATE POLICY "Service role full access on store_listings"
  ON store_listings FOR ALL
  USING (true) WITH CHECK (true);

-- Users can read their own purchases
CREATE POLICY "Users read own purchases"
  ON store_purchases FOR SELECT
  USING (auth.uid() = buyer_id);

-- Users can insert own purchases
CREATE POLICY "Users insert own purchases"
  ON store_purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Service role full access on purchases
CREATE POLICY "Service role full access on store_purchases"
  ON store_purchases FOR ALL
  USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════
-- 4. Updated_at trigger
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_store_listing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_store_listing_updated
  BEFORE UPDATE ON store_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_store_listing_timestamp();

-- ═══════════════════════════════════════════
-- 5. Seed: LinkedIn Agentic Onboarding
-- ═══════════════════════════════════════════
INSERT INTO store_listings (
  title,
  slug,
  description,
  long_description,
  category,
  tags,
  price,
  currency,
  services,
  step_count,
  status,
  workflow_data
) VALUES (
  'LinkedIn Agentic Onboarding',
  'linkedin-agentic-onboarding',
  'AI-powered LinkedIn profile analysis, archetype classification, and automated posting with self-optimizing follow-up questions. Includes PACG, LVOS, CUCIA, and TAICD subsystems.',
  E'## LinkedIn Agentic Onboarding & Self-Optimizing Conversion System\n\nThis .0n workflow connects to your LinkedIn profile and deploys a complete AI-powered content generation pipeline:\n\n### What''s Included\n\n**PACG** — Profile-Adaptive Content Generator\nClassifies your LinkedIn profile into a 5-dimensional professional archetype (tier, domain, style, posting behavior, vocabulary level) and generates posts that match your authentic voice.\n\n**LVOS** — Language Variation Optimization System\nUses Thompson Sampling (multi-armed bandit) to select the optimal follow-up questions during onboarding. Self-improves with every interaction through 48-hour observation windows.\n\n**CUCIA** — Cross-User Conversion Intelligence Aggregator\nAnonymized segment-level learning that boosts variant selection based on what works for similar professional profiles across all users.\n\n**TAICD** — Third-Party AI Intermediary Conversion Delivery\nExecution receipts returned to your AI system as structured proof of every tool call.\n\n### Features\n- LinkedIn OAuth connection\n- Automated posting (daily, weekly, biweekly)\n- 23 banned phrase detection\n- Autonomous plateau detection + new variant generation\n- AI Manifest at /.well-known/0n-manifest.json\n- Cron-driven self-optimization cycle',
  'sales',
  ARRAY['linkedin', 'ai', 'automation', 'content', 'pacg', 'lvos', 'cucia', 'taicd', 'thompson-sampling', 'archetype'],
  0,
  'usd',
  ARRAY['anthropic', 'linkedin', 'supabase'],
  6,
  'active',
  '{
    "$0n": {
      "version": "1.0.0",
      "type": "workflow",
      "created": "2026-02-28T00:00:00.000Z",
      "name": "LinkedIn Agentic Onboarding",
      "description": "AI-powered LinkedIn profile analysis, archetype classification, and automated posting with self-optimizing follow-up questions."
    },
    "trigger": {
      "type": "event",
      "config": {
        "event": "linkedin_oauth_callback",
        "description": "Triggers when a user connects their LinkedIn profile via OAuth"
      }
    },
    "inputs": {
      "topic": {
        "type": "string",
        "description": "Optional topic for post generation",
        "required": false
      },
      "follow_up_response": {
        "type": "string",
        "description": "User response to the onboarding follow-up question",
        "required": false
      }
    },
    "launch_codes": {
      "LINKEDIN_CLIENT_ID": {
        "label": "LinkedIn Client ID",
        "description": "OAuth Client ID from your LinkedIn Developer App",
        "type": "string",
        "required": true,
        "help_url": "https://developer.linkedin.com/",
        "placeholder": "77abc123def456"
      },
      "LINKEDIN_CLIENT_SECRET": {
        "label": "LinkedIn Client Secret",
        "description": "OAuth Client Secret from your LinkedIn Developer App",
        "type": "string",
        "required": true,
        "placeholder": "AaBbCcDdEeFf..."
      },
      "ANTHROPIC_API_KEY": {
        "label": "Anthropic API Key",
        "description": "API key for Claude (used for profile classification and content generation)",
        "type": "string",
        "required": true,
        "help_url": "https://console.anthropic.com/",
        "placeholder": "sk-ant-..."
      }
    },
    "steps": [
      {
        "id": "classify_profile",
        "service": "anthropic",
        "action": "Classify LinkedIn profile into 5D professional archetype using Claude",
        "params": {
          "model": "claude-sonnet-4-20250514",
          "analysis": ["tier", "domain", "style", "postingBehavior", "vocabularyLevel"]
        },
        "description": "PACG: Analyzes headline, industry, and profile data to produce a professional archetype with validated fields."
      },
      {
        "id": "save_archetype",
        "service": "supabase",
        "action": "Save classified archetype to linkedin_members table",
        "params": {
          "table": "linkedin_members",
          "operation": "update",
          "fields": ["archetype", "onboarding_completed"]
        },
        "description": "Persists the archetype and marks onboarding as complete."
      },
      {
        "id": "get_segment_boosts",
        "service": "supabase",
        "action": "Query CUCIA segment model for variant boosts",
        "params": {
          "table": "cucia_segment_model",
          "operation": "select",
          "key_format": "domain:tier:postingBehavior"
        },
        "description": "CUCIA: Fetches anonymized cross-user conversion data to boost variant selection for this professional segment."
      },
      {
        "id": "select_variant",
        "service": "internal",
        "action": "Thompson Sampling variant selection with CUCIA boosts",
        "params": {
          "algorithm": "thompson_sampling",
          "distribution": "beta",
          "boost_source": "{{get_segment_boosts.output.boosts}}"
        },
        "description": "LVOS: Samples Beta(alpha, beta) for each follow-up question variant, applies segment boosts, selects the highest-scoring question."
      },
      {
        "id": "record_selection",
        "service": "supabase",
        "action": "Open 48-hour observation window for variant selection",
        "params": {
          "table": "lvos_selections",
          "operation": "insert",
          "window_hours": 48
        },
        "description": "Creates an observation window to track whether this variant selection leads to a conversion event within 48 hours."
      },
      {
        "id": "build_receipt",
        "service": "internal",
        "action": "Build TAICD execution receipt with tool call log",
        "params": {
          "tool_name": "onboard_with_linkedin",
          "log_to": "linkedin_tool_calls"
        },
        "description": "TAICD: Constructs a structured execution receipt (rcpt_{ts}_{id}) and logs the tool call for third-party AI verification."
      }
    ]
  }'::JSONB
) ON CONFLICT (slug) DO NOTHING;
