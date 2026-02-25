// =============================================================================
// QA Distribution Engine — Types
// =============================================================================
// Platform definitions, content types, and distribution tracking for 0nMCP
// =============================================================================

// ---------------------------------------------------------------------------
// Platform Definitions
// ---------------------------------------------------------------------------

export type PlatformId =
  | 'quora'
  | 'reddit'
  | 'poe'
  | 'warrior_forum'
  | 'indiehackers'
  | 'growthhackers'
  | 'medium'
  | 'hackernews'
  | 'producthunt'
  | 'dev_to'
  | 'hashnode'
  | 'linkedin'

export interface Platform {
  id: PlatformId
  name: string
  url: string
  domainAuthority: number

  // Content rules
  linkPolicy: 'generous' | 'moderate' | 'strict' | 'none'
  linkType: 'dofollow' | 'nofollow' | 'mixed' | 'none'
  maxLinks: number
  allowsSignatureLinks: boolean

  // Content format
  format: 'markdown' | 'html' | 'bbcode' | 'plain'
  maxLength: number | null
  minLength: number

  // Tone and style
  preferredTone: 'professional' | 'casual' | 'technical' | 'community'
  selfPromotionRules: string

  // Automation potential
  apiAvailable: boolean
  automationLevel: 'full' | 'semi' | 'manual'

  // Relevance for 0nMCP
  relevanceScore: number // 1-10
  primaryAudience: string[]
  bestContentTypes: string[]
}

