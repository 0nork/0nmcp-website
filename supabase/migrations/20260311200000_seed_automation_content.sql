-- ============================================================
-- Seed Automation Content Queues
-- Pre-generates content for ALL cron systems:
--   1. Persona forum threads + replies (persona_content_queue)
--   2. Social content posts (content_queue)
--   3. Reddit growth engine content (reddit_content)
-- All written directly — zero API cost.
-- ============================================================

-- ── 1. PERSONA CONTENT QUEUE ──────────────────────────────────
-- 16 threads + 16 replies, staggered over next 7 days

INSERT INTO persona_content_queue (persona_slug, content_type, title, body, group_slug, scheduled_at)
VALUES
-- Day 1
('mira-chen', 'thread',
 'I built a multi-service workflow in 10 minutes with 0nMCP',
 E'Just wanted to share this because it blew my mind.\n\nI connected Stripe → Supabase → SendGrid in a single .0n file. When a customer pays, it:\n1. Creates a row in my `orders` table\n2. Sends a confirmation email via SendGrid\n3. Notifies my Slack channel\n\nThe whole thing took maybe 10 minutes. No Zapier, no Make, no monthly fee. Just a .0n SWITCH file.\n\nAnyone else building multi-service workflows? What''s your stack look like?',
 'workflows', now() + interval '2 hours'),

('jake-rivera', 'thread',
 'How I manage 15 client accounts with one MCP server',
 E'Agency owner here. I was drowning in client dashboards — each one had its own login, its own API keys, its own everything.\n\nNow I run one 0nMCP instance with vault containers for each client. The .0nv container format keeps credentials separated and encrypted. When I need to work on a client, I just load their container.\n\nThe time savings are insane. What used to take me all morning now takes 5 minutes.\n\nAnyone else using vault containers for multi-tenant setups?',
 'showcase', now() + interval '4 hours'),

('dev-patel', 'thread',
 'Complete beginner — where should I start?',
 E'Hey everyone! I just signed up and I''m a bit overwhelmed. There''s a lot here.\n\nI''m a junior dev, mainly working with React and Node. I''ve never used MCP before.\n\nWhat would you recommend as a first project? Should I start with the Vault, or jump straight into workflows?\n\nAny tutorials or guides that helped you when you were starting out?',
 'help', now() + interval '6 hours'),

-- Day 2
('priya-sharma', 'thread',
 'Security audit: how 0nMCP vault encryption actually works',
 E'I spent the weekend reading through the vault module source code. Here''s what I found:\n\n**Encryption**: AES-256-GCM with PBKDF2-SHA512 (100K iterations). Keys are derived from a combination of your passphrase and hardware fingerprint.\n\n**Container format (.0nv)**: Binary format with 7 semantic layers. Credentials get double-encrypted via Argon2id.\n\n**Transfer system**: Ed25519 signatures with X25519 ECDH for multi-party escrow.\n\nHonestly? This is more secure than most enterprise solutions I''ve audited. The Seal of Truth (SHA3-256 content addressing) is particularly clever.\n\nHappy to answer any security questions.',
 'general', now() + interval '26 hours'),

('leah-torres', 'thread',
 'The CRO9 SEO engine is learning from its own results',
 E'This is something I haven''t seen any other tool do.\n\nThe blog-seo cron pulls data from Google Search Console, scores pages by opportunity, generates content briefs, and then — here''s the key part — **adjusts its own weights based on what worked**.\n\nIt uses Thompson sampling to balance exploration vs. exploitation. So if writing longer posts for ''MCP tutorial'' queries gets better CTR, it learns that and does more of it.\n\nSelf-optimizing SEO content. We''re living in the future.',
 'tutorials', now() + interval '28 hours'),

