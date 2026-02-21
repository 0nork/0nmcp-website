# Brain Transplant v2.0 — Complete Technical Reference

> **Product**: Brain Transplant by 0nMCP
> **URL**: https://0nmcp.com/convert
> **Owner**: RocketOpp LLC (mike@rocketopp.com)
> **Patent**: US Provisional Patent Application #63/968,814

---

## What It Is

Brain Transplant is a **universal AI workflow migration and conversion system** built into the 0nMCP ecosystem. It lets users convert AI configurations from any major platform (OpenAI, Google Gemini, OpenClaw, Claude Code) into the portable **.0n standard** — a universal, human-readable, version-controllable workflow format that runs on any AI client through 0nMCP's 550-tool orchestration layer.

**Tagline**: "Stop being locked into one AI platform. Own your workflows."

---

## The .0n Standard

The .0n format is the universal configuration standard for AI automation. Key properties:

- **Human-readable JSON** — can be opened, edited, and understood by anyone
- **Version-controllable** — works with git, diffs cleanly, can be code-reviewed
- **Platform-independent** — runs on any AI client that supports MCP (Model Context Protocol)
- **Encryptable** — supports AES-256-GCM encryption (both portable and machine-bound)
- **Composable** — workflows can reference other workflows, use templates, and chain together

### .0n File Structure

```json
{
  "$0n": {
    "type": "workflow",        // or "connection", "snapshot", "config"
    "name": "My Workflow",
    "version": "1.0.0",
    "created": "2026-02-20T00:00:00.000Z"
  },
  "steps": [...],
  "metadata": { "converter": "brain-transplant-v2" }
}
```

### .0n Directory Structure (`~/.0n/`)

```
~/.0n/
├── config.json        # Global settings
├── connections/       # Service credentials (*.0n)
├── workflows/         # Saved workflows (*.0n)
├── bundles/           # Encrypted brain bundles
├── apps/              # Application bundles
├── snapshots/         # System snapshots
├── history/           # JSONL execution logs
├── cache/             # Response cache
└── plugins/           # Custom extensions
```

### Variable Resolution Order

Templates use `{{expression}}` syntax, resolved in this order:
1. `{{system.*}}` — System variables (date, time, platform)
2. `{{launch.*}}` — Launch-time variables
3. `{{inputs.*}}` — User-provided inputs
4. `{{step.output.*}}` — Previous step outputs

---

## Architecture Overview

Brain Transplant operates at two levels:

### 1. 0nMCP Engine (npm package — server-side / CLI)

The core conversion engine lives in `0nMCP/engine/` (12 files, 4,458 lines). This is the **backend powerhouse**:

| File | Purpose | Lines |
|------|---------|-------|
| `index.js` | Module entry — 11 MCP tool registrations + re-exports | 27KB |
| `parser.js` | Credential file parser (.env, CSV, JSON) | 222 lines |
| `mapper.js` | Auto-maps env vars to 26 services (75+ exact mappings + pattern + fuzzy) | 293 lines |
| `validator.js` | Verifies API keys with real test calls (non-destructive) | ~250 lines |
| `platforms.js` | Generates configs for 7 AI platforms | 255 lines |
| `bundler.js` | Creates/opens encrypted .0n bundle files | ~300 lines |
| `cipher-portable.js` | AES-256-GCM encryption (passphrase-only, portable) | 95 lines |
| `app-builder.js` | Builds .0n application bundles | ~300 lines |
| `app-server.js` | Serves .0n applications via HTTP | ~400 lines |
| `application.js` | Application class — runtime for .0n apps | ~170 lines |
| `operations.js` | Operation registry for app steps | ~200 lines |
| `scheduler.js` | CronScheduler class for timed execution | ~220 lines |

#### 11 MCP Tools

| Tool | Description |
|------|-------------|
| `engine_import` | Import credentials from .env, CSV, or JSON — auto-detect format |
| `engine_verify` | Verify API keys with live test calls to each service |
| `engine_platforms` | Generate MCP configs for 7 AI platforms |
| `engine_export` | Export .0n bundle from existing connections |
| `engine_bundle` | Full pipeline: import → map → verify → bundle |
| `engine_open` | Open and decrypt a .0n bundle file |
| `app_build` | Build a .0n application bundle |
| `app_open` | Open/extract a .0n application |
| `app_inspect` | Show application metadata (no passphrase needed) |
| `app_validate` | Validate application cross-references |
| `app_list` | List installed applications |

