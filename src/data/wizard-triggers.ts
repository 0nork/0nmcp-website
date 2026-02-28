export interface WizardTrigger {
  id: string
  label: string
  description: string
  icon: string
  definesFrequency: boolean
}

/** Backward-compatible alias used by existing consumers */
export type TriggerDefinition = WizardTrigger

export const WIZARD_TRIGGERS: WizardTrigger[] = [
  {
    id: 'webhook',
    label: 'Webhook',
    description: 'Triggered by HTTP request',
    icon: 'Webhook',
    definesFrequency: true,
  },
  {
    id: 'schedule',
    label: 'Schedule',
    description: 'Run on a time schedule',
    icon: 'Clock',
    definesFrequency: false,
  },
  {
    id: 'form',
    label: 'Form Submit',
    description: 'New form submission',
    icon: 'FileText',
    definesFrequency: true,
  },
  {
    id: 'new-contact',
    label: 'New Contact',
    description: 'Contact created in CRM',
    icon: 'UserPlus',
    definesFrequency: true,
  },
  {
    id: 'payment',
    label: 'Payment',
    description: 'Payment received',
    icon: 'CreditCard',
    definesFrequency: true,
  },
  {
    id: 'email',
    label: 'Email',
    description: 'New email received',
    icon: 'Mail',
    definesFrequency: true,
  },
  {
    id: 'message',
    label: 'Message',
    description: 'New chat message',
    icon: 'MessageSquare',
    definesFrequency: true,
  },
  {
    id: 'manual',
    label: 'Manual',
    description: 'Run on demand',
    icon: 'Play',
    definesFrequency: true,
  },
  {
    id: 'github',
    label: 'GitHub Event',
    description: 'Push, PR, or issue',
    icon: 'Github',
    definesFrequency: true,
  },
  {
    id: 'database',
    label: 'Database Change',
    description: 'Row insert or update',
    icon: 'Database',
    definesFrequency: true,
  },
]
