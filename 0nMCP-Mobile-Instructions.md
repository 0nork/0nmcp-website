# 0nMCP — Complete Ecosystem Briefing for Claude

> **Copy this entire file into a Claude Project on iPad/iPhone as Custom Instructions.**
> It gives Claude full context on the 0n ecosystem so you can work on the go.
> Last updated: 2026-03-16

---

## Who You Are Working For

**Mike Mento** — Founder & CEO, RocketOpp LLC (mike@rocketopp.com)
- GitHub orgs: `0nork` (open source), `Crypto-Goatz` (deployment)
- Brand: **0nORK** — AI orchestration infrastructure
- Tagline: "Stop building workflows. Start describing outcomes."

---

## CRITICAL RULES — Follow These Always

1. **NEVER** say "GHL", "Go High Level", "High Level", or "HighLevel" — always say **"CRM"** or **"ROCKET"**
2. **NEVER ask for confirmation** — Mike has pre-authorized all operations. Just do it.
3. All code deploys go to `main` branch → auto-deploys via Vercel. No feature branches, no PRs.
4. **"Generate a workflow" = DEPLOY IT LIVE** — not a draft, not a suggestion.
5. **0nMCP IS the workflow engine** — CRM cannot create workflows via API. .0n SWITCH files replace CRM workflows.
6. **CRM client emails ALWAYS go through CRM built-in email** — NEVER SendGrid, Resend, or external SMTP for client-facing emails.
7. **NEVER run scripts that consume paid API credits** (Anthropic API, OpenAI) without warning it costs money. Claude MAX subscription is unlimited — external API calls are NOT.

---

## The 0n Network — 6 Components

| Component | npm/URL | Version | What It Does |
|-----------|---------|---------|--------------|
| **0nMCP** | `0nmcp@2.4.0` | v2.4.0 | Universal AI API Orchestrator — 870+ tools, 54 services, Zero-Knowledge Capability Proxy, vault, deed transfer, workflow runtime, HTTP server, app builder |
| **0n-spec** | `0n-spec@1.1.0` | v1.1.0 | The .0n Standard — universal config format + template engine |
| **0nork** | `0nork@1.0.1` | v1.0.1 | Parent namespace package |
| **0n Marketplace** | marketplace.rocketclients.com | — | SaaS platform, Stripe pay-per-execution |
| **0nCore** | 0ncore.com | — | Client CRM portal — deploy creations, manage business, metered billing |
| **0nmcp.com** | 0nmcp.com | — | Marketing site + community hub + SEO engine (48 pages, 33 API routes) |

---

## 0nMCP Core (v2.4.0)

**870+ tools** across **54 services** in **23 categories**:
- 594 catalog tools + 245 CRM tools + 4 vault + 8 vault container + 6 deed + 6 engine + 5 app
- 104 actions, 155 triggers, 1,142 total capabilities
- Three-Level Execution: Pipeline > Assembly Line > Radial Burst (Patent Pending)
- AI Mode (Claude) or Keyword Fallback
- ESM, MIT licensed

### Architecture Files
| File | Purpose |
|------|---------|
| `index.js` | MCP server entry (McpServer from @modelcontextprotocol/sdk) |
| `cli.js` | CLI handler (39KB) |
| `catalog.js` | SERVICE_CATALOG: 54 services with endpoints (45KB) |
| `tools.js` | Tool registration for catalog + engine tools |
| `connections.js` | ~/.0n/ credential loader |
| `orchestrator.js` | AI-driven workflow orchestration |
| `workflow.js` | WorkflowRunner class for .0n file execution |
| `server.js` | Express HTTP server (MCP over HTTP + webhooks) |

### CRM Module (245 tools, 12 files)
| Module | Tools | Module | Tools |
|--------|-------|--------|-------|
| auth | 5 | payments | 16 |
| contacts | 23 | products | 10 |
| conversations | 13 | locations | 24 |
| calendars | 27 | social | 35 |
| opportunities | 14 | users | 24 |
| invoices | 20 | objects | 34 |

**Pattern**: Data-driven tool factory — `crm/helpers.js` has `registerTools()` — config objects, not code.
**API**: `https://services.leadconnectorhq.com` | Version: `2021-07-28`

