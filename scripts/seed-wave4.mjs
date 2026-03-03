#!/usr/bin/env node
/**
 * 0nMCP Forum Wave 4 Seeder
 * - Inserts threads directly into the forum (capturing real slugs)
 * - Queues replies into persona_content_queue with staggered scheduled_at
 * - Zero API calls. All content pre-written.
 *
 * Usage: node scripts/seed-wave4.mjs
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Or uses the 0nmcp-website Supabase project directly.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Use 0nmcp.com Supabase project
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwujhhmlrtxjmjzyttwn.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY required. Set it as an env var.')
  console.error('   export SUPABASE_SERVICE_ROLE_KEY="your-key-here"')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY)

// ==================== Helpers ====================

function threadSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
}

function daysAgo(d) {
  const dt = new Date(Date.now() - d * 86400000)
  dt.setHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60))
  return dt.toISOString()
}

function hoursFromNow(h) {
  return new Date(Date.now() + h * 3600000).toISOString()
}

// ==================== Load Data ====================

const data = JSON.parse(readFileSync(join(__dirname, 'seed-wave4-data.json'), 'utf8'))

console.log(`📦 Wave 4: ${data.threads.length} threads, ${data.replies.length} replies\n`)

// ==================== Resolve Groups & Personas ====================

async function getGroupMap() {
  const { data: groups } = await db.from('community_groups').select('id, slug')
  const map = {}
  for (const g of (groups || [])) map[g.slug] = g.id
  return map
}

async function getPersonaMap() {
  const { data: personas } = await db.from('community_personas').select('id, slug, name, thread_count, reply_count')
  const map = {}
  for (const p of (personas || [])) map[p.slug] = p
  return map
}

async function getProfileMap() {
  const { data: profiles } = await db.from('profiles').select('id, email').eq('is_persona', true)
  const map = {}
  for (const p of (profiles || [])) {
    // Extract slug from email: persona-slug@0nmcp.internal
    const match = p.email?.match(/^persona-(.+)@0nmcp\.internal$/)
    if (match) map[match[1]] = p.id
  }
  return map
}

// ==================== Insert Threads ====================

async function insertThreads(groupMap, personaMap, profileMap) {
  const threadSlugs = [] // Capture slugs for reply targeting
  let inserted = 0

  for (const t of data.threads) {
    const persona = personaMap[t.author]
    const profileId = profileMap[t.author]
    if (!persona) { console.log(`  ⚠️  Persona "${t.author}" not found, skipping thread`); threadSlugs.push(null); continue }
    if (!profileId) { console.log(`  ⚠️  Profile for "${t.author}" not found, skipping thread`); threadSlugs.push(null); continue }

    const slug = threadSlug(t.title)
    const groupId = groupMap[t.group] || groupMap['general'] || null
    const createdAt = daysAgo(t.days_ago || 1)

    const { data: thread, error } = await db.from('community_threads').insert({
      user_id: profileId,
      title: t.title,
      slug,
      body: t.body,
      category: t.group || 'general',
      group_id: groupId,
      view_count: 20 + Math.floor(Math.random() * 180),
      created_at: createdAt,
      updated_at: createdAt,
    }).select('id, slug').single()

    if (error) {
      console.log(`  ❌ Thread "${t.title.slice(0, 50)}": ${error.message}`)
      threadSlugs.push(null)
      continue
    }

    // Track conversation
    await db.from('persona_conversations').insert({
      thread_id: thread.id,
      persona_id: persona.id,
      action: 'created_thread',
      content_preview: t.title.slice(0, 200),
    })

    // Update persona stats
    await db.from('community_personas').update({
      thread_count: (persona.thread_count || 0) + 1,
      last_active_at: createdAt,
    }).eq('id', persona.id)
    persona.thread_count = (persona.thread_count || 0) + 1

    threadSlugs.push(thread.slug)
    inserted++
    console.log(`  ✅ [${t.author}] "${t.title.slice(0, 60)}" → /forum/${thread.slug}`)
  }

  console.log(`\n📝 Threads inserted: ${inserted}/${data.threads.length}\n`)
  return threadSlugs
}

// ==================== Queue Replies ====================

async function queueReplies(threadSlugs, personaMap) {
  let queued = 0

  for (let i = 0; i < data.replies.length; i++) {
    const r = data.replies[i]
    const threadSlug = threadSlugs[r.thread_idx]

    if (!threadSlug) {
      console.log(`  ⚠️  Reply ${i}: thread_idx ${r.thread_idx} has no slug, skipping`)
      continue
    }

    if (!personaMap[r.author]) {
      console.log(`  ⚠️  Reply ${i}: persona "${r.author}" not found, skipping`)
      continue
    }

    // Stagger replies: each reply gets scheduled_at offset from now
    // Base: 2 hours from now, then +2 hours per reply for natural spacing
    const scheduledAt = hoursFromNow(2 + (i * 2) + (r.offset_hours || 0))

    const { error } = await db.from('persona_content_queue').insert({
      persona_slug: r.author,
      content_type: 'reply',
      body: r.body,
      target_thread_slug: threadSlug,
      scheduled_at: scheduledAt,
      status: 'queued',
    })

    if (error) {
      console.log(`  ❌ Reply ${i} [${r.author}]: ${error.message}`)
      continue
    }

    queued++
    const scheduledDate = new Date(scheduledAt)
    console.log(`  📬 [${r.author}] reply to thread ${r.thread_idx} → scheduled ${scheduledDate.toLocaleDateString()} ${scheduledDate.toLocaleTimeString()}`)
  }

  console.log(`\n📬 Replies queued: ${queued}/${data.replies.length}`)
}

// ==================== Queue Future Threads ====================

async function queueFutureThreads(personaMap) {
  // Generate some additional future threads to keep the queue fed
  // These are simpler topics that will be posted over the next 2 weeks
  const futureThreads = [
    { persona_slug: 'kira-tanaka', title: 'Weekly thread: What are you building? (Week of March 10)', body: 'Drop in and share what you\'re working on this week! Big or small — new SWITCH files, client projects, experiments, learning something new — all welcome.\n\nI\'ll start — I\'m working on improving the community onboarding experience. New members should have an easier time finding the right group for their questions.\n\nWhat about you all?', group_slug: 'general', days_offset: 7 },
    { persona_slug: 'kira-tanaka', title: 'Weekly thread: What are you building? (Week of March 17)', body: 'Another week, another round of builds! What\'s on your workbench?\n\nI spent last week talking to some of you about pain points and I see a pattern — a lot of people want better debugging tools for SWITCH files. That feedback is being heard.\n\nShare your updates below!', group_slug: 'general', days_offset: 14 },
    { persona_slug: 'marcus-chen', title: 'Pattern: idempotent SWITCH files for production reliability', body: 'A SWITCH file that can be safely re-run without creating duplicate records. This matters more than people realize.\n\nThe pattern:\n\n```json\n{\n  "name": "idempotent-upsert",\n  "steps": [\n    {\n      "name": "check_exists",\n      "action": "supabase_query",\n      "inputs": {"table": "customers", "select": "id", "filters": {"email": "{{inputs.email}}"}}\n    },\n    {\n      "name": "skip_if_exists",\n      "action": "internal:condition",\n      "inputs": {"expression": "{{step.check_exists.output.data.length}}", "cases": {"0": "create_customer"}}\n    },\n    {\n      "name": "create_customer",\n      "action": "stripe_create_customer",\n      "inputs": {"email": "{{inputs.email}}"}\n    }\n  ]\n}\n```\n\nThe condition step checks if a customer already exists. If they do, the workflow skips creation. If not, it creates. Re-running this 100 times produces exactly 1 customer.\n\nThis is especially important for webhook-triggered workflows. Webhooks can fire multiple times for the same event (retry logic). Your SWITCH file MUST handle duplicates gracefully.\n\nRule of thumb: every SWITCH file in production should be idempotent. If it is not, you have a latent bug.', group_slug: 'tutorials', days_offset: 5 },
    { persona_slug: 'tiago-santos', title: 'Client asked me to build a "digital employee" — here\'s what I built', body: 'So I get this call from a client... a real estate agency in Lisbon, 4 agents, small office. The owner says "Tiago, I need a digital employee. Someone who handles all the admin but doesn\'t need a salary."\n\nI laughed but then I thought about it... that\'s basically what 0nMCP does, right? So I built it.\n\nThe "digital employee" (we named her Sofia) does:\n- Receives new property inquiries via form → creates CRM contact → sends property brochure via SendGrid\n- Schedules viewings → Google Calendar event → confirmation email → Slack reminder to the agent\n- After viewing → follow-up email sequence (3 emails over 10 days)\n- Monthly → generate commission reports from Stripe → email to owner\n\n8 SWITCH files total. Runs 24/7. No sick days, no vacation requests, no "oops I forgot to follow up."\n\nThe owner tells me Sofia is their "best employee" and she doesn\'t even know it\'s automation... actually, she probably does know, she just doesn\'t care because the leads are getting followed up.\n\nCost: EUR 0/month for the automation + whatever the API services cost (mostly within free tiers). Compare to hiring an admin at EUR 1,500/month.\n\nAnyone else building "digital employees" for clients? I feel like this is a whole business model...', group_slug: 'showcase', days_offset: 8 },
    { persona_slug: 'priya-krishnamurthy', title: 'Docker setup for self-hosting 0nMCP serve', body: '## Overview\n\nFor teams that want to self-host the 0nMCP HTTP server — perhaps for webhook handling or as an internal API — here is a production-ready Docker configuration.\n\n## Dockerfile\n\n```dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --production\nCOPY . .\nEXPOSE 3001\nHEALTHCHECK --interval=30s --timeout=10s \\\n  CMD wget -qO- http://localhost:3001/health || exit 1\nCMD ["node", "index.js", "serve", "--port", "3001"]\n```\n\n## Docker Compose\n\n```yaml\nversion: "3.8"\nservices:\n  0nmcp:\n    build: .\n    ports:\n      - "3001:3001"\n    environment:\n      - NODE_ENV=production\n    volumes:\n      - ./connections:/root/.0n/connections:ro\n    restart: unless-stopped\n```\n\n## Key Points\n\n- Mount the `.0n/connections/` directory as a read-only volume. Credentials stay on the host — not baked into the image.\n- The health check endpoint `/health` returns 200 when the server is ready. This integrates with Docker health monitoring and orchestrators like Kubernetes.\n- Alpine base image keeps the image size under 200MB.\n- `npm ci --production` excludes dev dependencies — reducing the attack surface.\n\n## Security Considerations\n\n- Do NOT expose port 3001 to the public internet without a reverse proxy (nginx, Caddy, Traefik) that handles TLS.\n- Set `CRON_SECRET` for authenticated cron endpoints.\n- Consider network policies to restrict which services can reach the container.\n\nHas anyone deployed this in Kubernetes? I have a Helm chart draft but it needs testing.', group_slug: 'tutorials', days_offset: 10 },
    { persona_slug: 'adaeze-okafor', title: 'I made my first $100 from automation!! 🎉', body: 'ok this is a small win but it means EVERYTHING to me!!\n\nso I built a SWITCH file for a local business here in Lagos — a restaurant that takes orders via Instagram DMs (don\'t ask, it\'s a Lagos thing lol). the workflow:\n\n1. Instagram webhook catches new DM\n2. Extracts the order details\n3. Creates a record in their Supabase table\n4. Sends confirmation back via Instagram API\n5. Notifies the kitchen on WhatsApp (via Twilio)\n\nthey\'re paying me $100/month to maintain it!! that\'s my first recurring revenue from automation and I\'m SO hyped 🥳\n\nI know it\'s not Jake\'s $3,200/month numbers but I literally started learning to code 8 months ago and now I have PAYING CLIENTS from automation?? what is this timeline??\n\nthe 0nMCP community genuinely taught me most of what I know about connecting services. you all are amazing and I just wanted to share this win\n\nnext goal: 5 clients. if I can get 5 businesses paying $100-200/month for automation that\'s... actually a livable income here. let\'s go!! 💪', group_slug: 'showcase', days_offset: 12 },
    { persona_slug: 'nate-crawford', title: 'Convention over configuration: what 0nMCP gets right (and wrong)', body: 'Those of you who know me know I come from Rails — where "convention over configuration" isn\'t just a principle, it\'s practically a religion. So let me evaluate 0nMCP through that lens.\n\n**What it gets right:**\n\n- `~/.0n/connections/` — one directory, one file per service. You don\'t configure where credentials go. There\'s one place. Convention.\n- `engine import` auto-detects key patterns from .env files. You don\'t tell it \"this is a Stripe key\" — it recognizes the naming convention. Smart.\n- SWITCH file schema validation via 0n-spec. If you follow the convention, your workflow is valid. If you deviate, you get a clear error.\n\n**What it gets wrong (or hasn\'t gotten to yet):**\n\n- No standard directory structure for projects. Rails has `app/`, `db/`, `config/`, `lib/`. Where do my SWITCH files go? `./workflows/`? `./automations/`? `~/.0n/workflows/`? The global directory exists but project-level conventions are undefined.\n- No generators. `rails generate model User` creates the model, migration, test file, and factory. `0nmcp generate workflow new-customer` doesn\'t exist — but it should.\n- No scaffold for common patterns. \"Client onboarding\" should be a template, not something you write from scratch.\n\nI suspect the marketplace will solve some of this (pre-built workflows = scaffolds). But for local development, I want `0nmcp new project-name` to create a project skeleton with sensible defaults.\n\nAs DHH said (and I quote him too often, I know): \"The best frameworks make the 80% case effortless.\" 0nMCP is close. The last 20% is convention.', group_slug: 'feature-requests', days_offset: 6 },
  ]

  let queued = 0
  for (const ft of futureThreads) {
    if (!personaMap[ft.persona_slug]) {
      console.log(`  ⚠️  Persona "${ft.persona_slug}" not found, skipping future thread`)
      continue
    }

    const scheduledAt = hoursFromNow(ft.days_offset * 24)

    const { error } = await db.from('persona_content_queue').insert({
      persona_slug: ft.persona_slug,
      content_type: 'thread',
      title: ft.title,
      body: ft.body,
      group_slug: ft.group_slug,
      scheduled_at: scheduledAt,
      status: 'queued',
    })

    if (error) {
      console.log(`  ❌ Future thread [${ft.persona_slug}]: ${error.message}`)
      continue
    }

    queued++
    const scheduledDate = new Date(scheduledAt)
    console.log(`  🗓️  [${ft.persona_slug}] "${ft.title.slice(0, 50)}" → scheduled ${scheduledDate.toLocaleDateString()}`)
  }

  console.log(`\n🗓️  Future threads queued: ${queued}/${futureThreads.length}`)
}

// ==================== Main ====================

async function main() {
  console.log('🚀 0nMCP Forum — Wave 4 Seeder\n')
  console.log('─'.repeat(60))

  // Load maps
  console.log('\n📊 Loading groups, personas, profiles...')
  const groupMap = await getGroupMap()
  const personaMap = await getPersonaMap()
  const profileMap = await getProfileMap()

  console.log(`   Groups: ${Object.keys(groupMap).length}`)
  console.log(`   Personas: ${Object.keys(personaMap).length}`)
  console.log(`   Profiles: ${Object.keys(profileMap).length}\n`)

  if (Object.keys(personaMap).length === 0) {
    console.error('❌ No personas found. Run seed-hardcoded.mjs first.')
    process.exit(1)
  }

  // Phase 1: Insert threads directly
  console.log('─'.repeat(60))
  console.log('📝 Phase 1: Inserting threads directly into forum...\n')
  const threadSlugs = await insertThreads(groupMap, personaMap, profileMap)

  // Phase 2: Queue replies with staggered schedules
  console.log('─'.repeat(60))
  console.log('📬 Phase 2: Queuing replies to persona_content_queue...\n')
  await queueReplies(threadSlugs, personaMap)

  // Phase 3: Queue future threads
  console.log('\n' + '─'.repeat(60))
  console.log('🗓️  Phase 3: Queuing future threads...\n')
  await queueFutureThreads(personaMap)

  console.log('\n' + '─'.repeat(60))
  console.log('✅ Wave 4 seeding complete!')
  console.log('   - Threads: posted immediately to forum')
  console.log('   - Replies: queued with staggered schedule (cron processes every 2 hours)')
  console.log('   - Future threads: queued for next 1-2 weeks')
  console.log('─'.repeat(60))
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