export const PLATFORMS: Record<PlatformId, Platform> = {
  quora: {
    id: 'quora',
    name: 'Quora',
    url: 'https://quora.com',
    domainAuthority: 93,
    linkPolicy: 'moderate',
    linkType: 'nofollow',
    maxLinks: 2,
    allowsSignatureLinks: false,
    format: 'markdown',
    maxLength: 5000,
    minLength: 150,
    preferredTone: 'professional',
    selfPromotionRules: 'Links must add value. Answers should be helpful first. Disclosure recommended.',
    apiAvailable: false,
    automationLevel: 'semi',
    relevanceScore: 9,
    primaryAudience: ['developers', 'tech leads', 'entrepreneurs'],
    bestContentTypes: ['how-to', 'comparison', 'best practices', 'troubleshooting'],
  },

  reddit: {
    id: 'reddit',
    name: 'Reddit',
    url: 'https://reddit.com',
    domainAuthority: 99,
    linkPolicy: 'strict',
    linkType: 'nofollow',
    maxLinks: 1,
    allowsSignatureLinks: false,
    format: 'markdown',
    maxLength: 40000,
    minLength: 50,
    preferredTone: 'casual',
    selfPromotionRules: '10:1 rule - 10 helpful posts for every self-promo. Be a community member first.',
    apiAvailable: true,
    automationLevel: 'semi',
    relevanceScore: 8,
    primaryAudience: ['developers', 'AI enthusiasts', 'startup founders'],
    bestContentTypes: ['case studies', 'tools', 'discussions', 'AMAs'],
  },

  poe: {
    id: 'poe',
    name: 'Poe (Quora AI)',
    url: 'https://poe.com',
    domainAuthority: 75,
    linkPolicy: 'none',
    linkType: 'none',
    maxLinks: 0,
    allowsSignatureLinks: false,
    format: 'markdown',
    maxLength: null,
    minLength: 0,
    preferredTone: 'professional',
    selfPromotionRules: 'Build a helpful bot. Brand awareness through value.',
    apiAvailable: true,
    automationLevel: 'full',
    relevanceScore: 7,
    primaryAudience: ['ai enthusiasts', 'tech users', 'researchers'],
    bestContentTypes: ['expert bot', 'tool bot', 'knowledge base'],
  },

  warrior_forum: {
    id: 'warrior_forum',
    name: 'Warrior Forum',
    url: 'https://warriorforum.com',
    domainAuthority: 72,
    linkPolicy: 'generous',
    linkType: 'mixed',
    maxLinks: 3,
    allowsSignatureLinks: true,
    format: 'bbcode',
    maxLength: 10000,
    minLength: 100,
    preferredTone: 'community',
    selfPromotionRules: 'Signature links allowed. WSO (offers) in dedicated section.',
    apiAvailable: false,
    automationLevel: 'manual',
    relevanceScore: 6,
    primaryAudience: ['internet marketers', 'affiliate marketers', 'copywriters'],
    bestContentTypes: ['case studies', 'tutorials', 'tool reviews', 'discussions'],
  },

  indiehackers: {
    id: 'indiehackers',
    name: 'Indie Hackers',
    url: 'https://indiehackers.com',
    domainAuthority: 78,
    linkPolicy: 'moderate',
    linkType: 'dofollow',
    maxLinks: 2,
    allowsSignatureLinks: false,
    format: 'markdown',
    maxLength: 5000,
    minLength: 100,
    preferredTone: 'casual',
    selfPromotionRules: 'Share your journey authentically. Community values transparency.',
    apiAvailable: false,
    automationLevel: 'semi',
    relevanceScore: 9,
    primaryAudience: ['indie founders', 'solopreneurs', 'bootstrappers'],
    bestContentTypes: ['build in public', 'revenue updates', 'lessons learned', 'launches'],
  },

  growthhackers: {
    id: 'growthhackers',
    name: 'GrowthHackers',
    url: 'https://growthhackers.com',
    domainAuthority: 68,
    linkPolicy: 'moderate',
    linkType: 'dofollow',
    maxLinks: 2,
    allowsSignatureLinks: false,
    format: 'markdown',
    maxLength: 3000,
    minLength: 150,
    preferredTone: 'professional',
    selfPromotionRules: 'Content should provide actionable growth insights.',
    apiAvailable: false,
    automationLevel: 'semi',
    relevanceScore: 8,
    primaryAudience: ['growth marketers', 'product managers', 'startup marketers'],
    bestContentTypes: ['growth experiments', 'case studies', 'frameworks', 'tools'],
  },

  medium: {
    id: 'medium',
    name: 'Medium',
    url: 'https://medium.com',
    domainAuthority: 96,
    linkPolicy: 'generous',
    linkType: 'nofollow',
    maxLinks: 5,
    allowsSignatureLinks: false,
    format: 'html',
    maxLength: null,
    minLength: 500,
    preferredTone: 'professional',
    selfPromotionRules: 'Original content preferred. Can republish with canonical.',
    apiAvailable: true,
    automationLevel: 'full',
    relevanceScore: 7,
    primaryAudience: ['general readers', 'professionals', 'writers'],
    bestContentTypes: ['long-form articles', 'thought leadership', 'tutorials'],
  },

  hackernews: {
    id: 'hackernews',
    name: 'Hacker News',
    url: 'https://news.ycombinator.com',
    domainAuthority: 92,
    linkPolicy: 'strict',
    linkType: 'nofollow',
    maxLinks: 1,
    allowsSignatureLinks: false,
    format: 'plain',
    maxLength: 2000,
    minLength: 50,
    preferredTone: 'technical',
    selfPromotionRules: 'Show HN for launches. Comments must add value. No marketing speak.',
    apiAvailable: true,
    automationLevel: 'manual',
    relevanceScore: 9,
    primaryAudience: ['developers', 'tech founders', 'engineers'],
    bestContentTypes: ['technical deep dives', 'Show HN launches', 'Ask HN questions'],
  },

  producthunt: {
    id: 'producthunt',
    name: 'Product Hunt',
    url: 'https://producthunt.com',
    domainAuthority: 90,
    linkPolicy: 'generous',
    linkType: 'dofollow',
    maxLinks: 3,
    allowsSignatureLinks: false,
    format: 'markdown',
    maxLength: 2000,
    minLength: 100,
    preferredTone: 'casual',
    selfPromotionRules: 'Launch products. Comment helpfully on others. Build maker profile.',
    apiAvailable: true,
    automationLevel: 'semi',
    relevanceScore: 9,
    primaryAudience: ['early adopters', 'product managers', 'makers'],
    bestContentTypes: ['product launches', 'tool discussions', 'maker stories'],
  },

  dev_to: {
    id: 'dev_to',
    name: 'Dev.to',
    url: 'https://dev.to',
    domainAuthority: 85,
    linkPolicy: 'generous',
    linkType: 'dofollow',
    maxLinks: 5,
    allowsSignatureLinks: false,
    format: 'markdown',
    maxLength: null,
    minLength: 300,
    preferredTone: 'technical',
    selfPromotionRules: 'Technical content welcome. Cross-posting allowed with canonical.',
    apiAvailable: true,
    automationLevel: 'full',
    relevanceScore: 8,
    primaryAudience: ['developers', 'tech writers', 'engineers'],
    bestContentTypes: ['tutorials', 'technical guides', 'tool comparisons'],
  },

  hashnode: {
    id: 'hashnode',
    name: 'Hashnode',
    url: 'https://hashnode.com',
    domainAuthority: 82,
    linkPolicy: 'generous',
    linkType: 'dofollow',
    maxLinks: 5,
    allowsSignatureLinks: false,
    format: 'markdown',
    maxLength: null,
    minLength: 300,
    preferredTone: 'technical',
    selfPromotionRules: 'Developer blog platform. Custom domain support.',
    apiAvailable: true,
    automationLevel: 'full',
    relevanceScore: 6,
    primaryAudience: ['developers', 'tech bloggers'],
    bestContentTypes: ['tutorials', 'technical deep dives', 'career advice'],
  },

  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com',
    domainAuthority: 98,
    linkPolicy: 'moderate',
    linkType: 'nofollow',
    maxLinks: 3,
    allowsSignatureLinks: false,
    format: 'plain',
    maxLength: 3000,
    minLength: 100,
    preferredTone: 'professional',
    selfPromotionRules: 'Thought leadership content. Personal brand building.',
    apiAvailable: true,
    automationLevel: 'semi',
    relevanceScore: 8,
    primaryAudience: ['professionals', 'b2b buyers', 'tech leaders'],
    bestContentTypes: ['insights', 'case studies', 'career content', 'company updates'],
  },
}