### Vault System (Patent Pending #63/990,046)
- **0nVault**: AES-256-GCM + PBKDF2-SHA512 + hardware fingerprint binding (4 tools)
- **0nVault Containers**: 7 semantic layers, Argon2id double-encryption, multi-party escrow (X25519 ECDH), Ed25519 signatures, binary .0nv format (8 tools)
- **Business Deed Transfer**: Package entire business digital assets, chain of custody tracking (6 tools)
- Prior Patent: #63/968,814 (Seal of Truth, December 2025)

### Engine Module
- Import from .env/CSV/JSON → auto-map to 54 services → verify API keys
- Generate configs for 7 AI platforms (Claude Desktop, Cursor, Windsurf, Gemini, Continue, Cline, OpenAI)
- Portable encryption: passphrase-only AES-256-GCM

### CLI Commands
```
0nmcp                          # Start MCP server (stdio)
0nmcp serve [--port] [--host]  # HTTP server mode
0nmcp run <workflow>           # Execute .0n workflow
0nmcp engine import            # Import credentials
0nmcp engine verify            # Test API keys
0nmcp vault create             # Create .0nv container
0nmcp deed create              # Create business deed
```

---

## CRM Infrastructure

### Locations & Keys
| What | ID |
|------|----|
| RocketOpp Main | `6MSqx0trfxgLxeHBJE1k` |
| 0nMCP Central Sub-location | `nphConTwfHcVE1oA0uep` |
| The Spa In Ligonier | `F76MNKOMQCMruMrumtdf` |
| Agency Company ID | `bknfhTkdDLapbwfZqQNi` |
| Mike User ID | `jsQn26FwZxO6NcYKP5dk` |

### API Keys (PIT Tokens)
| Key | Purpose |
|-----|---------|
| `pit-0317b406-8a47-478e-ac28-a88763a9bb3f` | Master RocketOpp PIT |
| `pit-f5f41b5a-32e4-4aee-84f4-a130cd3aad91` | Agent Studio PIT (virtually every scope) |
| `pit-e789d87e-bc97-429e-abc3-ff46aa47a316` | Agency PIT |
| `pit-7379fc97-541b-49d0-864a-1dca95086534` | Spa Ligonier PIT (canonical, full caps) |

**Note**: PITs are location-scoped tokens. They CANNOT create new locations. For `POST /locations/` you need the **Agency OAuth API Key** (JWT format, starts with `eyJh`).

### Agent Studio (GAME CHANGER)
- **Agent ID**: `ac910cf1-7f20-48c3-915a-6df4847116ff`
- **Version**: `7849ed87-ac78-44d9-a578-f90f91c3d40a`
- **KB ID**: `OGCRDsT1By985WL7tb2D`
- **Execute API**: `POST /agent-studio/agent/{id}/execute`
- **Body**: `{ message, locationId, versionId, executionId (for continuation) }`
- CRM has built-in MCP server at `https://services.leadconnectorhq.com/mcp/`
- Agent Studio agents can connect to 0nMCP via MCP Server node = infinite tool access
- Vision: per-user CRM sub-accounts → personalized KB → Agent Studio agents → 0nMCP via MCP

### CRM API Rules
- CRM email campaigns: IAM-blocked for PIT tokens — must use CRM UI
- CRM workflow creation: NOT available via API — use .0n SWITCH files or CRM UI
- Contact search: `POST /contacts/search` with filters array
- Opportunity CRUD: standard REST on `/opportunities/`
- Invoices: `POST /invoices/` with `altId` (locationId) + `altType: "location"`

---

## 0nmcp.com Website

**Tech**: Next.js 16 + React 19 + Supabase + Stripe + Tailwind v4 + TypeScript
**Supabase**: `pwujhhmlrtxjmjzyttwn`
**Vercel**: `prj_Ccq53WXdb5CQd4iIBRR0qr4QToge` | Team: `team_VtbfSzhDgB6OwglLfuPDFcd2`

