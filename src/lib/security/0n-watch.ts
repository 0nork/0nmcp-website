/**
 * 0nDefender — Supply Chain Monitor (0nWatch)
 * Scans package-lock.json for known malicious packages, typosquatters, and suspicious patterns
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendAlert, type SecurityThreat } from './0n-alert';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ThreatLevel = 'clean' | 'suspicious' | 'malicious';

export interface ScanResult {
  scanType: string;
  threatLevel: ThreatLevel;
  threats: SecurityThreat[];
  suspicions: SecurityThreat[];
  totalPackages: number;
  scannedAt: string;
}

interface LockfileDependency {
  version: string;
  resolved?: string;
  integrity?: string;
  dependencies?: Record<string, LockfileDependency>;
}

interface PackageLockV3 {
  packages?: Record<string, {
    version?: string;
    resolved?: string;
    integrity?: string;
  }>;
  dependencies?: Record<string, LockfileDependency>;
}

// ─── Lazy Supabase Client ────────────────────────────────────────────────────

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('0nWatch: Missing Supabase credentials');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// ─── Known Malicious Packages ────────────────────────────────────────────────

const BLOCKED_PACKAGES: Map<string, string> = new Map([
  // Known malicious — exact name+version
  ['event-stream@3.3.6', 'Contained flatmap-stream cryptocurrency stealer'],
  ['flatmap-stream@0.1.1', 'Cryptocurrency wallet stealer injected into event-stream'],
  ['ua-parser-js@0.7.29', 'Cryptominer + password stealer injected via compromised maintainer'],
  ['coa@2.0.3', 'Compromised — contained credential stealer'],
  ['coa@2.0.4', 'Compromised — contained credential stealer'],
  ['rc@1.2.9', 'Compromised — contained credential stealer'],
  ['rc@1.3.9', 'Compromised — contained credential stealer'],
  ['colors@1.4.1', 'Sabotaged by maintainer — infinite loop DoS'],
  ['faker@6.6.6', 'Sabotaged by maintainer — broke dependents'],
  ['node-ipc@10.1.1', 'Protestware — overwrites files based on geolocation'],
  ['node-ipc@10.1.2', 'Protestware — overwrites files based on geolocation'],
  ['node-ipc@10.1.3', 'Protestware — overwrites files based on geolocation'],
  ['peacenotwar@9.1.3', 'Geolocation-based file destruction payload'],
  ['peacenotwar@9.1.5', 'Geolocation-based file destruction payload'],
  ['axios@1.14.1', 'Supply chain attack — credential exfiltration'],
  ['axios@0.30.4', 'Supply chain attack — credential exfiltration'],
  ['plain-crypto-js@*', 'Typosquat of crypto-js — steals private keys'],
]);

// ─── Typosquat Detection Patterns ───────────────────────────────────────────

const TYPOSQUATTER_PATTERNS: RegExp[] = [
  /^(@[^/]+\/)?loadsh$/,          // lodash typo
  /^(@[^/]+\/)?axois$/,           // axios typo
  /^(@[^/]+\/)?expresss$/,        // express typo
  /^(@[^/]+\/)?requets$/,         // requests typo
  /^(@[^/]+\/)?cross-env\d/,      // cross-env variants
  /^(@[^/]+\/)?crossenv$/,        // cross-env without hyphen
  /^(@[^/]+\/)?babelcli$/,        // @babel/cli typo
  /^(@[^/]+\/)?mongose$/,         // mongoose typo
  /^(@[^/]+\/)?electorn$/,        // electron typo
  /^(@[^/]+\/)?react-nativ$/,     // react-native typo
  /^(@[^/]+\/)?reaact$/,          // react typo
  /^(@[^/]+\/)?angullar$/,        // angular typo
  /^(@[^/]+\/)?strpe$/,           // stripe typo
  /^(@[^/]+\/)?stripee$/,         // stripe typo
  /^(@[^/]+\/)?supabasee$/,       // supabase typo
  /^(@[^/]+\/)?nextt$/,           // next typo
  /^plain-crypto-js$/,            // crypto-js typosquat
];

// ─── Suspicious URL Patterns ─────────────────────────────────────────────────

const SUSPICIOUS_REGISTRY_PATTERNS: RegExp[] = [
  /^https?:\/\/(?!registry\.npmjs\.org)/,  // Non-npm registries
  /\.ru\//,                                  // Russian domains
  /\.cn\//,                                  // Chinese domains
  /pastebin\.com/,
  /githubusercontent\.com.*\.tgz$/,         // Raw GitHub tarballs
  /bit\.ly/,
  /tinyurl\.com/,
];

// ─── Core Scan Function ─────────────────────────────────────────────────────

export async function scanSupplyChain(lockfilePath?: string): Promise<ScanResult> {
  const resolvedPath = lockfilePath || findLockfile();
  const scannedAt = new Date().toISOString();

  if (!resolvedPath || !existsSync(resolvedPath)) {
    return {
      scanType: 'supply_chain',
      threatLevel: 'clean',
      threats: [],
      suspicions: [],
      totalPackages: 0,
      scannedAt,
    };
  }

  let lockfile: PackageLockV3;
  try {
    const raw = readFileSync(resolvedPath, 'utf-8');
    lockfile = JSON.parse(raw);
  } catch {
    console.error('[0nWatch] Failed to parse lockfile');
    return {
      scanType: 'supply_chain',
      threatLevel: 'clean',
      threats: [],
      suspicions: [],
      totalPackages: 0,
      scannedAt,
    };
  }

  const threats: SecurityThreat[] = [];
  const suspicions: SecurityThreat[] = [];
  let totalPackages = 0;

  // Scan v3 lockfile format (packages field)
  if (lockfile.packages) {
    for (const [pkgPath, info] of Object.entries(lockfile.packages)) {
      if (!pkgPath || pkgPath === '') continue; // skip root
      totalPackages++;

      const name = extractPackageName(pkgPath);
      const version = info.version || 'unknown';
      const resolved = info.resolved || '';

      // Check exact blocked packages
      const exactKey = `${name}@${version}`;
      const wildcardKey = `${name}@*`;
      if (BLOCKED_PACKAGES.has(exactKey)) {
        threats.push({
          name,
          version,
          reason: BLOCKED_PACKAGES.get(exactKey)!,
          source: 'blocked_list',
        });
      } else if (BLOCKED_PACKAGES.has(wildcardKey)) {
        threats.push({
          name,
          version,
          reason: BLOCKED_PACKAGES.get(wildcardKey)!,
          source: 'blocked_list',
        });
      }

      // Check typosquatters
      for (const pattern of TYPOSQUATTER_PATTERNS) {
        if (pattern.test(name)) {
          threats.push({
            name,
            version,
            reason: `Matches typosquatter pattern: ${pattern.source}`,
            source: 'typosquat_detection',
          });
          break;
        }
      }

      // Check suspicious resolved URLs
      if (resolved) {
        for (const urlPattern of SUSPICIOUS_REGISTRY_PATTERNS) {
          if (urlPattern.test(resolved)) {
            suspicions.push({
              name,
              version,
              reason: `Suspicious registry URL: ${resolved}`,
              source: 'registry_check',
            });
            break;
          }
        }
      }

      // Check for missing integrity hash
      if (!info.integrity && resolved && resolved.startsWith('http')) {
        suspicions.push({
          name,
          version,
          reason: 'Missing integrity hash for remote package',
          source: 'integrity_check',
        });
      }
    }
  }

  // Also scan v1/v2 dependencies field for older lockfiles
  if (lockfile.dependencies) {
    scanDependenciesV1(lockfile.dependencies, threats, suspicions);
    if (totalPackages === 0) {
      totalPackages = countDependencies(lockfile.dependencies);
    }
  }

  const threatLevel: ThreatLevel = threats.length > 0 ? 'malicious' : suspicions.length > 0 ? 'suspicious' : 'clean';

  const result: ScanResult = {
    scanType: 'supply_chain',
    threatLevel,
    threats,
    suspicions,
    totalPackages,
    scannedAt,
  };

  // Persist to Supabase
  try {
    const supabase = getSupabase();
    await supabase.from('security_scans').insert({
      scan_type: 'supply_chain',
      result: result as unknown as Record<string, unknown>,
      threat_count: threats.length,
      scanned_at: scannedAt,
    });
  } catch (err) {
    console.error('[0nWatch] Failed to persist scan result:', err);
  }

  // Alert on threats
  if (threats.length > 0) {
    await sendAlert({
      type: 'supply_chain_threat',
      severity: 'critical',
      action: `${threats.length} malicious package(s) detected in lockfile`,
      threats,
    });
  } else if (suspicions.length > 5) {
    await sendAlert({
      type: 'supply_chain_suspicious',
      severity: 'medium',
      action: `${suspicions.length} suspicious package(s) detected`,
      threats: suspicions,
    });
  }

  return result;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findLockfile(): string | null {
  const candidates = [
    join(process.cwd(), 'package-lock.json'),
    join(process.cwd(), '..', 'package-lock.json'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function extractPackageName(pkgPath: string): string {
  // node_modules/@scope/name or node_modules/name
  const parts = pkgPath.replace(/^node_modules\//, '');
  return parts;
}

function scanDependenciesV1(
  deps: Record<string, LockfileDependency>,
  threats: SecurityThreat[],
  suspicions: SecurityThreat[],
): void {
  for (const [name, info] of Object.entries(deps)) {
    const version = info.version;
    const resolved = info.resolved || '';

    const exactKey = `${name}@${version}`;
    const wildcardKey = `${name}@*`;
    if (BLOCKED_PACKAGES.has(exactKey)) {
      threats.push({
        name,
        version,
        reason: BLOCKED_PACKAGES.get(exactKey)!,
        source: 'blocked_list',
      });
    } else if (BLOCKED_PACKAGES.has(wildcardKey)) {
      threats.push({
        name,
        version,
        reason: BLOCKED_PACKAGES.get(wildcardKey)!,
        source: 'blocked_list',
      });
    }

    for (const pattern of TYPOSQUATTER_PATTERNS) {
      if (pattern.test(name)) {
        threats.push({
          name,
          version,
          reason: `Matches typosquatter pattern: ${pattern.source}`,
          source: 'typosquat_detection',
        });
        break;
      }
    }

    if (resolved) {
      for (const urlPattern of SUSPICIOUS_REGISTRY_PATTERNS) {
        if (urlPattern.test(resolved)) {
          suspicions.push({
            name,
            version,
            reason: `Suspicious registry URL: ${resolved}`,
            source: 'registry_check',
          });
          break;
        }
      }
    }

    // Recurse into nested dependencies
    if (info.dependencies) {
      scanDependenciesV1(info.dependencies, threats, suspicions);
    }
  }
}

function countDependencies(deps: Record<string, LockfileDependency>): number {
  let count = 0;
  for (const info of Object.values(deps)) {
    count++;
    if (info.dependencies) {
      count += countDependencies(info.dependencies);
    }
  }
  return count;
}

// ─── Get Latest Scan ─────────────────────────────────────────────────────────

export async function getLatestScan(): Promise<ScanResult | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('security_scans')
      .select('*')
      .eq('scan_type', 'supply_chain')
      .order('scanned_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data.result as ScanResult;
  } catch {
    return null;
  }
}
