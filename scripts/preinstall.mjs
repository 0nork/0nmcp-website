#!/usr/bin/env node

/**
 * 0nSeal — Preinstall Lockfile Integrity Check
 * Runs before every `npm install` to block known malicious packages
 *
 * Usage: node scripts/preinstall.mjs
 * Configured via package.json "preinstall" script
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

// ─── Blocked Packages (exact name@version) ───────────────────────────────────

const BLOCKED_EXACT = new Map([
  ['axios@1.14.1', 'Supply chain attack — credential exfiltration'],
  ['axios@0.30.4', 'Supply chain attack — credential exfiltration'],
  ['event-stream@3.3.6', 'Contained flatmap-stream cryptocurrency stealer'],
  ['flatmap-stream@0.1.1', 'Cryptocurrency wallet stealer'],
  ['ua-parser-js@0.7.29', 'Cryptominer + password stealer'],
  ['coa@2.0.3', 'Credential stealer'],
  ['coa@2.0.4', 'Credential stealer'],
  ['rc@1.2.9', 'Credential stealer'],
  ['rc@1.3.9', 'Credential stealer'],
  ['colors@1.4.1', 'Sabotaged — infinite loop DoS'],
  ['faker@6.6.6', 'Sabotaged — breaks dependents'],
  ['node-ipc@10.1.1', 'Protestware — geolocation file destruction'],
  ['node-ipc@10.1.2', 'Protestware — geolocation file destruction'],
  ['node-ipc@10.1.3', 'Protestware — geolocation file destruction'],
  ['peacenotwar@9.1.3', 'Geolocation-based file destruction'],
  ['peacenotwar@9.1.5', 'Geolocation-based file destruction'],
]);

const BLOCKED_NAMES = new Map([
  ['plain-crypto-js', 'Typosquat of crypto-js — steals private keys'],
]);

// ─── Typosquat Patterns ─────────────────────────────────────────────────────

const TYPOSQUATTER_PATTERNS = [
  { pattern: /^loadsh$/, description: 'lodash typo' },
  { pattern: /^axois$/, description: 'axios typo' },
  { pattern: /^expresss$/, description: 'express typo' },
  { pattern: /^requets$/, description: 'requests typo' },
  { pattern: /^cross-env\d/, description: 'cross-env variant' },
  { pattern: /^crossenv$/, description: 'cross-env without hyphen' },
  { pattern: /^babelcli$/, description: '@babel/cli typo' },
  { pattern: /^mongose$/, description: 'mongoose typo' },
  { pattern: /^electorn$/, description: 'electron typo' },
  { pattern: /^reaact$/, description: 'react typo' },
  { pattern: /^strpe$/, description: 'stripe typo' },
  { pattern: /^stripee$/, description: 'stripe typo' },
  { pattern: /^nextt$/, description: 'next typo' },
  { pattern: /^plain-crypto-js$/, description: 'crypto-js typosquat' },
];

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const lockfilePath = join(process.cwd(), 'package-lock.json');

  console.log('\n  0nSeal — Preinstall Security Check\n');

  if (!existsSync(lockfilePath)) {
    console.log('  No package-lock.json found. Skipping.\n');
    return;
  }

  let raw;
  try {
    raw = readFileSync(lockfilePath, 'utf-8');
  } catch (err) {
    console.error('  Failed to read lockfile:', err.message);
    return;
  }

  const sha256 = createHash('sha256').update(raw).digest('hex');

  let lockfile;
  try {
    lockfile = JSON.parse(raw);
  } catch {
    console.error('  Failed to parse package-lock.json\n');
    process.exit(1);
  }

  const blocked = [];
  const typosquats = [];
  const suspicious = [];
  let packageCount = 0;

  const packages = lockfile.packages || {};

  for (const [pkgPath, info] of Object.entries(packages)) {
    if (!pkgPath || pkgPath === '') continue;
    packageCount++;

    const name = pkgPath.replace(/^node_modules\//, '');
    const version = info.version || 'unknown';
    const resolved = info.resolved || '';

    // Check exact blocked
    const exactKey = `${name}@${version}`;
    if (BLOCKED_EXACT.has(exactKey)) {
      blocked.push({ name, version, reason: BLOCKED_EXACT.get(exactKey) });
    }

    // Check name-only blocked
    const baseName = name.startsWith('@') ? name : name.split('/').pop() || name;
    if (BLOCKED_NAMES.has(baseName)) {
      blocked.push({ name, version, reason: BLOCKED_NAMES.get(baseName) });
    }

    // Check typosquatters
    for (const { pattern, description } of TYPOSQUATTER_PATTERNS) {
      if (pattern.test(baseName)) {
        typosquats.push({ name, version, pattern: description });
        break;
      }
    }

    // Check suspicious URLs
    if (resolved) {
      const isSuspicious =
        (resolved.startsWith('http') && !resolved.includes('registry.npmjs.org')) ||
        /\.(ru|cn)\//.test(resolved) ||
        /pastebin\.com/.test(resolved) ||
        /bit\.ly|tinyurl\.com/.test(resolved);

      if (isSuspicious) {
        suspicious.push({ name, version, url: resolved });
      }
    }
  }

  // Report
  console.log(`  Packages scanned: ${packageCount}`);
  console.log(`  Lockfile SHA-256: ${sha256.substring(0, 16)}...`);

  if (blocked.length > 0) {
    console.log(`\n  BLOCKED (${blocked.length}):`);
    for (const pkg of blocked) {
      console.log(`    ${pkg.name}@${pkg.version} — ${pkg.reason}`);
    }
  }

  if (typosquats.length > 0) {
    console.log(`\n  TYPOSQUATS (${typosquats.length}):`);
    for (const pkg of typosquats) {
      console.log(`    ${pkg.name}@${pkg.version} — ${pkg.pattern}`);
    }
  }

  if (suspicious.length > 0) {
    console.log(`\n  SUSPICIOUS URLs (${suspicious.length}):`);
    for (const pkg of suspicious) {
      console.log(`    ${pkg.name}@${pkg.version} — ${pkg.url}`);
    }
  }

  // Block on malicious
  if (blocked.length > 0 || typosquats.length > 0) {
    console.log('\n  INSTALL BLOCKED — malicious or typosquatted packages detected');
    console.log('  Remove the flagged packages and try again.\n');
    process.exit(1);
  }

  // Warn on suspicious (don't block)
  if (suspicious.length > 0) {
    console.log('\n  WARNING: Suspicious packages detected but not blocked.');
    console.log('  Review the URLs above and verify they are legitimate.\n');
  } else {
    console.log('\n  0nSeal: PASSED\n');
  }
}

main();
