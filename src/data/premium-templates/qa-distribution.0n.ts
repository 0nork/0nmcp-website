// QA Distribution Pipeline — Premium Template
// AI-powered content creation, quality scoring, and multi-channel distribution
// Used by PremiumOnboarding.tsx and WizardLanding.tsx

export const QA_DISTRIBUTION_TEMPLATE = {
  name: 'QA Distribution Pipeline',
  description:
    'AI-powered quality assurance and lead distribution system. Generate, score, format, and distribute content across 12 platforms simultaneously with engagement tracking and daily Slack reports.',
  version: '1.0.0',
  premium: true,
  category: 'Marketing',
  icon: 'Sparkles',

  services: ['anthropic', 'openai', 'crm', 'sendgrid', 'slack', 'discord'],

  platforms: [
    { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', color: '#0077b5' },
    { id: 'reddit', name: 'Reddit', icon: 'MessageCircle', color: '#ff4500' },
    { id: 'dev_to', name: 'Dev.to', icon: 'Code2', color: '#0a0a0a' },
    { id: 'x_twitter', name: 'X (Twitter)', icon: 'Twitter', color: '#000000' },
    { id: 'instagram', name: 'Instagram', icon: 'Instagram', color: '#e4405f' },
    { id: 'tiktok', name: 'TikTok', icon: 'Smartphone', color: '#010101' },
    { id: 'youtube', name: 'YouTube', icon: 'Play', color: '#ff0000' },
    { id: 'medium', name: 'Medium', icon: 'FileText', color: '#000000' },
    { id: 'hashnode', name: 'Hashnode', icon: 'Hash', color: '#2962ff' },
    { id: 'facebook', name: 'Facebook', icon: 'Users', color: '#1877f2' },
    { id: 'pinterest', name: 'Pinterest', icon: 'Image', color: '#e60023' },
    { id: 'threads', name: 'Threads', icon: 'AtSign', color: '#000000' },
  ],

  trigger: {
    type: 'schedule',
    frequency: 'daily',
    description: 'Runs daily at the configured time',
    cron: '0 9 * * *',
  },

  inputs: [
    {
      key: 'topic',
      label: 'Content Topic',
      type: 'text',
      required: true,
      placeholder: 'e.g., AI automation, developer tools, MCP servers',
    },
    {
      key: 'keywords',
      label: 'Target Keywords',
      type: 'text',
      required: true,
      placeholder: 'comma-separated keywords for SEO and hashtag generation',
    },
    {
      key: 'websiteUrl',
      label: 'Website URL',
      type: 'url',
      required: false,
      placeholder: 'https://yoursite.com',
    },
    {
      key: 'tone',
      label: 'Content Tone',
      type: 'select',
      required: false,
      options: ['professional', 'casual', 'technical', 'witty'],
      default: 'professional',
    },
    {
      key: 'frequency',
      label: 'Post Frequency',
      type: 'select',
      required: false,
      options: ['daily', 'twice-daily', '3x-week', 'weekly'],
      default: 'daily',
    },
  ],

  steps: [
    {
      id: 'research',
      name: 'Research Trends',
      service: 'anthropic',
      action: 'Analyze trending topics and competitor content for the configured niche',
      description:
        'Claude scans recent trends, news, and competitor posts in your topic area to identify high-engagement angles.',
    },
    {
      id: 'generate',
      name: 'Generate Content',
      service: 'anthropic',
      action: 'Create original long-form content based on research and topic configuration',
      description:
        'Generates a comprehensive content piece incorporating target keywords, brand voice, and trending angles.',
    },
    {
      id: 'quality-score',
      name: 'Quality Score',
      service: 'anthropic',
      action: 'Score content quality 0-100 and reject anything below 70',
      description:
        'AI evaluates readability, originality, keyword density, engagement potential, and brand alignment. Content scoring below 70 is regenerated.',
    },
    {
      id: 'generate-hashtags',
      name: 'Generate Hashtags',
      service: 'anthropic',
      action: 'Generate platform-specific hashtag sets from target keywords',
      description:
        'Creates optimized hashtag sets for each platform — trending tags for Twitter/Instagram, professional tags for LinkedIn, community tags for Reddit/Dev.to.',
    },
    {
      id: 'format-platforms',
      name: 'Platform Formatting',
      service: 'anthropic',
      action: 'Reformat the source content for each target platform',
      description:
        'Adapts content length, tone, and structure per platform: threads for Twitter, long-form for LinkedIn/Medium, short captions for Instagram/TikTok.',
    },
    {
      id: 'schedule-posts',
      name: 'Schedule Posts',
      service: 'internal',
      action: 'Queue posts at optimal times per platform and timezone',
      description:
        'Uses engagement data to schedule each post at the highest-traffic window for its platform.',
    },
    {
      id: 'distribute',
      name: 'Distribute',
      service: 'multi',
      action: 'Publish formatted content to all selected platforms',
      description:
        'Posts to every selected platform via their respective APIs, handling rate limits and retries automatically.',
    },
    {
      id: 'track-metrics',
      name: 'Track Metrics',
      service: 'internal',
      action: 'Monitor engagement metrics across all platforms for 24 hours',
      description:
        'Collects likes, shares, comments, clicks, and impressions from each platform and stores them for the daily report.',
    },
    {
      id: 'crm-sync',
      name: 'CRM Sync',
      service: 'crm',
      action: 'Log engagement data and leads generated back to CRM contacts',
      description:
        'Any leads or interactions generated from distributed content are synced back to CRM records with attribution.',
    },
    {
      id: 'send-report',
      name: 'Send Report',
      service: 'slack',
      action: 'Post daily distribution and engagement report to Slack',
      description:
        'Sends a formatted Slack message with per-platform metrics, top-performing content, and recommendations for the next cycle.',
    },
  ],

  notifications: ['slack', 'email'],

  config: {
    qualityThreshold: 70,
    maxRetries: 3,
    retryDelay: 5000,
    timezone: 'America/New_York',
    enableEngagementTracking: true,
    trackingWindowHours: 24,
    autoRegenerate: true,
    slackChannel: '#content-distribution',
    emailReportRecipients: [],
    platformDefaults: {
      linkedin: { maxLength: 3000, includeHashtags: true, includeLink: true },
      x_twitter: { maxLength: 280, threadIfLong: true, includeHashtags: true },
      reddit: { subreddit: '', titleMaxLength: 300, includeLink: true },
      dev_to: { tags: 4, canonical: true },
      instagram: { maxHashtags: 30, includeCaption: true },
      medium: { canonical: true, tags: 5 },
      discord: { channelId: '', embedFormat: true },
      facebook: { maxLength: 5000, includeLink: true },
    },
  },
} as const

export type QADistributionTemplate = typeof QA_DISTRIBUTION_TEMPLATE
export type QAPlatform = (typeof QA_DISTRIBUTION_TEMPLATE.platforms)[number]
export type QAInput = (typeof QA_DISTRIBUTION_TEMPLATE.inputs)[number]
export type QAStep = (typeof QA_DISTRIBUTION_TEMPLATE.steps)[number]
export type QAConfig = typeof QA_DISTRIBUTION_TEMPLATE.config