// ---------------------------------------------------------------------------
// Subreddit Definitions
// ---------------------------------------------------------------------------

export interface Subreddit {
  name: string
  url: string
  subscribers: number
  relevanceScore: number
  selfPromoRules: 'strict' | 'moderate' | 'lenient'
  bestPostTypes: string[]
  flairRequired: boolean
  minKarma?: number
  minAccountAge?: number // days
}

export const RELEVANT_SUBREDDITS: Subreddit[] = [
  {
    name: 'r/MCP',
    url: 'https://reddit.com/r/MCP',
    subscribers: 5000,
    relevanceScore: 10,
    selfPromoRules: 'moderate',
    bestPostTypes: ['tools', 'discussions', 'tutorials'],
    flairRequired: false,
  },
  {
    name: 'r/ClaudeAI',
    url: 'https://reddit.com/r/ClaudeAI',
    subscribers: 150000,
    relevanceScore: 10,
    selfPromoRules: 'moderate',
    bestPostTypes: ['tools', 'discussions', 'use cases'],
    flairRequired: false,
  },
  {
    name: 'r/ChatGPT',
    url: 'https://reddit.com/r/ChatGPT',
    subscribers: 5000000,
    relevanceScore: 7,
    selfPromoRules: 'strict',
    bestPostTypes: ['discussions', 'tools', 'comparisons'],
    flairRequired: false,
  },
  {
    name: 'r/artificial',
    url: 'https://reddit.com/r/artificial',
    subscribers: 500000,
    relevanceScore: 8,
    selfPromoRules: 'moderate',
    bestPostTypes: ['tools', 'discussions', 'news'],
    flairRequired: false,
  },
  {
    name: 'r/SaaS',
    url: 'https://reddit.com/r/SaaS',
    subscribers: 120000,
    relevanceScore: 9,
    selfPromoRules: 'lenient',
    bestPostTypes: ['launches', 'feedback', 'growth stories'],
    flairRequired: false,
  },
  {
    name: 'r/Entrepreneur',
    url: 'https://reddit.com/r/Entrepreneur',
    subscribers: 3000000,
    relevanceScore: 7,
    selfPromoRules: 'strict',
    bestPostTypes: ['stories', 'advice requests', 'discussions'],
    flairRequired: true,
    minKarma: 10,
  },
  {
    name: 'r/startups',
    url: 'https://reddit.com/r/startups',
    subscribers: 1200000,
    relevanceScore: 8,
    selfPromoRules: 'strict',
    bestPostTypes: ['feedback requests', 'discussions', 'launches'],
    flairRequired: true,
  },
  {
    name: 'r/webdev',
    url: 'https://reddit.com/r/webdev',
    subscribers: 2000000,
    relevanceScore: 7,
    selfPromoRules: 'strict',
    bestPostTypes: ['questions', 'showoff saturday', 'discussions'],
    flairRequired: false,
  },
  {
    name: 'r/devops',
    url: 'https://reddit.com/r/devops',
    subscribers: 400000,
    relevanceScore: 8,
    selfPromoRules: 'moderate',
    bestPostTypes: ['tools', 'discussions', 'questions'],
    flairRequired: false,
  },
  {
    name: 'r/selfhosted',
    url: 'https://reddit.com/r/selfhosted',
    subscribers: 500000,
    relevanceScore: 7,
    selfPromoRules: 'moderate',
    bestPostTypes: ['tools', 'launches', 'discussions'],
    flairRequired: false,
  },
  {
    name: 'r/node',
    url: 'https://reddit.com/r/node',
    subscribers: 250000,
    relevanceScore: 8,
    selfPromoRules: 'moderate',
    bestPostTypes: ['questions', 'tools', 'discussions'],
    flairRequired: false,
  },
  {
    name: 'r/programming',
    url: 'https://reddit.com/r/programming',
    subscribers: 6000000,
    relevanceScore: 6,
    selfPromoRules: 'strict',
    bestPostTypes: ['technical deep dives', 'tools', 'discussions'],
    flairRequired: false,
  },
  {
    name: 'r/automation',
    url: 'https://reddit.com/r/automation',
    subscribers: 80000,
    relevanceScore: 9,
    selfPromoRules: 'moderate',
    bestPostTypes: ['tools', 'workflows', 'questions'],
    flairRequired: false,
  },
  {
    name: 'r/nocode',
    url: 'https://reddit.com/r/nocode',
    subscribers: 100000,
    relevanceScore: 8,
    selfPromoRules: 'lenient',
    bestPostTypes: ['tools', 'launches', 'comparisons'],
    flairRequired: false,
  },
]

