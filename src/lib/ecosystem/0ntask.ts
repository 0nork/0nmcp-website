import type { EcosystemApp } from './types';

/**
 * 0nTask — /ecosystem/0ntask
 *
 * SXO TARGETING
 *   Primary:   "0nTask"  +  "MCP task manager"
 *   Secondary: "AI task manager", "AI task management software",
 *              "task manager for AI agents", "MCP powered app",
 *              "AI agent task list", "automate tasks with MCP"
 *
 * POSITIONING NOTE
 *   0nmcp.com's H1 is "Stop building workflows. Start describing outcomes."
 *   0ntask.com's H1 is "Stop clicking through ten tools. Just describe the
 *   outcome." Those are the same sentence twice. This page therefore leads
 *   with the SHARED-LIST idea instead of the describe-the-outcome idea, so
 *   0nmcp.com/ecosystem/0ntask and 0ntask.com do not compete for the same
 *   SERP intent. 0nMCP owns "orchestration". 0nTask owns "the shared list".
 */
export const ontask: EcosystemApp = {
  // ── Identity ──────────────────────────────────────────────────────────
  slug: '0ntask',
  name: '0nTask',
  category: 'AI task management & business automation',
  domain: 'https://www.0ntask.com',
  appUrl: 'https://app.0ntask.com',

  // ── SXO meta ──────────────────────────────────────────────────────────
  metaTitle: '0nTask — The AI Task Manager Built on 0nMCP',
  metaDescription:
    '0nTask is the AI task manager where you, your AI agents, and your automations share one list. Built on 0nMCP — 1,640+ tools, 111 services. Start free.',
  primaryKeyword: 'MCP task manager',
  secondaryKeywords: [
    'AI task manager',
    'AI task management software',
    'task manager for AI agents',
    'MCP powered app',
    '0nTask',
    'automate tasks with MCP',
    'AI CRM automation',
  ],
  ogImage: '/ecosystem/0ntask/opengraph-image.png',

  // ── Above the fold ────────────────────────────────────────────────────
  h1: '0nTask: the MCP task manager for humans and AI agents',
  deck:
    'One list. You, your AI, and your automations all work from it — and everything they touch runs through 0nMCP. 1,640+ tools across 111 services, connected once.',
  chips: [
    'Free forever tier',
    'No credit card',
    '100+ integrations',
    'Built on 0nMCP',
    'AES-256 encrypted vault',
  ],

  // ── What it is (AEO citation target) ──────────────────────────────────
  whatItIs: [
    '0nTask is an AI task manager where humans, AI agents, and automations all read and write the same task list. You describe an outcome in plain English; 0nTask decides whether a person needs to do it, an AI agent can handle it, or an automation should just run it — then routes it and reports back.',
    'That single design decision is what separates it from every other task app. Traditional task managers assume a human will open the app and check a box. AI assistants assume there is no list at all — you ask, they answer, the context evaporates. 0nTask assumes the list is the shared workspace, and that some of the workers reading it are not people.',
    'The practical effect is that work stops falling into the gap between your tools. A task like "follow up with everyone who booked a demo last week but never showed" is not a to-do you have to sit down and grind through. It is a sentence. 0nTask pulls the bookings from your calendar, cross-references the CRM, drafts the follow-ups, and puts the ones that need your judgment in front of you.',
  ],

  // ── Why MCP (the moat paragraph) ──────────────────────────────────────
  whyMcp: [
    'Every action 0nTask takes outside itself goes through 0nMCP. That is not an implementation detail — it is the whole reason 0nTask can do things other AI task apps cannot.',
    'Most "AI-powered" productivity tools ship a handful of hand-built integrations. Each one is bespoke code, each one breaks when the upstream API changes, and each one is a separate OAuth screen the user has to survive. Adding the eleventh integration costs as much as the first ten. That is why the category tops out around a dozen connectors and calls it a platform.',
    '0nMCP inverts that. It is a universal orchestration layer exposing 1,640+ tools across 111 services behind one protocol, one credential model, and one permission surface. 0nTask does not integrate with Slack, Stripe, and Gmail individually — it speaks 0nMCP, and 0nMCP already speaks all of them. When 0nMCP adds a service, every app in the ecosystem inherits it without shipping a line of code.',
    'For you that means connect once, in the encrypted 0nVault, and every tool is available to every task — and to every AI agent working that task. For us it means the integration count is not a roadmap item. It is a dependency.',
  ],

  // ── Capabilities ──────────────────────────────────────────────────────
  capabilities: [
    {
      icon: 'MessageSquare',
      title: '0nAI Chat',
      body:
        'The front door. Type what you want in plain English and 0nTask figures out the rest — create the tasks, pull the data, send the message, update the record. No command syntax, no trigger builder, no "if this then that" grammar to learn. When it needs a decision only you can make, it asks instead of guessing.',
    },
    {
      icon: 'Users',
      title: 'CRM on autopilot',
      body:
        'A full contact and deal layer that updates itself from plain-English instructions. "Log that call with Dana and move her to proposal" is a complete operation. The CRM you already pay for stops being a data-entry tax, because the system doing the work is also the system keeping the record.',
    },
    {
      icon: 'Plug',
      title: '100+ integrations, connected once',
      body:
        'Slack, Stripe, Gmail, Google Calendar, Google Drive, Notion, HubSpot, Shopify, QuickBooks, Twilio, Airtable and more, reached through 0nMCP. Credentials live in the encrypted 0nVault — you authorize a service one time and every task, agent, and automation can use it. Google Tasks and Google Calendar sync two ways; the rest are action-capable.',
    },
    {
      icon: 'Workflow',
      title: 'Flows — automations that actually ship',
      body:
        'Describe a routine and 0nTask builds it as a Flow you can inspect, schedule, enable, and watch run. Because Flows execute against 0nMCP, a Flow can span six services without six integrations. Every run records its status and result, so a broken automation is visible instead of silent.',
      status: 'beta',
    },
    {
      icon: 'Brain',
      title: 'Brain Dump',
      body:
        'Paste or dictate the mess in your head — a meeting scrawl, a voice note, a wall of Slack — and 0nTask splits it into discrete, titled, prioritized tasks assigned to the right project. The capture step is where every task system dies. This one removes it.',
    },
    {
      icon: 'Bot',
      title: 'Specialist agents',
      body:
        'Domain-specific agents you delegate a standing job to rather than a single task. The SXO agent audits a domain and turns findings into a prioritized task list. Others handle email nurture and research. They work the same list you do, so their output lands where you already look.',
    },
  ],

  // ── How it works ──────────────────────────────────────────────────────
  howItWorks: [
    {
      title: 'Describe the outcome',
      body:
        'Type it the way you would say it to a competent new hire. No syntax, no template, no builder. "Every Friday, pull the week\'s new signups and message anyone who has not connected an app yet."',
    },
    {
      title: '0nTask routes the work',
      body:
        'It decides what needs a human, what an AI agent can complete, and what should simply run on a schedule — then splits the request accordingly. Anything requiring your judgment surfaces as a task. Anything that does not, just happens.',
    },
    {
      title: '0nMCP executes and reports',
      body:
        'Every external action runs through 0nMCP against the tools in your vault. Results come back onto the same list — completed, logged, and attributable. Nothing happens in a system you cannot see.',
    },
  ],

  // ── Comparison ────────────────────────────────────────────────────────
  comparison: {
    againstLabel: 'traditional task managers',
    rows: [
      {
        dimension: 'Who does the work',
        ours: 'You, AI agents, and automations — all reading and writing one list',
        theirs: 'You. The app is a place to store your intentions.',
      },
      {
        dimension: 'How a task gets created',
        ours: 'Describe an outcome in plain English, or dump raw notes and let it split them',
        theirs: 'Type a title, pick a project, set a date, repeat',
      },
      {
        dimension: 'Integration model',
        ours: 'One protocol (0nMCP) — 1,640+ tools across 111 services, authorized once',
        theirs: 'A short list of hand-built connectors, each with its own OAuth flow',
      },
      {
        dimension: 'Automation',
        ours: 'Flows described in plain English, executed against every connected service',
        theirs: 'Recurring due dates, or a paid Zapier seat',
      },
      {
        dimension: 'CRM',
        ours: 'Built in and updated by the same system doing the work',
        theirs: 'A separate subscription and a manual sync habit',
      },
      {
        dimension: 'What happens to context',
        ours: 'Lives on the task — every agent and automation reads the same record',
        theirs: 'Lives in your head, or in a comment thread nobody re-reads',
      },
      {
        dimension: 'Entry price',
        ours: 'Free forever tier, no credit card',
        theirs: 'Free tier that gates the features that matter',
      },
    ],
  },

  // ── Pricing (real prices only — no invented figures) ──────────────────
  offers: [
    {
      name: 'Solo',
      price: 0,
      currency: 'USD',
      billingPeriod: 'MONTH',
      description: 'Free forever. The full task system, no credit card.',
      includes: [
        'AI task management',
        '0nAI Chat',
        'Brain Dump capture',
        'Projects and task detail',
        'Google Tasks & Calendar two-way sync',
      ],
    },
    {
      name: 'Pro',
      price: 12,
      currency: 'USD',
      billingPeriod: 'MONTH',
      trialDays: 7,
      description: 'Everything in Solo, plus your connected apps.',
      includes: [
        'Everything in Solo',
        '100+ app integrations via 0nMCP',
        'Encrypted 0nVault credentials',
        'Built-in CRM and contacts',
        'Google Drive and Meet sync',
      ],
    },
    {
      name: 'Command',
      price: 39,
      currency: 'USD',
      billingPeriod: 'MONTH',
      trialDays: 7,
      description: 'Full automation. Flows, agents, and the whole surface.',
      includes: [
        'Everything in Pro',
        'Flows — no-code automations',
        'Specialist AI agents',
        'Notebook and knowledge base',
        'Domain SXO scanning',
      ],
      featured: true,
    },
    {
      name: 'Founders Lifetime',
      price: 249,
      currency: 'USD',
      billingPeriod: null,
      description: 'One payment. Command tier, for as long as 0nTask exists.',
      includes: [
        'Everything in Command, forever',
        'No recurring charge',
        'Founder status on your account',
        'Direct line on feature requests',
      ],
      limitNote: 'First 100 accounts only',
    },
  ],

  // ── Audiences ─────────────────────────────────────────────────────────
  audiences: [
    {
      who: 'Solo founders and operators',
      why:
        'You are the whole company, so every tool you add is another tab you have to remember to open. 0nTask collapses the task list, the CRM, and the automation layer into one surface, and the free tier is genuinely usable — not a trial with the useful parts removed.',
    },
    {
      who: 'Small business owners',
      why:
        'The work that actually loses you money is the follow-up nobody did and the invoice nobody chased. Those are exactly the jobs that route to an agent or a Flow instead of sitting on a list until they expire.',
    },
    {
      who: 'Agencies and consultants',
      why:
        'Projects carry a client email and their own notification template, so status communication is a property of the project rather than a thing you remember to do. The SXO agent turns a client domain into a prioritized, billable task list in one pass.',
    },
    {
      who: 'Developers and AI builders',
      why:
        'You already know what MCP is worth. 0nTask is the reference application for what 0nMCP orchestration looks like when a real product depends on it — 1,640+ tools reachable from a task, with one credential model behind them.',
    },
  ],

  // ── Security ──────────────────────────────────────────────────────────
  security: [
    'Credentials live in the 0nVault under AES-256 encryption, never in task records and never in plain text.',
    'Connecting a service in your vault does not silently grant 0nTask new powers. Newly discovered apps appear locked until you explicitly re-verify with your 0n key — a background sync can find a capability, but only you can activate it.',
    'One identity across the whole 0n ecosystem, keyed on email. Signing in with 0n resolves to the same account as Google sign-in, so there is no accidental duplicate holding half your data.',
    'GDPR-friendly by construction: product data stays with the product, and the identity layer only ever holds identity.',
    'Your data is never deleted by a sync. Syncs are additive — a reconciliation bug cannot take your task history with it.',
  ],

  // ── FAQs (become FAQPage schema) ──────────────────────────────────────
  faqs: [
    {
      question: 'What is 0nTask?',
      answer:
        '0nTask is an AI task manager where humans, AI agents, and automations share one task list. You describe an outcome in plain English and it routes the work — to you, to an AI agent, or to a scheduled automation — executing every external action through 0nMCP.',
    },
    {
      question: 'What does 0nTask cost?',
      answer:
        'There is a free forever Solo tier with no credit card required. Pro is $12/month and adds 100+ app integrations. Command is $39/month and adds Flows and specialist agents. Both paid tiers include a 7-day trial. A Founders Lifetime deal gives Command tier permanently for a single $249 payment, limited to the first 100 accounts.',
    },
    {
      question: 'How is 0nTask different from Todoist, Asana, or ClickUp?',
      answer:
        'Those apps assume a human will open them and check a box. 0nTask assumes some of the workers reading the list are AI agents and automations. The functional difference is the integration model: 0nTask reaches 1,640+ tools across 111 services through the 0nMCP protocol with one authorization, rather than maintaining a short list of hand-built connectors.',
    },
    {
      question: 'What is 0nMCP and why does 0nTask need it?',
      answer:
        '0nMCP is a universal AI orchestration layer that exposes 1,640+ tools across 111 services behind a single protocol. 0nTask routes every external action through it, which is why 0nTask can act across your whole stack without building and maintaining each integration itself. When 0nMCP adds a service, 0nTask inherits it.',
    },
    {
      question: 'Which apps does 0nTask connect to?',
      answer:
        'Over 100, including Slack, Stripe, Gmail, Google Calendar, Google Drive, Notion, HubSpot, Shopify, QuickBooks, Twilio, and Airtable. Google Tasks and Google Calendar sync in both directions. The rest are action-capable — 0nTask can read from them and act on them as part of a task or Flow.',
    },
    {
      question: 'Do I need to know how to code to use 0nTask?',
      answer:
        'No. Every automation is described in plain English and built for you as an inspectable Flow. There is no scripting language, no node graph to wire up, and no webhook configuration.',
    },
    {
      question: 'Can 0nTask replace my task manager and my CRM?',
      answer:
        'For most solo operators and small teams, yes — that is the design intent. Contacts, deals, notes, and tasks live in one system, so the tool doing the work is also the tool keeping the record. Larger teams with an entrenched CRM more often connect it rather than replace it, which 0nTask supports through 0nMCP.',
    },
    {
      question: 'Is my data safe in 0nTask?',
      answer:
        'Credentials are held in the 0nVault under AES-256 encryption and are never stored in task records. Newly discovered vault apps stay locked until you explicitly re-verify them, so no capability is added without your consent. Syncs are additive by policy — 0nTask does not delete your tasks, projects, or notes.',
    },
    {
      question: 'What is the Founders Lifetime deal?',
      answer:
        'A single $249 payment for permanent Command-tier access, capped at the first 100 accounts. It includes Flows, specialist agents, all 100+ integrations, and founder status with a direct channel for feature requests. There is no recurring charge.',
    },
    {
      question: 'Is 0nTask part of a larger platform?',
      answer:
        'Yes. 0nTask is one node in the 0n ecosystem built by RocketOpp LLC, alongside 0nMCP (orchestration), 0nCore (the portable AI engine), CRO9 (analytics), web0n (site building), and social0n. All of them share one identity, so a single 0n account works across every product.',
    },
  ],

  // ── Cross-linking ─────────────────────────────────────────────────────
  crossLinks: [
    {
      label: 'Browse all 111 services on 0nMCP',
      href: '/capabilities',
      note: 'The full tool catalog 0nTask draws from — 1,640+ tools, one protocol.',
      external: false,
    },
    {
      label: '0nMCP integrations',
      href: '/integrations',
      note: 'Every service in the orchestration layer, with what each one can do.',
      external: false,
    },
    {
      label: 'Read the .0n standard',
      href: '/0n-standard',
      note: 'The open spec underneath 0nTask, 0nCore, and the rest of the ecosystem.',
      external: false,
    },
    {
      label: 'How 0nMCP compares',
      href: '/compare',
      note: 'Orchestration layers side by side, if you are evaluating the foundation first.',
      external: false,
    },
    {
      label: 'See what people build',
      href: '/examples',
      note: 'Real workflows running on 0nMCP — several of them are 0nTask Flows.',
      external: false,
    },
    {
      label: '0nTask — start free',
      href: 'https://www.0ntask.com',
      note: 'The product site, with full pricing and the Founders offer.',
      external: true,
    },
    {
      label: 'CRO9 analytics',
      href: 'https://www.cro9.com',
      note: 'The analytics engine behind 0nTask’s domain scanning and SXO agent.',
      external: true,
    },
    {
      label: '0nCore',
      href: 'https://0ncore.com',
      note: 'The portable AI engine. Same identity, same vault, different surface.',
      external: true,
    },
  ],

  integrations: [
    'Slack',
    'Stripe',
    'Gmail',
    'Google Calendar',
    'Google Tasks',
    'Google Drive',
    'Google Meet',
    'Notion',
    'HubSpot',
    'Shopify',
    'QuickBooks',
    'Twilio',
    'Airtable',
    'Discord',
    'SendGrid',
    'Mailchimp',
    'Supabase',
    'GitHub',
    'Figma',
    'Zoom',
    'DocuSign',
    'Calendly',
    'Typeform',
    'WordPress',
    'Webflow',
    'ElevenLabs',
  ],

  finalCta: {
    heading: 'Put your AI on the same list you are',
    body:
      'The Solo tier is free forever and does not ask for a card. If you want the 100+ integrations and the Flows, the Founders Lifetime deal is $249 once — and it is capped at 100 accounts.',
    button: 'Start free on 0nTask',
  },

  lastUpdated: '2026-07-29',
};