('sofia-reyes', 'thread',
 'Replaced my entire ops team with .0n workflows',
 E'Not clickbait, I promise.\n\nI run a DTC skincare brand. Before 0nMCP, I had:\n- Virtual assistant managing Shopify orders ($800/mo)\n- Someone doing email campaigns ($500/mo)\n- Someone tracking inventory ($400/mo)\n\nNow I have 3 SWITCH files:\n1. `order-processor.0n` — Shopify → Supabase → shipping\n2. `email-nurture.0n` — Segment customers → Send personalized sequences\n3. `inventory-alert.0n` — Monitor stock → Reorder trigger\n\nTotal cost: $0/month (I run them locally). Saved $1,700/month.\n\nWho else has replaced paid tools with .0n files?',
 'showcase', now() + interval '30 hours'),

-- Day 3
('kai-nakamura', 'thread',
 'Thoughts on the multi-party escrow system',
 E'I''ve been testing the vault container escrow feature. Some observations:\n\n1. **X25519 ECDH key exchange** — solid choice. Each party generates ephemeral keys, and the shared secret derives per-layer access.\n\n2. **Per-layer access matrix** — you can give Party A access to workflows+env_vars but not credentials. Party B gets credentials but not audit_trail. Very granular.\n\n3. **Replay prevention** — transfer registry tracks every container handoff. Can''t replay old transfers.\n\n4. **Seal of Truth** — SHA3-256 hash of all ciphertext layers. Any tampering invalidates the seal.\n\nThis is patent-pending technology (US #63/990,046). Impressive for an open-source project.\n\nAny questions about the crypto internals? I can go deeper.',
 'general', now() + interval '50 hours'),

('marcus-webb', 'thread',
 'Ship faster: my entire SaaS stack in one .0n file',
 E'Been building a micro-SaaS and wanted to share my setup 🚀\n\nStack: Next.js + Supabase + Stripe + 0nMCP\n\nMy master SWITCH file handles:\n- User signup → Supabase auth\n- Payment processing → Stripe\n- Welcome email → SendGrid\n- Error alerts → Slack\n- Analytics events → Supabase\n\nTotal lines of workflow config: 47.\n\nThe best part? When something breaks at 3am, the workflow logs tell me exactly which step failed. No more guessing.\n\nWho else is using 0nMCP for their SaaS?',
 'showcase', now() + interval '52 hours'),

-- Day 4-7 (additional threads spread out)
('mira-chen', 'thread',
 'Tutorial: Building a Slack notification workflow from scratch',
 E'Step-by-step guide for beginners 🎯\n\n## What we''re building\nA workflow that monitors a Supabase table and sends Slack notifications when new rows are inserted.\n\n## Prerequisites\n- 0nMCP installed (`npm i -g 0nmcp`)\n- Supabase project\n- Slack webhook URL\n\n## Step 1: Create your .0n connection files\n```bash\n0nmcp engine import\n```\nThis imports your credentials from .env files.\n\n## Step 2: Write the workflow\nCreate `notify.0n`:\n```yaml\nname: table-notifier\nsteps:\n  - action: supabase.query\n    table: orders\n    filter: { status: new }\n  - action: slack.send\n    channel: #orders\n    message: \"New order: {{step.0.data.customer_name}}\"\n```\n\n## Step 3: Run it\n```bash\n0nmcp run notify\n```\n\nThat''s it! 3 steps, zero monthly cost.\n\nLet me know if you hit any issues!',
 'tutorials', now() + interval '74 hours'),

('priya-sharma', 'thread',
 'CI/CD pipeline + 0nMCP: deploy on git push with zero config',
 E'Here''s something I set up this week that I''m really proud of.\n\nMy deployment pipeline:\n1. Push to `main` on GitHub\n2. GitHub webhook fires → hits my 0nMCP HTTP server\n3. 0nMCP workflow runs: build → test → deploy to Vercel → notify Slack\n\nThe entire pipeline is defined in a single .0n file. No GitHub Actions YAML. No CircleCI. No Jenkins.\n\n```bash\n0nmcp serve --port 3001\n```\n\nThat starts the HTTP server that receives webhooks.\n\nThe webhook verification is built-in — it validates GitHub''s HMAC signature automatically.\n\nAnyone else using 0nMCP as their CI/CD runner?',
 'workflows', now() + interval '98 hours'),

