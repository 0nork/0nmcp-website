// Wizard template definitions for the 0nmcp.com flow builder
// Powers the WizardLanding grid, WizardContext state, and category filters

export type Category =
  | 'Sales'
  | 'Marketing'
  | 'Support'
  | 'Operations'
  | 'Development'
  | 'Social'
  | 'Finance'
  | 'HR'

export const CATEGORIES: Category[] = [
  'Sales',
  'Marketing',
  'Support',
  'Operations',
  'Development',
  'Social',
  'Finance',
  'HR',
]

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  /** Lucide icon name — mapped to a component in WizardLanding */
  icon: string
  category: Category
  /** Service keys from the 0nMCP 26-service catalog */
  services: string[]
  /** Popularity score 0–100, drives badge display and default sort */
  popularity: number
  /** Premium templates get a special onboarding overlay */
  premium?: boolean
  /** If true, the premium template has its own guided onboarding flow. If 'store', redirects to the store tab. */
  onboardingFlow?: boolean | 'store'
  /** Pre-populated action service keys when template is selected */
  defaultActions?: string[]
  /** Pre-populated notification channels when template is selected */
  defaultNotifications?: string[]
  /** Suggested default trigger id for the trigger step */
  defaultTrigger?: string
}

/** Backward-compatible alias used by WizardContext */
export type WizardTemplate = WorkflowTemplate

