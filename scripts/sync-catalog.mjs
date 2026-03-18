#!/usr/bin/env node

/**
 * sync-catalog.mjs — Generate the executable services snapshot from 0nMCP's catalog.
 *
 * Reads:   ~/Github/0nMCP/catalog.js (54 services, real API endpoints)
 *          ~/Github/0nMCP/crm/*.js   (245 CRM tools via registerTools pattern)
 *
 * Writes:  src/data/catalog-snapshot.json
 *
 * Usage:   node scripts/sync-catalog.mjs
 *
 * Run this whenever 0nMCP adds new services, then commit the snapshot.
 * The builder, AI prompt, and Agent Studio execution all read from this file.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const ONMCP_DIR = resolve(process.env.HOME, 'Github/0nMCP')
const OUTPUT_FILE = resolve(import.meta.dirname, '..', 'src/data/catalog-snapshot.json')

// ── Step 1: Read the main catalog ──

let catalog
try {
  catalog = require(join(ONMCP_DIR, 'catalog.js'))
  // Handle different export patterns
  if (catalog.SERVICE_CATALOG) catalog = catalog.SERVICE_CATALOG
  if (catalog.default) catalog = catalog.default
} catch (err) {
  console.error('Failed to load catalog.js:', err.message)
  console.error(`Make sure ${ONMCP_DIR}/catalog.js exists`)
  process.exit(1)
}

// ── Step 2: Extract services + actions ──

const services = []
const serviceNames = Object.keys(catalog)

for (const key of serviceNames) {
  const svc = catalog[key]
  const endpoints = svc.endpoints || {}
  const actions = Object.entries(endpoints).map(([actionId, config]) => {
    const cfg = typeof config === 'object' ? config : {}
    return {
      id: actionId,
      name: actionId
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()),
      method: cfg.method || 'GET',
      path: cfg.path || '',
      description: cfg.description || actionId.replace(/_/g, ' '),
    }
  })

  services.push({
    id: key,
    name: svc.name || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    category: svc.category || 'other',
    base_url: svc.base_url || svc.baseUrl || '',
    auth_type: svc.auth_type || svc.authType || 'api_key',
    actions,
    action_count: actions.length,
  })
}

// ── Step 3: Count CRM module tools ──

let crmToolCount = 0
const crmDir = join(ONMCP_DIR, 'crm')
try {
  const crmFiles = readdirSync(crmDir).filter(f => f.endsWith('.js') && f !== 'helpers.js' && f !== 'index.js')
  for (const file of crmFiles) {
    const content = readFileSync(join(crmDir, file), 'utf-8')
    // Count registerTools() config entries — each { name: ... } block is a tool
    const matches = content.match(/name:\s*['"]/g)
    if (matches) crmToolCount += matches.length
  }
} catch {
  // CRM dir might not exist in some setups
}

// ── Step 4: Build the snapshot ──

const snapshot = {
  $meta: {
    generated_at: new Date().toISOString(),
    source: ONMCP_DIR,
    catalog_services: services.length,
    crm_module_tools: crmToolCount,
    total_tools: services.reduce((sum, s) => sum + s.action_count, 0) + crmToolCount,
    version: '1.0.0',
    description: 'Auto-generated from 0nMCP catalog.js. Do not edit manually.',
  },
  services,
  // Flat lookup: service_id -> [action_ids]
  service_actions: Object.fromEntries(
    services.map(s => [s.id, s.actions.map(a => a.id)])
  ),
  // All service IDs for quick validation
  service_ids: services.map(s => s.id),
}

// ── Step 5: Write the snapshot ──

writeFileSync(OUTPUT_FILE, JSON.stringify(snapshot, null, 2))

console.log(`\n  Catalog Snapshot Generated`)
console.log(`  ─────────────────────────`)
console.log(`  Services:    ${services.length}`)
console.log(`  Actions:     ${services.reduce((sum, s) => sum + s.action_count, 0)}`)
console.log(`  CRM Tools:   ${crmToolCount}`)
console.log(`  Total:       ${snapshot.$meta.total_tools}`)
console.log(`  Output:      ${OUTPUT_FILE}`)
console.log(`  Timestamp:   ${snapshot.$meta.generated_at}\n`)

// Print service summary
console.log(`  Services:`)
for (const svc of services) {
  console.log(`    ${svc.id.padEnd(20)} ${String(svc.action_count).padStart(3)} actions   ${svc.name}`)
}
console.log()
