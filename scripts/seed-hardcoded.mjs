#!/usr/bin/env node
/**
 * 0nMCP Forum Seeder — Hardcoded personas + content
 * Zero API calls. All content pre-written with distinct voices.
 *
 * Usage: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/seed-hardcoded.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const SUPABASE_URL = 'https://yaehbwimocvvnnlojkxe.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZWhid2ltb2N2dm5ubG9qa3hlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU2MDUwOSwiZXhwIjoyMDg2MTM2NTA5fQ.XPpbmQZmqjMe7GheA6HBbyfuqQy9KxdT7DqdjBYrKlI'
const db = createClient(SUPABASE_URL, SUPABASE_KEY)

// ==================== Helpers ====================

function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
function threadSlug(title) { return slugify(title).slice(0, 70) + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) }
function daysAgo(d, h = 12, m = 30) {
  const dt = new Date(Date.now() - d * 86400000)
  dt.setHours(h, m, Math.floor(Math.random() * 60))
  return dt.toISOString()
}

// ==================== 13 Personas ====================

const PERSONAS = [
  // ---- MODERATOR ----
  {
    name: 'Kira Tanaka',
    slug: 'kira-tanaka',
    bio: 'Community lead at 0nMCP. I keep the lights on and the conversations flowing.',
    role: 'moderator',
    expertise: ['community-management', 'api-integration', 'workflows', 'onboarding', 'documentation'],
    personality: {
      tone: 'helpful', verbosity: 'moderate', emoji_usage: 'minimal', asks_followups: true,
      writing_style: 'encouraging-mentor',
      quirks: ['references personal anecdotes from past jobs', 'thanks other posters by name', 'ends posts asking what others think'],
      sentence_structure: 'varied-complex (mixes long/short, subordinate clauses)',
      vocabulary_level: 'mixed-colloquial (professional with occasional casual)',
      punctuation_style: 'dash-heavy (em dashes everywhere)',
    },
    knowledge_level: 'expert',
    preferred_groups: ['general', 'help', 'showcase', 'feature-requests', 'tutorials'],
    activity_level: 'high',
  },

  // ---- 1. Marcus Chen — Senior Backend, Berlin ----
  {
    name: 'Marcus Chen',
    slug: 'marcus-chen',
    bio: 'Backend eng @ a fintech in Berlin. 12 years of breaking things in production so you don\'t have to.',
    role: 'developer',
    expertise: ['api-integration', 'stripe-webhooks', 'security', 'postgresql', 'node-performance'],
    personality: {
      tone: 'analytical', verbosity: 'detailed', emoji_usage: 'none', asks_followups: false,
      writing_style: 'code-heavy-minimal-prose',
      quirks: ['uses code blocks even for small snippets', 'capitalizes for EMPHASIS instead of bold', 'self-corrects mid-thought (actually, wait...)'],
      sentence_structure: 'academic-precise (proper grammar, clear antecedents)',
      vocabulary_level: 'technical-jargon-heavy (deep domain vocabulary)',
      punctuation_style: 'period-disciplined (clean stops. no fluff.)',
    },
    knowledge_level: 'expert',
    preferred_groups: ['help', 'integrations', 'workflows', 'showcase'],
    activity_level: 'high',
  },

  // ---- 2. Adaeze Okafor — Self-taught, Lagos ----
  {
    name: 'Adaeze Okafor',
    slug: 'adaeze-okafor',
    bio: 'Self-taught dev from Lagos building my first SaaS. Learning every day tbh',
    role: 'developer',
    expertise: ['supabase', 'react', 'api-integration', 'automation'],
    personality: {
      tone: 'curious', verbosity: 'moderate', emoji_usage: 'moderate', asks_followups: true,
      writing_style: 'excited-explorer',
      quirks: ['abbreviates common words (prob, def, config, repo)', 'ends posts asking what others think', 'mentions timezone/location context casually'],
      sentence_structure: 'conversational-run-on (commas instead of periods, natural flow)',
      vocabulary_level: 'casual-slang (gonna, wanna, lol, tbh, ngl)',
      punctuation_style: 'exclamation-enthusiast (excited! loves emphasis!)',
    },
    knowledge_level: 'beginner',
    preferred_groups: ['help', 'general', 'tutorials'],
    activity_level: 'high',
  },

  // ---- 3. Jake Holloway — Agency Owner, Austin ----
  {
    name: 'Jake Holloway',
    slug: 'jake-holloway',
    bio: 'Run a 6-person agency in Austin. We automate marketing funnels. Time is money.',
    role: 'agency_owner',
    expertise: ['crm', 'automation', 'ecommerce', 'sendgrid', 'workflows'],
    personality: {
      tone: 'professional', verbosity: 'concise', emoji_usage: 'none', asks_followups: false,
      writing_style: 'direct-blunt',
      quirks: ['uses numbered lists even for 2-3 items', 'prefaces opinions with "hot take:" or "unpopular opinion:"', 'writes TL;DR summaries at the top'],
      sentence_structure: 'telegraphic (drops articles/pronouns, gets to point)',
      vocabulary_level: 'professional-clean (no slang, industry terms)',
      punctuation_style: 'period-disciplined (clean stops. no fluff.)',
    },
    knowledge_level: 'intermediate',
    preferred_groups: ['workflows', 'showcase', 'feature-requests', 'general'],
    activity_level: 'moderate',
  },

  // ---- 4. Priya Krishnamurthy — DevOps, Toronto ----
  {
    name: 'Priya Krishnamurthy',
    slug: 'priya-krishnamurthy',
    bio: 'DevOps @ a Series B startup in Toronto. If it can be automated, it should be.',
    role: 'devops',
    expertise: ['devops', 'github-actions', 'docker', 'ci-cd', 'monitoring'],
    personality: {
      tone: 'analytical', verbosity: 'detailed', emoji_usage: 'minimal', asks_followups: true,
      writing_style: 'methodical-step-by-step',
      quirks: ['uses headers/sections in longer posts', 'references Stack Overflow or GitHub issues', 'uses inline code ticks for every technical term'],
      sentence_structure: 'academic-precise (proper grammar, clear antecedents)',
      vocabulary_level: 'technical-jargon-heavy (deep domain vocabulary)',
      punctuation_style: 'dash-heavy (em dashes everywhere)',
    },
    knowledge_level: 'expert',
    preferred_groups: ['integrations', 'workflows', 'tutorials', 'help'],
    activity_level: 'moderate',
  },

  // ---- 5. Tiago Santos — Freelancer, Lisbon ----
  {
    name: 'Tiago Santos',
    slug: 'tiago-santos',
    bio: 'Freelance dev in Lisbon. I build automations for small biz owners who hate spreadsheets.',
    role: 'freelancer',
    expertise: ['airtable', 'notion', 'google-sheets', 'slack-bots', 'webhooks'],
    personality: {
      tone: 'casual', verbosity: 'moderate', emoji_usage: 'minimal', asks_followups: true,
      writing_style: 'storyteller',
      quirks: ['references personal anecdotes from past jobs', 'compares things to cooking/sports/music analogies', 'drops in foreign language phrases occasionally'],
      sentence_structure: 'conversational-run-on (commas instead of periods, natural flow)',
      vocabulary_level: 'mixed-colloquial (professional with occasional casual)',
      punctuation_style: 'ellipsis-user (trails off... thinks out loud...)',
    },
    knowledge_level: 'intermediate',
    preferred_groups: ['showcase', 'workflows', 'general', 'integrations'],
    activity_level: 'moderate',
  },

  // ---- 6. Elena Voronova — Data Engineer, ex-Airflow ----
  {
    name: 'Elena Voronova',
    slug: 'elena-voronova',
    bio: 'Data engineer at a mid-size SaaS. Recovering Airflow addict.',
    role: 'data_engineer',
    expertise: ['data-pipelines', 'mongodb', 'supabase', 'etl', 'python'],
    personality: {
      tone: 'analytical', verbosity: 'detailed', emoji_usage: 'none', asks_followups: false,
      writing_style: 'analogies-and-metaphors',
      quirks: ['quotes or paraphrases famous developers/books', 'uses "EDIT:" or "UPDATE:" in posts', 'uses headers/sections in longer posts'],
      sentence_structure: 'varied-complex (mixes long/short, subordinate clauses)',
      vocabulary_level: 'academic-formal (precise terminology, no contractions)',
      punctuation_style: 'minimal (few commas, no semicolons, rare exclamation)',
    },
    knowledge_level: 'intermediate',
    preferred_groups: ['integrations', 'workflows', 'feature-requests'],
    activity_level: 'low',
  },

  // ---- 7. Soo-jin Park — Design-minded Dev, Seoul ----
  {
    name: 'Soo-jin Park',
    slug: 'soo-jin-park',
    bio: 'Full-stack dev in Seoul. I care way too much about how CLIs look.',
    role: 'designer',
    expertise: ['cli-design', 'react', 'typescript', 'developer-experience', 'ui-ux'],
    personality: {
      tone: 'enthusiastic', verbosity: 'moderate', emoji_usage: 'moderate', asks_followups: true,
      writing_style: 'question-led-socratic',
      quirks: ['uses rhetorical questions before answering', 'starts replies with "So" or "Hmm"', 'thanks other posters by name'],
      sentence_structure: 'short-punchy (5-12 words avg, fragments ok)',
      vocabulary_level: 'mixed-colloquial (professional with occasional casual)',
      punctuation_style: 'exclamation-enthusiast (excited! loves emphasis!)',
    },
    knowledge_level: 'expert',
    preferred_groups: ['feature-requests', 'showcase', 'general'],
    activity_level: 'moderate',
  },

  // ---- 8. Arjun Mehta — Startup Founder, Mumbai ----
  {
    name: 'Arjun Mehta',
    slug: 'arjun-mehta',
    bio: 'Building an AI scheduling startup in Mumbai. Pre-seed. Shipping fast, breaking things faster.',
    role: 'founder',
    expertise: ['openai', 'automation', 'stripe', 'mvp-building', 'supabase'],
    personality: {
      tone: 'enthusiastic', verbosity: 'concise', emoji_usage: 'minimal', asks_followups: false,
      writing_style: 'stream-of-consciousness',
      quirks: ['self-corrects mid-thought (actually, wait...)', 'uses "EDIT:" or "UPDATE:" in posts', 'abbreviates common words (prob, def, config, repo)'],
      sentence_structure: 'short-punchy (5-12 words avg, fragments ok)',
      vocabulary_level: 'casual-slang (gonna, wanna, lol, tbh, ngl)',
      punctuation_style: 'comma-splice-natural (combines thoughts with commas, flows like speech)',
    },
    knowledge_level: 'beginner',
    preferred_groups: ['general', 'help', 'showcase', 'workflows'],
    activity_level: 'high',
  },

  // ---- 9. Sam Rivera — CS Student, Vancouver ----
  {
    name: 'Sam Rivera',
    slug: 'sam-rivera',
    bio: 'CS sophomore at UBC. Just discovered APIs exist and I can\'t stop connecting things.',
    role: 'student',
    expertise: ['javascript', 'api-basics', 'discord-bots', 'github'],
    personality: {
      tone: 'curious', verbosity: 'moderate', emoji_usage: 'heavy', asks_followups: true,
      writing_style: 'excited-explorer',
      quirks: ['mentions timezone/location context casually', 'ends posts asking what others think', 'capitalizes for EMPHASIS instead of bold'],
      sentence_structure: 'conversational-run-on (commas instead of periods, natural flow)',
      vocabulary_level: 'casual-slang (gonna, wanna, lol, tbh, ngl)',
      punctuation_style: 'exclamation-enthusiast (excited! loves emphasis!)',
    },
    knowledge_level: 'beginner',
    preferred_groups: ['help', 'tutorials', 'general', 'off-topic'],
    activity_level: 'moderate',
  },

  // ---- 10. Yael Goldstein — Security Engineer, Tel Aviv ----
  {
    name: 'Yael Goldstein',
    slug: 'yael-goldstein',
    bio: 'AppSec engineer. I break things so attackers can\'t. The Vault is why I\'m here.',
    role: 'developer',
    expertise: ['security', 'vault', 'encryption', 'api-keys', 'oauth'],
    personality: {
      tone: 'sarcastic', verbosity: 'concise', emoji_usage: 'none', asks_followups: false,
      writing_style: 'skeptical-pragmatist',
      quirks: ['prefaces opinions with "hot take:" or "unpopular opinion:"', 'references Stack Overflow or GitHub issues', 'self-corrects mid-thought (actually, wait...)'],
      sentence_structure: 'short-punchy (5-12 words avg, fragments ok)',
      vocabulary_level: 'technical-jargon-heavy (deep domain vocabulary)',
      punctuation_style: 'period-disciplined (clean stops. no fluff.)',
    },
    knowledge_level: 'expert',
    preferred_groups: ['feature-requests', 'help', 'integrations'],
    activity_level: 'low',
  },

  // ---- 11. Nate Crawford — Rails Dev, Portland ----
  {
    name: 'Nate Crawford',
    slug: 'nate-crawford',
    bio: 'Rails dev for 9 years. Skeptical of JS tooling but 0nMCP has me curious.',
    role: 'developer',
    expertise: ['ruby-rails', 'postgresql', 'rest-apis', 'testing', 'monoliths'],
    personality: {
      tone: 'sarcastic', verbosity: 'moderate', emoji_usage: 'none', asks_followups: true,
      writing_style: 'dry-humor',
      quirks: ['quotes or paraphrases famous developers/books', 'compares things to cooking/sports/music analogies', 'uses rhetorical questions before answering'],
      sentence_structure: 'parenthetical (lots of asides, digressions in parens)',
      vocabulary_level: 'professional-clean (no slang, industry terms)',
      punctuation_style: 'dash-heavy (em dashes everywhere)',
    },
    knowledge_level: 'intermediate',
    preferred_groups: ['general', 'integrations', 'off-topic'],
    activity_level: 'low',
  },

  // ---- 12. Olivia Pearce — Non-tech Founder, London ----
  {
    name: 'Olivia Pearce',
    slug: 'olivia-pearce',
    bio: 'I run an e-commerce brand in London. No coding background. Learning to automate everything.',
    role: 'founder',
    expertise: ['shopify', 'ecommerce', 'email-marketing', 'business-automation'],
    personality: {
      tone: 'helpful', verbosity: 'moderate', emoji_usage: 'minimal', asks_followups: true,
      writing_style: 'storyteller',
      quirks: ['references personal anecdotes from past jobs', 'writes TL;DR summaries at the top', 'ends posts asking what others think'],
      sentence_structure: 'varied-complex (mixes long/short, subordinate clauses)',
      vocabulary_level: 'plain-accessible (avoids jargon, explains everything)',
      punctuation_style: 'ellipsis-user (trails off... thinks out loud...)',
    },
    knowledge_level: 'beginner',
    preferred_groups: ['help', 'general', 'tutorials', 'workflows'],
    activity_level: 'moderate',
  },
]

// ==================== Thread Content ====================
// Each thread: { author (slug), title, body, group, daysAgo, hour }

const THREADS = [
  // ---- Kira (moderator) — welcome + housekeeping ----
  {
    author: 'kira-tanaka',
    title: 'Welcome to the 0nMCP Community',
    body: `Hey folks — Kira here, your community lead.\n\nThis forum is for everyone building with 0nMCP — whether you just ran your first \`npm install\` or you're orchestrating 50 services in production. No question is too basic, no workflow too ambitious.\n\nA few ground rules:\n- Be kind. We were all beginners once.\n- Share what you're building — we love seeing real use cases.\n- If you hit a wall, post in **help** with your config (redact API keys!) and someone will jump in.\n- Feature requests go in **feature-requests** — we actually read every one.\n\nI'm around most days. Tag me if something needs attention or you just want to say hi.\n\nWhat are you working on right now?`,
    group: 'general', daysAgo: 21, hour: 9,
  },
  {
    author: 'kira-tanaka',
    title: 'Quick tip: redact your API keys before posting configs',
    body: `Just a friendly reminder — when you paste your \`.0n\` SWITCH files or workflow configs, make sure you scrub any API keys or secrets first.\n\nI've had to edit a few posts this week where folks accidentally left their Stripe test keys visible. Even test keys can be a headache if someone grabs them.\n\nEasy rule: replace the value with \`YOUR_KEY_HERE\` or use the Vault to keep secrets out of your config files entirely. That's literally what it's for — when I was at my last gig we had a junior push live Twilio creds to a public repo and it cost us $400 in spam calls before anyone noticed.\n\nAnyone else have a good "oops I leaked a key" story? Makes me feel better about my own.`,
    group: 'general', daysAgo: 16, hour: 10,
  },

  // ---- Marcus Chen — expert, code-heavy ----
  {
    author: 'marcus-chen',
    title: 'Stripe webhook signature verification with 0nMCP',
    body: `Spent the morning getting Stripe webhook verification working through the 0nMCP workflow runner. Documenting it here because the docs don't cover this edge case.\n\nThe issue: Stripe sends a \`Stripe-Signature\` header that you need to verify against your webhook secret. If you're using \`0nmcp serve\` as your webhook endpoint, the raw body needs to be preserved for signature verification. JSON parsing the body first breaks the signature.\n\nThe fix:\n\n\`\`\`javascript\n// In your SWITCH file, use the raw_body variable\n{\n  "step": "verify",\n  "action": "webhook_verify",\n  "service": "stripe",\n  "inputs": {\n    "payload": "{{raw_body}}",\n    "signature": "{{headers.stripe-signature}}"\n  }\n}\n\`\`\`\n\nIMPORTANT: do NOT use \`{{body}}\` here. That's the parsed JSON. You need the raw string.\n\nActually, wait — I should mention that this only matters if you're running \`0nmcp serve\` directly. If you're behind a reverse proxy that re-serializes the body, you'll need to configure it to pass the raw body through. I hit this with nginx and it took me an embarrassing amount of time to figure out.`,
    group: 'integrations', daysAgo: 19, hour: 14,
  },
  {
    author: 'marcus-chen',
    title: 'Rate limiting gotchas when chaining API calls',
    body: `Something I keep running into with multi-step workflows: rate limits.\n\n0nMCP has built-in rate limiting per service (token bucket with backoff), but if you're chaining calls across services — say Stripe \u2192 CRM \u2192 SendGrid — the total latency adds up fast. Each service has its own rate limit window.\n\nWhat I've found works:\n\n\`\`\`\n// Bad: sequential calls in a tight loop\nfor (const customer of customers) {\n  await stripe.getInvoices(customer.id)  // 100ms\n  await crm.updateContact(customer.id)   // 150ms\n  await sendgrid.send(customer.email)    // 200ms\n}\n// 450ms per customer * 500 customers = 225 seconds\n\n// Better: batch by service\nconst invoices = await stripe.listAll()       // 1 call\nconst contacts = await crm.batchUpdate(data)  // 1 call\nconst emails = await sendgrid.batchSend(list) // 1 call\n\`\`\`\n\nThe workflow runner handles retries automatically but it doesn't optimize call order. That's on you.\n\nAnyone found a cleaner pattern for this?`,
    group: 'workflows', daysAgo: 15, hour: 11,
  },
  {
    author: 'marcus-chen',
    title: 'Pipeline vs Assembly Line execution — when to use which',
    body: `Been testing the three execution modes and wanted to share notes.\n\nPipeline: sequential. Step A finishes, step B starts. Predictable. Use this when step B depends on step A output.\n\nAssembly Line: parallel within stages. Steps in the same stage run concurrently. Use this when you have independent operations that can happen simultaneously.\n\nRadial Burst: everything fires at once. Use this for fan-out operations like sending notifications to multiple channels.\n\nThe gotcha I hit: Assembly Line doesn't guarantee order WITHIN a stage. If you have two steps that both write to the same resource, you'll get a race condition. Found this out the hard way when two parallel steps both tried to update the same CRM contact. Last write wins.\n\nMy rule of thumb: Pipeline for data transformations. Assembly Line for independent I/O. Radial Burst for notifications.`,
    group: 'tutorials', daysAgo: 10, hour: 16,
  },
  {
    author: 'marcus-chen',
    title: 'Built a Stripe dunning workflow — saves us ~$2k/month',
    body: `Sharing because this actually moved the needle for us.\n\nProblem: customers with failed payments churning silently. Stripe's built-in retry logic is... fine. But we needed custom dunning emails and a Slack alert for our CS team.\n\nSWITCH file workflow:\n1. Webhook trigger: \`invoice.payment_failed\`\n2. Look up customer in CRM by Stripe ID\n3. Check failure count (1st, 2nd, 3rd attempt)\n4. Branch:\n   - 1st failure: friendly email via SendGrid ("hey, card declined, update here")\n   - 2nd failure: Slack alert to CS channel + follow-up email\n   - 3rd failure: account flag in CRM + final warning email\n5. Log everything to Supabase for reporting\n\nResults after 6 weeks: recovered 34 subscriptions that would have churned. At our average MRR per customer, that's roughly $2,100/month saved.\n\nThe whole workflow is maybe 40 lines of \`.0n\` config. No custom code. This is where 0nMCP actually shines — connecting things that should have been connected already.`,
    group: 'showcase', daysAgo: 7, hour: 9,
  },
  {
    author: 'marcus-chen',
    title: 'Vault encryption — how does key derivation actually work?',
    body: `Dug into the Vault source code because I needed to verify the crypto before storing production credentials.\n\nHere's what I found:\n- PBKDF2-SHA512 with 100,000 iterations for key derivation\n- AES-256-GCM for symmetric encryption\n- Hardware fingerprint binding (machine-specific)\n\nThe fingerprint binding is interesting. It hashes system identifiers so a sealed vault only opens on the machine that created it. Good for preventing credential theft if someone copies the file.\n\nOne thing I wish was different: the iteration count is hardcoded at 100K. OWASP recommends 600K for PBKDF2-SHA512 as of 2024. Not a dealbreaker but worth bumping.\n\n\`\`\`\n// Current: vault/index.js line 47\nconst KEY_ITERATIONS = 100_000\n\n// Recommended\nconst KEY_ITERATIONS = 600_000\n\`\`\`\n\nFiling a PR for this.`,
    group: 'integrations', daysAgo: 4, hour: 15,
  },

  // ---- Adaeze Okafor — beginner, eager ----
  {
    author: 'adaeze-okafor',
    title: 'How do I connect Supabase to 0nMCP?? confused about the config',
    body: `ok so I just installed 0nMCP (finally!!) and I'm trying to connect it to my Supabase project but the docs have me confused tbh\n\nI ran \`0nmcp engine import\` and it found my \`.env\` file with the Supabase keys but then it says "mapped to: supabase" and I'm not sure if that means it actually connected or just recognized the key format??\n\nlike, how do I test that the connection works? I tried \`0nmcp engine verify\` but it just shows a checkmark and I don't trust it lol\n\nfor context I'm building a client dashboard app, my Supabase has tables for clients, invoices, and projects. I want to use 0nMCP to auto-create rows when I get new leads from my website form.\n\nit's about 3am here in Lagos rn so I might be missing something obvious, any help would be amazing!!`,
    group: 'help', daysAgo: 20, hour: 3,
  },
  {
    author: 'adaeze-okafor',
    title: 'First workflow!! auto-welcome email for new signups',
    body: `ok this is prob basic for most of yall but I'm SO excited rn\n\nI just got my first SWITCH file working!! When someone signs up on my site (Supabase trigger), 0nMCP sends them a welcome email through SendGrid AND creates a row in my "onboarding" table\n\nthe whole thing is like 15 lines of config, I literally cannot believe it used to take me 200 lines of code to do this manually\n\nthe part that tripped me up: I had the SendGrid API key in my \`.env\` as \`SENDGRID_KEY\` but 0nMCP expects \`SENDGRID_API_KEY\`. once I renamed it everything just... worked??\n\nngl the error message was not helpful at all tho, it just said "service connection failed" with no details about WHICH key was wrong. maybe that's a feature request?\n\nanyone else remember their first workflow? what did you build?`,
    group: 'showcase', daysAgo: 17, hour: 22,
  },
  {
    author: 'adaeze-okafor',
    title: 'SWITCH files — can someone explain the variable syntax?',
    body: `I keep getting confused by the different variable types in SWITCH files and when to use which one\n\nlike there's:\n- \`{{system.timestamp}}\`\n- \`{{inputs.email}}\`\n- \`{{step.output.id}}\`\n\nand I think there's also \`{{launch.*}}\` but I have no idea what that does??\n\nI tried using \`{{step.1.output}}\` to get the result from my first step but it doesn't work, it has to be the step name not the number apparently?? but the docs show it both ways and I'm confused\n\nalso is there a way to do like... math? I want to calculate a discount based on the order total and idk if SWITCH files can do that or if I need to add a custom code step\n\nsorry for all the questions lol, I'm learning fast but there's a lot going on here`,
    group: 'help', daysAgo: 14, hour: 19,
  },
  {
    author: 'adaeze-okafor',
    title: 'Anyone using 0nMCP with Nigerian payment gateways?',
    body: `so Stripe doesn't fully work in Nigeria yet (we can receive USD but local Naira payments are limited), so most of us use Paystack or Flutterwave for local payments\n\nI see 0nMCP has Stripe integration built in but is there a way to connect custom REST APIs? like Paystack has a standard REST API with webhooks and everything, I feel like it SHOULD work but I'm not sure how to set it up without a pre-built connector\n\nif anyone has done this or has tips I'd really appreciate it! there's a whole community of devs here in Lagos who would prob jump on 0nMCP if it worked with our local payment providers\n\nwhat do you all think? should I request this as a feature or try to build a custom connector?`,
    group: 'feature-requests', daysAgo: 8, hour: 16,
  },

  // ---- Jake Holloway — agency, blunt ----
  {
    author: 'jake-holloway',
    title: 'ROI breakdown: 0nMCP vs custom automation code',
    body: `TL;DR: 0nMCP saved my agency 40 dev hours/month. That's $6K at our billing rate.\n\nRan the numbers over the last quarter. We onboard roughly 8 new clients per month. Each client needs:\n\n1. CRM contact creation + pipeline setup\n2. Welcome email sequence (3 emails)\n3. Slack channel notification\n4. Google Sheets reporting row\n5. Calendar booking link generation\n\nBefore 0nMCP: custom Node scripts per client. Average 5 hours to build, test, deploy. Total: 40 hours/month.\n\nAfter 0nMCP: one SWITCH file template. Clone, swap credentials, deploy. Average 30 minutes per client. Total: 4 hours/month.\n\nNot a single client has noticed the difference. The automations just work.`,
    group: 'showcase', daysAgo: 18, hour: 8,
  },
  {
    author: 'jake-holloway',
    title: 'Need --dry-run flag for workflows. Seriously.',
    body: `Hot take: deploying workflows without a dry-run option is playing with fire.\n\nYesterday one of my devs pushed a SWITCH file that had a typo in the SendGrid template ID. Didn't catch it because there's no way to test-run without actually executing. Sent 200 clients an email with broken formatting.\n\n1. Add \`--dry-run\` flag to \`0nmcp run\`\n2. Should validate all service connections\n3. Should resolve all variables and show the resolved values\n4. Should NOT actually call any external APIs\n\nThis is table stakes for any automation tool used in production. We have staging environments for a reason.`,
    group: 'feature-requests', daysAgo: 12, hour: 7,
  },
  {
    author: 'jake-holloway',
    title: 'Client onboarding in 47 seconds',
    body: `Timed it today. From form submission to fully provisioned client:\n\n- 0s: Webhook fires from website form\n- 3s: CRM contact created, tagged, pipelined\n- 8s: Welcome email sent via SendGrid\n- 12s: Slack channel created + team notified\n- 22s: Google Sheets row added to master tracker\n- 35s: Calendar booking link generated\n- 47s: Client receives confirmation SMS via Twilio\n\n7 services. 1 SWITCH file. 47 seconds.\n\nBefore this, my ops manager did it manually. Took 25 minutes per client and she'd miss steps.`,
    group: 'showcase', daysAgo: 5, hour: 13,
  },

  // ---- Priya Krishnamurthy — DevOps, methodical ----
  {
    author: 'priya-krishnamurthy',
    title: 'Running 0nmcp serve behind nginx reverse proxy',
    body: `## The Setup\n\nI needed to run \`0nmcp serve\` as a webhook receiver behind our existing nginx reverse proxy — alongside our main API on the same domain.\n\n## The Problem\n\nnginx by default buffers request bodies and re-serializes them. This breaks webhook signature verification for services like Stripe and GitHub that compute HMAC signatures against the raw body.\n\n## The Solution\n\n\`\`\`nginx\nlocation /webhooks/ {\n    proxy_pass http://127.0.0.1:3001/;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n    \n    # Critical: preserve raw body for signature verification\n    proxy_request_buffering off;\n    proxy_http_version 1.1;\n}\n\`\`\`\n\n## Additional Notes\n\n- Set \`client_max_body_size\` appropriately — webhook payloads can be large for batch events\n- The \`proxy_request_buffering off\` directive requires nginx 1.7.11+\n- I also added \`proxy_read_timeout 300s\` for long-running workflow executions\n\nHas anyone tried running this behind Cloudflare Tunnel instead? I'm considering switching from nginx to simplify the setup.`,
    group: 'tutorials', daysAgo: 17, hour: 11,
  },
  {
    author: 'priya-krishnamurthy',
    title: 'GitHub Actions + 0nMCP: triggering workflows from CI/CD',
    body: `## Use Case\n\nWe wanted our CI/CD pipeline to trigger 0nMCP workflows — specifically, after a successful deployment, notify all relevant services (Slack, CRM, monitoring).\n\n## Approach\n\nUsed \`0nmcp serve\` as a webhook endpoint that GitHub Actions hits via \`curl\` in a post-deploy step.\n\n## GitHub Actions Step\n\n\`\`\`yaml\n- name: Notify via 0nMCP\n  if: success()\n  run: |\n    curl -X POST \\$\\{\\{ secrets.ONMCP_WEBHOOK_URL \\}\\}/run/deploy-notify \\\\\n      -H "Content-Type: application/json" \\\\\n      -d \'{"version": "\\$\\{\\{ github.sha \\}\\}", "env": "production"}\'\n\`\`\`\n\n## The SWITCH File\n\nThe \`deploy-notify.0n\` workflow fans out via Radial Burst to:\n1. Post to \`#deployments\` Slack channel with commit details\n2. Update the deployment log in Supabase\n3. Trigger a health check workflow that verifies the deploy\n\n## Gotcha\n\nMake sure your \`0nmcp serve\` instance has proper authentication — you don't want anyone triggering your production workflows. I used a shared secret in the webhook URL path: \`/run/deploy-notify?token=SECRET\`.\n\nWhat authentication patterns are others using for their webhook endpoints?`,
    group: 'integrations', daysAgo: 11, hour: 14,
  },

  // ---- Tiago Santos — freelancer, storyteller ----
  {
    author: 'tiago-santos',
    title: 'How I replaced 3 Zapier zaps with one SWITCH file',
    body: `So this client of mine, a small bakery chain in Lisbon, they were paying like \u20AC80/month for three Zapier automations... and one of them kept breaking every two weeks because Zapier's Google Sheets integration is, how do I say this politely... temperamental.\n\nThe three zaps were:\n1. New order from their website \u2192 Google Sheets row + email confirmation\n2. Daily inventory check \u2192 Slack alert if anything is low\n3. New review on Google \u2192 repost to their Instagram (via a third-party thing)\n\nI rebuilt #1 and #2 in a single SWITCH file. Took me about an hour, including the time I spent figuring out the Google Sheets auth... which, fun story, I initially had the wrong scope and spent 20 minutes wondering why I could read but not write.\n\nThe inventory check runs on a cron trigger and the order processing is webhook-based. Both in the same file, different entry points. Pretty elegant once you see it.\n\nI didn't replace #3 yet because the Instagram API is... well, it's the Instagram API. Some things even 0nMCP can't fix.\n\nClient saves \u20AC80/month and the automations haven't broken once in 6 weeks. Versus Zapier breaking biweekly. I call that a win, n\u00e3o \u00e9?`,
    group: 'showcase', daysAgo: 15, hour: 17,
  },
  {
    author: 'tiago-santos',
    title: 'Airtable vs Notion vs Google Sheets — which works best with 0nMCP?',
    body: `I use all three with different clients and figured I'd share my notes on how each one works with 0nMCP...\n\n**Airtable**: best API of the three, honestly. 0nMCP connects cleanly, reads and writes work as expected. The rate limit is tight though (5 requests per second per base), so if you're doing bulk operations you'll hit it fast. Tiago's tip: batch your writes.\n\n**Notion**: the API is... fine. It works. But Notion's data model is weird, everything is a "page" and properties are nested in a way that makes my head hurt sometimes. 0nMCP handles it but you'll spend more time structuring your data correctly.\n\n**Google Sheets**: the OAuth setup is the most painful part. Once you're past that, it's actually quite reliable. Just remember that Sheets treats everything as strings unless you format explicitly.\n\nFor simple client dashboards, I go Airtable. For project management stuff, Notion. For clients who already live in Google Workspace, Sheets.\n\nWhat's everyone else using for client-facing data? I'm always curious about other people's stacks...`,
    group: 'integrations', daysAgo: 9, hour: 20,
  },

  // ---- Elena Voronova — data engineer ----
  {
    author: 'elena-voronova',
    title: 'Thinking about 0nMCP through the lens of data pipelines',
    body: `As someone who spent five years building Airflow DAGs, I find the 0nMCP workflow model interesting in a specific way that I have not seen discussed here.\n\nAirflow operates on a DAG paradigm. Each task is a node with explicit dependencies. You define what depends on what and the scheduler figures out execution order. It is declarative in that sense.\n\n0nMCP SWITCH files are sequential by default with branching. This is closer to a script than a DAG. The Pipeline mode is literally step 1 then step 2 then step 3. Assembly Line adds parallelism within stages but the stages themselves are sequential.\n\nThis is not a criticism. Martin Kleppmann writes in "Designing Data-Intensive Applications" that most real-world workflows are actually sequential with occasional fan-out. The DAG model is more powerful in theory but adds complexity that most use cases do not need.\n\nWhat I would like to see is a way to express dependencies between steps more explicitly. Something like:\n\nEDIT: To be clear, I am not suggesting 0nMCP become Airflow. I am suggesting that explicit dependency declarations would make complex workflows more maintainable than relying on step ordering alone.`,
    group: 'feature-requests', daysAgo: 13, hour: 10,
  },

  // ---- Soo-jin Park — design-minded ----
  {
    author: 'soo-jin-park',
    title: 'The CLI output could be SO much better',
    body: `Ok hear me out. The 0nMCP CLI works great functionally. But the output is... plain?\n\nLike when you run \`0nmcp engine verify\`, you get checkmarks and text. That's fine! But what if it looked more like this:\n\n\`\`\`\n\u250c\u2500 0nMCP Engine Verify \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\u2502\n\u2502  \u2713 stripe      connected (2ms)\n\u2502  \u2713 supabase    connected (45ms)\n\u2502  \u2713 sendgrid    connected (120ms)\n\u2502  \u2717 slack       failed: invalid token\n\u2502\n\u2514\u2500 3/4 services verified (167ms total)\n\`\`\`\n\nVs just:\n\`\`\`\n\u2713 stripe\n\u2713 supabase\n\u2713 sendgrid\n\u2717 slack\n\`\`\`\n\nSmall thing! But developer tools that feel polished get recommended more. First impressions matter.\n\nWho else cares about CLI aesthetics or am I the only one? Soo-jin from Seoul, reporting live from a cafe at 2am because apparently this is what I think about instead of sleeping.`,
    group: 'feature-requests', daysAgo: 14, hour: 17,
  },
  {
    author: 'soo-jin-park',
    title: 'Made a VS Code color theme inspired by the 0nMCP brand',
    body: `So you know how the 0nMCP brand uses that lime green (#7ed957)? I made a VS Code theme around it!\n\nIt's dark-mode only (obviously) with the green as the primary accent, cyan (#00d4ff) for strings, and purple (#a78bfa) for keywords.\n\nNot published to the marketplace yet but I can share the JSON if anyone wants to try it. Hmm, maybe I should make it a proper extension?\n\nScreenshot in my profile if you're curious. Works surprisingly well for long coding sessions — the green is easy on the eyes compared to the harsh blues most themes use.\n\nWould anyone actually use this?`,
    group: 'showcase', daysAgo: 6, hour: 21,
  },

  // ---- Arjun Mehta — startup founder ----
  {
    author: 'arjun-mehta',
    title: 'Wired up my entire MVP backend in a weekend with 0nMCP',
    body: `ok so hear me out, I know this sounds like an ad but it's not, I'm genuinely shocked\n\nI've been trying to build my scheduling startup for 3 months. kept getting stuck writing integration code. Stripe for payments, SendGrid for emails, Supabase for the DB, Slack for notifications\n\nthis weekend I discovered 0nMCP, installed it saturday morning, and by sunday night I had:\n- payment webhook handling (stripe \u2192 supabase \u2192 email confirmation)\n- new user onboarding flow (signup \u2192 welcome email \u2192 slack alert)\n- appointment reminder system (cron \u2192 check upcoming \u2192 send SMS via twilio)\n\nthree SWITCH files, prob 80 lines total\n\nthe part that blew my mind is the engine import, it literally found all my API keys from .env and auto-mapped them to services. I didn't configure ANYTHING manually\n\nactually wait, I take that back, I did have to rename one key from SUPABASE_KEY to SUPABASE_SERVICE_ROLE_KEY, but that's it\n\nnow I can focus on the actual product instead of writing glue code forever`,
    group: 'showcase', daysAgo: 16, hour: 23,
  },
  {
    author: 'arjun-mehta',
    title: 'How to handle workflow failures gracefully?',
    body: `quick question for the experienced folks here\n\nmy payment webhook workflow occasionally fails on the SendGrid step (their API returns 429 sometimes during peak hours) and when that happens the whole workflow stops\n\nthe payment still processes fine in Stripe but the confirmation email never goes out, which is bad because users think their payment didn't work\n\nis there a way to:\n1. retry just the failed step\n2. or catch the error and continue with the rest of the workflow\n3. or queue failed emails for a retry later\n\nright now I'm literally checking my Supabase logs every few hours to see if any emails got dropped and manually resending them, which, yeah, not great for a startup that's supposed to be about automation lol`,
    group: 'help', daysAgo: 12, hour: 20,
  },
  {
    author: 'arjun-mehta',
    title: 'Week 2 update: 0nMCP in production',
    body: `told yall I'd report back so here goes\n\n2 weeks running 0nMCP in prod for my scheduling app. stats:\n- 847 webhook events processed\n- 3 failures (all SendGrid rate limits, handled with the retry tip from Marcus)\n- 0 data issues\n- avg execution time: 1.2 seconds per workflow\n\nthe cron job for appointment reminders has been flawless, sent 156 SMS reminders with zero misses\n\none thing I didn't expect: debugging is actually easier than my old custom code. the execution logs show exactly which step failed and why, whereas before I had to dig through scattered console.logs\n\nEDIT: also my AWS bill went down because I killed 3 Lambda functions that 0nMCP replaced. small savings but feels good`,
    group: 'showcase', daysAgo: 3, hour: 18,
  },

  // ---- Sam Rivera — student ----
  {
    author: 'sam-rivera',
    title: 'Can 0nMCP make a Discord bot?? like for real??',
    body: `ok so I'm a CS student at UBC (Vancouver represent!) and I've been making Discord bots as a hobby but they always end up being like 500 lines of discord.js code for basic stuff\n\nI just found out 0nMCP has Discord integration and I'm LOSING IT rn, can it actually send messages and react to events without writing a full bot??\n\nlike for my study group Discord server I want:\n- when someone posts in #resources, cross-post to #announcements\n- daily summary of all messages posted (send at 10pm PST)\n- when someone types !remind, create a reminder in Google Calendar\n\nis this even possible with SWITCH files or am I dreaming?? because if so I might drop my current project and rebuild everything in 0nMCP\n\nalso sorry if this is a dumb question, I'm still pretty new to all this API stuff, we haven't covered it in class yet 😅`,
    group: 'help', daysAgo: 13, hour: 22,
  },
  {
    author: 'sam-rivera',
    title: 'My first integration!! Discord to Google Calendar',
    body: `UPDATE from my earlier post about the Discord bot — IT WORKS!!! 🎉🎉🎉\n\nI got the !remind command working! when someone types \`!remind meeting tomorrow 3pm\` in our Discord study group, 0nMCP parses it and creates a Google Calendar event!\n\nok so it's not PERFECT, the time parsing is a bit janky (it doesn't understand "next tuesday" yet), but for explicit dates and times it's solid\n\nthe SWITCH file is only 22 lines. TWENTY TWO. my old discord.js bot that did something similar was like 300 lines with all the error handling and date parsing\n\nngl I did need help from @marcus-chen's rate limiting post to get the Google Calendar API calls right, the API kept rejecting my requests and it turned out I was hitting it too fast\n\nwhat should I build next?? I'm thinking maybe a GitHub + Discord integration that posts when someone pushes to our class project repo 🤔`,
    group: 'showcase', daysAgo: 9, hour: 21,
  },

  // ---- Yael Goldstein — security ----
  {
    author: 'yael-goldstein',
    title: 'Vault PBKDF2 iterations should be 600K not 100K',
    body: `Unpopular opinion: the Vault's crypto is good but the PBKDF2 iteration count is too low.\n\n100,000 iterations was fine in 2020. OWASP's 2024 guidance recommends 600,000 for PBKDF2-SHA512. The Vault uses 100K.\n\nThe performance impact of bumping to 600K is negligible for a seal/unseal operation (we're talking about adding 200ms to a one-time operation). The security improvement is significant.\n\nAlso: the hardware fingerprint binding is clever but it means I can't back up sealed vaults to a different machine for disaster recovery. What's the recovery story if my laptop dies?\n\nFiled as an issue on GitHub. Would like to hear the rationale for 100K if there is one.`,
    group: 'feature-requests', daysAgo: 11, hour: 9,
  },

  // ---- Nate Crawford — Rails, skeptical ----
  {
    author: 'nate-crawford',
    title: 'A Rails developer tries 0nMCP — initial impressions',
    body: `So I've been writing Rails for 9 years and I have a deeply ingrained suspicion of anything in the JavaScript ecosystem that promises to be "universal." (Looking at you, Webpack. And you, Babel. And you too, left-pad.)\n\nBut a colleague kept pestering me about 0nMCP and I finally gave it a shot this weekend. Some thoughts:\n\n**The good:**\n- Config-over-code approach. Rails devs will appreciate this — it's convention-based. You don't write integration code, you describe what you want. Very "Rails-like" in philosophy (if not in implementation).\n- The Engine import is slick. Found all my API keys, mapped them correctly. Took 30 seconds.\n- Vault encryption is solid (I checked the source — it's doing real crypto, not just base64-and-a-prayer).\n\n**The "hmm":**\n- SWITCH file syntax. It's JSON. JSON! In 2026. Where's my YAML? Or better yet, a DSL. Rails proved that a good DSL beats raw data formats for developer happiness.\n- Error messages could be more helpful. When something fails, I want to know WHY, not just "service connection failed" — that's like a Rails app showing "Something went wrong" instead of the actual stack trace.\n- No built-in testing framework. In Rails we have RSpec, Minitest, fixtures. Here... you just run it and hope?\n\n**The verdict:** I'm cautiously impressed. It's solving a real problem (API integration is genuinely tedious) and the approach is sound. I just wish it had the polish and conventions that mature frameworks provide.\n\nDHH would probably hate it (it's JavaScript) and love it (it's convention-over-configuration) simultaneously.`,
    group: 'general', daysAgo: 8, hour: 15,
  },

  // ---- Olivia Pearce — non-technical founder ----
  {
    author: 'olivia-pearce',
    title: 'Can a non-coder actually use 0nMCP? My honest experience',
    body: `TL;DR: Sort of. With help.\n\nSo I run a small e-commerce brand (candles and home fragrance, if you're curious) and I've been wanting to automate my order processing for ages. Currently I manually copy order details from Shopify into a Google Sheet, then send shipping confirmation emails by hand. It takes about 2 hours every morning.\n\nI heard about 0nMCP from a developer friend and thought... maybe I can do this myself? I have zero coding background. I once edited a WordPress PHP file and broke my entire site for three days.\n\nHere's how it went...\n\nDay 1: Installed Node.js (had to Google how). Installed 0nMCP. Ran the engine import. It found my Shopify and SendGrid keys. So far so good.\n\nDay 2: Tried to write a SWITCH file. Immediately got lost. What's a webhook? What's a payload? Spent 3 hours reading docs and YouTube tutorials.\n\nDay 3: Asked my developer friend for help over a video call. She walked me through creating a basic Shopify order \u2192 Google Sheets \u2192 email workflow. It took us 45 minutes together.\n\nNow it runs automatically and I've saved those 2 hours every morning. But I definitely couldn't have done it alone. The tool is powerful but the learning curve for non-technical users is real.\n\nWould a visual builder or templates help? I feel like if there were pre-made workflows for common e-commerce tasks, people like me could get started much faster... has anyone else felt this way?`,
    group: 'general', daysAgo: 10, hour: 11,
  },
  {
    author: 'olivia-pearce',
    title: 'Shopify + SendGrid order confirmation — my template',
    body: `After getting my first workflow running (see my earlier post), I thought I\'d share the actual SWITCH file in case other e-commerce folks find it useful...\n\nIt does three things when a new Shopify order comes in:\n1. Adds the order to my Google Sheets tracking spreadsheet\n2. Sends a branded confirmation email via SendGrid\n3. Posts a notification to my personal Slack channel so I see it on my phone\n\nI\'m not going to pretend I wrote this alone — my developer friend helped me set it up — but now I understand how it works well enough to tweak things myself. Like last week I changed the email template to include the estimated delivery date and it only took me 10 minutes.\n\nThe one thing I still can\'t figure out... is there a way to handle different email templates for different product types? Like my candle orders should get a different email than my diffuser orders. Is that what the "condition" step does?\n\nAny help would be amazing, and if there are other small business owners here, I\'d love to connect!`,
    group: 'tutorials', daysAgo: 6, hour: 14,
  },
]

// ==================== Replies ====================
// Each reply: { author (slug), threadTitle (match), body, hoursAfterThread }

const REPLIES = [
  // ---- Welcome thread replies ----
  { author: 'marcus-chen', threadTitle: 'Welcome to the 0nMCP Community', body: `Good to see an official community space. Couple of questions for you Kira: what's the policy on posting production configs (sanitized obviously) and is there a way to get verified contributor flair for people who submit PRs?`, hoursAfter: 4 },
  { author: 'adaeze-okafor', threadTitle: 'Welcome to the 0nMCP Community', body: `this is so cool!! I just signed up yesterday, I'm building a client management tool and I'm hoping 0nMCP can help me automate the boring parts. excited to be here! 🎉`, hoursAfter: 8 },
  { author: 'sam-rivera', threadTitle: 'Welcome to the 0nMCP Community', body: `hey everyone!! Sam here from Vancouver, I'm a CS student and I just discovered 0nMCP like 2 days ago. already made my first workflow (Discord bot stuff!) and I'm hooked. this community looks awesome 🙌`, hoursAfter: 14 },
  { author: 'nate-crawford', threadTitle: 'Welcome to the 0nMCP Community', body: `Thanks for setting this up. I'll be the resident skeptic — someone has to ask the hard questions around here. (Just kidding. Mostly.) Looking forward to learning from everyone.`, hoursAfter: 22 },

  // ---- Marcus: Stripe webhook ----
  { author: 'priya-krishnamurthy', threadTitle: 'Stripe webhook signature verification with 0nMCP', body: `## Nginx Addendum\n\nFor those running behind nginx — I wrote a tutorial on this exact issue. The key directive is \`proxy_request_buffering off\` in your nginx config. Without it, nginx re-serializes the body and the HMAC check fails.\n\nAlso worth noting: if you're using Cloudflare in front of nginx, Cloudflare ALSO buffers and re-serializes. You'll need to use Cloudflare's "raw body" option in the webhook settings.\n\nHas anyone tried this with Caddy instead of nginx? I've been meaning to test it.`, hoursAfter: 3 },
  { author: 'yael-goldstein', threadTitle: 'Stripe webhook signature verification with 0nMCP', body: `Good writeup. One addition: the webhook secret should be in the Vault, not in plain text in your SWITCH file. If your config file is in version control (and it should be), you don't want secrets in there.\n\n\`0nmcp vault seal --key stripe_webhook_secret\`\n\nThen reference it as \`{{vault.stripe_webhook_secret}}\` in your SWITCH file.`, hoursAfter: 7 },

  // ---- Adaeze: Supabase help ----
  { author: 'kira-tanaka', threadTitle: 'How do I connect Supabase to 0nMCP?? confused about the config', body: `Hey Adaeze! Welcome to the community — great to have you here.\n\nSo when \`engine import\` says "mapped to: supabase" — that means it recognized the key format and registered the connection. The \`engine verify\` checkmark means the key was tested against the Supabase API and it responded successfully.\n\nTo double-check, try running a simple workflow that reads from your Supabase table:\n\n\`\`\`json\n{\n  "steps": [{\n    "action": "supabase_query",\n    "inputs": {\n      "table": "clients",\n      "select": "*",\n      "limit": 1\n    }\n  }]\n}\n\`\`\`\n\nIf that returns data, you're connected! Let me know how it goes — and don't worry about asking "obvious" questions, that's what this forum is for.`, hoursAfter: 5 },
  { author: 'arjun-mehta', threadTitle: 'How do I connect Supabase to 0nMCP?? confused about the config', body: `same thing confused me at first!! the verify checkmark just means the API key is valid, it doesn't actually test reading/writing data\n\nwhat worked for me was running \`0nmcp run\` with a super simple workflow that just does one supabase read, then you KNOW it works for real`, hoursAfter: 9 },

  // ---- Marcus: Rate limiting ----
  { author: 'jake-holloway', threadTitle: 'Rate limiting gotchas when chaining API calls', body: `This is exactly the problem I hit last month. The batch approach is the right answer.\n\nOne addition: for CRM updates specifically, you can use the batch endpoint instead of individual calls. Cuts 500 API calls down to 5.`, hoursAfter: 6 },
  { author: 'elena-voronova', threadTitle: 'Rate limiting gotchas when chaining API calls', body: `This is essentially the same problem that data engineers solve with micro-batching in stream processing. The pattern Marcus describes is what Spark Structured Streaming calls "trigger processing time." Accumulate events in a window then flush.\n\nIn 0nMCP terms one could implement this with a scheduled workflow that processes queued items every N minutes rather than reacting to each event individually. The tradeoff is latency for throughput. Whether that tradeoff is acceptable depends on your SLA requirements.`, hoursAfter: 14 },

  // ---- Adaeze: Variable syntax ----
  { author: 'marcus-chen', threadTitle: 'SWITCH files — can someone explain the variable syntax?', body: `Quick rundown:\n\n\`\`\`\n{{system.*}}    - built-in values (timestamp, uuid, etc)\n{{launch.*}}    - values passed at runtime via CLI args\n{{inputs.*}}    - webhook/trigger payload data\n{{step.NAME.output.*}} - output from a named step\n\`\`\`\n\nYou reference steps by NAME not index. So if your step has \`"name": "create_contact"\`, you access its output as \`{{step.create_contact.output.id}}\`.\n\nAnd yes, the template engine supports math: \`{{inputs.price * 0.9}}\` gives you a 10% discount. Conditions too: \`{{inputs.total > 100 ? "premium" : "standard"}}\`.`, hoursAfter: 2 },
  { author: 'kira-tanaka', threadTitle: 'SWITCH files — can someone explain the variable syntax?', body: `Marcus nailed it. I'll add that the resolution order matters — if you have the same variable name in \`system\` and \`inputs\`, system wins. The full priority is:\n\n\`system > launch > inputs > step outputs\`\n\nAlso re: the docs showing both numbered and named steps — named steps are the correct approach. Numbered references were from an older version and should have been removed from the docs. I'll flag that for cleanup.\n\nDon't apologize for questions, Adaeze — this is literally what the help group is for!`, hoursAfter: 5 },

  // ---- Jake: dry-run ----
  { author: 'marcus-chen', threadTitle: 'Need --dry-run flag for workflows. Seriously.', body: `+1. This is an obvious gap.\n\nActually, wait — you can KIND of do this today by pointing your services at test/sandbox endpoints. Stripe has test mode, SendGrid has sandbox mode. But that requires maintaining two sets of credentials and switching between them manually. A proper \`--dry-run\` that intercepts API calls before they're sent would be much better.`, hoursAfter: 3 },
  { author: 'priya-krishnamurthy', threadTitle: 'Need --dry-run flag for workflows. Seriously.', body: `## Strong +1\n\nIn CI/CD we call this "plan mode" (like \`terraform plan\`). It should:\n\n1. Resolve all variables\n2. Validate all service connections\n3. Show the resolved payload for each step\n4. Log what WOULD be sent to each API\n5. Return success/failure prediction\n\nThis is essential for any production deployment pipeline. Without it, you're essentially doing \`terraform apply\` without \`terraform plan\` first.\n\nWould be happy to contribute to this if there's an open issue.`, hoursAfter: 8 },
  { author: 'olivia-pearce', threadTitle: 'Need --dry-run flag for workflows. Seriously.', body: `Yes please!! I accidentally sent test emails to my real customer list once because I thought I was in sandbox mode... it was mortifying. A dry-run mode would have saved me so much embarrassment.\n\nEven just showing "this would send an email to [these addresses]" without actually sending would be huge for non-technical users like me.`, hoursAfter: 18 },

  // ---- Jake: ROI breakdown ----
  { author: 'tiago-santos', threadTitle: 'ROI breakdown: 0nMCP vs custom automation code', body: `Those numbers track with what I'm seeing with my clients too... the time savings are real. I had a client paying me 20 hours/month to maintain custom Zapier integrations, now I spend maybe 3 hours/month on 0nMCP configs.\n\nThe ironic part is I make less money per client now, but I can take on more clients because each one requires less maintenance. Net positive, pois n\u00e3o?`, hoursAfter: 12 },

  // ---- Priya: nginx tutorial ----
  { author: 'marcus-chen', threadTitle: 'Running 0nmcp serve behind nginx reverse proxy', body: `Good tutorial. The \`proxy_request_buffering off\` is the key detail that took me hours to find when I first set this up.\n\nRe: Cloudflare Tunnel — I tested it last week. Works fine for receiving webhooks but adds ~50ms latency compared to direct nginx. Not a problem for webhooks but worth knowing if you're doing real-time processing.`, hoursAfter: 5 },

  // ---- Tiago: Zapier replacement ----
  { author: 'olivia-pearce', threadTitle: 'How I replaced 3 Zapier zaps with one SWITCH file', body: `This is exactly the kind of story I needed to hear! I'm also migrating from Zapier... my Shopify automations cost me about \u00A340/month on Zapier and they break constantly.\n\nQuestion though — how difficult was the Google Sheets auth setup? That's the part I'm dreading most. The OAuth stuff makes my head spin...`, hoursAfter: 10 },
  { author: 'adaeze-okafor', threadTitle: 'How I replaced 3 Zapier zaps with one SWITCH file', body: `wait you can have multiple entry points in one SWITCH file?? like both a webhook trigger AND a cron trigger?? I did NOT know that, I've been making separate files for everything 😭\n\nhow does that work? do you just have two different trigger blocks at the top?`, hoursAfter: 16 },
  { author: 'tiago-santos', threadTitle: 'How I replaced 3 Zapier zaps with one SWITCH file', body: `@olivia-pearce the Google Sheets auth is honestly the worst part of any Google integration... my tip is to use a service account instead of OAuth. It's more setup upfront but you never have to deal with token refresh issues.\n\n@adaeze-okafor yes! you define multiple entry points in the triggers array. Each trigger has its own steps chain. Same file, different activation paths. It's very clean once you see it... I can share an example if you want.`, hoursAfter: 24 },

  // ---- Adaeze: Nigerian payment gateways ----
  { author: 'kira-tanaka', threadTitle: 'Anyone using 0nMCP with Nigerian payment gateways?', body: `Great question, Adaeze. Custom REST API integration is definitely possible — 0nMCP has a generic HTTP service that can connect to any API with standard auth (API key headers, Bearer tokens, etc).\n\nFor Paystack specifically, their API is clean REST with API key auth, so it should map cleanly to the generic HTTP connector.\n\nI'll pass along the feature request for a first-class Paystack connector — you're right that there's a huge community of developers in Nigeria and across Africa who would benefit. Thanks for flagging this!`, hoursAfter: 6 },
  { author: 'tiago-santos', threadTitle: 'Anyone using 0nMCP with Nigerian payment gateways?', body: `I had a similar situation with a Portuguese payment provider (Multibanco) that isn't supported natively... I ended up using the generic webhook receiver to listen for their events and then the generic HTTP service to call their API.\n\nIt works but it's more setup than the built-in connectors. Would be nice if there was a way to define custom service connectors as plugins, like a community-contributed catalog...`, hoursAfter: 14 },

  // ---- Elena: Data pipelines ----
  { author: 'marcus-chen', threadTitle: 'Thinking about 0nMCP through the lens of data pipelines', body: `Interesting perspective. You're right that most real-world workflows are sequential. The Assembly Line mode does add some DAG-like parallelism within stages, but it's not true dependency resolution.\n\nThe question is whether the added complexity of a DAG scheduler is worth it for the use cases 0nMCP targets. Most API integrations are linear: trigger → process → output. The 5% that need complex dependency graphs probably need a dedicated orchestrator like Airflow anyway.`, hoursAfter: 8 },
  { author: 'nate-crawford', threadTitle: 'Thinking about 0nMCP through the lens of data pipelines', body: `This is basically the same debate the Rails community had about Active Job vs Sidekiq. Do you need a full-featured job queue with dependencies, or is a simple sequential pipeline good enough?\n\nThe answer — as it always is in software — is "it depends." But I'd argue that starting simple and adding complexity later is better than starting complex. You can always add a DAG scheduler on top. You can't easily remove one.\n\n(Also, +1 for the Kleppmann reference. That book should be required reading.)`, hoursAfter: 20 },

  // ---- Soo-jin: CLI output ----
  { author: 'sam-rivera', threadTitle: 'The CLI output could be SO much better', body: `YES I care about this SO much!! good CLIs just hit different. like when you use Vercel's CLI and everything is smooth and pretty... that's the energy I want from 0nMCP\n\nalso Soo-jin the cafe at 2am thing is SO relatable, I'm literally reading this at midnight in my dorm 😅`, hoursAfter: 5 },
  { author: 'nate-crawford', threadTitle: 'The CLI output could be SO much better', body: `Counterpoint: I'd rather the team spend time on functionality (like the dry-run flag Jake requested) than on making the output prettier. Pretty CLIs are nice but they're polish, not substance.\n\nThat said — your mockup does look good. If it's a small PR, why not submit it?`, hoursAfter: 10 },
  { author: 'soo-jin-park', threadTitle: 'The CLI output could be SO much better', body: `@nate-crawford Fair point! But I'd argue they're not mutually exclusive. Good output formatting actually helps with debugging — when everything looks the same, it's harder to spot errors. Visual hierarchy IS functionality.\n\nHmm, maybe I should just submit a PR instead of talking about it. Anyone want to pair on it?`, hoursAfter: 14 },

  // ---- Arjun: MVP weekend ----
  { author: 'jake-holloway', threadTitle: 'Wired up my entire MVP backend in a weekend with 0nMCP', body: `Solid progress for a weekend. One word of caution: make sure you add error handling before going to production. The happy path working is great but you need to handle cases where Stripe webhooks are delayed, SendGrid rate limits you, or Supabase is temporarily unavailable.\n\nAsking because I've seen startups lose days debugging production issues that proper error handling would have caught.`, hoursAfter: 8 },
  { author: 'kira-tanaka', threadTitle: 'Wired up my entire MVP backend in a weekend with 0nMCP', body: `This is awesome, Arjun! Love seeing the engine import work that smoothly — that's exactly the experience we're going for.\n\nJake's right about error handling though. The workflow runner has built-in retry logic but you should also define what happens when retries are exhausted. A dead letter queue pattern works well — failed events go to a Supabase table that you can review and replay.\n\nKeep us posted on how the startup goes!`, hoursAfter: 12 },

  // ---- Arjun: Workflow failures ----
  { author: 'marcus-chen', threadTitle: 'How to handle workflow failures gracefully?', body: `The workflow runner supports \`on_error\` at the step level. Add this to your SendGrid step:\n\n\`\`\`json\n{\n  "name": "send_confirmation",\n  "action": "sendgrid_send",\n  "on_error": {\n    "retry": { "max": 3, "delay_ms": 5000 },\n    "fallback": {\n      "action": "supabase_insert",\n      "inputs": {\n        "table": "failed_emails",\n        "data": { "email": "{{inputs.email}}", "template": "confirmation" }\n      }\n    }\n  }\n}\n\`\`\`\n\nThe retry will attempt 3 times with 5-second delays. If all retries fail, the fallback step queues it to a \`failed_emails\` table. Then you can have a separate cron workflow that processes that queue every 15 minutes.`, hoursAfter: 4 },

  // ---- Sam: Discord bot ----
  { author: 'kira-tanaka', threadTitle: 'Can 0nMCP make a Discord bot?? like for real??', body: `Not a dumb question at all, Sam!\n\nYes, 0nMCP can interact with the Discord API — send messages, read channels, react to events. It's not a full bot framework (you can't do slash commands or interactive components natively), but for the use cases you described, it works great.\n\nFor the cross-posting and daily summary, SWITCH files will handle that. The !remind command is trickier because you'd need something listening for messages in real-time — that's more of a bot thing. You could use a lightweight Discord bot that just forwards !remind messages to an 0nMCP webhook, keeping most of the logic in your SWITCH file.\n\nWhat do you think — want to start with the cross-posting and we can help you set it up?`, hoursAfter: 3 },
  { author: 'arjun-mehta', threadTitle: 'Can 0nMCP make a Discord bot?? like for real??', body: `dude YES you can, that's basically what I did for my team's discord, we have a webhook that listens for messages and routes them through 0nMCP\n\nthe cross-post thing is super easy, prob like 10 lines of config. the calendar thing is a bit more work but totally doable\n\ndef try it, it's way less code than a full discord.js bot`, hoursAfter: 8 },

  // ---- Yael: Vault crypto ----
  { author: 'marcus-chen', threadTitle: 'Vault PBKDF2 iterations should be 600K not 100K', body: `Agreed on the iteration count. 100K is below current recommendations.\n\nOn the backup question — you CAN export vault contents via \`vault open\` and re-seal on another machine. The fingerprint binding means the .0nv file itself is machine-locked, but the decrypted contents can be transferred and re-sealed. Not ideal for automated DR but workable for manual recovery.`, hoursAfter: 6 },
  { author: 'priya-krishnamurthy', threadTitle: 'Vault PBKDF2 iterations should be 600K not 100K', body: `## DR Perspective\n\nThe hardware fingerprint binding is problematic for any serious disaster recovery plan. In our infrastructure, we need credentials to be recoverable if a machine is lost or decommissioned.\n\nThe portable encryption mode in the Engine module (passphrase-only AES-256-GCM, no fingerprint) might be a better fit for credentials that need to survive hardware changes.\n\nAgreed on bumping the iterations. I'd also suggest making it configurable rather than hardcoded — different use cases have different security/performance tradeoffs.`, hoursAfter: 12 },

  // ---- Nate: Rails developer tries 0nMCP ----
  { author: 'soo-jin-park', threadTitle: 'A Rails developer tries 0nMCP — initial impressions', body: `Hmm, interesting take on the CLI output! So you want prettier output BUT also think a DSL would be better than JSON?\n\nI actually agree on both counts. What if the SWITCH file format supported YAML in addition to JSON? YAML is way more readable for config files. And a proper DSL on top of that would be even better.\n\nAlso the DHH comment made me laugh 😄`, hoursAfter: 6 },
  { author: 'jake-holloway', threadTitle: 'A Rails developer tries 0nMCP — initial impressions', body: `Agree on testing. We need a test framework. Even basic assertions like "step 2 should receive this input" and "step 3 should produce output matching this schema" would be huge.\n\nI'm running production workflows without tests. That should bother me more than it does.`, hoursAfter: 11 },
  { author: 'elena-voronova', threadTitle: 'A Rails developer tries 0nMCP — initial impressions', body: `The comparison to Rails conventions is apt. Ruby on Rails succeeded not because Ruby was the best language but because the framework had strong opinions about how things should be done. 0nMCP has similar opinionated conventions but they are implicit rather than documented.\n\nWhat would help is a "Convention Guide" that explicitly states the patterns the tool expects. Airflow has an excellent one and it reduces onboarding time significantly.`, hoursAfter: 24 },

  // ---- Olivia: Non-coder experience ----
  { author: 'adaeze-okafor', threadTitle: 'Can a non-coder actually use 0nMCP? My honest experience', body: `omg this is SO relatable!! I'm not exactly non-technical but I'm def not an expert and the learning curve was REAL for me too\n\ntemplates would be amazing!! like if there was a "Shopify store starter pack" with pre-made workflows that you just plug your API keys into, I would have saved SO much time\n\nalso the webhook thing confused me too for the longest time 😅`, hoursAfter: 5 },
  { author: 'kira-tanaka', threadTitle: 'Can a non-coder actually use 0nMCP? My honest experience', body: `This is really valuable feedback, Olivia. Thank you for taking the time to write it up.\n\nYou're touching on something we've been discussing internally — pre-built workflow templates for common use cases. An "E-commerce Starter Kit" with Shopify + email + spreadsheet workflows ready to customize would lower the barrier significantly.\n\nThe visual builder on the website (0nmcp.com/builder) is a step in that direction but it's still early. Your perspective as a non-technical user is exactly what we need to make it better.\n\nWould you be open to a quick call to walk through your experience? I'd love to capture the specific friction points. Either way — really glad you stuck with it and got your workflow running!`, hoursAfter: 8 },
  { author: 'tiago-santos', threadTitle: 'Can a non-coder actually use 0nMCP? My honest experience', body: `Olivia your experience mirrors what I see with my small business clients exactly... they WANT to automate but the technical barrier is real.\n\nI've actually been thinking about creating a "SWITCH file template library" for common small business workflows. Things like order processing, appointment reminders, invoice follow-ups... the stuff every small business needs.\n\nWould you be interested in beta testing if I put something together? I could use the feedback from a non-technical perspective.`, hoursAfter: 18 },

  // ---- Olivia: Shopify template ----
  { author: 'adaeze-okafor', threadTitle: 'Shopify + SendGrid order confirmation — my template', body: `tysm for sharing this!! I'm going to try adapting it for my app, I don't use Shopify but the SendGrid + Google Sheets part is exactly what I need\n\nand yes the condition step is what you want for different email templates! you can do like:\n\`{{inputs.product_type == "candle" ? "candle_template" : "diffuser_template"}}\`\n\nat least I THINK that's how it works, I saw Marcus explain it somewhere in another thread 😄`, hoursAfter: 7 },

  // ---- Marcus: Vault encryption ----
  { author: 'yael-goldstein', threadTitle: 'Vault encryption — how does key derivation actually work?', body: `Good analysis. The 100K iteration count is the same thing I flagged in my feature request post. Glad someone else is reading the source.\n\nThe hardware fingerprint binding is the most interesting design decision. It prevents credential theft but creates a recovery problem. You can't just restore from backup on a new machine. The Engine module's portable encryption is the intended workaround but it's a weaker security model.\n\nTradeoff city. Pick your risk tolerance.`, hoursAfter: 10 },

  // ---- Marcus: Pipeline vs Assembly ----
  { author: 'elena-voronova', threadTitle: 'Pipeline vs Assembly Line execution — when to use which', body: `This is a good practical summary. To add a data engineering perspective:\n\nPipeline maps to what we call "sequential ETL." Extract then transform then load. Each step feeds the next.\n\nAssembly Line maps to "parallel ETL stages." Within a single stage you can extract from multiple sources concurrently before the transform stage begins.\n\nRadial Burst is "fan-out" which in event-driven architectures is handled by message queues like Kafka or SNS.\n\nThe race condition Marcus describes is a classic write-write conflict. In databases we solve it with locking. In 0nMCP the recommendation would be to ensure parallel steps within a stage do not share write targets.`, hoursAfter: 16 },

  // ---- Sam: Discord + Calendar ----
  { author: 'soo-jin-park', threadTitle: 'My first integration!! Discord to Google Calendar', body: `22 lines!! That's amazing for a first integration. The time parsing thing — have you looked at chrono-node? It can parse natural language dates like "next tuesday" really well. You could add a transform step that uses it before the calendar API call.\n\nAlso @marcus-chen getting credited in a student project is peak community vibes. Love it!`, hoursAfter: 6 },

  // ---- Arjun: Week 2 update ----
  { author: 'jake-holloway', threadTitle: 'Week 2 update: 0nMCP in production', body: `847 events with 3 failures. That's a 99.65% success rate. Solid for week 2.\n\nThe execution logs being better than custom code is something I've noticed too. Structured logging > scattered console.log. Every time.`, hoursAfter: 5 },
  { author: 'adaeze-okafor', threadTitle: 'Week 2 update: 0nMCP in production', body: `the part about killing Lambda functions and saving money is SO relatable, I was paying AWS like $15/month for functions that 0nMCP now handles for free basically\n\nalso 1.2 seconds avg is really fast!! mine are more like 3-4 seconds but I think that's because I'm hitting more APIs per workflow`, hoursAfter: 12 },
]

// ==================== Main ====================

async function main() {
  console.log('\n=== 0nMCP Forum Seeder (Hardcoded) ===\n')

  // ---- Step 1: Create profiles + personas ----
  console.log('STEP 1: Creating 13 personas + profiles...\n')

  const profileMap = new Map()  // slug -> profile UUID
  const personaMap = new Map()  // slug -> persona row

  for (const p of PERSONAS) {
    // Check if already exists
    const { data: existing } = await db.from('community_personas').select('id').eq('slug', p.slug).limit(1)
    if (existing?.length > 0) {
      console.log(`  SKIP ${p.name} (already exists)`)
      personaMap.set(p.slug, existing[0])
      // Get profile ID
      const { data: prof } = await db.from('profiles').select('id').eq('email', `persona-${p.slug}@0nmcp.internal`).single()
      if (prof) profileMap.set(p.slug, prof.id)
      continue
    }

    // Create profile
    const profileId = randomUUID()
    const { error: profErr } = await db.from('profiles').insert({
      id: profileId,
      full_name: p.name,
      display_name: p.name,
      username: p.slug,
      email: `persona-${p.slug}@0nmcp.internal`,
      bio: p.bio,
      is_persona: true,
      reputation_level: p.knowledge_level === 'expert' ? 'contributor' : 'member',
      karma: p.knowledge_level === 'expert' ? 50 : p.knowledge_level === 'intermediate' ? 25 : 10,
      role: 'member',
      onboarding_completed: true,
      onboarding_step: 0,
    })
    if (profErr) { console.error(`  ERROR profile ${p.name}: ${profErr.message}`); continue }
    profileMap.set(p.slug, profileId)

    // Create persona
    const { data: persona, error: persErr } = await db.from('community_personas').insert({
      name: p.name,
      slug: p.slug,
      bio: p.bio,
      role: p.role,
      expertise: p.expertise,
      personality: p.personality,
      knowledge_level: p.knowledge_level,
      preferred_groups: p.preferred_groups,
      is_active: true,
      activity_level: p.activity_level,
    }).select('id').single()

    if (persErr) { console.error(`  ERROR persona ${p.name}: ${persErr.message}`); continue }
    personaMap.set(p.slug, persona)
    console.log(`  + ${p.name} (${p.role}, ${p.knowledge_level}, ${p.activity_level})`)
  }

  console.log(`\n  Created ${profileMap.size} profiles, ${personaMap.size} personas\n`)

  // ---- Step 2: Create threads ----
  console.log('STEP 2: Creating threads...\n')

  const threadMap = new Map()  // title -> { id, slug }
  let threadCount = 0

  for (const t of THREADS) {
    const profileId = profileMap.get(t.author)
    if (!profileId) { console.log(`  SKIP "${t.title.slice(0, 40)}" — no profile for ${t.author}`); continue }

    const slug = threadSlug(t.title)
    const groupId = await resolveGroup(t.group)
    const createdAt = daysAgo(t.daysAgo, t.hour, Math.floor(Math.random() * 60))

    const { data: thread, error } = await db.from('community_threads').insert({
      user_id: profileId,
      title: t.title,
      slug,
      body: t.body,
      category: t.group,
      group_id: groupId,
      created_at: createdAt,
    }).select('id, slug').single()

    if (error) { console.error(`  ERROR thread: ${error.message}`); continue }
    threadMap.set(t.title, { id: thread.id, slug: thread.slug, createdAt })
    threadCount++

    // Track in persona_conversations
    const persona = personaMap.get(t.author)
    if (persona) {
      await db.from('persona_conversations').insert({
        thread_id: thread.id,
        persona_id: persona.id,
        action: 'created_thread',
        content_preview: t.title.slice(0, 200),
      }).then(() => {})
    }

    console.log(`  + [${t.group}] "${t.title.slice(0, 50)}..." by ${t.author}`)
  }

  console.log(`\n  Created ${threadCount} threads\n`)

  // ---- Step 3: Create replies ----
  console.log('STEP 3: Creating replies...\n')

  let replyCount = 0

  for (const r of REPLIES) {
    const profileId = profileMap.get(r.author)
    const thread = threadMap.get(r.threadTitle)
    if (!profileId || !thread) {
      console.log(`  SKIP reply by ${r.author} — missing profile or thread`)
      continue
    }

    // Calculate reply timestamp
    const threadTime = new Date(thread.createdAt).getTime()
    const replyTime = new Date(threadTime + r.hoursAfter * 3600000).toISOString()

    // Don't create replies in the future
    if (new Date(replyTime) > new Date()) continue

    const { data: post, error } = await db.from('community_posts').insert({
      thread_id: thread.id,
      user_id: profileId,
      body: r.body,
      created_at: replyTime,
    }).select('id').single()

    if (error) { console.error(`  ERROR reply: ${error.message}`); continue }

    // Update thread reply count
    const { data: tData } = await db.from('community_threads').select('reply_count').eq('id', thread.id).single()
    if (tData) {
      await db.from('community_threads').update({
        reply_count: (tData.reply_count || 0) + 1,
        last_reply_at: replyTime,
      }).eq('id', thread.id)
    }

    // Track
    const persona = personaMap.get(r.author)
    if (persona) {
      await db.from('persona_conversations').insert({
        thread_id: thread.id,
        persona_id: persona.id,
        action: 'replied',
        content_preview: r.body.slice(0, 200),
      }).then(() => {})
    }

    replyCount++
    console.log(`  + ${r.author} replied to "${r.threadTitle.slice(0, 40)}..."`)
  }

  console.log(`\n  Created ${replyCount} replies\n`)

  // ---- Step 4: Update persona stats ----
  console.log('STEP 4: Updating persona stats...\n')

  for (const [slug, persona] of personaMap) {
    const { data: convos } = await db.from('persona_conversations')
      .select('action')
      .eq('persona_id', persona.id)

    if (!convos) continue

    const threads = convos.filter(c => c.action === 'created_thread').length
    const replies = convos.filter(c => c.action === 'replied').length

    await db.from('community_personas').update({
      thread_count: threads,
      reply_count: replies,
      last_active_at: new Date().toISOString(),
    }).eq('id', persona.id)

    console.log(`  ${slug}: ${threads} threads, ${replies} replies`)
  }

  // ---- Done ----
  console.log(`\n=== SEEDING COMPLETE ===`)
  console.log(`  Personas: ${personaMap.size}`)
  console.log(`  Threads:  ${threadCount}`)
  console.log(`  Replies:  ${replyCount}`)
  console.log(`  API calls: 0 (all hardcoded)\n`)
}

// Group resolver cache
const groupCache = new Map()
async function resolveGroup(slug) {
  if (groupCache.has(slug)) return groupCache.get(slug)
  const { data } = await db.from('community_groups').select('id').eq('slug', slug).single()
  const id = data?.id || null
  groupCache.set(slug, id)
  return id
}

main().catch(err => { console.error('\nFATAL:', err); process.exit(1) })
