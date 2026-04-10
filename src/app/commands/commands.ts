export type CommandCategory =
  | 'lead-intelligence'
  | 'outreach'
  | 'content'
  | 'revenue'
  | 'development'
  | 'research'
  | 'automation'
  | 'security'
  | 'power';

export type ServiceName =
  | 'ZoomInfo'
  | 'LinkedIn'
  | 'Clearbit'
  | 'Hunter'
  | 'HubSpot'
  | 'Pipedrive'
  | 'Salesforce'
  | 'Stripe'
  | 'Square'
  | 'QuickBooks'
  | 'GitHub'
  | 'Vercel'
  | 'Supabase'
  | 'Linear'
  | 'Jira'
  | 'Sentry'
  | 'Gmail'
  | 'Slack'
  | 'Notion'
  | 'Google Calendar'
  | 'Google Drive'
  | 'Asana'
  | 'Trello'
  | 'Monday'
  | 'Shopify'
  | 'WooCommerce'
  | 'Webflow'
  | 'Twilio'
  | 'SendGrid'
  | 'Mailchimp'
  | 'Figma'
  | 'Canva'
  | 'AWS'
  | 'Cloudflare'
  | 'Shodan'
  | 'npm'
  | 'n8n'
  | 'Zapier'
  | '0nmcp';

export interface Command {
  id: string;
  title: string;
  description: string;
  category: CommandCategory;
  services: ServiceName[];
  claudePrompt: string;
  slackPrompt: string;
  tags: string[];
  outputExample?: string;
  isPower?: boolean;
  isFree?: boolean;
}

export const CATEGORIES: Record<CommandCategory, { label: string; description: string }> = {
  'lead-intelligence': {
    label: 'Lead Intelligence',
    description: 'Find, enrich, and score prospects',
  },
  outreach: {
    label: 'Outreach',
    description: 'Personalized emails, DMs, and sequences',
  },
  content: {
    label: 'Content & Social',
    description: 'LinkedIn posts, newsletters, VPIS scoring',
  },
  revenue: {
    label: 'Revenue & Ops',
    description: 'Pipeline, invoices, churn, metrics',
  },
  development: {
    label: 'Development',
    description: 'GitHub, Vercel, Supabase, bugs, deploys',
  },
  research: {
    label: 'Research',
    description: 'Markets, people, companies, signals',
  },
  automation: {
    label: 'Automation',
    description: 'Workflows, briefings, reports, triggers',
  },
  security: {
    label: 'Security',
    description: 'Audits, secrets scanning, supply chain',
  },
  power: {
    label: 'Power Commands',
    description: 'Full-stack multi-service orchestration',
  },
};

