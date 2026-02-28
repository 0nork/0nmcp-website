// Wizard trigger definitions for the 0nmcp.com flow builder
// Powers the WizardTriggerStep grid and WizardContext trigger state

export const TRIGGER_CATEGORIES = [
  'Event',
  'Scheduled',
  'Communication',
  'Manual',
  'Integration',
] as const

export type TriggerCategory = (typeof TRIGGER_CATEGORIES)[number]

export interface TriggerDefinition {
  id: string
  /** Short label shown on the tile */
  label: string
  /** Description shown as sublabel on the tile */
  description: string
  /** Lucide icon name — mapped to a component in WizardTriggerStep */
  icon: string
  /** Grouping category for the trigger */
  category: TriggerCategory
  /**
   * When true the trigger fires on external events and the frequency step
   * can be skipped (the trigger itself defines when the workflow runs).
   * When false (e.g. "schedule") the user must pick a frequency/cron.
   */
  definesFrequency: boolean
  /** Service keys this trigger is associated with (optional) */
  associatedServices?: string[]
}

/** Backward-compatible alias used by WizardContext */
export type WizardTrigger = TriggerDefinition

export const WIZARD_TRIGGERS: TriggerDefinition[] = [
  {
    id: 'webhook',
    label: 'Webhook Received',
    description: 'Fires when your endpoint receives an HTTP request',
    icon: 'Webhook',
    category: 'Event',
    definesFrequency: true,
  },
  {
    id: 'schedule',
    label: 'Scheduled',
    description: 'Runs on a timer (cron schedule)',
    icon: 'Clock',
    category: 'Scheduled',
    definesFrequency: false,
  },
  {
    id: 'form_submission',
    label: 'Form Submitted',
    description: 'When a form is filled out and submitted',
    icon: 'FileText',
    category: 'Event',
    definesFrequency: true,
    associatedServices: ['crm'],
  },
  {
    id: 'new_contact',
    label: 'New Contact Created',
    description: 'CRM contact added or imported',
    icon: 'UserPlus',
    category: 'Event',
    definesFrequency: true,
    associatedServices: ['crm'],
  },
  {
    id: 'payment_received',
    label: 'Payment Received',
    description: 'Stripe payment succeeds or subscription renews',
    icon: 'CreditCard',
    category: 'Event',
    definesFrequency: true,
    associatedServices: ['stripe'],
  },
  {
    id: 'email_received',
    label: 'Email Received',
    description: 'New email arrives in connected inbox',
    icon: 'Mail',
    category: 'Communication',
    definesFrequency: true,
    associatedServices: ['gmail', 'sendgrid'],
  },
  {
    id: 'message_received',
    label: 'Message Received',
    description: 'Chat message in Slack or Discord',
    icon: 'MessageSquare',
    category: 'Communication',
    definesFrequency: true,
    associatedServices: ['slack', 'discord'],
  },
  {
    id: 'manual',
    label: 'Manual Trigger',
    description: 'Run on demand from the dashboard',
    icon: 'Play',
    category: 'Manual',
    definesFrequency: true,
  },
  {
    id: 'github_event',
    label: 'GitHub Event',
    description: 'Push, pull request, issue, or release',
    icon: 'Github',
    category: 'Integration',
    definesFrequency: true,
    associatedServices: ['github'],
  },
  {
    id: 'database_change',
    label: 'Database Change',
    description: 'Row insert, update, or delete detected',
    icon: 'Database',
    category: 'Integration',
    definesFrequency: true,
    associatedServices: ['supabase', 'mongodb'],
  },
]

/**
 * Return triggers filtered by category.
 */
export function getTriggersByCategory(
  category: TriggerCategory
): TriggerDefinition[] {
  return WIZARD_TRIGGERS.filter((t) => t.category === category)
}
