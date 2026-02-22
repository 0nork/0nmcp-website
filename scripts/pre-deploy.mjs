#!/usr/bin/env node
// ============================================================
// 0n Auto-Migrate Deploy Protocol — Pre-Deploy Script
// ============================================================
// Runs BEFORE `next build` at Vercel build time.
// Applies pending Supabase migrations via Management API.
// Skips gracefully if env vars are missing (local dev).
// ============================================================

import { readdir, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const PROJECT_NAME = process.env.npm_package_name || '0nmcp-website'
const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations')
const API_BASE = 'https://api.supabase.com'

const PREFIX = '[pre-deploy]'

// ── Helpers ──────────────────────────────────────────────────

function log(...args) {
  console.log(PREFIX, ...args)
}

function logError(...args) {
  console.error(PREFIX, 'ERROR:', ...args)
}

function sha256(content) {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ── Supabase Management API ─────────────────────────────────

async function executeSql(sql, retries = 3) {
  const url = `${API_BASE}/v1/projects/${PROJECT_REF}/database/query`
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`HTTP ${res.status}: ${body}`)
      }
      return await res.json()
    } catch (err) {
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
        log(`Retry ${attempt}/${retries} in ${delay}ms...`)
        await sleep(delay)
      } else {
        throw err
      }
    }
  }
}

// ── Tracking Table ──────────────────────────────────────────

async function bootstrapTrackingTable() {
  await executeSql(`
    CREATE TABLE IF NOT EXISTS _0n_migrations (
      id            SERIAL PRIMARY KEY,
      filename      TEXT NOT NULL,
      project_name  TEXT NOT NULL,
      checksum      TEXT NOT NULL,
      applied_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      applied_by    TEXT DEFAULT 'vercel-build',
      duration_ms   INTEGER,
      success       BOOLEAN NOT NULL DEFAULT true,
      error_message TEXT,
      UNIQUE(filename, project_name)
    );
  `)
  log('Tracking table ready')
}

// ── Advisory Lock ───────────────────────────────────────────

async function acquireLock() {
  log('Acquiring advisory lock...')
  const result = await executeSql(
    `SELECT pg_try_advisory_lock(hashtext('_0n_migrations_lock')) AS locked;`
  )
  const locked = result?.[0]?.locked ?? result?.locked
  if (!locked) {
    // Wait and retry up to 60s
    const start = Date.now()
    while (Date.now() - start < 60000) {
      await sleep(2000)
      const retry = await executeSql(
        `SELECT pg_try_advisory_lock(hashtext('_0n_migrations_lock')) AS locked;`
      )
      const retryLocked = retry?.[0]?.locked ?? retry?.locked
      if (retryLocked) {
        log('Advisory lock acquired (after wait)')
        return
      }
    }
    throw new Error('Could not acquire advisory lock after 60s')
  }
  log('Advisory lock acquired')
}

async function releaseLock() {
  await executeSql(
    `SELECT pg_advisory_unlock(hashtext('_0n_migrations_lock'));`
  )
  log('Advisory lock released')
}

// ── Migration Logic ─────────────────────────────────────────

async function getAppliedMigrations() {
  const result = await executeSql(`
    SELECT filename, checksum FROM _0n_migrations
    WHERE project_name = '${PROJECT_NAME}' AND success = true
    ORDER BY filename;
  `)
  // Management API returns array of rows
  if (Array.isArray(result)) return result
  return []
}

async function getLocalMigrations() {
  let files
  try {
    files = await readdir(MIGRATIONS_DIR)
  } catch {
    log('No supabase/migrations/ directory found — skipping')
    return []
  }

  const sqlFiles = files
    .filter(f => f.endsWith('.sql'))
    .sort()

  const migrations = []
  for (const filename of sqlFiles) {
    const filepath = join(MIGRATIONS_DIR, filename)
    const info = await stat(filepath)
    if (info.size === 0) {
      log(`Skipping empty file: ${filename}`)
      continue
    }
    const content = await readFile(filepath, 'utf8')
    migrations.push({
      filename,
      content,
      checksum: sha256(content),
    })
  }
  return migrations
}