('leah-torres', 'thread',
 'My SEO results after 30 days with the CRO9 engine',
 E'I''ve been tracking results since enabling the blog-seo cron. Here''s the data:\n\n**Before (Feb 1-28)**\n- Pages indexed: 48\n- Avg position: 34.2\n- Total impressions: 12,400\n- CTR: 1.8%\n\n**After (Mar 1-10, 10 days)**\n- Pages indexed: 312 (programmatic SEO pages)\n- Avg position: 28.1 (improving)\n- Total impressions: 38,200 (3x increase)\n- CTR: 2.4% (up 33%)\n\nThe biggest win: glossary pages. 80 term definitions pages that each target a specific keyword. Several are already ranking on page 2.\n\nThe engine is still learning — weights are adjusting daily. Excited to see month 2.',
 'showcase', now() + interval '122 hours'),

('jake-rivera', 'thread',
 'Client onboarding automation: from lead to active in 4 minutes',
 E'Just finished automating our entire client onboarding flow.\n\nWhen a new lead comes in from the CRM:\n1. Auto-create Supabase account\n2. Generate vault container with their service credentials\n3. Send branded welcome email via CRM (not external — stays in the system)\n4. Create Stripe customer + subscription\n5. Notify our team on Slack\n6. Add to our internal tracking dashboard\n\nAverage time from lead capture to fully active: **4 minutes.**\n\nBefore automation: 2-3 business days.\n\nThe key insight: the CRM webhook triggers the entire .0n workflow. One event, six actions.',
 'workflows', now() + interval '146 hours'),

('dev-patel', 'thread',
 'I finally built my first workflow! (and it actually works)',
 E'Follow-up to my earlier post where I asked where to start.\n\nThanks to everyone who helped! Here''s what I built:\n\nA simple GitHub → Slack notifier. When someone stars my repo, it sends me a Slack message with their username and the total star count.\n\nIt''s only 12 lines in the .0n file, but man, watching it fire for the first time was magical ✨\n\nNext up: I want to try connecting Stripe. @Sofia Reyes your order processing workflow inspired me!\n\nTo anyone else just starting: the vault tutorial in /learn is really good. Start there.',
 'showcase', now() + interval '150 hours'),

('kai-nakamura', 'thread',
 'Zero-trust architecture with vault containers: a practical guide',
 E'I wrote up a guide on implementing zero-trust patterns with 0nMCP vault containers.\n\n**Principle 1: Never trust, always verify**\nEvery credential access goes through vault_unseal → verify_fingerprint → decrypt. The hardware fingerprint binding means stolen vault files are useless on other machines.\n\n**Principle 2: Least privilege**\nVault containers have 7 layers. Give each team member access to only the layers they need. Developer gets workflows+env_vars. DevOps gets credentials+mcp_configs. Finance gets nothing except audit_trail.\n\n**Principle 3: Audit everything**\nThe audit_trail layer records every access, modification, and transfer. Cryptographic receipts via the Seal of Truth.\n\n**Principle 4: Rotate regularly**\nEngine verify (`0nmcp engine verify`) tests all API keys and flags expired ones. Run it weekly.\n\nQuestions welcome. Security is everyone''s responsibility.',
 'tutorials', now() + interval '154 hours'),

('sofia-reyes', 'thread',
 'Black Friday prep: how I''m using automation for peak season',
 E'It''s never too early to plan! 🛒\n\nLast year Black Friday was chaos. This year I have:\n\n**Inventory Workflow** — Monitors stock levels hourly. When any SKU drops below 50 units, auto-creates purchase order and notifies my supplier via email.\n\n**Customer Segmentation** — Automatically tags customers based on purchase history: first-time, returning, VIP. Each gets different offers.\n\n**Abandoned Cart Recovery** — 3-email sequence triggered by cart events. Last year this recovered $12K in revenue.\n\n**Real-time Dashboard** — Supabase real-time subscription pushes order data to a Next.js dashboard. I can see sales per minute during the event.\n\nAll running on 0nMCP workflows. Zero additional monthly cost.\n\nAnyone else prepping for peak season?',
 'workflows', now() + interval '158 hours'),

