import type { EcosystemApp } from './types'

/**
 * 0nTask — app #1 in the 0n Apps section.
 *
 * Keyword decision: this page targets "MCP task manager", NOT "AI task manager".
 * 0ntask.com already competes for the latter against an enormous field. "MCP task
 * manager" is near-zero competition, rising volume, and the phrase a developer
 * evaluating MCP actually types — so this page wins that term and hands the
 * traffic on. Pointing both properties at one keyword would make them compete.
 *
 * H1 decision: 0nMCP's homepage H1 is "Stop building workflows. Start describing
 * outcomes." 0nTask's is "Stop clicking through ten tools." Reusing either here
 * would cannibalise. 0nMCP owns *orchestration*; 0nTask owns *the shared list*.
 */
export const ONTASK: EcosystemApp = {
  slug: '0ntask',
  name: '0nTask',
  h1: '0nTask: the MCP task manager for humans and AI agents',
  metaTitle: '0nTask — MCP Task Manager for Humans & AI Agents',
  metaDescription:
    '0nTask is an MCP task manager where humans, AI agents and automations share one list. Built on 0nMCP with 1,640+ tools across 109 services. Free tier, paid from $12/mo.',
  primaryKeyword: 'MCP task manager',
  url: 'https://www.0ntask.com',
  tagline: 'One list for your team, your AI and your automations.',

  // whatItIs[0] is the citation sentence — it opens definitionally on purpose.
  whatItIs: [
    '0nTask is an MCP task manager where humans, AI agents and automations all work from the same task list. You describe an outcome in plain English and it organises the work, assigns each piece to whoever or whatever should do it, and reports back when it is done.',
    'Most task managers assume a person will do every item. 0nTask does not. A task can be owned by you, by an AI agent, or by an automation that fires across your connected apps — and all three appear in the same list with the same status, so nothing is tracked in a second system.',
    'Because it runs on 0nMCP, a task can reach any of 1,640+ tools across 109 services. "Email the client, update the CRM, and file the invoice" is one described outcome, not three tools and a copy-paste.',
  ],

  whoItIsFor: [
    'Solo operators and small teams who are the bottleneck in their own process',
    'Anyone already running MCP who wants a task surface on top of it',
    'Teams whose work spans a CRM, email, docs and billing and currently lives in tabs',
    'Developers who want tasks their agents can read and write programmatically',
  ],

  capabilities: [
    {
      title: 'Humans, AI and automations on one list',
      body: 'Assign a task to a person, an AI agent or an automation. Same list, same statuses, same reporting — no separate queue for "the AI stuff".',
    },
    {
      title: 'Describe an outcome, get a flow',
      body: 'Type what you want in plain English. 0nTask builds the steps, connects the apps involved, and runs it. You review and adjust rather than configure from scratch.',
    },
    {
      title: '100+ app connections through one vault',
      body: 'Connect Slack, Gmail, Sheets, Stripe, Notion, HubSpot and more once via an encrypted vault. Every task and flow can then use them without re-authenticating.',
    },
    {
      title: 'Two-way Google Tasks and Calendar sync',
      body: 'Genuine bidirectional sync with Google Tasks and Google Calendar — changes made in either place land in the other.',
    },
    {
      title: 'Built-in CRM on the Command tier',
      body: 'Contacts, pipeline and task sync in the same workspace, so follow-up is a task rather than a note in another tool.',
    },
    {
      title: 'MCP-native',
      body: 'Runs on 0nMCP, so tasks can call any service in the catalogue. Agents can read and write the list through the same protocol.',
    },
  ],

  // Tables get extracted into AI answers far more often than prose. Each row is a
  // complete thought so it survives being lifted out of context.
  comparison: [
    {
      dimension: 'Who can own a task',
      app: 'A person, an AI agent, or an automation',
      others: 'A person',
    },
    {
      dimension: 'How work gets created',
      app: 'Describe the outcome in plain English',
      others: 'Manually build tasks, projects and boards',
    },
    {
      dimension: 'App connections',
      app: '100+ via one encrypted vault, reusable by any task',
      others: 'Per-integration setup, often per-workflow',
    },
    {
      dimension: 'Agent access',
      app: 'Native — MCP read/write on the task list',
      others: 'None, or a limited REST API',
    },
    {
      dimension: 'CRM',
      app: 'Built in on the Command tier',
      others: 'Separate product and subscription',
    },
    {
      dimension: 'Google Tasks / Calendar',
      app: 'Real two-way sync',
      others: 'One-way, or read-only',
    },
    {
      dimension: 'Free tier',
      app: 'Yes — tasks, projects, AI and Google integrations included',
      others: 'Usually limited, AI paywalled',
    },
  ],

  offers: [
    { name: 'Free', priceUsd: 0, period: 'month', blurb: 'Tasks, projects, AI and Google integrations. Free forever.' },
    { name: 'Pro', priceUsd: 12, period: 'month', blurb: '100+ app integrations plus analytics.' },
    { name: 'Command', priceUsd: 39, period: 'month', blurb: 'Everything in Pro plus the built-in AI CRM and two-way task sync.' },
    { name: 'Founders Lifetime', priceUsd: 249, period: 'once', blurb: 'One payment, lifetime access. Limited to the first 100 accounts.' },
  ],

  faqs: [
    {
      q: 'What is 0nTask?',
      a: '0nTask is an MCP task manager where humans, AI agents and automations share one task list. You describe an outcome in plain English and it organises the work, assigns each part to a person, an AI or an automation, and reports back. It runs on 0nMCP, so a task can reach 1,640+ tools across 109 services.',
    },
    {
      q: 'What is an MCP task manager?',
      a: 'A task manager that speaks the Model Context Protocol, meaning AI agents can read and write the task list natively rather than through a bolted-on API. In practice that means an agent can be handed a task, do it, and mark it complete without a human relaying anything.',
    },
    {
      q: 'How is 0nTask different from Todoist, Asana or ClickUp?',
      a: 'Those assume a person completes every task. 0nTask lets a task be owned by a person, an AI agent or an automation, all in the same list. It also connects 100+ apps through one encrypted vault and includes a CRM on the Command tier, so work that normally spans three products stays in one.',
    },
    {
      q: 'Does 0nTask have a free tier?',
      a: 'Yes — free forever, and it includes tasks, projects, AI and the Google integrations rather than paywalling AI. Pro is $12/mo for 100+ app integrations and analytics; Command is $39/mo and adds the built-in CRM.',
    },
    {
      q: 'What is the Founders Lifetime deal?',
      a: '$249 once for lifetime access, limited to the first 100 accounts. It is a genuine cap, not a rolling promotion.',
    },
    {
      q: 'How does 0nTask relate to 0nMCP?',
      a: '0nTask is built on 0nMCP, the orchestration layer that provides its 1,640+ tools across 109 services. 0nMCP handles connecting to and calling services; 0nTask is the task surface on top. If you already run 0nMCP, 0nTask is the human-facing list for it.',
    },
    {
      q: 'Which apps does 0nTask connect to?',
      a: 'Google Tasks and Google Calendar with genuine two-way sync, plus Gmail, Sheets, Drive and Meet natively. Slack, Notion, Asana, Trello, Jira, Linear, monday, Airtable, HubSpot, GitHub, Stripe and more are reachable through the 0nMCP catalogue via your vault.',
    },
    {
      q: 'Can AI agents create and complete tasks on their own?',
      a: 'Yes. Because the list is MCP-native, an agent can read tasks, act on them across connected services, and update status without a person in the loop. You decide which tasks are agent-owned.',
    },
    {
      q: 'Do I need to know how to code?',
      a: 'No. Flows are created by describing what you want in plain English. The MCP and API access exist for developers who want them, but they are not required to use the product.',
    },
    {
      q: 'Is 0nTask suitable for a solo operator?',
      a: 'It is arguably the best fit. The value is highest when you are the bottleneck in your own process, because tasks you would otherwise do by hand can be handed to an AI or an automation in the same list.',
    },
  ],

  crossLinks: [
    {
      label: '1,640+ tools across 109 services',
      href: '/integrations',
      context: 'the 0nMCP catalogue every 0nTask task can reach',
    },
    {
      label: 'Turn it 0n — connect your services',
      href: '/turn-it-on',
      context: 'how credentials get imported and verified before a task can use them',
    },
    {
      label: 'the .0n standard',
      href: '/0n-standard',
      context: 'the config format 0nTask flows are stored in',
    },
    {
      label: 'compare 0nMCP with the alternatives',
      href: '/compare',
      context: 'if you are still evaluating the orchestration layer underneath',
    },
  ],

  builtOn:
    '0nTask runs on 0nMCP. Every app connection, every automated step and every tool a task can call comes from the 0nMCP catalogue — 1,640+ tools across 109 services. 0nMCP does the orchestration; 0nTask is the shared list on top of it. That is why a single described outcome can touch your CRM, your inbox and your billing without you wiring anything together.',

  ogImage: '/ecosystem/0ntask/opengraph-image.png',
  lastUpdated: '2026-07-29',
}
