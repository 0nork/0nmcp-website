export interface WizardTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: 'Marketing' | 'Sales' | 'Operations' | 'Developer' | 'Support' | 'AI'
  services: string[]
  popularity: number
  defaults: {
    trigger: string
    actions: string
  }
  /** Premium templates get special onboarding flow */
  premium?: boolean
  /** Onboarding flow identifier for premium templates */
  onboardingFlow?: string
  /** @deprecated Use `defaults.trigger` — kept for backward compat */
  defaultTrigger?: string
  /** @deprecated Use `services` — kept for backward compat */
  defaultActions?: string[]
  /** @deprecated Use `notifications` field in wizard state — kept for backward compat */
  defaultNotifications?: string[]
}

/** Backward-compatible alias used by existing consumers */
export type WorkflowTemplate = WizardTemplate

export const CATEGORIES = [
  'Marketing',
  'Sales',
  'Operations',
  'Developer',
  'Support',
  'AI',
] as const

export type Category = (typeof CATEGORIES)[number]

export const WIZARD_TEMPLATES: WizardTemplate[] = [
  {
    id: 'qa-distribution',
    name: 'QA Distribution Engine',
    description:
      'Generate, score, and distribute quality content across 12 platforms simultaneously with AI-powered creation and engagement tracking.',
    icon: 'Zap',
    category: 'Marketing',
    services: ['openai', 'anthropic', 'slack', 'discord'],
    popularity: 98,
    premium: true,
    onboardingFlow: 'qa-distribution',
    defaults: {
      trigger: 'schedule',
      actions: 'Generate content with AI, quality score, format per platform, distribute to 12 channels, track metrics',
    },
    defaultTrigger: 'schedule',
    defaultActions: ['openai', 'anthropic', 'slack'],
    defaultNotifications: ['slack', 'email'],
  },
  {
    id: 'linkedin-auto-post',
    name: 'LinkedIn Auto-Poster',
    description:
      'Generate and publish AI-crafted LinkedIn posts on a schedule to maintain consistent thought leadership.',
    icon: 'Linkedin',
    category: 'Marketing',
    services: ['crm', 'openai'],
    popularity: 92,
    defaults: {
      trigger: 'schedule',
      actions: 'Generate post with OpenAI, publish via CRM social module',
    },
    defaultTrigger: 'schedule',
    defaultActions: ['crm', 'openai'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'lead-capture',
    name: 'Lead Capture Pipeline',
    description:
      'Capture form submissions, create CRM contacts, and fire off welcome emails automatically.',
    icon: 'UserPlus',
    category: 'Sales',
    services: ['crm', 'sendgrid'],
    popularity: 88,
    defaults: {
      trigger: 'form_submission',
      actions: 'Create CRM contact, send welcome email via SendGrid',
    },
    defaultTrigger: 'form_submission',
    defaultActions: ['crm', 'sendgrid'],
    defaultNotifications: ['sendgrid'],
  },
  {
    id: 'blog-generator',
    name: 'AI Blog Generator',
    description:
      'Draft, refine, and commit blog posts to your repo using AI — fully hands-off content creation.',
    icon: 'PenTool',
    category: 'Marketing',
    services: ['openai', 'github'],
    popularity: 85,
    defaults: {
      trigger: 'schedule',
      actions: 'Generate article with OpenAI, commit to GitHub repo',
    },
    defaultTrigger: 'schedule',
    defaultActions: ['openai', 'github'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'invoice-automation',
    name: 'Invoice Automation',
    description:
      'Auto-generate Stripe invoices when deals close and update the CRM record with payment status.',
    icon: 'DollarSign',
    category: 'Operations',
    services: ['stripe', 'crm'],
    popularity: 82,
    defaults: {
      trigger: 'payment_received',
      actions: 'Create Stripe invoice, update CRM opportunity',
    },
    defaultTrigger: 'payment_received',
    defaultActions: ['stripe', 'crm'],
    defaultNotifications: ['sendgrid', 'slack'],
  },
  {
    id: 'customer-onboarding',
    name: 'Customer Onboarding',
    description:
      'Welcome new customers with emails, CRM pipeline updates, and team Slack notifications.',
    icon: 'Users',
    category: 'Sales',
    services: ['crm', 'sendgrid', 'slack'],
    popularity: 80,
    defaults: {
      trigger: 'new_contact',
      actions: 'Send onboarding email, update CRM pipeline, notify Slack',
    },
    defaultTrigger: 'new_contact',
    defaultActions: ['crm', 'sendgrid', 'slack'],
    defaultNotifications: ['slack', 'sendgrid'],
  },
  {
    id: 'social-scheduler',
    name: 'Social Media Scheduler',
    description:
      'Schedule and distribute AI-generated content across social channels on autopilot.',
    icon: 'Calendar',
    category: 'Marketing',
    services: ['crm', 'openai'],
    popularity: 78,
    defaults: {
      trigger: 'schedule',
      actions: 'Generate content with OpenAI, post via CRM social module',
    },
    defaultTrigger: 'schedule',
    defaultActions: ['crm', 'openai'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'support-ticket',
    name: 'Support Ticket Router',
    description:
      'Route incoming support requests to the right Slack channel based on type and priority.',
    icon: 'Headphones',
    category: 'Support',
    services: ['crm', 'slack'],
    popularity: 76,
    defaults: {
      trigger: 'webhook',
      actions: 'Classify ticket, route to Slack channel, update CRM',
    },
    defaultTrigger: 'webhook',
    defaultActions: ['crm', 'slack'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'code-review',
    name: 'Code Review Bot',
    description:
      'Automatically review pull requests with AI and post summaries to Slack for your team.',
    icon: 'GitBranch',
    category: 'Developer',
    services: ['github', 'openai', 'slack'],
    popularity: 74,
    defaults: {
      trigger: 'github_event',
      actions: 'Analyze PR with OpenAI, post review to Slack',
    },
    defaultTrigger: 'github_event',
    defaultActions: ['github', 'openai', 'slack'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'crm-sync',
    name: 'CRM Data Sync',
    description:
      'Keep your CRM and HubSpot contacts, deals, and companies in perfect sync bidirectionally.',
    icon: 'Activity',
    category: 'Operations',
    services: ['crm', 'hubspot'],
    popularity: 72,
    defaults: {
      trigger: 'schedule',
      actions: 'Fetch CRM changes, push to HubSpot, reconcile conflicts',
    },
    defaultTrigger: 'schedule',
    defaultActions: ['crm', 'hubspot'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'email-nurture',
    name: 'Email Nurture Sequence',
    description:
      'Drip AI-personalized emails to new leads over days to warm them up before sales outreach.',
    icon: 'Send',
    category: 'Marketing',
    services: ['crm', 'sendgrid', 'openai'],
    popularity: 70,
    defaults: {
      trigger: 'new_contact',
      actions: 'Generate email with OpenAI, send via SendGrid, log in CRM',
    },
    defaultTrigger: 'new_contact',
    defaultActions: ['crm', 'sendgrid', 'openai'],
    defaultNotifications: ['sendgrid'],
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminders',
    description:
      'Send SMS reminders before scheduled appointments to reduce no-shows.',
    icon: 'Clock',
    category: 'Operations',
    services: ['crm', 'twilio'],
    popularity: 68,
    defaults: {
      trigger: 'schedule',
      actions: 'Check upcoming CRM appointments, send Twilio SMS reminders',
    },
    defaultTrigger: 'schedule',
    defaultActions: ['crm', 'twilio'],
    defaultNotifications: ['sms'],
  },
  {
    id: 'deal-closer',
    name: 'Deal Stage Automator',
    description:
      'Automatically advance CRM deal stages and notify your team in Slack when milestones are hit.',
    icon: 'TrendingUp',
    category: 'Sales',
    services: ['crm', 'slack'],
    popularity: 66,
    defaults: {
      trigger: 'webhook',
      actions: 'Update CRM deal stage, notify Slack channel',
    },
    defaultTrigger: 'webhook',
    defaultActions: ['crm', 'slack'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'content-repurposer',
    name: 'Content Repurposer',
    description:
      'Transform long-form content into social posts, summaries, and threads using multiple AI models.',
    icon: 'Bot',
    category: 'AI',
    services: ['openai', 'anthropic'],
    popularity: 64,
    defaults: {
      trigger: 'manual',
      actions: 'Chunk content, repurpose with OpenAI and Anthropic',
    },
    defaultTrigger: 'manual',
    defaultActions: ['openai', 'anthropic'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'webhook-relay',
    name: 'Webhook Relay',
    description:
      'Receive webhooks from any source and forward transformed payloads to Slack and GitHub.',
    icon: 'Globe',
    category: 'Developer',
    services: ['github', 'slack'],
    popularity: 62,
    defaults: {
      trigger: 'webhook',
      actions: 'Transform payload, post to Slack, create GitHub issue',
    },
    defaultTrigger: 'webhook',
    defaultActions: ['github', 'slack'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'data-enrichment',
    name: 'Data Enrichment',
    description:
      'Enrich CRM contacts with AI-generated company and role insights to improve lead scoring.',
    icon: 'Sparkles',
    category: 'Sales',
    services: ['crm', 'openai'],
    popularity: 60,
    defaults: {
      trigger: 'new_contact',
      actions: 'Research contact with OpenAI, enrich CRM record',
    },
    defaultTrigger: 'new_contact',
    defaultActions: ['crm', 'openai'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes AI',
    description:
      'Summarize meeting transcripts with AI and distribute notes to Slack and Google Drive.',
    icon: 'FileText',
    category: 'AI',
    services: ['openai', 'slack', 'gdrive'],
    popularity: 58,
    defaults: {
      trigger: 'webhook',
      actions: 'Summarize with OpenAI, post to Slack, save to Drive',
    },
    defaultTrigger: 'webhook',
    defaultActions: ['openai', 'slack', 'gdrive'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'inventory-alerts',
    name: 'Inventory Alerts',
    description:
      'Monitor Stripe product inventory and alert your team in Slack when stock runs low.',
    icon: 'ShoppingCart',
    category: 'Operations',
    services: ['stripe', 'slack'],
    popularity: 56,
    defaults: {
      trigger: 'schedule',
      actions: 'Check Stripe inventory levels, alert Slack if low',
    },
    defaultTrigger: 'schedule',
    defaultActions: ['stripe', 'slack'],
    defaultNotifications: ['slack'],
  },
  {
    id: 'feedback-collector',
    name: 'Feedback Collector',
    description:
      'Send automated feedback request emails and log responses back into your CRM.',
    icon: 'Star',
    category: 'Support',
    services: ['crm', 'sendgrid'],
    popularity: 54,
    defaults: {
      trigger: 'schedule',
      actions: 'Send feedback email via SendGrid, log response in CRM',
    },
    defaultTrigger: 'schedule',
    defaultActions: ['crm', 'sendgrid'],
    defaultNotifications: ['sendgrid'],
  },
]

/**
 * Return templates filtered by category, sorted by popularity descending.
 */
export function getTemplatesByCategory(
  category: Category
): WizardTemplate[] {
  return WIZARD_TEMPLATES
    .filter((t) => t.category === category)
    .sort((a, b) => b.popularity - a.popularity)
}