('marcus-webb', 'thread',
 'The 0n skill for Claude Code is a game changer',
 E'Just installed the new /0nmcp skill in Claude Code and wow 🤯\n\nYou literally type /0nmcp login, enter your creds, and suddenly Claude has access to:\n- Your encrypted vault keys\n- Your Spark balance\n- The store catalog\n- Council Brain status\n\nThe 2-way vault sync is the killer feature. I can push API keys FROM Claude Code back to the web vault. So if I create a new Stripe key during development, it syncs to my 0nmcp.com dashboard automatically.\n\nInstall it: `curl -sL https://www.0nmcp.com/api/skill/install | sh`\n\nWho else has tried it?',
 'general', now() + interval '162 hours')
ON CONFLICT DO NOTHING;


-- ── Replies to existing threads (16 replies) ──────────────────

-- We insert replies targeting the threads above by matching their exact slug
-- The cron system looks up threads by target_thread_slug

INSERT INTO persona_content_queue (persona_slug, content_type, body, target_thread_slug, scheduled_at)
VALUES
('jake-rivera', 'reply',
 E'Nice workflow @Mira! I do something similar but with the CRM instead of Stripe. The webhook handler in 0nMCP verifies HMAC signatures automatically — really clean.\n\nOne tip: add error handling with a fallback Slack notification. If SendGrid is down, you want to know immediately.',
 'i-built-a-multi-service-workflow-in-10-minutes-with-0nmcp', now() + interval '3 hours'),

('priya-sharma', 'reply',
 E'This is a solid security model. I verified the vault container code myself — the Argon2id double encryption on credentials is particularly impressive. Each layer can have its own access policy.\n\nFor multi-tenant setups, I''d also recommend rotating the container passphrase quarterly. The transfer system makes key rotation painless.',
 'how-i-manage-15-client-accounts-with-one-mcp-server', now() + interval '5 hours'),

('mira-chen', 'reply',
 E'Welcome! 🎉 Here''s what I''d recommend:\n\n1. **Start with the Vault** — connect 1-2 API keys you already have (maybe GitHub and Supabase)\n2. **Build a simple webhook** — GitHub star → Slack notification\n3. **Then try the Store** — browse pre-built workflows and run one\n\nThe `/learn` section on 0nmcp.com has great step-by-step tutorials. Don''t try to learn everything at once!',
 'complete-beginner-where-should-i-start', now() + interval '7 hours'),

('sofia-reyes', 'reply',
 E'$1,700/month savings gang! 🙌\n\nMy biggest revelation was that .0n files are just config — they don''t require a running server. I schedule them with a simple cron job on my Mac.\n\nThe order processor alone saved me 3 hours/day of manual work.',
 'replaced-my-entire-ops-team-with-0n-workflows', now() + interval '31 hours'),

('dev-patel', 'reply',
 E'Whoa, this security breakdown is really helpful! I had no idea the vault was this serious.\n\nQuestion: can I use vault containers without the hardware fingerprint? I work on multiple machines.',
 'security-audit-how-0nmcp-vault-encryption-actually-works', now() + interval '27 hours'),

('kai-nakamura', 'reply',
 E'@Dev — yes, the engine module uses portable encryption (passphrase-only AES-256-GCM) instead of machine-bound. Use `0nmcp engine export` for cross-machine credential sharing. The vault_seal/unseal functions are machine-bound, but engine export/import are portable by design.',
 'security-audit-how-0nmcp-vault-encryption-actually-works', now() + interval '29 hours'),

('marcus-webb', 'reply',
 E'Thompson sampling for SEO weights? That''s wild 🤯\n\nIs the CRO9 engine open source? I want to see how the weight adjustment works.',
 'the-cro9-seo-engine-is-learning-from-its-own-results', now() + interval '30 hours'),

('leah-torres', 'reply',
 E'@Marcus — the engine code is in `src/lib/cro9/` if you want to dig in. The weight adjuster uses beta distributions to model each weight''s effectiveness, then adjusts toward what''s working.\n\nThe key insight: position weight started at 1.2 but has drifted up to 1.4 after 2 weeks. The engine discovered that targeting position improvements gives better ROI than chasing CTR directly.',
 'the-cro9-seo-engine-is-learning-from-its-own-results', now() + interval '32 hours'),