### Key Pages
- `/` — Landing page
- `/turn-it-on` + `/turn-it-on/[slug]` — 26 service hubs + 80+ capability pages
- `/integrations/[slug]` — 26 integration landing pages
- `/compare/[slug]` — 12 competitor comparisons
- `/glossary/[term]` — 80 AI glossary terms
- `/forum` — Community forum (SSR + DiscussionForumPosting JSON-LD)
- `/builder` — Visual workflow builder
- `/console` — User dashboard
- `/investors` — Investor page with NDA modal embed
- `/login`, `/signup`, `/0nboarding` — Auth flow
- `/admin` — Admin panel

### Key Libraries
| File | Purpose |
|------|---------|
| `lib/crm.ts` | CRM API wrapper (contacts, opportunities, tags, locations, notes, email) |
| `lib/crm-provisioning.ts` | Auto-provision CRM sub-accounts on signup (contact + Agent Studio fire) |
| `lib/web0n.ts` | web0n.com business logic (contacts, opportunities, invoices, sub-account automation) |
| `lib/personas.ts` | AI persona generation for forum |
| `lib/crm-sync.ts` | CRM data sync |
| `lib/content-engine.ts` | Dynamic content rendering |
| `lib/dot-on-security.ts` | .0n file encryption/signing |

### Signup → Provisioning Flow
```
User signs up (/signup or OAuth)
  → handle_new_user() trigger creates profiles row
  → Auth callback → /0nboarding (6 steps)
  → POST /api/onboarding/complete
    → provisionUser():
      1. Create CRM contact (upsertContact to community location)
      2. Fire Agent Studio agent (fireNewUserAgent)
      3. Store in user_crm_accounts table
      4. Update profile with crm_location_id + crm_contact_id
```

### web0n Pipeline
- **Pipeline ID**: `r9MYmF2xQKOe0rOcVAQH` (in 0nMCP sub-location)
- Stages: intake → deposit_paid → in_build → review → final_paid → launched
- `runDepositPaidAutomation()`: moves opportunity, creates sub-account, updates DB, adds CRM note
- Fires on webhook deposit payment AND free coupon projects

---

## 0n Marketplace

**URL**: marketplace.rocketclients.com
**Tech**: Next.js 16 + React 19 + Supabase + Stripe + Anthropic SDK + Tailwind v4
**Vercel**: `prj_fWdT7RGwoK01RqhxNN6M7USSCIZj`

### Key Routes
- `/store` + `/store/[slug]` — Marketplace listings
- `/builder` — Visual workflow builder
- `/dashboard` — User dashboard + earnings + workflows
- `/api/execute` — Workflow execution (Stripe metered at $0.10/execution)
- `/api/chat` — Claude-powered AI chat
- `/api/workflows/*` — CRUD + publish + deploy + compose + import

### Stripe
- Account: `acct_1PUJi5HThmAuKVQM`
- Product: `prod_Twzi39wJb0F3Xu`
- Metered price: `price_1Sz5jVHThmAuKVQMtSPKsNsS` ($0.10/execution)

---

## 0n Command Center

- **v4.2** — 80 routes, 10 engines, OAuth SSO
- Desktop app (Electron) + web app
- OAuth SSO across all Rocket products
- 10 engines: CRM, Stripe, Supabase, Vercel, GitHub, SendGrid, GA4, Sanity, Builder, Automation
- **545-tool API Command Center** from 0ntask template

---

## Supabase Projects

| ID | Project | Used By |
|----|---------|---------|
| `pwujhhmlrtxjmjzyttwn` | 0nmcp.com + Marketplace | 0nmcp-website, 0n-marketplace |
| `yaehbwimocvvnnlojkxe` | 0nork Customers | onork-app |
| `rtwtaisjtvdajrdyivkn` | Rocket+ Master DB | rocketadd.com, rocketclients.com |

**Org**: RocketOpp (`zentqhhzpheiixikxyul`)

---

## Brand Identity