async function backfillExisting(localMigrations) {
  log(`First run — backfilling ${localMigrations.length} existing migrations`)
  for (const m of localMigrations) {
    await executeSql(`
      INSERT INTO _0n_migrations (filename, project_name, checksum, applied_by, duration_ms, success)
      VALUES ('${m.filename}', '${PROJECT_NAME}', '${m.checksum}', 'backfill', 0, true)
      ON CONFLICT (filename, project_name) DO NOTHING;
    `)
  }
  log(`Backfilled ${localMigrations.length} migrations`)
}

async function applyMigration(filename, sql, checksum) {
  const start = Date.now()
  try {
    await executeSql(sql, 1) // No retry on SQL errors
    const duration = Date.now() - start
    await executeSql(`
      INSERT INTO _0n_migrations (filename, project_name, checksum, duration_ms, success)
      VALUES ('${filename}', '${PROJECT_NAME}', '${checksum}', ${duration}, true)
      ON CONFLICT (filename, project_name) DO UPDATE SET
        checksum = EXCLUDED.checksum,
        applied_at = now(),
        duration_ms = EXCLUDED.duration_ms,
        success = true,
        error_message = NULL;
    `)
    log(`Applied: ${filename} (${duration}ms)`)
    return true
  } catch (err) {
    const duration = Date.now() - start
    const errorMsg = String(err.message || err).replace(/'/g, "''")
    try {
      await executeSql(`
        INSERT INTO _0n_migrations (filename, project_name, checksum, duration_ms, success, error_message)
        VALUES ('${filename}', '${PROJECT_NAME}', '${checksum}', ${duration}, false, '${errorMsg}')
        ON CONFLICT (filename, project_name) DO UPDATE SET
          checksum = EXCLUDED.checksum,
          applied_at = now(),
          duration_ms = EXCLUDED.duration_ms,
          success = false,
          error_message = '${errorMsg}';
      `)
    } catch {
      // If we can't even record the failure, just log it
    }
    logError(`Failed: ${filename} — ${err.message}`)
    return false
  }
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  log(`Project: ${PROJECT_NAME}`)

  // Skip if env vars missing (local dev)
  if (!PROJECT_REF || !ACCESS_TOKEN) {
    log('SUPABASE_PROJECT_REF or SUPABASE_ACCESS_TOKEN not set — skipping migrations')
    process.exit(0)
  }

  log(`Supabase project: ${PROJECT_REF}`)

  // Get local migrations
  const localMigrations = await getLocalMigrations()
  if (localMigrations.length === 0) {
    log('No migration files found — skipping')
    process.exit(0)
  }
  log(`Found ${localMigrations.length} local migration file(s)`)

  // Bootstrap tracking table
  await bootstrapTrackingTable()

  // Acquire lock
  await acquireLock()

  let exitCode = 0
  try {
    // Check applied migrations
    const applied = await getAppliedMigrations()
    const appliedMap = new Map(applied.map(r => [r.filename, r.checksum]))

    // First-run detection: 0 applied rows means backfill
    if (appliedMap.size === 0) {
      await backfillExisting(localMigrations)
      log('Backfill complete — no migrations to run')
      return
    }

    // Checksum verification for already-applied migrations
    for (const m of localMigrations) {
      const existingChecksum = appliedMap.get(m.filename)
      if (existingChecksum && existingChecksum !== m.checksum) {
        logError(`Checksum mismatch for ${m.filename}!`)
        logError(`  Expected: ${existingChecksum}`)
        logError(`  Got:      ${m.checksum}`)
        logError('An already-applied migration was modified. This is not allowed.')
        exitCode = 1
        return
      }
    }

    // Find pending migrations
    const pending = localMigrations.filter(m => !appliedMap.has(m.filename))

    if (pending.length === 0) {
      log('All migrations already applied — nothing to do')
      return
    }

    log(`${pending.length} pending migration(s)`)

    // Apply each pending migration
    for (const m of pending) {
      const success = await applyMigration(m.filename, m.content, m.checksum)
      if (!success) {
        exitCode = 1
        return
      }
    }

    log(`All ${pending.length} migration(s) applied successfully`)
  } finally {
    await releaseLock()
  }

  process.exit(exitCode)
}

main().catch(err => {
  logError('Unexpected error:', err.message)
  process.exit(1)
})
