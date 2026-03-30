/**
 * 0nDefender Patent Intelligence — Scan Engine
 * Orchestrates all 4 analyzers: MCP entrants, patent conflicts, acquisition signals, brand protection.
 */

import { createClient } from '@supabase/supabase-js';
import { contentHash, isDuplicate } from './deduplicator';
import { classifyFinding, type RawFinding, type ClassificationResult } from './classifier';
import { dispatchAlerts, type FindingRecord } from './alert-dispatcher';
import { analyzeMcpEntrants } from './analyzers/mcp-entrant';
import { analyzePatentConflicts } from './analyzers/patent-conflict';
import { analyzeAcquisitionSignals } from './analyzers/acquisition-signal';
import { analyzeBrandProtection } from './analyzers/brand-protection';

export type ScanType = 'full' | 'mcp_entrant' | 'patent_conflict' | 'acquisition_signal' | 'brand_protection';

export interface ScanResult {
  scan_id: string;
  scan_type: ScanType;
  started_at: string;
  completed_at: string;
  total_raw: number;
  duplicates_skipped: number;
  findings_saved: number;
  alerts_dispatched: number;
  errors: string[];
}

interface ScanRecord {
  id?: string;
  scan_type: ScanType;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  total_raw?: number;
  duplicates_skipped?: number;
  findings_saved?: number;
  alerts_dispatched?: number;
  error_log?: string[];
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('[0nDefender] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key);
}

/**
 * Run a scan of the specified type. Orchestrates analyzer execution, deduplication,
 * classification, persistence, and alert dispatch.
 */
export async function runScan(scanType: ScanType): Promise<ScanResult> {
  const supabase = getSupabase();
  const startedAt = new Date().toISOString();
  const errors: string[] = [];

  // Create scan record
  const scanRecord: ScanRecord = {
    scan_type: scanType,
    status: 'running',
    started_at: startedAt,
  };

  const { data: scanData, error: scanError } = await supabase
    .from('intel_scans')
    .insert(scanRecord)
    .select('id')
    .single();

  if (scanError || !scanData?.id) {
    console.error('[0nDefender] Failed to create scan record:', scanError);
    // Continue without a DB scan record — still run the analysis
  }

  const scanId: string = scanData?.id || `local-${Date.now()}`;
  console.log(`[0nDefender] Scan ${scanId} started (type: ${scanType})`);

  // Run the appropriate analyzer(s)
  let rawFindings: RawFinding[] = [];

  if (scanType === 'full' || scanType === 'mcp_entrant') {
    try {
      const results = await analyzeMcpEntrants();
      rawFindings.push(...results);
      console.log(`[0nDefender] MCP entrant analyzer: ${results.length} raw findings`);
    } catch (err) {
      const msg = `MCP entrant analyzer failed: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      console.error(`[0nDefender] ${msg}`);
    }
  }

  if (scanType === 'full' || scanType === 'patent_conflict') {
    try {
      const results = await analyzePatentConflicts();
      rawFindings.push(...results);
      console.log(`[0nDefender] Patent conflict analyzer: ${results.length} raw findings`);
    } catch (err) {
      const msg = `Patent conflict analyzer failed: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      console.error(`[0nDefender] ${msg}`);
    }
  }

  if (scanType === 'full' || scanType === 'acquisition_signal') {
    try {
      const results = await analyzeAcquisitionSignals();
      rawFindings.push(...results);
      console.log(`[0nDefender] Acquisition signal analyzer: ${results.length} raw findings`);
    } catch (err) {
      const msg = `Acquisition signal analyzer failed: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      console.error(`[0nDefender] ${msg}`);
    }
  }

  if (scanType === 'full' || scanType === 'brand_protection') {
    try {
      const results = await analyzeBrandProtection();
      rawFindings.push(...results);
      console.log(`[0nDefender] Brand protection analyzer: ${results.length} raw findings`);
    } catch (err) {
      const msg = `Brand protection analyzer failed: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      console.error(`[0nDefender] ${msg}`);
    }
  }

  const totalRaw = rawFindings.length;
  let duplicatesSkipped = 0;
  let findingsSaved = 0;
  const savedFindings: FindingRecord[] = [];

  // Deduplicate, classify, and persist each finding
  for (const raw of rawFindings) {
    try {
      // Deduplicate
      const hash = await contentHash(raw.title, raw.source_url);
      const duplicate = await isDuplicate(hash, supabase);

      if (duplicate) {
        duplicatesSkipped++;
        continue;
      }

      // Classify
      let classification: ClassificationResult;
      try {
        classification = await classifyFinding(raw);
      } catch (classErr) {
        console.error('[0nDefender] Classification failed, using defaults:', classErr);
        classification = {
          threat_level: 'info',
          category: raw.category || 'mcp_entrant',
          overlapping_patents: [],
          overlap_summary: 'Classification failed — manual review needed.',
          recommended_action: 'Review manually.',
        };
      }

      // Persist finding
      const findingPayload = {
        scan_id: scanId,
        title: raw.title,
        description: raw.description,
        source_url: raw.source_url,
        source_type: raw.source_type,
        content_hash: hash,
        threat_level: classification.threat_level,
        category: classification.category,
        overlapping_patents: classification.overlapping_patents,
        overlap_summary: classification.overlap_summary,
        recommended_action: classification.recommended_action,
        raw_data: raw.raw_data || {},
        created_at: new Date().toISOString(),
      };

      const { data: findingData, error: findingError } = await supabase
        .from('intel_findings')
        .insert(findingPayload)
        .select('id')
        .single();

      if (findingError) {
        console.error('[0nDefender] Failed to save finding:', findingError);
        errors.push(`Failed to save finding "${raw.title}": ${JSON.stringify(findingError)}`);
        continue;
      }

      findingsSaved++;
      savedFindings.push({
        id: findingData.id,
        title: raw.title,
        description: raw.description,
        source_url: raw.source_url,
        source_type: raw.source_type,
        threat_level: classification.threat_level,
        category: classification.category,
        overlapping_patents: classification.overlapping_patents,
        overlap_summary: classification.overlap_summary,
        recommended_action: classification.recommended_action,
        scan_id: scanId,
      });
    } catch (err) {
      const msg = `Processing finding "${raw.title}" failed: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      console.error(`[0nDefender] ${msg}`);
    }
  }

  // Dispatch alerts for critical/high findings
  let alertsDispatched = 0;
  if (savedFindings.length > 0) {
    try {
      const alertResult = await dispatchAlerts(supabase, savedFindings);
      alertsDispatched = alertResult.dispatched;
      if (alertResult.errors > 0) {
        errors.push(`${alertResult.errors} alert dispatch errors`);
      }
    } catch (err) {
      const msg = `Alert dispatch failed: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      console.error(`[0nDefender] ${msg}`);
    }
  }

  const completedAt = new Date().toISOString();

  // Update scan record
  if (scanData?.id) {
    const { error: updateError } = await supabase
      .from('intel_scans')
      .update({
        status: errors.length > 0 && findingsSaved === 0 ? 'failed' : 'completed',
        completed_at: completedAt,
        total_raw: totalRaw,
        duplicates_skipped: duplicatesSkipped,
        findings_saved: findingsSaved,
        alerts_dispatched: alertsDispatched,
        error_log: errors.length > 0 ? errors : null,
      })
      .eq('id', scanId);

    if (updateError) {
      console.error('[0nDefender] Failed to update scan record:', updateError);
    }
  }

  const result: ScanResult = {
    scan_id: scanId,
    scan_type: scanType,
    started_at: startedAt,
    completed_at: completedAt,
    total_raw: totalRaw,
    duplicates_skipped: duplicatesSkipped,
    findings_saved: findingsSaved,
    alerts_dispatched: alertsDispatched,
    errors,
  };

  console.log(
    `[0nDefender] Scan ${scanId} completed: ${totalRaw} raw, ${duplicatesSkipped} dupes, ${findingsSaved} saved, ${alertsDispatched} alerts`
  );

  return result;
}