// ---------------------------------------------------------------------------
// Content Generation Types
// ---------------------------------------------------------------------------

export interface ContentRequest {
  topic: string
  targetKeywords: string[]

  // Brand info
  websiteUrl: string
  websiteName: string
  businessDescription: string

  // Target platforms
  platforms: PlatformId[]

  // Content settings
  contentType: 'answer' | 'post' | 'comment' | 'article'
  numberOfVariants: number
  includeBacklinks: boolean

  // Optional
  existingQuestionUrl?: string
  targetSubreddit?: string
  additionalContext?: string
}

export interface GeneratedContent {
  id: string
  platform: PlatformId
  contentType: string

  title?: string
  body: string

  wordCount: number
  readingLevel: number
  keywordsUsed: string[]

  backlinks: {
    url: string
    anchorText: string
    position: number
  }[]

  suggestedSubreddit?: string
  suggestedQuoraTopics?: string[]
  suggestedTags?: string[]

  scores: {
    authenticity: number
    value: number
    seoOptimization: number
    platformFit: number
  }

  generatedAt: string
}

export interface ContentBatch {
  requestId: string
  request: ContentRequest
  contents: GeneratedContent[]
  summary: {
    totalPlatforms: number
    totalVariants: number
    totalWords: number
    averageScores: {
      authenticity: number
      value: number
      seoOptimization: number
      platformFit: number
    }
  }
  createdAt: string
}

// ---------------------------------------------------------------------------
// Scheduling and Tracking
// ---------------------------------------------------------------------------

export interface PostSchedule {
  id: string
  content: GeneratedContent
  platform: PlatformId

  scheduledFor: string
  timezone: string

  status: 'pending' | 'posted' | 'failed' | 'skipped'
  postedAt?: string
  postUrl?: string
  errorMessage?: string

  metrics?: {
    views?: number
    upvotes?: number
    comments?: number
    clicks?: number
    lastUpdated: string
  }
}

export interface CampaignMetrics {
  campaignId: string
  startDate: string
  endDate?: string

  totalPosts: number
  postsPerPlatform: Partial<Record<PlatformId, number>>

  totalViews: number
  totalEngagements: number
  totalClicks: number
  estimatedTraffic: number

  backlinksCounted: number
  referralTraffic: number
  conversions: number
}

// ---------------------------------------------------------------------------
// Forum Types
// ---------------------------------------------------------------------------

export interface ForumInfo {
  id: string
  name: string
  url: string
  domainAuthority: number
  monthlyTraffic?: number
  niche: string[]
  relevanceScore: number
  audienceMatch: string[]
  platform: 'discourse' | 'vbulletin' | 'xenforo' | 'phpbb' | 'custom' | 'unknown'
  hasApi: boolean
  requiresRegistration: boolean
  linkPolicy: 'allowed' | 'signature_only' | 'trusted_members' | 'none'
  selfPromoRules: string
  postRequirements?: string
  postsPerDay?: number
  activeUsers?: number
  bestSections: {
    name: string
    url: string
    description: string
  }[]
}

// ---------------------------------------------------------------------------
// Reddit Config
// ---------------------------------------------------------------------------

export interface RedditCredentials {
  clientId: string
  clientSecret: string
  username: string
  password: string
  userAgent: string
}

export interface RedditPost {
  id: string
  title: string
  selftext: string
  subreddit: string
  author: string
  url: string
  permalink: string
  score: number
  num_comments: number
  created_utc: number
  link_flair_text?: string
}

export interface RedditComment {
  id: string
  body: string
  author: string
  score: number
  permalink: string
  parent_id: string
  created_utc: number
}

export interface MonitoringConfig {
  subreddits: string[]
  keywords: string[]
  checkIntervalMinutes: number
  minScore: number
  maxAgeHours: number
  excludeAuthors: string[]
}

// ---------------------------------------------------------------------------
// Distribution Status
// ---------------------------------------------------------------------------

export type DistributionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

export interface DistributionRecord {
  id: string
  contentId: string
  platform: PlatformId
  platformUrl?: string
  status: DistributionStatus
  response?: Record<string, unknown>
  distributedAt?: string
  createdAt: string
}