#### Credential Import Pipeline

```
Source File (.env / CSV / JSON)
    ↓
Parser (parser.js) — normalize to [{key, value}]
    ↓
Mapper (mapper.js) — auto-map to 26 services
  • 75+ exact env var mappings (STRIPE_SECRET_KEY → stripe.apiKey)
  • Pattern matching ({SERVICE}_API_KEY → {service}.apiKey)
  • Fuzzy matching via service aliases
  • Value transformations (extract Supabase ref from URL)
    ↓
Validator (validator.js) — test each key with real API calls
  • Non-destructive read-only endpoints
  • 10s timeout per service
  • Returns: valid/invalid + error details
    ↓
Bundler (bundler.js) — create encrypted .0n bundle
  • AES-256-GCM + PBKDF2-SHA512 (100K iterations)
  • Passphrase-only (portable — works on any machine)
  • Includes platform configs + optional files
  • SHA-256 checksums for integrity
    ↓
Output: Encrypted .0n bundle file
```

#### 26 Supported Services for Auto-Mapping

stripe, openai, slack, discord, github, twilio, sendgrid, resend, airtable, notion, linear, shopify, hubspot, supabase, calendly, google_calendar, gmail, google_sheets, google_drive, jira, zendesk, mailchimp, zoom, microsoft, mongodb, crm

#### 7 AI Platform Config Targets

| Platform | Config Path | Format |
|----------|-------------|--------|
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` | JSON |
| Cursor | `~/.cursor/mcp.json` | JSON |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | JSON (stdio or HTTP) |
| Gemini | `~/.gemini/settings.json` | JSON |
| Continue | `~/.continue/config.yaml` | YAML |
| Cline | VS Code globalStorage path | JSON |
| OpenAI | HTTP-only (no local config) | JSON |

#### Encryption

**Portable Cipher** (for bundles — works on any machine):
- Algorithm: AES-256-GCM
- Key derivation: PBKDF2-SHA512 with 100,000 iterations
- Salt: 32 bytes random
- IV: 16 bytes random
- Auth tag: 16 bytes
- No machine fingerprint — bundles are fully portable

**Machine-Bound Cipher** (vault — locked to one machine):
- Same AES-256-GCM + PBKDF2
- Additional hardware fingerprint binding
- Cannot be moved between machines

### 2. 0nmcp.com Web Converter (Next.js — client-facing)

The web-based converter lives on 0nmcp.com and provides:

#### Public Marketing/SEO Pages

| Route | Content |
|-------|---------|
| `/convert` | Hub page — 4 platform cards, 3-step process, format table, JSON-LD (SoftwareApplication) |
| `/convert/openai` | OpenAI migration — pain points, 7-step export guide, comparison table, FAQ (JSON-LD FAQPage) |
| `/convert/gemini` | Gemini migration — Gems, ADK, Vertex AI, safety settings export guide |
| `/convert/openclaw` | OpenClaw migration — manifests, .claw files, MCP bridge configs |
| Claude Code | Coming soon (marked on hub page) |

Each platform page includes:
- **Pain points** — why users should migrate (vendor lock-in, no portability, limited integrations, pricing uncertainty)
- **What transfers** — detailed table of what maps from source → .0n
- **Step-by-step export guide** — exact instructions to extract configs
- **Comparison table** — source platform vs 0nMCP feature comparison
- **FAQ with JSON-LD** — SEO-optimized Q&A

#### Authenticated Conversion UI (Account Page → Convert Tab)

Located at `/account` (requires login), the Convert tab provides:

1. **File upload** — Click to upload (.json, .md, .claw, .yaml, .yml)
2. **Paste area** — Paste config content directly
3. **Auto-detection** — Platform detected from file content
4. **Live preview** — JSON output shown immediately
5. **Download** — One-click `.0n.json` download
6. **History** — All previous conversions saved and listed

#### Server-Side Converter (`POST /api/convert`)

Authentication required (Supabase auth). The converter:

1. **Detects platform** from JSON keys or content patterns:
   - OpenAI: `gizmo`, `actions`, `model` + `instructions` + "gpt"
   - Gemini: `generationConfig`, `safetySettings`, `systemInstruction`
   - OpenClaw: `claw`, `clawConfig`, `manifest`
   - Claude Code: `mcpServers`, `claudeDesktop`, or `# CLAUDE` in markdown