export const COMMANDS: Command[] = [
  // ─── LEAD INTELLIGENCE (CMD-001 through CMD-008) ───────────────────────────
  {
    id: 'CMD-001',
    title: 'Intent Lead List',
    description: 'Find companies showing buying intent in a specific industry with firmographic filters and decision-maker contacts.',
    category: 'lead-intelligence',
    services: ['ZoomInfo', 'LinkedIn', 'Clearbit'],
    isPower: true,
    claudePrompt: `/use 0nmcp

Find [N] companies in [industry] with [revenue range] revenue that are showing buying intent for [product/service category].
Filter by company size, location, and tech stack.
For each company, find the top 3 decision-makers (VP+ level) with verified email addresses.
Score each lead 1-100 based on intent signals, company fit, and recency.
Return a ranked list with company name, revenue, employee count, decision-maker names, titles, emails, and intent score.`,
    slackPrompt: 'leads [industry] [revenue range]',
    tags: ['prospecting', 'intent', 'firmographics', 'decision-makers', 'lead-scoring'],
  },
  {
    id: 'CMD-002',
    title: 'Contact Enrichment',
    description: 'Enrich a contact or list of contacts with firmographic data, social profiles, verified emails, and phone numbers.',
    category: 'lead-intelligence',
    services: ['ZoomInfo', 'LinkedIn', 'Clearbit', 'Hunter'],
    claudePrompt: `/use 0nmcp

Take this contact: [name / email / LinkedIn URL / company].
Enrich with full firmographic and demographic data from all available sources.
Find verified email (with deliverability score), direct phone, LinkedIn profile, current title and company.
Include company details: revenue, employee count, industry, tech stack, funding stage.
Flag any data conflicts between sources and indicate confidence level for each field.`,
    slackPrompt: 'enrich [name or email or LinkedIn URL]',
    tags: ['enrichment', 'contacts', 'verification', 'firmographics'],
  },
  {
    id: 'CMD-003',
    title: 'LinkedIn Post \u2192 Lead List',
    description: 'Extract everyone who engaged with a LinkedIn post and turn them into an enriched lead list.',
    category: 'lead-intelligence',
    services: ['LinkedIn', 'ZoomInfo', 'Clearbit'],
    isPower: true,
    claudePrompt: `/use 0nmcp

Analyze this LinkedIn post: [post URL or description].
Extract all users who liked, commented, or shared the post.
Enrich each person with company, title, email, and firmographic data.
Filter to only include people matching [ICP criteria: industry, title level, company size].
Score and rank by engagement type (comment > share > like) and ICP fit.
Return a prioritized lead list ready for outreach.`,
    slackPrompt: 'post-leads [LinkedIn post URL]',
    tags: ['linkedin', 'engagement', 'social-selling', 'lead-extraction'],
  },
  {
    id: 'CMD-004',
    title: 'Company Research Brief',
    description: 'Generate a comprehensive research brief on any company including financials, tech stack, key people, and vulnerabilities.',
    category: 'lead-intelligence',
    services: ['ZoomInfo', 'LinkedIn', 'Clearbit', 'Shodan'],
    claudePrompt: `/use 0nmcp

Research [company name] and produce a comprehensive brief.
Include: revenue, funding, employee count, growth trajectory, tech stack, key executives, recent news, job postings (hiring signals), competitive positioning.
Scan their public infrastructure for tech stack confirmation.
Identify potential pain points and buying triggers based on hiring patterns and tech choices.
Format as a structured brief with executive summary, key metrics, opportunity analysis, and recommended approach.`,
    slackPrompt: 'research [company name]',
    tags: ['company-research', 'competitive-intel', 'tech-stack', 'briefing'],
  },
  {
    id: 'CMD-005',
    title: 'Lookalike Finder',
    description: 'Find companies that look like your best customers based on shared firmographic and technographic attributes.',
    category: 'lead-intelligence',
    services: ['ZoomInfo', 'Clearbit', 'LinkedIn'],
    claudePrompt: `/use 0nmcp

Analyze these example companies: [company list or description of ideal customer].
Identify their shared attributes: industry, revenue range, employee count, tech stack, growth stage, geography.
Find [N] lookalike companies that match the same profile but are not yet customers.
Rank by similarity score and include key decision-maker contacts for each.
Highlight any companies showing active buying signals.`,
    slackPrompt: 'lookalikes [company name or list]',
    tags: ['lookalike', 'ICP', 'prospecting', 'similarity'],
  },
  {
    id: 'CMD-006',
    title: 'Competitor Customer Poacher',
    description: 'Identify companies using a competitor product and find the decision-makers responsible for that vendor relationship.',
    category: 'lead-intelligence',
    services: ['ZoomInfo', 'Clearbit', 'Shodan', 'LinkedIn'],
    claudePrompt: `/use 0nmcp

Find companies currently using [competitor product/service].
Detect via technographic data, job postings mentioning the tool, and public infrastructure scanning.
For each company, identify the person who likely owns that vendor relationship (title patterns: VP Ops, Director of IT, Head of Marketing, etc.).
Enrich contacts with verified emails.
Prioritize companies whose contracts may be up for renewal (look for job postings, negative reviews, or switching signals).`,
    slackPrompt: 'poach [competitor name]',
    tags: ['competitive', 'displacement', 'technographics', 'switching'],
  },
  {
    id: 'CMD-007',
    title: 'Funding Alert \u2192 Outreach',
    description: 'Find recently funded companies and generate personalized outreach based on their new budget and priorities.',
    category: 'lead-intelligence',
    services: ['Clearbit', 'ZoomInfo', 'LinkedIn', 'Gmail'],
    claudePrompt: `/use 0nmcp

Find companies that raised [funding round: Seed/A/B/C/D] in the last [N] days in [industry].
For each, identify the amount raised, lead investors, and stated use of funds.
Find the decision-maker most likely to spend on [your product category].
Generate a personalized outreach email for each that references their funding, congratulates them, and ties your solution to their growth plans.
Draft but do not send -- output the emails for review.`,
    slackPrompt: 'funded [round] [industry] [days]',
    tags: ['funding', 'trigger-events', 'outreach', 'personalization'],
  },
  {
    id: 'CMD-008',
    title: 'Job Posting Intelligence',
    description: 'Analyze job postings at target companies to infer buying signals, tech stack, budget, and org structure.',
    category: 'lead-intelligence',
    services: ['LinkedIn', 'Clearbit', 'ZoomInfo'],
    claudePrompt: `/use 0nmcp

Analyze recent job postings from [company name or list of companies].
Identify tools and technologies mentioned in requirements (buying signals).
Infer org structure changes, new initiatives, and budget allocation from role descriptions.
Flag any postings that suggest they need [your product/service category].
Summarize findings with recommended outreach angle for each company.`,
    slackPrompt: 'jobs [company name]',
    tags: ['job-postings', 'hiring-signals', 'tech-stack', 'buying-intent'],
  },

  // ─── OUTREACH (CMD-009 through CMD-013) ────────────────────────────────────
  {
    id: 'CMD-009',
    title: 'Personalized Email Sequence',
    description: 'Generate a multi-step email sequence personalized to a specific prospect using enrichment data.',
    category: 'outreach',
    services: ['ZoomInfo', 'LinkedIn', 'Gmail'],
    claudePrompt: `/use 0nmcp

Create a 5-step personalized email sequence for [prospect name/email/company].
First, enrich the contact to understand their role, company, recent activity, and interests.
Write each email with specific personalization -- reference their LinkedIn posts, company news, tech stack, or mutual connections.
Sequence timing: Day 1, Day 3, Day 7, Day 14, Day 21.
Each email should have a different angle: value prop, social proof, pain point, case study, breakup.
Output subject lines, body copy, and recommended send times.`,
    slackPrompt: 'sequence [prospect name or email]',
    tags: ['email', 'sequence', 'personalization', 'outreach', 'cadence'],
  },
  {
    id: 'CMD-010',
    title: 'LinkedIn Connection Note',
    description: 'Generate a personalized LinkedIn connection request note based on the prospect profile.',
    category: 'outreach',
    services: ['LinkedIn'],
    isFree: true,
    claudePrompt: `/use 0nmcp

Write a LinkedIn connection request note for [prospect name / LinkedIn URL].
Research their profile: current role, recent posts, shared connections, mutual interests.
Write a concise (<300 char) connection note that feels genuine, references something specific about them, and gives a clear reason to connect.
Provide 3 variations: casual, professional, and mutual-value.`,
    slackPrompt: 'connect [LinkedIn URL or name]',
    tags: ['linkedin', 'connection', 'networking', 'personalization'],
  },
  {
    id: 'CMD-011',
    title: 'Meeting Prep Brief',
    description: 'Generate a comprehensive meeting prep brief with attendee research, talking points, and suggested agenda.',
    category: 'outreach',
    services: ['Google Calendar', 'ZoomInfo', 'LinkedIn', 'Gmail'],
    claudePrompt: `/use 0nmcp

Prepare me for my upcoming meeting with [person/company or "my next meeting"].
Pull the meeting details from my calendar.
Research every attendee: current role, career history, LinkedIn activity, company background, recent news.
Check my email history with them for context on past conversations.
Generate a brief with: attendee profiles, company overview, potential objections, talking points, 3 smart questions to ask, and a suggested agenda.`,
    slackPrompt: 'prep [meeting name or contact]',
    tags: ['meeting', 'preparation', 'research', 'agenda', 'calendar'],
  },
  {
    id: 'CMD-012',
    title: 'Follow-Up Sequence After No Response',
    description: 'Generate a strategic follow-up sequence for prospects who have not responded, using new angles and data.',
    category: 'outreach',
    services: ['HubSpot', 'LinkedIn', 'Gmail', 'Clearbit'],
    claudePrompt: `/use 0nmcp

This prospect went dark: [name/email/company].
Check CRM for all previous touchpoints and email history.
Find any new trigger events: funding, job changes, new hires, company news, LinkedIn posts.
Generate a 3-step re-engagement sequence using fresh angles:
1. Reference a new trigger event or share relevant content
2. Provide a micro case study or ROI stat
3. Respectful breakup email with an open door
Each email should feel like a new conversation, not a "just checking in."`,
    slackPrompt: 'followup [prospect name or email]',
    tags: ['follow-up', 're-engagement', 'persistence', 'email'],
  },
  {
    id: 'CMD-013',
    title: 'Slack Announcement Writer',
    description: 'Write a polished Slack announcement for your team channel with proper formatting and tone.',
    category: 'outreach',
    services: ['Slack'],
    isFree: true,
    claudePrompt: `/use 0nmcp

Write a Slack announcement for [topic/update/news].
Channel: [#channel-name or general].
Tone: [professional / casual / celebratory / urgent].
Include proper Slack formatting: bold headers, bullet points, emoji where appropriate.
Keep it scannable -- people skim Slack. Lead with the key takeaway.
If there are action items, make them clear with owners and deadlines.`,
    slackPrompt: 'announce [topic] in [#channel]',
    tags: ['slack', 'announcement', 'internal-comms', 'formatting'],
  },

  // ─── CONTENT & SOCIAL (CMD-014 through CMD-019) ───────────────────────────
  {
    id: 'CMD-014',
    title: 'LinkedIn Post (VPIS-Optimized)',
    description: 'Write a LinkedIn post optimized for the VPIS scoring framework: Value, Personal, Insight, Structure.',
    category: 'content',
    services: ['0nmcp', 'LinkedIn'],
    isFree: true,
    isPower: true,
    claudePrompt: `/use 0nmcp

Write a LinkedIn post about [topic].
Optimize using the VPIS framework:
- Value: Lead with a concrete takeaway the reader can use today
- Personal: Include a real story, failure, or lesson learned
- Insight: Share a non-obvious perspective or contrarian take
- Structure: Use line breaks, hooks, and a clear CTA
Target length: 150-250 words. Strong hook in the first line (pattern interrupt).
Include 3-5 relevant hashtags. No cringe, no fluff, no "I'm humbled."
Provide 3 variations: storytelling, data-driven, and hot-take.`,
    slackPrompt: 'post [topic]',
    tags: ['linkedin', 'VPIS', 'social-media', 'copywriting', 'hooks'],
  },
  {
    id: 'CMD-015',
    title: 'Content Repurposer \u2014 5 Formats',
    description: 'Take one piece of content and repurpose it into 5 different formats for maximum reach.',
    category: 'content',
    services: ['Notion', 'LinkedIn', '0nmcp'],
    isFree: true,
    claudePrompt: `/use 0nmcp

Take this content: [paste content, URL, or describe the topic].
Repurpose into 5 formats:
1. LinkedIn post (VPIS-optimized, 150-250 words)
2. Twitter/X thread (8-12 tweets, each standalone valuable)
3. Email newsletter section (300 words, conversational)
4. Blog intro paragraph (SEO-optimized, includes target keyword)
5. Slack internal summary (bullet points, key takeaways)
Maintain the core message across all formats but adapt tone and structure for each platform.`,
    slackPrompt: 'repurpose [content or URL]',
    tags: ['repurposing', 'content', 'multi-format', 'distribution'],
  },
  {
    id: 'CMD-016',
    title: 'Competitor Content Analyzer',
    description: 'Analyze a competitor LinkedIn profile or content strategy and identify gaps and opportunities.',
    category: 'content',
    services: ['LinkedIn', '0nmcp'],
    isFree: true,
    claudePrompt: `/use 0nmcp

Analyze the content strategy of [competitor name / LinkedIn profile URL].
Review their last 20-30 LinkedIn posts.
Identify: posting frequency, top-performing content themes, engagement patterns, tone and style, hashtag strategy.
Find content gaps -- topics they are NOT covering that their audience would care about.
Generate 5 content ideas that would outperform their best posts by addressing those gaps.
Include recommended posting schedule and format for each idea.`,
    slackPrompt: 'analyze-content [competitor name or URL]',
    tags: ['competitive', 'content-strategy', 'analysis', 'gaps'],
  },
  {
    id: 'CMD-017',
    title: 'Viral Post Finder + Comment Generator',
    description: 'Find trending posts in your niche and generate thoughtful comments that drive profile visits.',
    category: 'content',
    services: ['LinkedIn', '0nmcp'],
    isFree: true,
    isPower: true,
    claudePrompt: `/use 0nmcp

Find viral or trending LinkedIn posts in [industry/niche] from the last 48 hours.
Filter for posts with high engagement (100+ likes or 20+ comments) from accounts with [follower range].
For each post, generate a thoughtful comment that:
- Adds genuine value or a unique perspective (not "Great post!")
- Positions you as knowledgeable in the space
- Is concise (2-4 sentences max)
- Naturally encourages a reply from the author
Return the top 10 posts with your drafted comments, ordered by potential visibility.`,
    slackPrompt: 'viral [industry/niche]',
    tags: ['linkedin', 'viral', 'comments', 'engagement', 'visibility'],
  },
  {
    id: 'CMD-018',
    title: 'Newsletter Writer',
    description: 'Write a complete newsletter issue with sections, formatting, and a compelling subject line.',
    category: 'content',
    services: ['Mailchimp', 'SendGrid', 'Notion', '0nmcp'],
    isFree: true,
    claudePrompt: `/use 0nmcp

Write a newsletter about [topic/theme] for [audience].
Structure:
- Subject line (A/B test: 2 options, <60 chars, curiosity-driven)
- Preview text (<90 chars)
- Hero section: bold opening stat or question
- Main story (300-400 words): insight, data, takeaway
- Quick hits: 3 bullet-point items (trends, tools, links)
- CTA: one clear action for the reader
- Sign-off: personal, warm, brief
Tone: [professional / casual / witty]. Keep total read time under 4 minutes.`,
    slackPrompt: 'newsletter [topic] for [audience]',
    tags: ['newsletter', 'email', 'copywriting', 'content'],
  },
  {
    id: 'CMD-019',
    title: 'SEO Brief Generator',
    description: 'Generate a complete SEO content brief with keyword strategy, outline, and competitive analysis.',
    category: 'content',
    services: ['0nmcp'],
    isFree: true,
    claudePrompt: `/use 0nmcp

Create an SEO content brief for the target keyword: [keyword].
Include:
- Primary keyword + 10 secondary/related keywords
- Search intent analysis (informational, transactional, navigational)
- Top 5 competing pages: their word count, structure, and gaps
- Recommended word count, title tag, meta description, H1
- Full outline with H2s and H3s (include target keywords naturally)
- Content angle that differentiates from existing results
- Internal linking opportunities and suggested anchor text
- Featured snippet opportunity analysis`,
    slackPrompt: 'seo [target keyword]',
    tags: ['SEO', 'content-brief', 'keywords', 'outline', 'competitive'],
  },

  // ─── REVENUE & OPS (CMD-020 through CMD-025) ──────────────────────────────
  {
    id: 'CMD-020',
    title: 'Pipeline Health Check',
    description: 'Analyze your sales pipeline for stuck deals, at-risk revenue, and stage conversion bottlenecks.',
    category: 'revenue',
    services: ['HubSpot', 'Pipedrive', 'Salesforce'],
    claudePrompt: `/use 0nmcp

Run a full pipeline health check on my CRM.
Analyze all open deals and identify:
- Deals stuck in the same stage for more than [N] days
- Deals with no activity in the last 14 days
- Stage-by-stage conversion rates and where deals are dropping off
- Total pipeline value, weighted pipeline, and expected close this month/quarter
- Top 5 deals most likely to close and top 5 most at risk
Provide specific recommendations for each at-risk deal: next best action, who to contact, what to say.`,
    slackPrompt: 'pipeline [days stuck threshold]',
    tags: ['pipeline', 'CRM', 'deals', 'forecasting', 'health-check'],
  },
  {
    id: 'CMD-021',
    title: 'Deal Intelligence Brief',
    description: 'Deep-dive on a specific deal with stakeholder mapping, risk analysis, and recommended next steps.',
    category: 'revenue',
    services: ['HubSpot', 'ZoomInfo', 'LinkedIn', 'Gmail'],
    claudePrompt: `/use 0nmcp

Generate a deal intelligence brief for [deal name / company].
Pull all CRM data: deal stage, amount, close date, activity history, notes.
Research the company and all stakeholders involved in the deal.
Map the buying committee: champion, decision-maker, influencer, blocker.
Analyze email sentiment from recent conversations.
Identify risks: competitor mentions, budget concerns, timeline delays.
Provide a win probability estimate and 3 specific actions to advance the deal this week.`,
    slackPrompt: 'deal [deal name or company]',
    tags: ['deal', 'intelligence', 'stakeholder-mapping', 'risk-analysis'],
  },
  {
    id: 'CMD-022',
    title: 'Revenue Report',
    description: 'Generate a revenue report with MRR, transaction volume, top customers, and trend analysis.',
    category: 'revenue',
    services: ['Stripe', 'Square'],
    claudePrompt: `/use 0nmcp

Generate a comprehensive revenue report for the last [time period: 30 days / quarter / year].
Include:
- Total revenue, MRR/ARR, and growth rate vs. previous period
- Transaction count and average transaction value
- Top 10 customers by revenue
- Revenue by product/plan breakdown
- New vs. expansion vs. churned revenue
- Payment failure rate and recovery rate
Format as an executive summary with key metrics up top and detailed breakdowns below.`,
    slackPrompt: 'revenue [time period]',
    tags: ['revenue', 'MRR', 'Stripe', 'analytics', 'reporting'],
  },
  {
    id: 'CMD-023',
    title: 'Invoice Creator + Sender',
    description: 'Create and optionally send a professional invoice through Stripe or Square.',
    category: 'revenue',
    services: ['Stripe', 'Square', 'Gmail'],
    claudePrompt: `/use 0nmcp

Create an invoice for [customer name / email].
Line items:
- [Item 1]: [description], [quantity], [unit price]
- [Item 2]: [description], [quantity], [unit price]
Payment terms: [Net 30 / Due on receipt / custom].
Include any applicable tax rate: [percentage or "auto-detect"].
Generate the invoice in Stripe/Square and draft a professional email with the payment link.
Do NOT send until I confirm -- show me the invoice details and email draft first.`,
    slackPrompt: 'invoice [customer] [amount] [description]',
    tags: ['invoice', 'billing', 'payments', 'Stripe'],
  },
  {
    id: 'CMD-024',
    title: 'Churn Risk Alert',
    description: 'Identify customers showing churn signals and generate retention playbooks for each.',
    category: 'revenue',
    services: ['Stripe', 'HubSpot', 'Gmail'],
    claudePrompt: `/use 0nmcp

Analyze my customer base for churn risk signals.
Check for:
- Failed payments or expiring cards in the next 30 days
- Customers who downgraded or reduced usage
- Support tickets with negative sentiment
- Customers with no login/activity in 30+ days
- Contracts expiring in the next 60 days without renewal signal
For each at-risk customer, generate a retention playbook:
- Risk level (high/medium/low) with reasoning
- Recommended intervention (email, call, discount, feature highlight)
- Draft outreach message personalized to their situation`,
    slackPrompt: 'churn-risk',
    tags: ['churn', 'retention', 'customer-success', 'alerts'],
  },
  {
    id: 'CMD-025',
    title: 'Subscription Analytics',
    description: 'Deep dive into subscription metrics: MRR movements, cohort retention, and LTV analysis.',
    category: 'revenue',
    services: ['Stripe'],
    claudePrompt: `/use 0nmcp

Analyze my Stripe subscription data and provide:
- MRR breakdown: new, expansion, contraction, churned, reactivated
- Monthly cohort retention table (last 6 months)
- Average LTV and LTV:CAC ratio (if CAC data available)
- Plan distribution: how many customers on each plan
- Trial-to-paid conversion rate
- Dunning recovery rate (failed payment retries)
- Projected MRR for next 3 months based on current trends
Highlight the single biggest lever to grow MRR and the single biggest risk.`,
    slackPrompt: 'subscriptions [time period]',
    tags: ['subscriptions', 'MRR', 'cohort', 'LTV', 'analytics'],
  },

  // ─── DEVELOPMENT (CMD-026 through CMD-031) ────────────────────────────────
  {
    id: 'CMD-026',
    title: 'Deploy Status Check',
    description: 'Check the current deployment status across Vercel, GitHub, and Supabase for all projects.',
    category: 'development',
    services: ['Vercel', 'GitHub', 'Supabase'],
    claudePrompt: `/use 0nmcp

Check the deployment status across all my infrastructure:
- Vercel: latest deployment status, build time, any errors, domain health
- GitHub: latest commits on main, any failing CI checks, open PRs
- Supabase: database health, migration status, edge function status
For any failures or warnings, provide the error details and a suggested fix.
Format as a dashboard-style status report with green/yellow/red indicators.`,
    slackPrompt: 'deploy-status',
    tags: ['deployment', 'status', 'Vercel', 'GitHub', 'Supabase', 'health'],
  },
  {
    id: 'CMD-027',
    title: 'GitHub PR Summary',
    description: 'Summarize open pull requests with change analysis, risk assessment, and review recommendations.',
    category: 'development',
    services: ['GitHub'],
    claudePrompt: `/use 0nmcp

Summarize all open pull requests in [repo or "all my repos"].
For each PR, provide:
- Title, author, branch, files changed, lines added/removed
- Plain-English summary of what the changes do
- Risk assessment: breaking changes, migration needed, security implications
- Review recommendation: approve, request changes, or needs discussion
- How long the PR has been open and if it has merge conflicts
Prioritize PRs by age and risk level.`,
    slackPrompt: 'prs [repo name]',
    tags: ['GitHub', 'pull-requests', 'code-review', 'summary'],
  },
  {
    id: 'CMD-028',
    title: 'Database Query (Plain English)',
    description: 'Query your Supabase database using plain English -- no SQL required.',
    category: 'development',
    services: ['Supabase'],
    claudePrompt: `/use 0nmcp

I want to query my Supabase database. Here is what I need in plain English:
[describe what data you want, e.g., "all users who signed up in the last 7 days and have made at least one purchase"]

First, show me the tables and columns available in my database.
Then translate my request into a SQL query, explain what it does, and run it.
Return the results in a clean table format.
If the query could be slow or return too many rows, warn me and suggest optimizations.`,
    slackPrompt: 'query [plain English description]',
    tags: ['database', 'SQL', 'Supabase', 'query', 'plain-english'],
  },
  {
    id: 'CMD-029',
    title: 'Bug Triage + Ticket Creator',
    description: 'Analyze a bug report, assess severity, and create a properly formatted ticket in your project tracker.',
    category: 'development',
    services: ['GitHub', 'Linear', 'Sentry'],
    claudePrompt: `/use 0nmcp

Triage this bug: [describe the bug or paste error message/stack trace].
Check Sentry for related errors, frequency, and affected users.
Check GitHub for similar issues or recent commits that may have introduced this.
Assess severity (critical/high/medium/low) based on user impact and frequency.
Create a ticket in [Linear/GitHub Issues] with:
- Clear title, reproduction steps, expected vs actual behavior
- Severity label, affected area, and suggested assignee
- Link to relevant Sentry events and code references`,
    slackPrompt: 'bug [description or error message]',
    tags: ['bugs', 'triage', 'tickets', 'Sentry', 'Linear'],
  },
  {
    id: 'CMD-030',
    title: 'Security Audit',
    description: 'Run a security audit on your codebase checking for vulnerabilities, outdated deps, and exposed secrets.',
    category: 'development',
    services: ['GitHub', 'npm', '0nmcp'],
    claudePrompt: `/use 0nmcp

Run a security audit on [repo name or "all repos"].
Check for:
- Known vulnerabilities in dependencies (npm audit)
- Outdated packages with available security patches
- Exposed secrets or API keys in code (scan commit history)
- Insecure configurations (CORS, CSP headers, auth patterns)
- Dependency supply chain risks (typosquatting, unmaintained packages)
Rate overall security posture (A-F) and provide a prioritized list of fixes.
Flag any critical issues that need immediate attention.`,
    slackPrompt: 'audit [repo name]',
    tags: ['security', 'audit', 'vulnerabilities', 'dependencies', 'secrets'],
  },
  {
    id: 'CMD-031',
    title: 'Codebase Explainer',
    description: 'Get a plain-English explanation of any repository structure, architecture, and key patterns.',
    category: 'development',
    services: ['GitHub'],
    claudePrompt: `/use 0nmcp

Explain the codebase at [repo name or URL].
Provide:
- High-level architecture diagram (text-based)
- Tech stack breakdown: languages, frameworks, databases, services
- Directory structure with purpose of each major folder
- Key patterns used: state management, API layer, auth flow, data flow
- Entry points: where does execution start, how are requests handled
- How to set up locally, run tests, and deploy
Write for a developer joining the team on their first day.`,
    slackPrompt: 'explain [repo name]',
    tags: ['codebase', 'architecture', 'documentation', 'onboarding'],
  },

  // ─── RESEARCH (CMD-032 through CMD-036) ────────────────────────────────────
  {
    id: 'CMD-032',
    title: 'Market Research Brief',
    description: 'Generate a market research brief with TAM, trends, competitors, and opportunity analysis.',
    category: 'research',
    services: ['0nmcp'],
    isFree: true,
    claudePrompt: `/use 0nmcp

Research the [industry/market] market and produce a brief covering:
- Total Addressable Market (TAM) size and growth rate
- Key trends shaping the market in the next 2-3 years
- Major players: market share, positioning, strengths/weaknesses
- Emerging disruptors and new entrants to watch
- Customer segments and their unmet needs
- Regulatory or macro factors that could impact the market
- Opportunity areas for a new entrant or expansion
Format as a structured brief with executive summary and data points.`,
    slackPrompt: 'market [industry or market name]',
    tags: ['market-research', 'TAM', 'trends', 'competitive-landscape'],
  },
  {
    id: 'CMD-033',
    title: 'Person Deep Dive',
    description: 'Research everything publicly available about a person: career, social presence, interests, connections.',
    category: 'research',
    services: ['ZoomInfo', 'LinkedIn', 'Clearbit'],
    claudePrompt: `/use 0nmcp

Do a deep dive on [person name / LinkedIn URL / email].
Compile:
- Full career history with timeline
- Current company and role details
- LinkedIn activity: recent posts, engagement patterns, interests
- Published content: articles, podcasts, speaking engagements
- Mutual connections and shared networks
- Estimated influence score based on following and engagement
- Communication style analysis (formal vs. casual, data-driven vs. emotional)
Output a profile brief that would help anyone prepare for a conversation with this person.`,
    slackPrompt: 'person [name or LinkedIn URL]',
    tags: ['person-research', 'deep-dive', 'profile', 'intelligence'],
  },
  {
    id: 'CMD-034',
    title: 'Tech Stack Reveal',
    description: 'Discover the complete technology stack of any company from public signals and infrastructure scanning.',
    category: 'research',
    services: ['Clearbit', 'Shodan'],
    claudePrompt: `/use 0nmcp

Reveal the full tech stack of [company name / domain].
Scan and identify:
- Frontend: framework, CDN, analytics, tag managers
- Backend: server technology, programming languages, API patterns
- Infrastructure: hosting provider, DNS, SSL, load balancers
- Marketing: email platform, CRM, ad tools, chat widgets
- Development: CI/CD, monitoring, error tracking, project management
- Security: WAF, DDoS protection, authentication providers
Cross-reference with job postings and public code repositories for confirmation.
Rate confidence level (confirmed / likely / possible) for each technology.`,
    slackPrompt: 'techstack [company or domain]',
    tags: ['tech-stack', 'technographics', 'infrastructure', 'scanning'],
  },
  {
    id: 'CMD-035',
    title: 'News + Signal Monitor',
    description: 'Monitor a company or industry for breaking news, trigger events, and actionable signals.',
    category: 'research',
    services: ['LinkedIn', 'Clearbit', '0nmcp'],
    claudePrompt: `/use 0nmcp

Monitor [company name / industry / topic] for recent signals and news.
Check the last [7/14/30] days for:
- Executive changes (new hires, departures, promotions)
- Funding rounds or M&A activity
- Product launches or major announcements
- Negative signals: layoffs, lawsuits, bad press, outages
- Job posting changes (hiring spree or freeze)
- LinkedIn activity from key executives
Categorize each signal as positive, negative, or neutral.
Highlight the top 3 most actionable signals with recommended next steps.`,
    slackPrompt: 'signals [company or industry] [days]',
    tags: ['news', 'signals', 'monitoring', 'trigger-events'],
  },
  {
    id: 'CMD-036',
    title: 'Everything Search',
    description: 'Search across all connected services simultaneously to find anything -- emails, docs, messages, deals, code.',
    category: 'research',
    services: ['Gmail', 'Notion', 'Slack', 'HubSpot', 'GitHub', 'Google Drive'],
    isPower: true,
    claudePrompt: `/use 0nmcp

Search for "[query]" across ALL my connected services.
Check:
- Gmail: emails matching the query (subject, body, attachments)
- Notion: pages, databases, comments mentioning the term
- Slack: messages across all channels
- HubSpot: deals, contacts, notes, activities
- GitHub: code, issues, PRs, comments
- Google Drive: documents, spreadsheets, presentations
Return results grouped by service, sorted by relevance and recency.
Highlight the most relevant result from each service.`,
    slackPrompt: 'search [query]',
    tags: ['search', 'cross-service', 'unified', 'everything'],
  },

  // ─── AUTOMATION (CMD-037 through CMD-042) ──────────────────────────────────
  {
    id: 'CMD-037',
    title: 'New Lead Auto-Setup',
    description: 'When a new lead comes in, automatically enrich, score, create CRM record, assign owner, and notify the team.',
    category: 'automation',
    services: ['HubSpot', 'ZoomInfo', 'Gmail', 'Slack', 'Linear'],
    isPower: true,
    claudePrompt: `/use 0nmcp

A new lead just came in: [name, email, company, source].
Automatically:
1. Enrich the contact with firmographic data (ZoomInfo)
2. Score the lead based on ICP fit (1-100)
3. Create/update the contact in HubSpot with all enriched fields
4. Assign to the right sales rep based on territory/vertical
5. Create a task for the assigned rep with context and suggested first touch
6. Post a notification in #new-leads Slack channel with lead summary
7. If score > 80, draft a personalized email for immediate outreach
Execute all steps and report what was done.`,
    slackPrompt: 'new-lead [name] [email] [company]',
    tags: ['automation', 'lead-routing', 'enrichment', 'CRM', 'workflow'],
  },
  {
    id: 'CMD-038',
    title: 'Daily Morning Briefing',
    description: 'Get a comprehensive morning briefing with calendar, pipeline, metrics, and action items for the day.',
    category: 'automation',
    services: ['Google Calendar', 'HubSpot', 'Stripe', 'GitHub', 'Slack', 'Gmail'],
    isPower: true,
    claudePrompt: `/use 0nmcp

Generate my daily morning briefing.
Include:
- Today's calendar: meetings, prep notes for each attendee
- Pipeline update: deals closing this week, any movement overnight
- Revenue: yesterday's transactions, current MRR, any failed payments
- Development: overnight deploys, failing checks, new issues
- Slack: important messages I missed overnight (mentions, DMs, key channels)
- Email: flagged/urgent emails that need response today
- Top 3 priorities for today based on deadlines and impact
Format as a scannable briefing I can read in 2 minutes.`,
    slackPrompt: 'morning',
    tags: ['briefing', 'daily', 'morning', 'summary', 'priorities'],
  },
  {
    id: 'CMD-039',
    title: 'End of Day Wrap',
    description: 'Generate an end-of-day summary with completed tasks, open items, and prep for tomorrow.',
    category: 'automation',
    services: ['Google Calendar', 'HubSpot', 'GitHub', 'Notion'],
    claudePrompt: `/use 0nmcp

Generate my end-of-day wrap-up.
Summarize:
- Meetings attended today and key outcomes/action items from each
- Deals that moved or were updated in CRM today
- Code changes: commits pushed, PRs merged, issues closed
- Tasks completed vs. planned (check Notion/project tracker)
- Carry-over items that need attention tomorrow
Log this summary to Notion as a daily standup entry.
Identify the top 3 priorities for tomorrow morning.`,
    slackPrompt: 'eod',
    tags: ['end-of-day', 'summary', 'wrap-up', 'standup', 'logging'],
  },
  {
    id: 'CMD-040',
    title: 'Weekly Report Generator',
    description: 'Generate a comprehensive weekly report covering sales, revenue, development, and key metrics.',
    category: 'automation',
    services: ['HubSpot', 'Stripe', 'Supabase', 'Notion', 'Slack', 'Gmail'],
    claudePrompt: `/use 0nmcp

Generate my weekly report for the past 7 days.
Sections:
1. Revenue: total, MRR change, new customers, churned, net revenue retention
2. Pipeline: deals won/lost, new opportunities, pipeline value change
3. Development: features shipped, bugs fixed, deploys, uptime
4. Growth: new signups, activation rate, key funnel metrics
5. Team: notable wins, blockers, resource needs
6. Next week: top priorities, upcoming deadlines, risks
Format professionally -- this goes to leadership.
Post a summary version to #weekly-updates in Slack.`,
    slackPrompt: 'weekly-report',
    tags: ['weekly', 'report', 'metrics', 'leadership', 'summary'],
  },
  {
    id: 'CMD-041',
    title: 'n8n Workflow Trigger',
    description: 'Trigger an n8n workflow by name or webhook URL with specified input data.',
    category: 'automation',
    services: ['n8n'],
    claudePrompt: `/use 0nmcp

Trigger the n8n workflow: [workflow name or webhook URL].
Input data:
[provide key-value pairs or JSON payload]

Execute the workflow and monitor for completion.
Return the workflow execution status, output data, and any errors.
If the workflow fails, analyze the error and suggest a fix.`,
    slackPrompt: 'n8n [workflow name] [input data]',
    tags: ['n8n', 'workflow', 'trigger', 'automation'],
  },
  {
    id: 'CMD-042',
    title: 'Task Creator \u2014 Anywhere',
    description: 'Create a task in any connected project management tool with smart defaults for priority and assignment.',
    category: 'automation',
    services: ['Linear', 'Jira', 'Asana', 'Notion'],
    isFree: true,
    claudePrompt: `/use 0nmcp

Create a task:
- Title: [task title]
- Description: [details]
- Platform: [Linear / Jira / Asana / Notion -- or "best fit"]
- Priority: [urgent / high / medium / low -- or "auto"]
- Assignee: [name or "auto-assign"]
- Due date: [date or "auto"]
- Labels/tags: [relevant labels]

If platform is "best fit," determine the right tool based on the task type (bug -> Linear, project -> Asana, doc -> Notion).
If priority is "auto," infer from the description and due date.
Confirm creation with a link to the task.`,
    slackPrompt: 'task [title] in [platform]',
    tags: ['tasks', 'project-management', 'Linear', 'Jira', 'Asana', 'Notion'],
  },

  // ─── SECURITY (CMD-043 through CMD-044) ────────────────────────────────────
  {
    id: 'CMD-043',
    title: 'npm Package Inspector',
    description: 'Deep-inspect an npm package for security, maintenance health, bundle size, and alternatives.',
    category: 'security',
    services: ['npm', 'GitHub', '0nmcp'],
    isFree: true,
    claudePrompt: `/use 0nmcp

Inspect the npm package: [package name].
Analyze:
- Security: known vulnerabilities, advisory history, supply chain risks
- Maintenance: last publish date, commit frequency, open issues/PRs ratio
- Quality: test coverage indicators, TypeScript support, documentation
- Popularity: weekly downloads, dependents, GitHub stars, trend direction
- Bundle size: minified, gzipped, tree-shakeable
- License: compatibility with commercial use
- Alternatives: top 3 similar packages with comparison matrix
Rate overall health (A-F) with a clear recommendation: use, use with caution, or avoid.`,
    slackPrompt: 'inspect [package name]',
    tags: ['npm', 'package', 'security', 'inspection', 'supply-chain'],
  },
  {
    id: 'CMD-044',
    title: 'Exposed Secrets Scanner',
    description: 'Scan repositories for accidentally committed secrets, API keys, tokens, and credentials.',
    category: 'security',
    services: ['GitHub', '0nmcp'],
    claudePrompt: `/use 0nmcp

Scan [repo name or "all repos"] for exposed secrets.
Check for:
- API keys (AWS, Stripe, SendGrid, Twilio, etc.)
- Database connection strings and passwords
- JWT secrets and auth tokens
- Private keys (SSH, SSL, signing keys)
- Environment variables committed to code
- Secrets in CI/CD configuration files
Scan the full commit history, not just the current state.
For each finding, report: file, line, commit SHA, secret type, and whether it is still valid.
Provide remediation steps: rotate, revoke, and add to .gitignore.`,
    slackPrompt: 'scan-secrets [repo name]',
    tags: ['secrets', 'scanning', 'credentials', 'security', 'remediation'],
  },

  // ─── POWER COMMANDS (CMD-045 through CMD-050) ─────────────────────────────
  {
    id: 'CMD-045',
    title: 'Full Stack Prospecting Run',
    description: 'End-to-end prospecting: find leads, enrich, score, add to CRM, draft outreach, and notify the team.',
    category: 'power',
    services: ['ZoomInfo', 'LinkedIn', 'HubSpot', 'Gmail', 'Slack'],
    isPower: true,
    claudePrompt: `/use 0nmcp

Run a full-stack prospecting cycle for [ICP description: industry, size, geo, persona].
Step 1: Find [N] companies matching the ICP with intent signals
Step 2: Identify 2-3 decision-makers per company, enrich with verified emails
Step 3: Score each lead (1-100) on ICP fit + intent + engagement signals
Step 4: Create/update all contacts in HubSpot with enrichment data and scores
Step 5: Draft personalized first-touch emails for the top 10 leads
Step 6: Post a summary to #sales Slack channel with the full lead list
Report total leads found, qualified, added to CRM, and ready for outreach.`,
    slackPrompt: 'prospect [ICP description]',
    tags: ['prospecting', 'full-stack', 'end-to-end', 'pipeline-generation'],
  },
  {
    id: 'CMD-046',
    title: 'Competitive Intelligence Package',
    description: 'Full competitive analysis: product, pricing, tech stack, content strategy, customer base, and win/loss insights.',
    category: 'power',
    services: ['ZoomInfo', 'LinkedIn', 'Clearbit', 'Shodan'],
    isPower: true,
    claudePrompt: `/use 0nmcp

Build a full competitive intelligence package on [competitor name].
Cover:
1. Company profile: revenue, headcount, funding, growth trajectory
2. Product analysis: features, pricing, positioning, recent launches
3. Tech stack: full infrastructure scan and technology choices
4. Content & social: LinkedIn presence, content themes, engagement rates
5. Customer base: notable customers, case studies, reviews, NPS signals
6. Team: key executives, recent hires (signals for strategy shifts), org structure
7. Weaknesses: negative reviews, complaints, feature gaps, churn signals
8. Battlecard: how to position against them, key differentiators, objection handlers
Format as a comprehensive deck-ready document.`,
    slackPrompt: 'compete [competitor name]',
    tags: ['competitive-intelligence', 'battlecard', 'analysis', 'strategy'],
  },
  {
    id: 'CMD-047',
    title: 'M&A Target Finder',
    description: 'Identify potential acquisition targets based on criteria like market, revenue, tech stack, and strategic fit.',
    category: 'power',
    services: ['ZoomInfo', 'Clearbit', 'LinkedIn'],
    claudePrompt: `/use 0nmcp

Find potential M&A targets matching these criteria:
- Industry: [industry/vertical]
- Revenue range: [min-max]
- Employee count: [range]
- Geography: [region/country]
- Must have: [specific tech, capability, customer base, or IP]
For each target, provide:
- Company overview, financials, and growth metrics
- Strategic rationale: what they bring (tech, customers, talent, IP)
- Key people: founders, executives, likely decision-makers for M&A
- Risk factors: competition for the deal, integration challenges, cultural fit
Rank by strategic fit score and estimated valuation range.`,
    slackPrompt: 'targets [industry] [revenue range]',
    tags: ['M&A', 'acquisition', 'targets', 'strategic', 'valuation'],
  },
  {
    id: 'CMD-048',
    title: 'Investor Outreach Package',
    description: 'Research investors, find the best fit for your stage and space, and generate personalized outreach.',
    category: 'power',
    services: ['LinkedIn', 'Clearbit', 'ZoomInfo', 'Gmail'],
    claudePrompt: `/use 0nmcp

Build an investor outreach package for [company/product] raising [round: pre-seed/seed/A/B].
Step 1: Find [N] investors who actively invest in [industry/stage] based on recent portfolio activity
Step 2: For each investor, research: thesis, recent deals, portfolio companies, check size, preferred stage
Step 3: Identify warm intro paths via LinkedIn mutual connections
Step 4: Score investor fit (1-100) based on thesis alignment, stage match, and portfolio synergies
Step 5: Draft personalized outreach emails for the top 10, referencing their portfolio and thesis
Output a ranked investor list with contact info, fit scores, intro paths, and draft emails.`,
    slackPrompt: 'investors [round] [industry]',
    tags: ['investors', 'fundraising', 'outreach', 'warm-intros', 'VC'],
  },
  {
    id: 'CMD-049',
    title: 'Partnership Identifier',
    description: 'Find potential strategic partners based on complementary offerings, shared audience, and mutual benefit.',
    category: 'power',
    services: ['LinkedIn', 'ZoomInfo', 'Clearbit'],
    claudePrompt: `/use 0nmcp

Find strategic partnership opportunities for [your company/product].
Identify companies that:
- Serve the same audience but are not direct competitors
- Have complementary products or services
- Are at a similar growth stage or have a relevant distribution channel
- Show signals of partnership openness (integrations page, partner programs, BD hires)
For each potential partner:
- Company overview and relevance score
- Specific partnership angle (integration, co-marketing, referral, reseller)
- Key contact: partnerships/BD lead with verified email
- Draft outreach message proposing the partnership
Return top 15 opportunities ranked by strategic fit and feasibility.`,
    slackPrompt: 'partners [your product or company]',
    tags: ['partnerships', 'strategy', 'business-development', 'alliances'],
  },
  {
    id: 'CMD-050',
    title: 'The Internet Search \u2014 Anything',
    description: 'Search the entire internet for anything. The ultimate catch-all command powered by 0nmcp orchestration.',
    category: 'power',
    services: ['0nmcp'],
    isFree: true,
    isPower: true,
    claudePrompt: `/use 0nmcp

Search the internet for: [anything].
Use every available source and method to find the most comprehensive, accurate, and up-to-date answer.
Cross-reference multiple sources for accuracy.
If the query involves a person, company, or product, enrich with all available data.
If the query involves code or technical topics, include working examples.
If the query involves market data, include numbers and sources.
Present findings in a structured format with confidence levels for each claim.
Always cite sources.`,
    slackPrompt: 'search [anything]',
    tags: ['search', 'internet', 'universal', 'catch-all', 'omnisearch'],
  },
];