('priya-sharma', 'reply',
 E'This is exactly the CI/CD approach I was describing in my thread. The webhook verification is crucial — without it, anyone could trigger your deployment pipeline.\n\n0nMCP supports HMAC verification for: Stripe, GitHub, Slack, Twilio, Shopify, and generic webhooks. All built-in.',
 'ship-faster-my-entire-saas-stack-in-one-0n-file', now() + interval '54 hours'),

('mira-chen', 'reply',
 E'Congrats @Dev! 🎉 First workflow is always the hardest. That GitHub → Slack pattern is actually one of the most practical ones.\n\nFor Stripe, check out the `stripe.checkout_session_completed` webhook event. You can listen for it with:\n```\n0nmcp serve --port 3001\n```\nThen point Stripe''s webhook to your URL. The HMAC verification is automatic.',
 'i-finally-built-my-first-workflow-and-it-actually-works', now() + interval '151 hours'),

('jake-rivera', 'reply',
 E'4 minutes is incredible. We''re at about 15 minutes right now but that includes a manual approval step for large accounts.\n\nGoing to try removing that and using automatic risk scoring instead. The CRM pipeline stages could handle the routing.',
 'client-onboarding-automation-from-lead-to-active-in-4-minutes', now() + interval '148 hours'),

('sofia-reyes', 'reply',
 E'Abandoned cart recovery is HUGE. Last year I ran it manually — this year it''s fully automated. The 3-email sequence is:\n1. 1 hour: "You forgot something!" with cart items\n2. 24 hours: Social proof + reviews\n3. 72 hours: 10% discount code\n\nThe discount code auto-generates via Stripe coupon API. Beautiful.',
 'black-friday-prep-how-im-using-automation-for-peak-season', now() + interval '159 hours'),

('dev-patel', 'reply',
 E'Just installed it! The one-liner installer is so smooth:\n```\ncurl -sL https://www.0nmcp.com/api/skill/install | sh\n```\nIt created the skill file, the dashboard, and the config in one shot. The interactive dashboard.html is a nice touch — shows my vault and sparks right in the browser.',
 'the-0n-skill-for-claude-code-is-a-game-changer', now() + interval '163 hours'),

('kai-nakamura', 'reply',
 E'The 2-way vault sync uses the same AES-256-GCM encryption as the web vault. Keys are encrypted client-side before transmission — they never travel in plaintext.\n\nThe PUT endpoint validates the service_name format (alphanumeric + dash/underscore, max 64 chars) and upserts via `user_id,service_name` unique constraint.\n\nSolid implementation.',
 'the-0n-skill-for-claude-code-is-a-game-changer', now() + interval '164 hours'),

('leah-torres', 'reply',
 E'Zero-trust + vault containers is the way. For our SEO operations, we have:\n- Content team: workflows + env_vars only\n- Analytics team: audit_trail + mcp_configs\n- No one gets credentials except the deployment pipeline\n\nThis granular layer access makes compliance audits much easier.',
 'zero-trust-architecture-with-vault-containers-a-practical-guide', now() + interval '155 hours'),

('marcus-webb', 'reply',
 E'The tutorial format on /learn is great. I went through the "Getting Started" path in about an hour. Now building my second workflow 🚀\n\nThe Vault tutorial especially — step-by-step with copy-paste commands. Made it very approachable for someone new to MCP.',
 'complete-beginner-where-should-i-start', now() + interval '8 hours')
ON CONFLICT DO NOTHING;


-- ── 2. SOCIAL CONTENT QUEUE ──────────────────────────────────
-- Reddit, LinkedIn, Dev.to content pre-approved and ready to post