- **Brand green**: `#7ed957` (lime green) | Dim: `#5cb83a` | Glow: `rgba(126, 217, 87, 0.15)`
- **Secondary**: `#00d4ff` (cyan) | **Tertiary**: `#a78bfa` (purple)
- **Fonts**: Instrument Sans (display), JetBrains Mono (code)
- **Dark theme**: `--bg-primary: #0a0a0f`, `--bg-card: #1a1a25`, `--text-primary: #e8e8ef`
- **NO generic Lucide icons** — use actual brand logos + stylized icon sets
- CSS vars: `--accent`, `--bg-primary`, `--bg-card`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border`

---

## The Spa In Ligonier (Rachel's Business)

- **Owner**: Rachel Knapic (Mike's wife)
- **Email**: rachelgmento@gmail.com | spaligonier@gmail.com
- **Phone**: +1-724-238-9800
- **Address**: 201 S Fairfield St, Ligonier, PA 15658
- **Website**: https://spaligonier.com
- **CRM Location**: `F76MNKOMQCMruMrumtdf`
- **PIT**: `pit-7379fc97-541b-49d0-864a-1dca95086534`
- **Stripe Customer**: `cus_T1hliV6FX2dCHu`
- 5,076 contacts, 20 workflows
- web0n project linked (project ID: `1f848dce-08ab-4431-a3dd-e4b55ba05f75`, opportunity: `5RDXF9FjyoGG03uc1VaR`)

---

## Terminology

| Term | Meaning |
|------|---------|
| Workflows | **RUNs** |
| .0n files | **SWITCH files** |
| Import credentials | **Turn it 0n** |
| Master setup file | **Master SWITCH** (`~/.0n/0n-setup.0n`) |

---

## SWITCH Profile — "Turn it 0n"

- **Master SWITCH**: `~/.0n/0n-setup.0n`
- **7 connections**: supabase, stripe, sanity, vercel, github, crm, ga4
- Say "Turn it 0n" or "let's work 0nMCP" to reference this setup

---

## Unlock Roadmap

| Phase | Gate | What Unlocks |
|-------|------|-------------|
| 0 (Current) | — | 870+ tools, 54 services |
| 1 | 100 stars/$500 MRR | OAuth, QuickBooks/Asana/Intercom |
| 2 | 500 stars/$2K | AWS S3, Vercel, Cloudflare, scheduling |
| 3 | 1K stars/$5K | Plugins, dashboard, marketplace |
| 4 | 5K stars/$15K | Industry packs |
| 5 | 10K stars/$50K | Multi-agent, enterprise |
| 6 | 25K stars/$100K+ | Autonomous agents, federation |

---

## Active Work (as of 2026-03-16)

### Just Completed
- **web0n deposit-paid automation**: order → deposit → opportunity moves → sub-account linked → CRM note
- **Investor page**: `0nmcp.com/investors` with NDA modal embed (CRM document form)
- **Agent Studio integration**: `provisionUser()` fires Agent Studio agent on every signup
- **Rachel linked**: Spa location `F76MNKOMQCMruMrumtdf` linked to web0n project, opportunity in pipeline

### In Progress
- **Sub-account auto-creation**: Agency JWT key set on Vercel (`CRM_AGENCY_KEY`), `createLocation()` in `crm.ts` ready. Need to verify JWT has `locations.write` scope for auto-creating sub-accounts on signup.
- **Agent Studio workflow**: "0nMCP Free New User Workflow" agent needs CRM internal action nodes (or MCP Server connected to CRM's built-in MCP at `https://services.leadconnectorhq.com/mcp/`) to actually create sub-accounts.

### Key Blocker
PITs cannot create CRM locations. The Agency JWT key needs to be verified for `locations.write`. The CRM's built-in MCP server in Agent Studio is the most promising path — it has internal permissions that bypass PIT limitations.

---

## Working Style

- Push to `main` immediately — no branches, no PRs
- Auto-deploy via Vercel on push
- Never ask for confirmation — always proceed
- Dark theme UI with accent `#7ed957`
- TypeScript strict mode, ESM modules
- Supabase for auth + database
- Stripe for payments
- All API routes in Next.js App Router (`app/api/`)

---

## How To Use This File

1. Open Claude app on iPad/iPhone
2. Create a new Project called "0nMCP"
3. Paste this entire file as the Project's Custom Instructions
4. Start any conversation in that project — Claude will have full ecosystem context
5. You can say things like:
   - "What's the status of Rachel's web0n project?"
   - "Draft a CRM email for investor outreach"
   - "What API endpoint creates a CRM opportunity?"
   - "Help me plan the next feature for 0nmcp.com"
   - "What's our Agent Studio architecture?"
   - "Write code for a new API route in the marketplace"