2. **Converts to .0n format**:

   **OpenAI → .0n**:
   - System prompts → `system.prompt` step
   - Model config → `source.model`
   - Functions/tools → `steps[].action` (lookup service)
   - Actions (APIs) → `steps[].transform`
   - GPT display info → workflow name
   - Knowledge file refs → metadata.files

   **Gemini → .0n**:
   - System instruction → `system.prompt` step
   - Generation config (temp, topP, etc.) → `system.config` step
   - Safety settings → `system.safety.*` steps
   - Tools → `steps[].transform`
   - ADK agent configs supported

   **OpenClaw → .0n**:
   - MCP servers → `steps[].lookup` (service connections)
   - Tools → `steps[].transform`
   - Manifest metadata → workflow metadata
   - .claw native format supported

   **Claude Code → .0n**:
   - `claude_desktop_config.json` → MCP server connections as steps
   - `CLAUDE.md` → system prompt step
   - All MCP server configs preserved

3. **Saves to database** (`user_workflows` table in Supabase)
4. **Returns** the converted workflow + stats (tools, prompts, settings count)

#### Client-Side Library (`lib/converter.ts`)

Provides:
- `detectPlatform(content)` — Client-side platform detection
- `uploadForConversion(content, filename)` — API call wrapper
- `PLATFORMS` — Platform metadata (names, colors, icons, file extensions, detection keys)
- `MIGRATION_GUIDES` — Step-by-step export instructions per platform

---

## Database Schema

### `user_workflows` table (Supabase)

```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users(id)
name            TEXT NOT NULL
source_platform TEXT (openai | gemini | openclaw | claude-code)
source_format   TEXT
workflow        JSONB (the converted .0n workflow)
stats           JSONB (tools, prompts, settings counts)
created_at      TIMESTAMPTZ
```

### `user_vaults` table (encrypted credentials)

```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users(id)
service_name    TEXT NOT NULL
encrypted_key   TEXT (AES-256-GCM encrypted, base64)
iv              TEXT (base64)
salt            TEXT (base64)
key_hint        TEXT (first 8 chars for identification)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### `workflow_files` table (.0n file storage)

```sql
id              UUID PRIMARY KEY
owner_id        UUID REFERENCES auth.users(id)
file_key        TEXT UNIQUE
name            TEXT
description     TEXT
version         TEXT
step_count      INTEGER
services_used   TEXT[]
tags            TEXT[]
status          TEXT (draft | published | archived)
execution_count INTEGER
last_executed_at TIMESTAMPTZ
workflow_data   JSONB
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

---

## 0nMCP Ecosystem Context

Brain Transplant is one component of the 0nMCP ecosystem:

- **0nMCP** (v1.7.0) — Universal AI API Orchestrator: 550 tools, 26 services, 13 categories
- **0n-spec** (v1.1.0) — The .0n Standard: config format + template engine + validation
- **0nmcp.com** — Marketing site + community hub + Brain Transplant UI
- **0n Marketplace** — Pay-per-execution SaaS at marketplace.rocketclients.com
- **0nork App** — Customer portal with PIN-based auth

### 0nMCP Stats

- **550 total tools** (290 catalog + 245 CRM + 4 vault + 6 engine + 5 app)
- **26 services** across **13 categories**
- **65 actions**, **93 triggers**, **708 total capabilities**
- Three-Level Execution: Pipeline > Assembly Line > Radial Burst (Patent Pending)
- Works with or without AI — keyword fallback mode
- ESM modules, MIT licensed

### The 26 Services

CRM, Stripe, SendGrid, Slack, Discord, Twilio, GitHub, Shopify, OpenAI, Anthropic, Gmail, Google Sheets, Google Drive, Airtable, Notion, MongoDB, Supabase, Zendesk, Jira, HubSpot, Mailchimp, Google Calendar, Calendly, Zoom, Linear, Microsoft

---

## User Capabilities Summary

### What Users Can Do with Brain Transplant

1. **Import & Convert** — Upload any AI config file and get a .0n workflow instantly
2. **Auto-Detection** — Platform and format detected automatically from file content
3. **Multi-Format Support** — JSON, YAML, Markdown (.md), .claw files
4. **Export Guides** — Step-by-step instructions to extract configs from each platform
5. **Download .0n** — One-click download of converted workflow files
6. **Conversion History** — All conversions saved to account, viewable anytime
7. **Credential Vault** — Store API keys encrypted (AES-256-GCM, client-side encryption)
8. **.0n File Manager** — Store, organize, and manage workflow files
9. **Platform Config Generation** — Auto-generate MCP configs for 7 AI platforms
10. **Bundle Creation** — Create encrypted portable brain bundles (share across machines)