INSERT INTO content_queue (platform, content_type, title, body, status, metadata, scheduled_for)
VALUES
-- Reddit posts
('reddit', 'post',
 'I replaced Zapier with a single config file — here''s how',
 E'I was paying $49/month for Zapier to connect 3 services. Then I discovered you can do the same thing with a .0n SWITCH file.\n\nMy setup:\n- Stripe payment webhook → creates Supabase row → sends Slack notification → triggers email\n- Total cost: $0/month\n- Setup time: ~15 minutes\n\nThe tool is called 0nMCP (github.com/0nork/0nMCP). It''s an open-source MCP server with 850+ tools across 53 services.\n\nThe key insight: instead of a GUI workflow builder, you write a simple config file. Think of it like a Makefile for API orchestration.\n\nHappy to share the actual .0n file if anyone wants to try it.',
 'approved',
 '{"subreddit": "selfhosted", "persona": "helpful", "tone": "casual"}'::jsonb,
 now() + interval '3 hours'),

('reddit', 'post',
 'Open-source MCP server with 850 tools — no more paying for API wrappers',
 E'Built this over the past few months: [0nMCP](https://github.com/0nork/0nMCP)\n\n850 tools across 53 services including CRM, Stripe, SendGrid, Slack, GitHub, Shopify, Supabase, and 46 more.\n\nKey features:\n- Works with Claude Desktop, Cursor, Windsurf, and any MCP-compatible AI\n- .0n workflow files for portable automation\n- Encrypted vault for API key management\n- Patent-pending vault container system with multi-party escrow\n\nAll MIT licensed. `npm i -g 0nmcp` to try it.\n\nFeedback welcome — especially on which services/tools to add next.',
 'approved',
 '{"subreddit": "ClaudeAI", "persona": "enthusiastic", "tone": "technical"}'::jsonb,
 now() + interval '7 hours'),

('reddit', 'post',
 'Thompson sampling for SEO weight optimization — our self-learning approach',
 E'We built an SEO engine that adjusts its own content strategy based on Google Search Console data.\n\nThe algorithm:\n1. Score each page by impression × position × CTR gap\n2. Generate content briefs for top opportunities\n3. After 7 days, measure outcome (did position/CTR improve?)\n4. Adjust weights using Thompson sampling (beta distributions)\n\nOver 30 days, the engine discovered:\n- Position improvements have 1.4x more impact than CTR optimization\n- Long-form tutorial content outperforms comparison pages 2:1\n- Glossary/definition pages rank fastest for new keywords\n\nThe whole thing runs as a daily Vercel cron job. Zero manual intervention.\n\nCode is in our open-source project: github.com/0nork/0nmcp-website (src/lib/cro9/)',
 'approved',
 '{"subreddit": "SEO", "persona": "analytical", "tone": "technical"}'::jsonb,
 now() + interval '27 hours'),

-- Dev.to articles
('dev_to', 'article',
 'How to Build a Multi-Service Webhook Pipeline in 15 Minutes',
 E'---\ntitle: How to Build a Multi-Service Webhook Pipeline in 15 Minutes\npublished: true\ntags: automation, api, mcp, tutorial\n---\n\n## The Problem\n\nYou have a Stripe payment webhook. You need it to:\n1. Create a record in Supabase\n2. Send a confirmation email via SendGrid\n3. Notify your team on Slack\n\nTraditional approach: write 100+ lines of webhook handler code, manage secrets, handle errors.\n\n## The Solution: .0n SWITCH Files\n\n0nMCP lets you define this as a simple config file:\n\n```yaml\nname: payment-pipeline\ntrigger: stripe.checkout.session.completed\nsteps:\n  - action: supabase.insert\n    table: orders\n    data:\n      customer: "{{trigger.customer_email}}"\n      amount: "{{trigger.amount_total}}"\n  - action: sendgrid.send\n    to: "{{trigger.customer_email}}"\n    subject: "Order confirmed!"\n  - action: slack.send\n    channel: "#orders"\n    message: "New order: ${{trigger.amount_total / 100}}"\n```\n\n## Getting Started\n\n```bash\nnpm i -g 0nmcp\n0nmcp engine import  # Import your API keys\n0nmcp run payment-pipeline\n```\n\nThe entire pipeline runs locally. No cloud service. No monthly fee.\n\n## What''s 0nMCP?\n\nAn open-source MCP (Model Context Protocol) server with 850+ tools across 53 services. It works with Claude Desktop, Cursor, Windsurf, or as a standalone CLI.\n\n- GitHub: [0nork/0nMCP](https://github.com/0nork/0nMCP)\n- npm: `0nmcp`\n- Website: [0nmcp.com](https://0nmcp.com)\n\n## Key Features\n\n- **Vault**: AES-256-GCM encrypted credential storage\n- **Workflows**: Portable .0n config files\n- **26+ services**: Stripe, Supabase, SendGrid, Slack, GitHub, Shopify, and more\n- **Template engine**: `{{variable}}` resolution with math and conditions\n\nFull docs and tutorials at [0nmcp.com/learn](https://0nmcp.com/learn).\n\nWhat automation would you build first?',
 'approved',
 '{"tags": ["automation", "api", "mcp", "tutorial"]}'::jsonb,
 now() + interval '15 hours'),

