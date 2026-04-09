/**
 * CRO9 — Canonical PostHog Event Registry
 * ALL event names across all 0n products defined here.
 * Never use string literals — always import from this file.
 */

export const CRO9_EVENTS = {
  // Auth
  USER_SIGNED_UP:          'user_signed_up',
  USER_LOGGED_IN:          'user_logged_in',
  USER_LOGGED_OUT:         'user_logged_out',

  // Onboarding
  ONBOARDING_STARTED:      'onboarding_started',
  ONBOARDING_COMPLETED:    'onboarding_completed',
  INTEGRATION_CONNECTED:   'integration_connected',
  INTEGRATION_FAILED:      'integration_failed',

  // 0nExec
  PIPELINE_VIEWED:         'pipeline_viewed',
  DEPARTMENTS_VIEWED:      'departments_viewed',
  CLIENT_CARD_CLICKED:     'client_card_clicked',
  FLAG_VIEWED:             'flag_viewed',
  FLAG_ACTED:              'flag_acted',
  FLAG_DISMISSED:          'flag_dismissed',
  SCORE_IMPROVED:          'score_improved',
  ALERT_ACKNOWLEDGED:      'alert_acknowledged',
  PREDICTIVE_FLAG_VIEWED:  'predictive_flag_viewed',

  // 0nMCP
  TOOL_EXECUTED:           'tool_executed',
  WORKFLOW_RUN:            'workflow_run',
  COMBO_PURCHASED:         'combo_purchased',

  // Billing
  PLAN_UPGRADED:           'plan_upgraded',
  PLAN_CANCELLED:          'plan_cancelled',

  // Generic
  FEATURE_USED:            'feature_used',
  ERROR_ENCOUNTERED:       'error_encountered',
  FEEDBACK_SUBMITTED:      'feedback_submitted',
} as const

export type CRO9EventName = typeof CRO9_EVENTS[keyof typeof CRO9_EVENTS]
