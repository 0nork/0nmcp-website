-- Insert the 0nMCP Social Automation Engine as a store listing
-- This is the Chrome Extension product with tiered pricing

INSERT INTO store_listings (
  title, slug, description, long_description, category, tags,
  price, currency, status, step_count, total_purchases,
  workflow_data, services
) VALUES (
  '0nMCP Social Intelligence Engine',
  'social-intelligence-engine',
  'AI-powered Chrome Extension for LinkedIn automation, CRM integration, multi-channel distribution, and autonomous relationship intelligence. The AI learns your voice and gets smarter over time.',
  '## 0nMCP Social Intelligence Engine

The **Personal Business Intelligence Operating System** that starts on LinkedIn and expands everywhere.

### What It Does

**Generate** — AI writes posts in YOUR voice. Not generic AI — learned from your corrections, edits, and approvals. The more you use it, the more it sounds like you.

**Analyze** — Real-time engagement scoring on any LinkedIn post. Know before you publish whether it will perform.

**Dispute** — Select any claim on LinkedIn, get a fact-checked, professional response backed by your knowledge base. Never let misinformation go unchallenged.

**Schedule** — Queue posts with optimal timing. AI learns your best posting windows from actual performance data.

**Distribute** — One post, every channel. AI adapts your content for Twitter, Facebook, Instagram, Discord, Slack, Email, and SMS automatically.

**CRM Intelligence** — Every LinkedIn interaction syncs to your CRM. Know who you''re talking to, their pipeline stage, and what to say next.

**Relationship Heat Map** — Visual warmth scores for every connection. Never let a prospect go cold.

**Meeting Prep** — Auto-generated briefings before every call. Know their recent posts, your history, and the perfect opening line.

### The Learning Engine

Every interaction feeds the AI brain. After 30 days, it knows:
- Your writing voice (sentence length, tone, vocabulary)
- What content performs for you
- Your best posting times
- Your relationship patterns
- Your pipeline priorities

**This intelligence cannot be exported.** It only exists inside 0n.

### Built on 0nMCP

Routes through the 0nMCP orchestration layer — 819 tools across 48 services. Your Chrome Extension is backed by the same infrastructure that powers enterprise automation.

**Patent Pending** — US Provisional #63/990,046',
  'extensions',
  ARRAY['linkedin', 'chrome-extension', 'ai', 'social-media', 'crm', 'automation', 'content-generation', 'relationship-intelligence'],
  0,
  'usd',
  'active',
  5,
  0,
  '{
    "$0n": {
      "type": "extension",
      "name": "0nMCP Social Intelligence Engine",
      "version": "1.0.0",
      "description": "Chrome Extension — AI-powered social automation with autonomous learning"
    },
    "tiers": {
      "free": {"price": 0, "label": "Turn It On", "stripe_price_id": null},
      "creator": {"price_monthly": 19, "price_yearly": 190, "label": "Turn It Up"},
      "operator": {"price_monthly": 49, "price_yearly": 490, "label": "The Full Stack"},
      "agency": {"price_monthly": 149, "price_yearly": 1490, "label": "Run the Whole Stack"},
      "enterprise": {"price_monthly": 499, "label": "Enterprise"}
    },
    "features": {
      "generate": true,
      "analyze": true,
      "dispute": true,
      "schedule": true,
      "distribute": true,
      "crm_sync": true,
      "relationship_heatmap": true,
      "meeting_prep": true,
      "voice_memo": true,
      "workflow_runner": true
    }
  }'::jsonb,
  ARRAY['anthropic', 'linkedin', 'crm', 'slack', 'discord', 'sendgrid', 'twilio', 'twitter', 'facebook']
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  long_description = EXCLUDED.long_description,
  workflow_data = EXCLUDED.workflow_data,
  tags = EXCLUDED.tags,
  services = EXCLUDED.services,
  updated_at = now();