### What Users Can Do with .0n Files After Conversion

1. **Run workflows** — Execute through 0nMCP with 550 tools across 26 services
2. **Edit workflows** — Human-readable JSON, editable in any text editor
3. **Version control** — Git-friendly, diffs cleanly
4. **Share workflows** — Portable format, no vendor lock-in
5. **Encrypt workflows** — AES-256-GCM encryption (portable or machine-bound)
6. **Compose workflows** — Chain multiple .0n files together
7. **Publish to marketplace** — Sell workflows on marketplace.rocketclients.com
8. **Use templates** — `{{variable}}` syntax with automatic resolution
9. **Schedule execution** — Cron-based scheduling via CronScheduler
10. **Build apps** — Package workflows into standalone applications

---

## Technology Stack

### 0nMCP Engine (Node.js)
- **Runtime**: Node.js >= 18
- **Protocol**: MCP (Model Context Protocol) via `@modelcontextprotocol/sdk`
- **Encryption**: Node.js built-in `crypto` — AES-256-GCM, PBKDF2-SHA512
- **Zero external deps** for cipher (pure Node.js crypto)
- **ESM modules** throughout

### 0nmcp.com Website (Next.js)
- **Framework**: Next.js 16 + React 19
- **Auth**: Supabase Auth (email/password + magic link)
- **Database**: Supabase (PostgreSQL) — project `pwujhhmlrtxjmjzyttwn`
- **Styling**: Tailwind CSS v4
- **Payments**: Stripe (metered billing, $0.10/execution)
- **Email**: CRM-routed transactional emails (branded, CAN-SPAM compliant)
- **SEO**: Programmatic pages with JSON-LD (FAQPage, SoftwareApplication, etc.)
- **Hosting**: Vercel (auto-deploy on push to main)

---

## Key Files Reference

### 0nMCP Engine
| File | Path |
|------|------|
| Engine entry | `~/Github/0nMCP/engine/index.js` |
| Parser | `~/Github/0nMCP/engine/parser.js` |
| Mapper | `~/Github/0nMCP/engine/mapper.js` |
| Validator | `~/Github/0nMCP/engine/validator.js` |
| Platforms | `~/Github/0nMCP/engine/platforms.js` |
| Bundler | `~/Github/0nMCP/engine/bundler.js` |
| Cipher | `~/Github/0nMCP/engine/cipher-portable.js` |
| App Builder | `~/Github/0nMCP/engine/app-builder.js` |
| App Server | `~/Github/0nMCP/engine/app-server.js` |
| Application | `~/Github/0nMCP/engine/application.js` |
| Operations | `~/Github/0nMCP/engine/operations.js` |
| Scheduler | `~/Github/0nMCP/engine/scheduler.js` |

### 0nmcp.com Website
| File | Path |
|------|------|
| Convert hub | `~/Github/0nmcp-website/src/app/convert/page.tsx` |
| OpenAI page | `~/Github/0nmcp-website/src/app/convert/openai/page.tsx` |
| Gemini page | `~/Github/0nmcp-website/src/app/convert/gemini/page.tsx` |
| OpenClaw page | `~/Github/0nmcp-website/src/app/convert/openclaw/page.tsx` |
| Convert API | `~/Github/0nmcp-website/src/app/api/convert/route.ts` |
| Converter lib | `~/Github/0nmcp-website/src/lib/converter.ts` |
| Account page | `~/Github/0nmcp-website/src/app/account/page.tsx` |

---

## Intellectual Property

- **Patent Pending**: US Provisional Patent Application #63/968,814
  - Covers: Three-Level Execution (Pipeline > Assembly Line > Radial Burst)
  - Covers: Portable encrypted AI Brain bundles
  - Covers: Auto-mapping credential import pipeline
- **Trademark**: 0nMCP, 0nORK, Brain Transplant, Turn it 0n
- **License**: 0nMCP is MIT licensed (open source)
- **Owner**: RocketOpp LLC, 651 N Broad St, Suite 201, Middletown, DE 19709
