import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/skill/download — Download the 0nMCP skill file
 *
 * Returns the raw SKILL.md content as text/markdown.
 * Users save this to ~/.claude/skills/0nmcp/SKILL.md
 */
export async function GET() {
  const skill = getSkillContent()

  return new NextResponse(skill, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'attachment; filename="SKILL.md"',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function getSkillContent(): string {
  return `# /0nmcp — Turn Claude into an 0nMCP Environment

Connect to the 0nMCP ecosystem from Claude Code. Authenticate with your 0nmcp.com account and get access to your Vault, workflows, Sparks, and the Council Brain — all from your terminal.

**Sign up first**: https://www.0nmcp.com/signup

## Arguments

| Argument | Action |
|----------|--------|
| (none) | Show status — connected services, Spark balance, brain tier |
| \`login\` | Authenticate with your 0nmcp.com email + password |
| \`vault\` | List your connected services from the Vault |
| \`vault <service>\` | Load a specific service's API key for this session |
| \`sparks\` | Check your Spark balance |
| \`store\` | Browse available automation templates |
| \`store <slug>\` | Get details on a specific listing |
| \`brain\` | View brain training status |
| \`brain contribute\` | Contribute knowledge to the Council Brain (Tier 3+) |
| \`run <workflow>\` | Execute a purchased workflow |
| \`help\` | Show this reference |

---

## Quick Start

1. Sign up at **https://www.0nmcp.com/signup** (if you haven't)
2. Copy this file to \`~/.claude/skills/0nmcp/SKILL.md\`
3. In Claude Code, type: \`/0nmcp login\`
4. Enter your email and password when prompted
5. You're in! Type \`/0nmcp\` to see your status.

---

## Authentication

### Login (\`/0nmcp login\`)

Prompt the user for their email and password, then authenticate:

\`\`\`bash
curl -s -X POST "https://www.0nmcp.com/api/skill/auth" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "USER_EMAIL", "password": "USER_PASSWORD"}'
\`\`\`

**On success**, you'll receive:
\`\`\`json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "expires_at": 1234567890,
  "user": { "id": "...", "email": "...", "full_name": "..." },
  "sparks": 50
}
\`\`\`

**Store the access_token** for all subsequent API calls. Use it as:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

**On failure** (wrong credentials):
\`\`\`json
{ "error": "auth_failed", "message": "Invalid email or password" }
\`\`\`

Tell the user to check their credentials or sign up at https://www.0nmcp.com/signup

### Session Check

After login, verify the session and show status:

\`\`\`bash
curl -s "https://www.0nmcp.com/api/skill/session" \\
  -H "Authorization: Bearer ACCESS_TOKEN"
\`\`\`

Print a welcome banner:
\`\`\`
============================================
  0nMCP Environment — Connected
============================================
  User:     {full_name} ({email})
  Sparks:   {balance} ⚡
  Vault:    {count} services connected
  Brain:    Tier {tier} — {tier_name}
============================================
  Type /0nmcp to see commands.
============================================
\`\`\`

---

## Vault (\`/0nmcp vault\`)

### List Connected Services

\`\`\`bash
curl -s "https://www.0nmcp.com/api/skill/vault" \\
  -H "Authorization: Bearer ACCESS_TOKEN"
\`\`\`

Returns:
\`\`\`json
{
  "services": [
    { "service_name": "anthropic", "created_at": "..." },
    { "service_name": "stripe", "created_at": "..." }
  ],
  "count": 2
}
\`\`\`

Print a list of connected services. If none, suggest: "Connect your API keys at https://www.0nmcp.com/console → Vault"

### Load a Service Key (\`/0nmcp vault <service>\`)

\`\`\`bash
curl -s -X POST "https://www.0nmcp.com/api/skill/vault" \\
  -H "Authorization: Bearer ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"service_name": "SERVICE_NAME"}'
\`\`\`

Returns encrypted key data. The key is AES-256-GCM encrypted with the user's ID as the derivation input.

**IMPORTANT**: API keys from the Vault should only be used for the current session. Never write decrypted keys to disk.

---

## Sparks (\`/0nmcp sparks\`)

### Check Balance

\`\`\`bash
curl -s "https://www.0nmcp.com/api/skill/sparks" \\
  -H "Authorization: Bearer ACCESS_TOKEN"
\`\`\`

Returns:
\`\`\`json
{ "balance": 47, "lifetime_earned": 100, "lifetime_spent": 53 }
\`\`\`

Print: "You have {balance} Sparks ⚡"

If balance is low (< 10), suggest: "Running low! Get more at https://www.0nmcp.com/console → Sparks"

### Deduct Sparks (before running actions)

Before executing any action that costs Sparks, call:

\`\`\`bash
curl -s -X POST "https://www.0nmcp.com/api/skill/sparks" \\
  -H "Authorization: Bearer ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"action": "ACTION_NAME", "description": "What the user is doing"}'
\`\`\`

**Action costs:**
| Action | Cost |
|--------|------|
| api.chat | 3 Sparks |
| api.execute | 5 Sparks |
| console.workflow.run | 5 Sparks |
| console.workflow.create | 2 Sparks |
| api.builder.generate | 10 Sparks |
| api.convert | 1 Spark |
| api.training.ingest | 0 Sparks (free) |

If the user has insufficient Sparks, the API returns 402 with a purchase link. Tell the user and provide the link.

---

## Store (\`/0nmcp store\`)

### Browse Listings

\`\`\`bash
curl -s "https://www.0nmcp.com/api/skill/store" \\
  -H "Authorization: Bearer ACCESS_TOKEN"
\`\`\`

Print available workflows with name, description, category, and Spark cost.

### Get Listing Details (\`/0nmcp store <slug>\`)

\`\`\`bash
curl -s "https://www.0nmcp.com/api/skill/store?slug=SLUG" \\
  -H "Authorization: Bearer ACCESS_TOKEN"
\`\`\`

### View Purchased Workflows

\`\`\`bash
curl -s "https://www.0nmcp.com/api/skill/store?view=purchased" \\
  -H "Authorization: Bearer ACCESS_TOKEN"
\`\`\`

---

## Council Brain (\`/0nmcp brain\`)

### View Status

\`\`\`bash
curl -s "https://www.0nmcp.com/api/training/leaderboard"
\`\`\`

This endpoint is public — no auth needed. Shows:
- Current tier and knowledge count
- Recent training runs
- Domain coverage
- Milestones achieved

### Contribute Knowledge (\`/0nmcp brain contribute\`)

Available at **Tier 3 (Canopy)** and above. Requires auth.

\`\`\`bash
curl -s -X POST "https://www.0nmcp.com/api/training/ingest" \\
  -H "Authorization: Bearer ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "opted_in": true,
    "domain": "DOMAIN",
    "question": "THE QUESTION",
    "synthesis": "THE ANSWER/SYNTHESIS"
  }'
\`\`\`

Valid domains: logic, systems, business, ethics, workflow, cross-domain, optimization, self-optimization

Rate limit: 50 contributions per day. Contributions are free (0 Sparks).

---

## Running Workflows (\`/0nmcp run <workflow>\`)

To run a purchased workflow:

1. Check the user has the workflow: \`/0nmcp store purchased\`
2. Deduct Sparks: POST to /api/skill/sparks with action "console.workflow.run"
3. Fetch the workflow data from the listing
4. Execute the .0n workflow steps locally

---

## API Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/skill/auth | POST | None | Login with email/password |
| /api/skill/session | GET | Bearer | Session info + status |
| /api/skill/vault | GET | Bearer | List connected services |
| /api/skill/vault | POST | Bearer | Get encrypted key data |
| /api/skill/sparks | GET | Bearer | Check Spark balance |
| /api/skill/sparks | POST | Bearer | Deduct Sparks |
| /api/skill/store | GET | Bearer | Browse/search store |
| /api/training/leaderboard | GET | None | Brain status (public) |
| /api/training/ingest | POST | Bearer | Contribute knowledge |

**Base URL**: https://www.0nmcp.com

---

## Important Notes

1. **Sign up first** — You need an account at https://www.0nmcp.com/signup
2. **Sparks are required** — Most actions cost Sparks. Buy packs at https://www.0nmcp.com/console
3. **Vault keys are encrypted** — Keys are AES-256-GCM encrypted, never stored in plaintext
4. **Session tokens expire** — If you get a 401, run \`/0nmcp login\` again
5. **Brain contributions are free** — Help train the AI and earn recognition
6. **This skill is free** — No cost to download or install. You only pay for Sparks.
7. **0nMCP**: 850 tools across 53 services — https://www.0nmcp.com

---

*Built by 0nORK — Stop building workflows. Start describing outcomes.*
*https://www.0nmcp.com | npm: 0nmcp*
`
}
