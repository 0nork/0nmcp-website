/**
 * 0nDefender Patent Intelligence — Alert Dispatcher
 * Creates intel_alerts records and logs email-worthy alerts.
 */

import type { ClassificationResult, FindingCategory, ThreatLevel } from './classifier';

export interface FindingRecord {
  id: string;
  title: string;
  description: string;
  source_url: string;
  source_type: string;
  threat_level: ThreatLevel;
  category: FindingCategory;
  overlapping_patents: string[];
  overlap_summary: string;
  recommended_action: string;
  scan_id: string;
}

export interface AlertRecord {
  finding_id: string;
  alert_type: 'critical' | 'high';
  title: string;
  summary: string;
  recommended_action: string;
  dispatched_at: string;
  email_logged: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

/**
 * Dispatch alerts for critical and high-threat findings.
 * Creates a record in intel_alerts and logs email details for critical.
 */
export async function dispatchAlert(
  supabase: SupabaseClient,
  finding: FindingRecord
): Promise<void> {
  if (finding.threat_level !== 'critical' && finding.threat_level !== 'high') {
    return;
  }

  const alertRecord: AlertRecord = {
    finding_id: finding.id,
    alert_type: finding.threat_level as 'critical' | 'high',
    title: `[${finding.threat_level.toUpperCase()}] ${finding.title}`,
    summary: finding.overlap_summary,
    recommended_action: finding.recommended_action,
    dispatched_at: new Date().toISOString(),
    email_logged: finding.threat_level === 'critical',
  };

  // Insert alert record
  const { error } = await supabase
    .from('intel_alerts')
    .insert(alertRecord)
    .select();

  if (error) {
    console.error('[0nDefender] Failed to create alert record:', error);
  } else {
    console.log(`[0nDefender] Alert created: ${alertRecord.title}`);
  }

  // For critical findings, log email details (Resend not configured yet)
  if (finding.threat_level === 'critical') {
    logCriticalEmail(finding);
  }
}

/**
 * Dispatch alerts for multiple findings in batch.
 */
export async function dispatchAlerts(
  supabase: SupabaseClient,
  findings: FindingRecord[]
): Promise<{ dispatched: number; errors: number }> {
  let dispatched = 0;
  let errors = 0;

  const alertable = findings.filter(
    (f) => f.threat_level === 'critical' || f.threat_level === 'high'
  );

  for (const finding of alertable) {
    try {
      await dispatchAlert(supabase, finding);
      dispatched++;
    } catch (err) {
      console.error(`[0nDefender] Alert dispatch error for finding ${finding.id}:`, err);
      errors++;
    }
  }

  if (dispatched > 0) {
    console.log(`[0nDefender] Dispatched ${dispatched} alerts (${errors} errors)`);
  }

  return { dispatched, errors };
}

/**
 * Log critical alert details for future email sending.
 * When Resend is configured, this will be replaced with actual email dispatch.
 */
function logCriticalEmail(finding: FindingRecord): void {
  console.log('=== CRITICAL PATENT ALERT — EMAIL NOTIFICATION ===');
  console.log(`To: mike@rocketopp.com`);
  console.log(`Subject: [0nDefender CRITICAL] ${finding.title}`);
  console.log(`---`);
  console.log(`Threat Level: ${finding.threat_level.toUpperCase()}`);
  console.log(`Category: ${finding.category}`);
  console.log(`Source: ${finding.source_url}`);
  console.log(`Overlapping Patents: ${finding.overlapping_patents.join(', ') || 'None identified'}`);
  console.log(`Summary: ${finding.overlap_summary}`);
  console.log(`Recommended Action: ${finding.recommended_action}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('=== END CRITICAL ALERT ===');
}
