/**
 * 0nExec Scoring Engine — Value Equation Implementation
 * Score = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)
 * Normalized to 0–100 across four subscores of 0–25 each.
 */

export interface ClientScoreInputs {
  // Pipedrive
  dealValue: number
  dealTitle: string
  daysInCurrentStage: number
  stageBaseline: number
  pipelineConversionRate: number
  openActivities: number
  overdueActivities: number
  lastActivityDays: number

  // LinkedIn Ads
  ctr: number | null
  ctrBaseline: number
  cpa: number | null
  cpaBaseline: number
  creativeDaysInMarket: number

  // Slack
  avgResponseLatencyHours: number
  lastTouchDays: number

  // Framework audit
  hackAuditFlags: HackFlag[]
}

export interface HackFlag {
  hackNumber: number
  hackName: string
  layer: 'Attention' | 'Trust' | 'Desire' | 'Action' | 'Foundation'
  issue: string
  severity: 'critical' | 'warning'
  scoreImpact: number
}

export interface AnomalyFlag {
  type: 'score_drop' | 'stage_overrun' | 'creative_stale' | 'no_contact' | 'hack_violation' | 'predictive'
  severity: 'critical' | 'warning' | 'info'
  message: string
  hackNumber?: number
  layer?: string
}

export type ScoreBand = 'NOMINAL' | 'MONITOR' | 'REVIEW' | 'CRITICAL'

export interface ClientScore {
  total: number
  dreamOutcome: number
  likelihood: number
  speed: number
  friction: number
  band: ScoreBand
  flags: AnomalyFlag[]
  computedAt: string
}

export function computeScore(inputs: ClientScoreInputs): ClientScore {
  // Dream Outcome (0–25)
  const dealValueScore = Math.min(inputs.dealValue / 10000 * 5, 5)
  const titleScore = inputs.dealTitle.length > 20 ? 5 : 2
  const conversionScore = Math.min(inputs.pipelineConversionRate / 4, 15)
  const dreamOutcome = Math.round(Math.min(dealValueScore + titleScore + conversionScore, 25))

  // Proof / Likelihood (0–25)
  const ctrRatio = inputs.ctr ? inputs.ctr / Math.max(inputs.ctrBaseline, 0.001) : 0.5
  const ctrScore = Math.min(ctrRatio * 12, 12)
  const cpaRatio = inputs.cpa ? inputs.cpaBaseline / Math.max(inputs.cpa, 0.01) : 0.5
  const cpaScore = Math.min(cpaRatio * 8, 8)
  const activityScore = inputs.overdueActivities === 0 ? 5 : Math.max(5 - inputs.overdueActivities * 2, 0)

  // Apply hack audit penalty to likelihood
  const hackPenalty = inputs.hackAuditFlags.reduce((sum, f) => sum + Math.abs(f.scoreImpact), 0)
  const rawLikelihood = ctrScore + cpaScore + activityScore
  const likelihood = Math.round(Math.min(Math.max(rawLikelihood - hackPenalty, 0), 25))

  // Speed to Result (0–25)
  const stageRatio = Math.max(inputs.stageBaseline, 1) / Math.max(inputs.daysInCurrentStage, 1)
  const speed = Math.round(Math.min(stageRatio * 25, 25))

  // Low Friction (0–25)
  const responseScore = inputs.avgResponseLatencyHours < 4 ? 12
    : inputs.avgResponseLatencyHours < 24 ? 8
    : inputs.avgResponseLatencyHours < 72 ? 4 : 0
  const touchScore = inputs.lastTouchDays < 1 ? 13
    : inputs.lastTouchDays < 3 ? 10
    : inputs.lastTouchDays < 7 ? 6 : 0
  const friction = Math.round(Math.min(responseScore + touchScore, 25))

  const total = dreamOutcome + likelihood + speed + friction
  const band: ScoreBand = total >= 80 ? 'NOMINAL' : total >= 60 ? 'MONITOR' : total >= 40 ? 'REVIEW' : 'CRITICAL'

  const flags = generateFlags(inputs, { total, dreamOutcome, likelihood, speed, friction })

  return {
    total,
    dreamOutcome,
    likelihood,
    speed,
    friction,
    band,
    flags,
    computedAt: new Date().toISOString(),
  }
}

function generateFlags(
  inputs: ClientScoreInputs,
  scores: { total: number; dreamOutcome: number; likelihood: number; speed: number; friction: number }
): AnomalyFlag[] {
  const flags: AnomalyFlag[] = []

  // Stage overrun
  if (inputs.daysInCurrentStage > inputs.stageBaseline * 1.5) {
    flags.push({
      type: 'stage_overrun',
      severity: inputs.daysInCurrentStage > inputs.stageBaseline * 2 ? 'critical' : 'warning',
      message: `${inputs.daysInCurrentStage} days in current stage (baseline: ${inputs.stageBaseline} days)`,
    })
  }

  // Stale creative
  if (inputs.creativeDaysInMarket > 21) {
    flags.push({
      type: 'creative_stale',
      severity: inputs.creativeDaysInMarket > 45 ? 'critical' : 'warning',
      message: `Creative has been in market ${inputs.creativeDaysInMarket} days without refresh`,
    })
  }

  // No recent contact
  if (inputs.lastTouchDays > 5) {
    flags.push({
      type: 'no_contact',
      severity: inputs.lastTouchDays > 10 ? 'critical' : 'warning',
      message: `No client contact in ${inputs.lastTouchDays} days`,
    })
  }

  // Hack violations
  for (const hack of inputs.hackAuditFlags) {
    flags.push({
      type: 'hack_violation',
      severity: hack.severity,
      message: `Hack #${hack.hackNumber} (${hack.hackName}): ${hack.issue}`,
      hackNumber: hack.hackNumber,
      layer: hack.layer,
    })
  }

  // Overall score drop warning
  if (scores.speed === 0) {
    flags.push({
      type: 'score_drop',
      severity: 'critical',
      message: 'Speed subscore is zero — deal is severely overrun in current stage',
    })
  }

  if (scores.friction === 0) {
    flags.push({
      type: 'score_drop',
      severity: 'critical',
      message: 'Friction subscore is zero — no recent communication with client',
    })
  }

  return flags
}

export function getBandColor(band: ScoreBand): string {
  switch (band) {
    case 'NOMINAL': return '#22D3A5'
    case 'MONITOR': return '#F5C518'
    case 'REVIEW': return '#F97316'
    case 'CRITICAL': return '#EF4444'
  }
}