export const WIZARD_TEMPLATES: WorkflowTemplate[] = [
  // ── Sales ────────────────────────────────────────────
  {
    id: 'linkedin-lead-generator',
    name: 'LinkedIn Lead Generator',
    description:
      'Scrape LinkedIn engagement signals, enrich contacts via CRM, and send personalized outreach emails through SendGrid.',
    icon: 'Linkedin',
    category: 'Sales',
    services: ['crm', 'sendgrid'],
    popularity: 92,
    defaultActions: ['crm', 'sendgrid'],
    defaultNotifications: ['email', 'slack'],
    defaultTrigger: 'schedule',
  },
  {
    id: 'new-contact-onboarding',
    name: 'New Contact Onboarding',
    description:
      'Welcome new CRM contacts with a drip email sequence via SendGrid and alert your team in Slack.',
    icon: 'UserPlus',
    category: 'Sales',
    services: ['crm', 'sendgrid', 'slack'],
    popularity: 88,
    defaultActions: ['crm', 'sendgrid', 'slack'],
    defaultNotifications: ['slack', 'email'],
    defaultTrigger: 'new_contact',
  },
  {
    id: 'lead-score-calculator',
    name: 'Lead Score Calculator',
    description:
      'Use AI to analyze CRM contact activity, engagement signals, and firmographic data to assign lead scores automatically.',
    icon: 'TrendingUp',
    category: 'Sales',
    services: ['crm', 'anthropic'],
    popularity: 91,
    defaultActions: ['crm', 'anthropic'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'new_contact',
  },

  // ── Marketing ────────────────────────────────────────
  {
    id: 'content-writer',
    name: 'Content Writer',
    description:
      'Generate SEO-optimized blog posts and articles with AI, then log them in Google Sheets for editorial review.',
    icon: 'PenTool',
    category: 'Marketing',
    services: ['anthropic', 'google_sheets'],
    popularity: 86,
    defaultActions: ['anthropic', 'google_sheets'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'schedule',
  },
  {
    id: 'email-campaign-builder',
    name: 'Email Campaign Builder',
    description:
      'Build AI-written email campaigns in Mailchimp, segment audiences from CRM data, and A/B test subject lines.',
    icon: 'Mail',
    category: 'Marketing',
    services: ['mailchimp', 'crm', 'anthropic'],
    popularity: 84,
    defaultActions: ['mailchimp', 'crm', 'anthropic'],
    defaultNotifications: ['email', 'slack'],
    defaultTrigger: 'schedule',
  },
  {
    id: 'sms-campaign',
    name: 'SMS Campaign',
    description:
      'Send targeted SMS blasts to CRM contact segments using Twilio with delivery tracking and opt-out handling.',
    icon: 'Smartphone',
    category: 'Marketing',
    services: ['twilio', 'crm'],
    popularity: 74,
    defaultActions: ['twilio', 'crm'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'schedule',
  },

  // ── Support ──────────────────────────────────────────
  {
    id: 'support-ticket-router',
    name: 'Support Ticket Router',
    description:
      'Classify incoming Zendesk tickets by priority and topic, then route to the right Slack channel and update CRM.',
    icon: 'Headphones',
    category: 'Support',
    services: ['zendesk', 'slack', 'crm'],
    popularity: 80,
    defaultActions: ['zendesk', 'slack', 'crm'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'webhook',
  },
  {
    id: 'customer-feedback-loop',
    name: 'Customer Feedback Loop',
    description:
      'Collect Zendesk satisfaction scores, analyze sentiment with AI, and surface insights in Slack for product teams.',
    icon: 'Star',
    category: 'Support',
    services: ['zendesk', 'slack', 'anthropic'],
    popularity: 77,
    defaultActions: ['zendesk', 'slack', 'anthropic'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'webhook',
  },

  // ── Operations ───────────────────────────────────────
  {
    id: 'invoice-on-payment',
    name: 'Invoice on Payment',
    description:
      'Automatically generate a Stripe invoice when a payment succeeds, update the CRM deal, and notify your finance channel in Slack.',
    icon: 'Receipt',
    category: 'Operations',
    services: ['stripe', 'crm', 'slack'],
    popularity: 85,
    defaultActions: ['stripe', 'crm', 'slack'],
    defaultNotifications: ['slack', 'email'],
    defaultTrigger: 'payment_received',
  },
  {
    id: 'shopify-order-sync',
    name: 'Shopify Order Sync',
    description:
      'Sync new Shopify orders into your CRM as deals, tag contacts, and alert fulfillment teams in Slack.',
    icon: 'ShoppingCart',
    category: 'Operations',
    services: ['shopify', 'crm', 'slack'],
    popularity: 82,
    defaultActions: ['shopify', 'crm', 'slack'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'webhook',
  },
  {
    id: 'meeting-scheduler',
    name: 'Meeting Scheduler',
    description:
      'Coordinate availability across Google Calendar and Calendly, auto-book meetings, and post confirmations to Slack.',
    icon: 'Calendar',
    category: 'Operations',
    services: ['google_calendar', 'calendly', 'slack'],
    popularity: 76,
    defaultActions: ['google_calendar', 'calendly', 'slack'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'webhook',
  },
  {
    id: 'zoom-meeting-followup',
    name: 'Zoom Meeting Follow-up',
    description:
      'After a Zoom meeting ends, auto-send a summary email via Gmail with action items and update the CRM contact record.',
    icon: 'Mic',
    category: 'Operations',
    services: ['zoom', 'gmail', 'crm'],
    popularity: 75,
    defaultActions: ['zoom', 'gmail', 'crm'],
    defaultNotifications: ['email'],
    defaultTrigger: 'webhook',
  },
  {
    id: 'microsoft-teams-alerts',
    name: 'Microsoft Teams Alerts',
    description:
      'Push CRM pipeline changes and deal updates as formatted cards to Microsoft Teams channels in real time.',
    icon: 'Bell',
    category: 'Operations',
    services: ['microsoft', 'crm'],
    popularity: 72,
    defaultActions: ['microsoft', 'crm'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'webhook',
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    description:
      'Create Stripe invoices from CRM deal data, email the PDF via Gmail, and log the transaction in the CRM timeline.',
    icon: 'DollarSign',
    category: 'Operations',
    services: ['stripe', 'gmail', 'crm'],
    popularity: 83,
    defaultActions: ['stripe', 'gmail', 'crm'],
    defaultNotifications: ['email'],
    defaultTrigger: 'webhook',
  },

  // ── Development ──────────────────────────────────────
  {
    id: 'github-pr-notifier',
    name: 'GitHub PR Notifier',
    description:
      'Post rich PR summaries to Slack and Discord when pull requests are opened, reviewed, or merged on GitHub.',
    icon: 'GitBranch',
    category: 'Development',
    services: ['github', 'slack', 'discord'],
    popularity: 78,
    defaultActions: ['github', 'slack', 'discord'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'github_event',
  },
  {
    id: 'bug-tracker-sync',
    name: 'Bug Tracker Sync',
    description:
      'Keep Jira and Linear issues in sync bidirectionally, with status changes mirrored and Slack notifications on updates.',
    icon: 'RefreshCw',
    category: 'Development',
    services: ['jira', 'linear', 'slack'],
    popularity: 73,
    defaultActions: ['jira', 'linear', 'slack'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'webhook',
  },
  {
    id: 'data-backup-pipeline',
    name: 'Data Backup Pipeline',
    description:
      'Export Supabase tables on a schedule and upload compressed snapshots to Google Drive for disaster recovery.',
    icon: 'Database',
    category: 'Development',
    services: ['supabase', 'google_drive'],
    popularity: 70,
    defaultActions: ['supabase', 'google_drive'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'schedule',
  },
  {
    id: 'mongodb-data-pipeline',
    name: 'MongoDB Data Pipeline',
    description:
      'Replicate MongoDB collections to Supabase tables on a schedule for analytics and reporting.',
    icon: 'Repeat',
    category: 'Development',
    services: ['mongodb', 'supabase'],
    popularity: 68,
    defaultActions: ['mongodb', 'supabase'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'schedule',
  },

  // ── Social ───────────────────────────────────────────
  {
    id: 'social-media-manager',
    name: 'Social Media Manager',
    description:
      'AI-generate platform-specific posts, schedule across channels via Slack approvals, and track engagement metrics.',
    icon: 'Globe',
    category: 'Social',
    services: ['slack', 'anthropic'],
    popularity: 89,
    defaultActions: ['slack', 'anthropic'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'schedule',
  },
  {
    id: 'discord-community-bot',
    name: 'Discord Community Bot',
    description:
      'AI-moderated Discord bot that answers questions, welcomes members, and escalates complex queries with context.',
    icon: 'MessageCircle',
    category: 'Social',
    services: ['discord', 'anthropic'],
    popularity: 79,
    defaultActions: ['discord', 'anthropic'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'message_received',
  },
  {
    id: 'ai-chatbot-builder',
    name: 'AI Chatbot Builder',
    description:
      'Deploy a conversational AI chatbot powered by Anthropic that syncs interactions to CRM and escalates via Slack.',
    icon: 'Bot',
    category: 'Social',
    services: ['anthropic', 'crm', 'slack'],
    popularity: 90,
    defaultActions: ['anthropic', 'crm', 'slack'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'webhook',
  },

  // ── Finance ──────────────────────────────────────────
  {
    id: 'ecommerce-analytics',
    name: 'E-commerce Analytics',
    description:
      'Pull Shopify sales data into Google Sheets dashboards and post daily revenue summaries to Slack.',
    icon: 'BarChart3',
    category: 'Finance',
    services: ['shopify', 'google_sheets', 'slack'],
    popularity: 80,
    defaultActions: ['shopify', 'google_sheets', 'slack'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'schedule',
  },
  {
    id: 'airtable-data-sync',
    name: 'Airtable Data Sync',
    description:
      'Bidirectional sync between Airtable bases and Google Sheets, keeping reporting data fresh across both platforms.',
    icon: 'Activity',
    category: 'Finance',
    services: ['airtable', 'google_sheets'],
    popularity: 71,
    defaultActions: ['airtable', 'google_sheets'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'schedule',
  },

  // ── HR ───────────────────────────────────────────────
  {
    id: 'notion-knowledge-base',
    name: 'Notion Knowledge Base',
    description:
      'Auto-generate and update Notion wiki pages from source documents using AI summarization and categorization.',
    icon: 'Package',
    category: 'HR',
    services: ['notion', 'anthropic'],
    popularity: 81,
    defaultActions: ['notion', 'anthropic'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'schedule',
  },

  // ── Premium ──────────────────────────────────────────
  {
    id: 'qa-distribution-pipeline',
    name: 'QA Distribution Pipeline',
    description:
      'AI-powered content generation, quality scoring, platform formatting, and multi-channel distribution with engagement tracking.',
    icon: 'Sparkles',
    category: 'Marketing',
    services: ['crm', 'sendgrid', 'slack', 'anthropic'],
    popularity: 95,
    premium: true,
    onboardingFlow: true,
    defaultActions: ['crm', 'sendgrid', 'slack', 'anthropic'],
    defaultNotifications: ['slack', 'email'],
    defaultTrigger: 'schedule',
  },
  {
    id: 'linkedin-agentic-onboarding',
    name: 'LinkedIn Agentic Onboarding',
    description:
      'AI-powered LinkedIn profile analysis, archetype classification, and automated posting with self-optimizing follow-up questions. Includes PACG, LVOS, CUCIA, and TAICD subsystems.',
    icon: 'Linkedin',
    category: 'Sales',
    services: ['anthropic', 'linkedin', 'supabase'],
    popularity: 97,
    premium: true,
    onboardingFlow: 'store',
    defaultActions: ['anthropic'],
    defaultNotifications: ['slack'],
    defaultTrigger: 'webhook',
  },
]

/**
 * Return templates filtered by category, sorted by popularity descending.
 */
export function getTemplatesByCategory(category: Category): WorkflowTemplate[] {
  return WIZARD_TEMPLATES
    .filter((t) => t.category === category)
    .sort((a, b) => b.popularity - a.popularity)
}