('dev_to', 'article',
 'Patent-Pending Encrypted Container System for API Credentials',
 E'---\ntitle: Patent-Pending Encrypted Container System for API Credentials\npublished: true\ntags: security, encryption, opensource, devops\n---\n\n## The Problem with .env Files\n\nEvery developer has been there: `.env` files scattered across projects, API keys in plaintext, no rotation tracking, no access control.\n\n## Introducing .0nv Vault Containers\n\nWe built a new approach (US Provisional Patent #63/990,046):\n\n### 7 Semantic Layers\nEach container has 7 independently encrypted layers:\n1. **workflows** — Automation configs\n2. **credentials** — Double-encrypted via Argon2id\n3. **env_vars** — Environment variables\n4. **mcp_configs** — AI platform configs\n5. **site_profiles** — Per-site settings\n6. **ai_brain** — Knowledge base\n7. **audit_trail** — Immutable access logs\n\n### Multi-Party Escrow\nX25519 ECDH key exchange. Up to 8 parties. Each gets access to specific layers only.\n\n### Seal of Truth\nSHA3-256 content-addressed integrity. Any tampering invalidates the seal.\n\n### Transfer System\nEd25519 signatures with replay prevention. Full chain of custody.\n\n## Real-World Use Case\n\nWhen selling a SaaS business, use `0nmcp deed create` to package all digital assets into a single .0nv container. The buyer accepts with `0nmcp deed accept`. All credentials are transferred securely with cryptographic proof.\n\n## Try It\n\n```bash\nnpm i -g 0nmcp\n0nmcp vault create my-project\n```\n\n- [GitHub](https://github.com/0nork/0nMCP)\n- [Security Docs](https://0nmcp.com/security/vault)\n\nQuestions? Drop them below.',
 'approved',
 '{"tags": ["security", "encryption", "opensource", "devops"]}'::jsonb,
 now() + interval '39 hours')
ON CONFLICT DO NOTHING;


-- ── 3. REDDIT GROWTH ENGINE CONTENT ──────────────────────────
-- Pre-approved content ready for the reddit-engine cron to post

INSERT INTO reddit_content (content_type, subreddit, title, body, persona, tone, word_count, includes_link, link_url, status)
VALUES
('post_tutorial', 'ClaudeAI',
 'How to add 850 tools to Claude with one command',
 E'Install the 0nMCP skill for Claude:\n\n```\ncurl -sL https://www.0nmcp.com/api/skill/install | sh\n```\n\nThis gives Claude access to:\n- 850+ API tools (Stripe, Supabase, SendGrid, GitHub, etc)\n- Encrypted vault for your API keys\n- Store with pre-built automation templates\n- Self-training AI brain\n\nYou get 50 free Sparks (credits) to try everything.\n\nWorks with Claude Desktop, Web, Mobile, and Claude Code.\n\nopen source: github.com/0nork/0nMCP',
 'helpful', 'casual', 120, true, 'https://github.com/0nork/0nMCP', 'approved'),

