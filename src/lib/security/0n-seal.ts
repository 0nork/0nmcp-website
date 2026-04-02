/**
 * 0nDefender — Lockfile Integrity Enforcer (0nSeal)
 * Standalone script that can also be imported as a module
 * Verifies lockfile integrity before npm install
 *
 * Usage as script: node src/lib/security/0n-seal.ts
 * Usage as module: import { verifyLockfileIntegrity } from './0n-seal'
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SealVerification {
  valid: boolean;
  lockfileExists: boolean;
  packageCount: number;
  blockedFound: BlockedPackage[];
  typosquatsFound: TyposquatMatch[];
  integrityMissing: string[];
  suspiciousUrls: SuspiciousUrl[];
  sha256: string | null;
}

export interface BlockedPackage {
  name: string;
  version: string;
  reason: string;
}

export interface TyposquatMatch {
  name: string;
  version: string;
  pattern: string;
}

export interface SuspiciousUrl {
  name: string;
  version: string;
  url: string;
}

// ─── Blocked Packages (exact name@version) ───────────────────────────────────

const BLOCKED_EXACT: Map<string, string> = new Map([
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

const BLOCKED_NAMES: Map<string, string> = new Map([
  ['plain-crypto-js', 'Typosquat of crypto-js — steals private keys'],
]);

// ─── Typosquat Patterns ─────────────────────────────────────────────────────

const TYPOSQUATTER_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
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

// ─── Core Verification ──────────────────────────────────────────────────────

export function verifyLockfileIntegrity(lockfilePath?: string): SealVerification {
  const resolvedPath = lockfilePath || join(process.cwd(), 'package-lock.json');

  if (!existsSync(resolvedPath)) {
    return {
      valid: true,
      lockfileExists: false,
      packageCount: 0,
      blockedFound: [],
      typosquatsFound: [],
      integrityMissing: [],
      suspiciousUrls: [],
      sha256: null,
    };
  }

  const raw = readFileSync(resolvedPath, 'utf-8');
  const sha256 = createHash('sha256').update(raw).digest('hex');

  let lockfile: {
    packages?: Record<string, { version?: string; resolved?: string; integrity?: string }>;
  };

  try {
    lockfile = JSON.parse(raw);
  } catch {
    return {
      valid: false,
      lockfileExists: true,
      packageCount: 0,
      blockedFound: [{ name: 'lockfile', version: 'N/A', reason: 'Failed to parse package-lock.json' }],
      typosquatsFound: [],
      integrityMissing: [],
      suspiciousUrls: [],
      sha256,
    };
  }

  const blockedFound: BlockedPackage[] = [];
  const typosquatsFound: TyposquatMatch[] = [];
  const integrityMissing: string[] = [];
  const suspiciousUrls: SuspiciousUrl[] = [];
  let packageCount = 0;

  const packages = lockfile.packages || {};

  for (const [pkgPath, info] of Object.entries(packages)) {
    if (!pkgPath || pkgPath === '') continue;
    packageCount++;

    const name = pkgPath.replace(/^node_modules\//, '');
    const version = info.version || 'unknown';

    // Check exact blocked
    const exactKey = `${name}@${version}`;
    if (BLOCKED_EXACT.has(exactKey)) {
      blockedFound.push({ name, version, reason: BLOCKED_EXACT.get(exactKey)! });
    }

    // Check name-only blocked
    const baseName = name.startsWith('@') ? name : name.split('/').pop() || name;
    if (BLOCKED_NAMES.has(baseName)) {
      blockedFound.push({ name, version, reason: BLOCKED_NAMES.get(baseName)! });
    }

    // Check typosquatters
    for (const { pattern, description } of TYPOSQUATTER_PATTERNS) {
      if (pattern.test(baseName)) {
        typosquatsFound.push({ name, version, pattern: description });
        break;
      }
    }

    // Check integrity
    if (!info.integrity && info.resolved && info.resolved.startsWith('http')) {
      integrityMissing.push(`${name}@${version}`);
    }

    // Check suspicious resolved URLs
    if (info.resolved) {
      const suspicious =
        (info.resolved.startsWith('http') && !info.resolved.includes('registry.npmjs.org')) ||
        /\.(ru|cn)\//.test(info.resolved) ||
        /pastebin\.com/.test(info.resolved) ||
        /bit\.ly|tinyurl\.com/.test(info.resolved);

      if (suspicious) {
        suspiciousUrls.push({ name, version, url: info.resolved });
      }
    }
  }

  const valid = blockedFound.length === 0 && typosquatsFound.length === 0;

  return {
    valid,
    lockfileExists: true,
    packageCount,
    blockedFound,
    typosquatsFound,
    integrityMissing,
    suspiciousUrls,
    sha256,
  };
}

// ─── CLI Execution ───────────────────────────────────────────────────────────

const isDirectRun = process.argv[1]?.endsWith('0n-seal.ts') || process.argv[1]?.endsWith('0n-seal.js');

if (isDirectRun) {
  const result = verifyLockfileIntegrity();

  console.log('\n=== 0nSeal Lockfile Integrity Check ===\n');

  if (!result.lockfileExists) {
    console.log('No package-lock.json found. Skipping.\n');
    process.exit(0);
  }

  console.log(`Packages scanned: ${result.packageCount}`);
  console.log(`SHA-256: ${result.sha256}`);

  if (result.blockedFound.length > 0) {
    console.log(`\n  BLOCKED PACKAGES (${result.blockedFound.length}):`);
    for (const pkg of result.blockedFound) {
      console.log(`    ${pkg.name}@${pkg.version} — ${pkg.reason}`);
    }
  }

  if (result.typosquatsFound.length > 0) {
    console.log(`\n  TYPOSQUATS DETECTED (${result.typosquatsFound.length}):`);
    for (const pkg of result.typosquatsFound) {
      console.log(`    ${pkg.name}@${pkg.version} — ${pkg.pattern}`);
    }
  }

  if (result.suspiciousUrls.length > 0) {
    console.log(`\n  SUSPICIOUS URLs (${result.suspiciousUrls.length}):`);
    for (const pkg of result.suspiciousUrls) {
      console.log(`    ${pkg.name}@${pkg.version} — ${pkg.url}`);
    }
  }

  if (result.integrityMissing.length > 0) {
    console.log(`\n  Missing integrity hashes: ${result.integrityMissing.length}`);
  }

  if (result.valid) {
    console.log('\n  Lockfile integrity: PASSED\n');
    process.exit(0);
  } else {
    console.log('\n  Lockfile integrity: FAILED — blocked or typosquatted packages found\n');
    process.exit(1);
  }
}
