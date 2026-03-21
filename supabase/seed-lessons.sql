-- ============================================================
-- 0nMCP Course Lessons — Seed Data
-- ============================================================
-- Run AFTER 20260321200000_lessons_table.sql migration
-- ============================================================

-- ── Getting Started with 0nMCP (FREE) ──────────────────────
-- Course ID: a37c2510-6b44-4c72-91f9-af82cbb3d99b

INSERT INTO lessons (course_id, title, slug, order_index, duration_minutes, is_free_preview, content_markdown) VALUES

('a37c2510-6b44-4c72-91f9-af82cbb3d99b', 'What is 0nMCP?', 'what-is-0nmcp', 1, 5, true,
'# What is 0nMCP?

**0nMCP is the universal AI API orchestrator.** It connects 54 services through 1,171 tools — all accessible through a single MCP server that plugs into Claude, Cursor, Windsurf, or any AI platform.

## The Problem It Solves

Every business uses multiple tools: a CRM, a payment processor, an email sender, a calendar, social media accounts. Each one has its own API, its own authentication, its own field names.

**Before 0n:** You write custom integrations for each pair of services. Change one tool, rewrite everything.

**With 0n:** You describe what you want. 0n figures out which services to use, translates the fields, and executes.

## Key Concepts

| Concept | What It Means |
|---------|--------------|
| **RUNs** | Workflows — sequences of actions across services |
| **SWITCH files** | .0n configuration files that define connections and workflows |
| **Turn it 0n** | The onboarding process — connect your services |
| **Runs** | Credits that power marketplace workflow executions |
| **Capability Routing** | 0n picks the best service for each action automatically |

## The .0n Field Standard

Instead of memorizing every API''s field names, you use universal fields:

```
email.0n    → works everywhere
company.0n  → works everywhere
phone.0n    → works everywhere
```

0n translates `company.0n` into `companyName` (CRM), `properties.company` (HubSpot), `CompanyName` (QuickBooks), or whatever the target service needs.

## Next Steps

In the next lesson, you''ll install 0nMCP and connect your first service.'),

('a37c2510-6b44-4c72-91f9-af82cbb3d99b', 'Install & Connect', 'install-and-connect', 2, 8, true,
'# Install & Connect Your First Service

## One Command Install

Open your terminal and run:

```bash
npx 0nmcp install
```

This single command:
1. Creates your `~/.0n/` directory
2. Opens your browser to create your 0n account
3. Detects your AI platform (Claude Desktop, Cursor, etc.)
4. Configures the MCP server automatically
5. Offers to generate a personalized social post about your experience

## Connect a Service

After installation, connect your first service:

```bash
npx 0nmcp connect
```

You''ll see a list of 54 available services. Pick one, paste your API key, done.

### Example: Connecting Stripe

```
Available services:
  1. stripe
  2. slack
  ...

Choose: 1
API Key: sk_live_xxxxx

✓ Connected to Stripe
  Saved to: ~/.0n/connections/stripe.0n
```

## Verify Your Connections

```bash
npx 0nmcp engine verify
```

This tests every connected service with a real API call and reports status:

```
  ✓ stripe (145ms)
  ✓ slack (203ms)
  ✗ openai — Invalid API key
```

## Import from .env

Already have API keys in a `.env` file? Import them all at once:

```bash
npx 0nmcp engine import ~/.env
```

0n auto-detects which keys belong to which services.

## Next: Your First Workflow

Now that you''re connected, let''s execute your first workflow.'),

('a37c2510-6b44-4c72-91f9-af82cbb3d99b', 'Your First Workflow', 'first-workflow', 3, 10, false,
'# Your First Workflow

A workflow in 0n is called a **RUN**. It''s a sequence of actions across your connected services.

## Writing a .0n SWITCH File

Create a file called `welcome-customer.0n`:

```json
{
  "$0n": { "type": "workflow", "version": "1.1.0" },
  "name": "Welcome New Customer",
  "steps": [
    {
      "action": "crm.0n",
      "method": "create_contact",
      "inputs": {
        "email.0n": "{{inputs.email}}",
        "fullname.0n": "{{inputs.name}}",
        "company.0n": "{{inputs.company}}",
        "tags.0n": ["new-customer", "welcome-sent"]
      }
    },
    {
      "action": "emailsender.0n",
      "inputs": {
        "email.0n": "{{inputs.email}}",
        "subject.0n": "Welcome to {{inputs.company}}!",
        "message.0n": "Hi {{inputs.name}}, thanks for joining."
      }
    }
  ]
}
```

Notice:
- **`crm.0n`** — 0n picks whichever CRM you have connected
- **`emailsender.0n`** — 0n picks your email service (SendGrid, Resend, Gmail...)
- **`.0n` fields** — universal field names that work with any service

## Running the Workflow

```bash
npx 0nmcp run welcome-customer --input name="Jane Smith" --input email="jane@example.com" --input company="Acme Inc"
```

## What Happens Under the Hood

1. 0n reads your `~/.0n/connections/` to find available services
2. `crm.0n` resolves to your connected CRM (HubSpot, Salesforce, Pipedrive, etc.)
3. `email.0n` field translates to the CRM''s specific field name
4. Contact is created with the right tags
5. `emailsender.0n` resolves to your email service
6. Email is sent using that service''s API format
7. Execution is logged to `~/.0n/history/`

**The same workflow works for any user, regardless of their stack.**'),

('a37c2510-6b44-4c72-91f9-af82cbb3d99b', 'The Marketplace & Runs', 'marketplace-and-runs', 4, 7, false,
'# The Marketplace & Runs

## What is the Marketplace?

The 0n Marketplace is where you buy, sell, and share workflows. Every workflow uses the .0n Field Standard, which means any workflow from the marketplace works with YOUR connected services — no reconfiguration needed.

## Runs — The Execution Currency

**Runs** are the credits that power marketplace workflow executions.

| Action | Runs |
|--------|------|
| Sign up | 10 free Runs |
| Refer a friend | +50 Runs |
| Complete a course | +25 Runs |
| Hit Power User karma | +100 Runs |
| Purchase (Starter Pack) | 250 Runs / $20 |

### Earning Runs for Free

- **Community engagement** — earn karma in the Grid, level up, unlock Run bonuses
- **Referrals** — every friend who signs up = 50 Runs for you
- **Course completion** — finish courses, earn Runs + badges
- **Contributing** — publish a workflow to the marketplace, earn Runs on every sale

### Spending Runs

Each marketplace workflow has a Run cost set by the creator:
- Simple automations: 1-3 Runs
- Multi-step workflows: 5-10 Runs
- Premium enterprise workflows: 20-50 Runs

## Selling on the Marketplace

Anyone can publish workflows:

1. Build a .0n SWITCH file
2. Test it locally
3. Publish to the marketplace with a title, description, and Run price
4. Earn Runs (or cash via Stripe Connect) every time someone executes it

## The Flywheel

```
Sign up → Take courses → Earn Runs + badges
→ Use Runs on marketplace → Build own workflows
→ Publish to marketplace → Earn Runs from others
→ Refer friends → Earn more Runs → Repeat
```

This is the 0n economy. Every user is both a consumer and a creator.');

-- ── The .0n Standard (FREE) ────────────────────────────────
-- Course ID: 39940161-3897-4a33-a4e5-628637e93c0f

INSERT INTO lessons (course_id, title, slug, order_index, duration_minutes, is_free_preview, content_markdown) VALUES

('39940161-3897-4a33-a4e5-628637e93c0f', 'The .0n File Format', 'file-format', 1, 6, true,
'# The .0n File Format

Every configuration in the 0n ecosystem uses the **.0n file format** — a JSON-based standard with a special `$0n` header that identifies what the file contains.

## Structure

```json
{
  "$0n": {
    "type": "connection",
    "version": "1.0.0",
    "name": "My Stripe Connection",
    "created": "2026-03-21T00:00:00.000Z"
  },
  "service": "stripe",
  "environment": "production",
  "auth": {
    "type": "api_key",
    "credentials": {
      "api_key": "sk_live_xxxxx"
    }
  }
}
```

## File Types

| Type | Purpose | Location |
|------|---------|----------|
| `connection` | Service credentials | `~/.0n/connections/` |
| `workflow` | Automation sequences | `~/.0n/workflows/` |
| `snapshot` | System state captures | `~/.0n/snapshots/` |
| `config` | Global settings | `~/.0n/config.json` |

## Why .0n?

- **Portable** — share connection configs without sharing raw API keys (use Vault encryption)
- **Validated** — every .0n file can be validated against its schema
- **Universal** — one format for everything, no per-service config files
- **Versioned** — the `version` field ensures backward compatibility'),

('39940161-3897-4a33-a4e5-628637e93c0f', 'Universal Fields (.0n Fields)', 'universal-fields', 2, 8, true,
'# Universal Fields — The .0n Field Standard

The .0n Field Standard is what makes 0n workflows portable. Instead of learning every API''s field names, you use one canonical name that works everywhere.

## How It Works

Every canonical field ends in `.0n`:

```
email.0n     → the email address
company.0n   → the company name
phone.0n     → the phone number
fullname.0n  → the full name
```

When 0n sends data to a service, it automatically translates:

| You Write | CRM Gets | Stripe Gets | HubSpot Gets |
|-----------|----------|-------------|--------------|
| `email.0n` | `email` | `email` | `properties.email` |
| `company.0n` | `companyName` | `metadata.company` | `properties.company` |
| `fullname.0n` | `firstName` + `lastName` | `name` | `properties.firstname` + `properties.lastname` |
| `phone.0n` | `phone` | `phone` | `properties.phone` |

## 32 Canonical Fields

0n ships with 32 universal fields covering:
- **Identity**: firstname, lastname, fullname, email, phone
- **Company**: company, jobtitle, website
- **Location**: address, city, state, zip, country, timezone
- **Social**: avatar, bio, linkedin_url, twitter_handle
- **Financial**: currency, amount
- **Communication**: subject, message
- **Dates**: created, updated
- **Meta**: tags, status, source, notes, id

## In Workflows

```json
{
  "action": "crm.0n",
  "inputs": {
    "email.0n": "jane@example.com",
    "company.0n": "Acme Inc"
  }
}
```

This works regardless of which CRM the user has connected.'),

('39940161-3897-4a33-a4e5-628637e93c0f', 'Capability Routing', 'capability-routing', 3, 7, false,
'# Capability Routing

Capability routing is what makes 0n workflows truly portable. Instead of specifying WHICH service to use, you specify WHAT you want to do.

## The Old Way vs The 0n Way

**Old way (every other platform):**
```
Step 1: SendGrid → Send Email
Step 2: HubSpot → Create Contact
```
If you switch from SendGrid to Resend, you rebuild the workflow.

**0n way:**
```
Step 1: emailsender.0n → Send Email
Step 2: crm.0n → Create Contact
```
Switch email providers? The workflow doesn''t change. 0n picks the right service.

## How It Works

1. You write `emailsender.0n` in your workflow
2. 0n checks `~/.0n/connections/` for email-capable services
3. If you have SendGrid → uses SendGrid
4. If SendGrid is down → falls back to Resend
5. If no Resend → tries Gmail
6. Fields are translated automatically for whichever service is selected

## Available Capabilities

| Capability | Services |
|-----------|----------|
| `emailsender.0n` | SendGrid, Resend, CRM, Gmail, Mailchimp |
| `payment.0n` | Stripe, Square, QuickBooks |
| `crm.0n` | CRM, HubSpot, Salesforce, Pipedrive |
| `calendar.0n` | Google Calendar, Calendly, CRM Calendar |
| `messaging.0n` | Slack, Discord, Twilio, WhatsApp |
| `social.0n` | LinkedIn, X, Instagram, Facebook |
| `storage.0n` | Google Drive, Dropbox, Supabase Storage |

## Automatic Failover

If your primary service fails (rate limit, downtime, auth error), 0n automatically tries the next available service. No manual error handling. No workflow rebuilds.'),

('39940161-3897-4a33-a4e5-628637e93c0f', 'Variables & Templates', 'variables-templates', 4, 6, false,
'# Variables & Templates

0n SWITCH files support dynamic variables using the `{{expression}}` syntax.

## Variable Resolution Order

Variables resolve in this priority:

1. `{{system.*}}` — built-in system values (timestamp, hostname, etc.)
2. `{{launch.*}}` — values from the Master SWITCH file
3. `{{inputs.*}}` — values passed at runtime
4. `{{step.output.*}}` — output from a previous step

## Examples

### Input Variables
```json
{
  "steps": [
    {
      "action": "emailsender.0n",
      "inputs": {
        "email.0n": "{{inputs.customer_email}}",
        "subject.0n": "Welcome, {{inputs.customer_name}}!"
      }
    }
  ]
}
```

Run with: `npx 0nmcp run workflow --input customer_email=jane@co.com --input customer_name=Jane`

### Step Output Chaining
```json
{
  "steps": [
    {
      "id": "create",
      "action": "crm.0n",
      "method": "create_contact",
      "inputs": { "email.0n": "{{inputs.email}}" }
    },
    {
      "action": "messaging.0n",
      "inputs": {
        "message.0n": "New contact created: {{step.create.output.id}}"
      }
    }
  ]
}
```

The second step uses the contact ID from the first step.

### System Variables
```
{{system.timestamp}}  → 2026-03-21T14:30:00Z
{{system.hostname}}   → mikes-macbook
{{system.platform}}   → darwin
```

## Math & Conditions

The template engine supports expressions:

```
{{inputs.price * 1.1}}           → 10% markup
{{inputs.quantity > 100 ? "bulk" : "standard"}}
```');

-- ── Building Workflows (FREE) ──────────────────────────────
-- Course ID: c2ff4095-2ddb-4870-96c8-911f7807e324

INSERT INTO lessons (course_id, title, slug, order_index, duration_minutes, is_free_preview, content_markdown) VALUES

('c2ff4095-2ddb-4870-96c8-911f7807e324', 'Anatomy of a Workflow', 'anatomy', 1, 7, true,
'# Anatomy of a Workflow

Every 0n workflow (RUN) follows the same structure: a header, inputs, and steps.

## Basic Structure

```json
{
  "$0n": {
    "type": "workflow",
    "version": "1.1.0",
    "name": "My First Workflow"
  },
  "description": "What this workflow does",
  "inputs": {
    "email": { "type": "string", "required": true },
    "name": { "type": "string", "default": "Friend" }
  },
  "steps": [
    {
      "id": "step1",
      "action": "emailsender.0n",
      "inputs": {
        "email.0n": "{{inputs.email}}",
        "subject.0n": "Hello {{inputs.name}}"
      }
    }
  ]
}
```

## The Three Execution Levels

0n uses **Three-Level Execution** (Patent Pending):

### Pipeline (Sequential)
Steps run one after another. Output from step 1 feeds into step 2.
```json
"execution": "pipeline"
```

### Assembly Line (Parallel)
Independent steps run simultaneously.
```json
"execution": "assembly",
"parallel": ["step1", "step2", "step3"]
```

### Radial Burst (Simultaneous)
Fan out to multiple services at once — same data, different destinations.
```json
"execution": "burst",
"targets": ["crm.0n", "emailsender.0n", "messaging.0n"]
```

## Internal Actions

Besides calling external services, workflows support built-in actions:

| Action | Purpose |
|--------|---------|
| `lookup` | Search for data |
| `set` | Set a variable |
| `transform` | Modify data |
| `compute` | Math operations |
| `condition` | If/else branching |
| `map` | Transform arrays |'),

('c2ff4095-2ddb-4870-96c8-911f7807e324', 'Multi-Step Workflows', 'multi-step', 2, 10, false,
'# Multi-Step Workflows

Real workflows chain multiple services together. Here''s how to build complex automations.

## Example: New Lead Pipeline

When a new lead comes in, this workflow:
1. Creates a CRM contact
2. Adds them to a pipeline
3. Sends a welcome email
4. Posts a notification to Slack
5. Logs the event

```json
{
  "$0n": { "type": "workflow", "version": "1.1.0" },
  "name": "New Lead Pipeline",
  "inputs": {
    "email": { "type": "string", "required": true },
    "name": { "type": "string", "required": true },
    "company": { "type": "string" },
    "source": { "type": "string", "default": "website" }
  },
  "steps": [
    {
      "id": "create_contact",
      "action": "crm.0n",
      "method": "create_contact",
      "inputs": {
        "email.0n": "{{inputs.email}}",
        "fullname.0n": "{{inputs.name}}",
        "company.0n": "{{inputs.company}}",
        "source.0n": "{{inputs.source}}",
        "tags.0n": ["new-lead", "{{inputs.source}}"]
      }
    },
    {
      "id": "notify_team",
      "action": "messaging.0n",
      "inputs": {
        "message.0n": "New lead: {{inputs.name}} ({{inputs.email}}) from {{inputs.source}}"
      }
    },
    {
      "id": "send_welcome",
      "action": "emailsender.0n",
      "inputs": {
        "email.0n": "{{inputs.email}}",
        "subject.0n": "Thanks for reaching out, {{inputs.name}}!",
        "message.0n": "We received your inquiry and will be in touch within 24 hours."
      }
    }
  ]
}
```

## Conditional Logic

```json
{
  "id": "check_value",
  "action": "condition",
  "inputs": {
    "test": "{{inputs.deal_value > 10000}}",
    "if_true": "enterprise_flow",
    "if_false": "standard_flow"
  }
}
```

## Error Handling

Each step can define `on_error`:
```json
{
  "id": "send_email",
  "action": "emailsender.0n",
  "on_error": "continue",
  "inputs": { ... }
}
```

Options: `"stop"` (default), `"continue"`, `"retry"` (3 attempts with backoff).');

-- Update lesson_count on courses
UPDATE courses SET lesson_count = 4 WHERE slug = 'getting-started';
UPDATE courses SET lesson_count = 4 WHERE slug = 'on-standard';
UPDATE courses SET lesson_count = 2 WHERE slug = 'building-workflows';