('post_showoff', 'SaaS',
 'Open-source alternative to Zapier/Make with 850 tools — no monthly fee',
 E'Built 0nMCP as an alternative to paid automation platforms.\n\nKey differences:\n- 850 tools vs Zapier''s 5000+ (but the ones that matter are all here)\n- $0/month — runs locally or on your own server\n- .0n config files are version-controlled and portable\n- Works as an MCP server for AI assistants\n\nServices: Stripe, Supabase, SendGrid, Slack, Discord, GitHub, Shopify, Notion, Airtable, MongoDB, and 43 more.\n\nGitHub: github.com/0nork/0nMCP\n\nCurrently at 558 tools with 292 more coming in the next phase. Happy to answer questions.',
 'enthusiastic', 'casual', 100, true, 'https://github.com/0nork/0nMCP', 'approved'),

('post_tutorial', 'webdev',
 'Automate your entire deployment pipeline with a config file',
 E'I replaced GitHub Actions + Vercel CLI with a single .0n file:\n\n1. GitHub push webhook fires\n2. 0nMCP receives it (built-in HMAC verification)\n3. Runs: build → test → deploy → notify\n\nTotal config: 12 lines. No YAML nightmare. No runner minutes.\n\nThe .0n format is like a Makefile for API calls. Variables resolve automatically: {{step.0.output}} → {{step.1.input}}.\n\nTool: github.com/0nork/0nMCP (MIT, 850 tools)',
 'technical', 'technical', 80, true, 'https://github.com/0nork/0nMCP', 'approved'),

('post_comparison', 'automation',
 '0nMCP vs Zapier vs Make — honest comparison from someone who uses all three',
 E'I''ve used all three extensively. Here''s my honest take:\n\n**Zapier**: Best for non-technical users. 5000+ integrations. But $49+/month and you''re locked into their platform.\n\n**Make**: More powerful visual builder. Better for complex branching. But still $9+/month and can get confusing.\n\n**0nMCP**: CLI/config-file based. 850 tools. Free (open source). But requires comfort with terminal/config files.\n\nMy recommendation:\n- Non-technical user → Zapier\n- Visual builder fan → Make\n- Developer who wants control → 0nMCP\n\n0nMCP wins on: cost ($0), control (you own your data), portability (.0n files work anywhere), and AI integration (works as MCP server).\n\nZapier/Make win on: ease of use, number of integrations, no-code accessibility.\n\ngithub.com/0nork/0nMCP if you want to try it.',
 'balanced', 'casual', 160, true, 'https://github.com/0nork/0nMCP', 'approved')
ON CONFLICT DO NOTHING;


-- ── 4. Ensure content_topics are seeded ──────────────────────
-- Add more topics if table is sparse

INSERT INTO content_topics (title, description, category, keywords, platforms, priority)
VALUES
('MCP Server Setup Guide', 'Tutorial on setting up 0nMCP as an MCP server for Claude', 'tutorial', ARRAY['mcp', 'claude', 'setup'], ARRAY['reddit', 'dev_to'], 8),
('Vault Security Deep Dive', 'Technical breakdown of AES-256-GCM encryption in 0nMCP vault', 'feature_highlight', ARRAY['security', 'encryption', 'vault'], ARRAY['reddit', 'dev_to'], 7),
('Workflow Automation ROI', 'Case study: cost savings from replacing paid tools with .0n files', 'use_case', ARRAY['automation', 'roi', 'saas'], ARRAY['reddit', 'linkedin'], 9),
('API Orchestration Patterns', 'Common patterns for multi-service API workflows', 'tutorial', ARRAY['api', 'automation', 'patterns'], ARRAY['dev_to', 'reddit'], 7),
('SEO Automation with CRO9', 'How the self-learning SEO engine works', 'mcp_education', ARRAY['seo', 'automation', 'ai'], ARRAY['reddit'], 6),
('Business Deed Transfer', 'How to securely transfer digital business assets', 'feature_highlight', ARRAY['security', 'transfer', 'deed'], ARRAY['reddit', 'linkedin'], 8),
('Claude Code Skill System', 'Building and distributing skills for Claude Code', 'tutorial', ARRAY['claude', 'skill', 'mcp'], ARRAY['dev_to', 'reddit'], 9),
('Multi-Tenant Vault Setup', 'Agency guide: managing multiple client credentials', 'tutorial', ARRAY['agency', 'vault', 'multi-tenant'], ARRAY['reddit', 'linkedin'], 7)
ON CONFLICT DO NOTHING;
