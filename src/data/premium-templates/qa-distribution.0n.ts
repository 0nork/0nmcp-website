// Phase 4: QA Distribution Premium Template
// Complete workflow definition for AI-powered content creation and distribution

export const QA_DISTRIBUTION_TEMPLATE = {
  name: 'QA Distribution Engine',
  description:
    'Generate, score, and distribute quality content across 12 platforms simultaneously. AI-powered content creation with automatic hashtag injection and engagement tracking.',
  version: '1.0.0',
  premium: true,
  category: 'Marketing',
  icon: 'Zap',
  services: ['openai', 'anthropic', 'slack', 'discord'],
  platforms: [
    { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', color: '#0077b5' },
    { id: 'reddit', name: 'Reddit', icon: 'MessageCircle', color: '#ff4500' },
    { id: 'dev_to', name: 'Dev.to', icon: 'Code2', color: '#0a0a0a' },
    { id: 'x_twitter', name: 'X (Twitter)', icon: 'Twitter', color: '#000' },
    { id: 'instagram', name: 'Instagram', icon: 'Instagram', color: '#e4405f' },
    { id: 'tiktok', name: 'TikTok', icon: 'Smartphone', color: '#010101' },
    { id: 'youtube', name: 'YouTube', icon: 'Play', color: '#ff0000' },
    { id: 'medium', name: 'Medium', icon: 'FileText', color: '#000' },
    { id: 'hashnode', name: 'Hashnode', icon: 'Hash', color: '#2962ff' },
    { id: 'facebook', name: 'Facebook', icon: 'Users', color: '#1877f2' },
    { id: 'pinterest', name: 'Pinterest', icon: 'Image', color: '#e60023' },
    { id: 'threads', name: 'Threads', icon: 'AtSign', color: '#000' },
  ],
  trigger: {
    type: 'schedule',
    frequency: 'daily',
    description: 'Runs daily at configured time',
  },
  inputs: [
    {
      key: 'topic',
      label: 'Content Topic',
      type: 'text',
      required: true,
      placeholder: 'e.g., AI automation, developer tools',
    },
    {
      key: 'keywords',
      label: 'Target Keywords',
      type: 'text',
      required: true,
      placeholder: 'comma-separated keywords',
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
      options: ['professional', 'casual', 'technical', 'witty'],
      default: 'professional',
    },
    {
      key: 'frequency',
      label: 'Post Frequency',
      type: 'select',
      options: ['daily', 'twice-daily', 'weekly', '3x-week'],
      default: 'daily',
    },
  ],
  steps: [
    {
      id: 'generate',
      name: 'Generate Content',
      service: 'openai',
      action: 'Generate topic-relevant content with AI',
    },
    {
      id: 'score',
      name: 'Quality Score',
      service: 'anthropic',
      action: 'Score content quality 0-100, reject below 70',
    },
    {
      id: 'hashtags',
      name: 'Generate Hashtags',
      service: 'openai',
      action: 'Generate platform-specific hashtags',
    },
    {
      id: 'format',
      name: 'Platform Formatting',
      service: 'openai',
      action: 'Reformat content for each target platform',
    },
    {
      id: 'schedule',
      name: 'Schedule Posts',
      service: 'internal',
      action: 'Queue posts for optimal posting times',
    },
    {
      id: 'distribute',
      name: 'Distribute',
      service: 'multi',
      action: 'Post to all selected platforms',
    },
    {
      id: 'track',
      name: 'Track Metrics',
      service: 'internal',
      action: 'Monitor engagement and log analytics',
    },
    {
      id: 'notify',
      name: 'Send Report',
      service: 'slack',
      action: 'Send daily distribution report to Slack',
    },
  ],
  notifications: ['slack', 'email'],
} as const

export type QADistributionTemplate = typeof QA_DISTRIBUTION_TEMPLATE
export type QAPlatform = (typeof QA_DISTRIBUTION_TEMPLATE.platforms)[number]
export type QAInput = (typeof QA_DISTRIBUTION_TEMPLATE.inputs)[number]
export type QAStep = (typeof QA_DISTRIBUTION_TEMPLATE.steps)[number]
