#!/usr/bin/env node
/**
 * 0nMCP Forum Seeder — Wave 2
 * Reads seed-wave2-data.json and inserts threads + replies into Supabase.
 *
 * Usage: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/seed-wave2.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ==================== Config ====================

const SUPABASE_URL = 'https://yaehbwimocvvnnlojkxe.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZWhid2ltb2N2dm5ubG9qa3hlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU2MDUwOSwiZXhwIjoyMDg2MTM2NTA5fQ.XPpbmQZmqjMe7GheA6HBbyfuqQy9KxdT7DqdjBYrKlI'
const db = createClient(SUPABASE_URL, SUPABASE_KEY)

// ==================== Profile ID Mappings ====================

const PROFILE_IDS = {
  'kira-tanaka': 'bd817aee-0d26-4bb4-be06-a4f4eb74da3a',
  'marcus-chen': '71865cc1-cad0-4556-8dd9-495b26d9862c',
  'adaeze-okafor': '3fe27d43-bc05-48f5-ba2e-2773584c4cec',
  'jake-holloway': '21163236-cb37-451d-ad22-3dc14dc86898',
  'priya-krishnamurthy': 'c63a9d01-bc16-45c8-a60d-c9f99ea60184',
  'tiago-santos': 'c6739515-831c-43dc-9105-43718b747f51',
  'elena-voronova': 'eda212f3-d14f-4af3-95f8-d10d85c0a588',
  'soo-jin-park': 'a4bec727-9ed7-4e1b-89bd-6c0e71e6a1a8',
  'arjun-mehta': '8eb4311a-f252-4dc0-9548-55f37d332aae',
  'sam-rivera': '52990976-e22d-4e23-a184-71724b9d8289',
  'yael-goldstein': 'b2c93f0c-0ee9-4010-85a8-a35d49167905',
  'nate-crawford': '87f3df96-58ef-4a17-8b8e-089ed6343195',
  'olivia-pearce': '644899ce-2dd8-4dee-8a1a-789d098b539a',
}

// ==================== Group ID Mappings ====================

const GROUP_IDS = {
  'general': '3005b39b-d210-4226-9657-dc11de004e47',
  'help': 'eecc2ee6-a4d9-4df8-a781-7ffd2ec84801',
  'showcase': '6fb88c4f-bbdb-4022-b234-24c67e67f87a',
  'feature-requests': '1ab84d8a-4570-411f-bdc2-650f88b55f81',
  'tutorials': '8f591768-0033-43ba-ab55-39bf19d48887',
  'integrations': 'b511341e-75bb-4a1e-9d1e-bb5fd00443cb',
  'workflows': '85b0a78d-aa25-4fdc-ab21-3d39040458ab',
  'bug-reports': '51841f2e-f129-45a3-a526-6c7a40431b60',
  'off-topic': 'd059562f-0455-46b0-85b3-b916b10d6a44',
}

// ==================== Helpers ====================

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

function makeSlug(title) {
  const base = slugify(title)
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
  return `${base}-${suffix}`.slice(0, 80)
}

function daysAgoDate(days, offsetHours = 0) {
  const dt = new Date(Date.now() - days * 86400000)
  // Add some randomness to the time
  const hour = Math.floor(Math.random() * 14) + 8 // 8am - 10pm
  const minute = Math.floor(Math.random() * 60)
  const second = Math.floor(Math.random() * 60)
  dt.setHours(hour, minute, second)
  if (offsetHours > 0) {
    dt.setTime(dt.getTime() + offsetHours * 3600000)
  }
  return dt.toISOString()
}

function randomViewCount() {
  return Math.floor(Math.random() * 181) + 20 // 20-200
}

// ==================== Main ====================

async function main() {
  console.log('\n=== 0nMCP Forum Seeder — Wave 2 ===\n')

  // Load data
  const dataPath = join(__dirname, 'seed-wave2-data.json')
  const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

  console.log(`Loaded: ${data.threads.length} threads, ${data.replies.length} replies\n`)

  // ---- Step 1: Insert threads ----
  console.log('STEP 1: Inserting threads...\n')

  const threadRecords = [] // array of { id, created_at } indexed by thread_idx
  let threadCount = 0

  for (let i = 0; i < data.threads.length; i++) {
    const t = data.threads[i]
    const userId = PROFILE_IDS[t.author]
    const groupId = GROUP_IDS[t.group]

    if (!userId) {
      console.log(`  SKIP thread ${i}: no profile for "${t.author}"`)
      threadRecords.push(null)
      continue
    }
    if (!groupId) {
      console.log(`  SKIP thread ${i}: no group for "${t.group}"`)
      threadRecords.push(null)
      continue
    }

    const id = randomUUID()
    const slug = makeSlug(t.title)
    const createdAt = daysAgoDate(t.days_ago)
    const viewCount = randomViewCount()

    const { error } = await db.from('community_threads').insert({
      id,
      title: t.title,
      body: t.body,
      slug,
      user_id: userId,
      group_id: groupId,
      is_pinned: false,
      is_locked: false,
      view_count: viewCount,
      reply_count: 0,
      created_at: createdAt,
      updated_at: createdAt,
    })

    if (error) {
      console.error(`  ERROR thread ${i} "${t.title.slice(0, 40)}...": ${error.message}`)
      threadRecords.push(null)
      continue
    }

    threadRecords.push({ id, created_at: createdAt })
    threadCount++
    console.log(`  + [${t.group}] "${t.title.slice(0, 55)}..." by ${t.author}`)
  }

  console.log(`\n  Inserted ${threadCount} threads\n`)

  // ---- Step 2: Insert replies ----
  console.log('STEP 2: Inserting replies...\n')

  // Track reply counts per thread for later update
  const replyCounts = {} // thread_id -> count
  const lastReplyAt = {} // thread_id -> latest reply timestamp

  let replyCount = 0

  for (let i = 0; i < data.replies.length; i++) {
    const r = data.replies[i]
    const threadRec = threadRecords[r.thread_idx]

    if (!threadRec) {
      console.log(`  SKIP reply ${i}: thread_idx ${r.thread_idx} not found`)
      continue
    }

    const userId = PROFILE_IDS[r.author]
    if (!userId) {
      console.log(`  SKIP reply ${i}: no profile for "${r.author}"`)
      continue
    }

    const threadTime = new Date(threadRec.created_at).getTime()
    const replyTime = new Date(threadTime + r.offset_hours * 3600000)

    // Don't create replies in the future
    if (replyTime > new Date()) {
      console.log(`  SKIP reply ${i}: would be in the future`)
      continue
    }

    const replyTimestamp = replyTime.toISOString()
    const id = randomUUID()

    const { error } = await db.from('community_posts').insert({
      id,
      thread_id: threadRec.id,
      user_id: userId,
      body: r.body,
      created_at: replyTimestamp,
      updated_at: replyTimestamp,
    })

    if (error) {
      console.error(`  ERROR reply ${i} by ${r.author}: ${error.message}`)
      continue
    }

    // Track counts
    replyCounts[threadRec.id] = (replyCounts[threadRec.id] || 0) + 1
    if (!lastReplyAt[threadRec.id] || replyTimestamp > lastReplyAt[threadRec.id]) {
      lastReplyAt[threadRec.id] = replyTimestamp
    }

    replyCount++
    const threadTitle = data.threads[r.thread_idx]?.title || '???'
    console.log(`  + ${r.author} -> "${threadTitle.slice(0, 45)}..."`)
  }

  console.log(`\n  Inserted ${replyCount} replies\n`)

  // ---- Step 3: Update thread reply counts and updated_at ----
  console.log('STEP 3: Updating thread reply counts...\n')

  let updateCount = 0
  for (const [threadId, count] of Object.entries(replyCounts)) {
    const updateData = {
      reply_count: count,
    }
    if (lastReplyAt[threadId]) {
      updateData.updated_at = lastReplyAt[threadId]
    }

    const { error } = await db.from('community_threads')
      .update(updateData)
      .eq('id', threadId)

    if (error) {
      console.error(`  ERROR updating thread ${threadId}: ${error.message}`)
      continue
    }

    updateCount++
    console.log(`  ~ thread ${threadId.slice(0, 8)}... reply_count=${count}`)
  }

  console.log(`\n  Updated ${updateCount} threads\n`)

  // ---- Step 4: Update persona stats ----
  console.log('STEP 4: Updating persona stats...\n')

  // Count threads and replies per persona
  const personaThreads = {}
  const personaReplies = {}

  for (const t of data.threads) {
    personaThreads[t.author] = (personaThreads[t.author] || 0) + 1
  }
  for (const r of data.replies) {
    personaReplies[r.author] = (personaReplies[r.author] || 0) + 1
  }

  // Get all unique personas
  const allPersonas = new Set([
    ...Object.keys(personaThreads),
    ...Object.keys(personaReplies),
  ])

  let personaUpdateCount = 0
  for (const slug of allPersonas) {
    const threads = personaThreads[slug] || 0
    const replies = personaReplies[slug] || 0

    // Look up persona by slug
    const { data: persona, error: lookupErr } = await db
      .from('community_personas')
      .select('id, thread_count, reply_count')
      .eq('slug', slug)
      .single()

    if (lookupErr || !persona) {
      console.log(`  SKIP persona "${slug}": not found in community_personas`)
      continue
    }

    // Add wave 2 counts to existing counts
    const newThreadCount = (persona.thread_count || 0) + threads
    const newReplyCount = (persona.reply_count || 0) + replies

    const { error: updateErr } = await db
      .from('community_personas')
      .update({
        thread_count: newThreadCount,
        reply_count: newReplyCount,
        last_active_at: new Date().toISOString(),
      })
      .eq('id', persona.id)

    if (updateErr) {
      console.error(`  ERROR updating persona "${slug}": ${updateErr.message}`)
      continue
    }

    personaUpdateCount++
    console.log(`  ~ ${slug}: ${newThreadCount} threads (+${threads}), ${newReplyCount} replies (+${replies})`)
  }

  console.log(`\n  Updated ${personaUpdateCount} personas\n`)

  // ---- Done ----
  console.log('=== SEEDING COMPLETE ===')
  console.log(`  Threads:  ${threadCount}`)
  console.log(`  Replies:  ${replyCount}`)
  console.log(`  Thread updates: ${updateCount}`)
  console.log(`  Persona updates: ${personaUpdateCount}`)
  console.log('')
}

main().catch(err => {
  console.error('\nFATAL:', err)
  process.exit(1)
})
