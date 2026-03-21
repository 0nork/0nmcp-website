# CLAUDE.md — 0nMCP Website

## Project Overview

0nMCP Website is a Next.js 16 full-stack application for the 0nMCP platform — a universal AI workflow migration system built on the .0n standard format. The site includes marketing pages, a web console, marketplace, admin dashboard, blog, and extensive API routes for CRM integration, AI content generation, and MCP tooling.

**Stack**: Next.js 16 (App Router) · React 19 · TypeScript 5.9 · Tailwind CSS 4 · Supabase (PostgreSQL) · Stripe · Sentry · Vercel

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Pre-deploy script + Next.js build
npm run lint         # ESLint
```

Copy `.env.example` to `.env.local` and fill in required values (Supabase, Stripe, CRM, AI provider keys, etc.).

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── (dashboard)/        # Grouped dashboard routes
│   ├── api/                # 45+ API route directories
│   │   ├── cron/           # Scheduled jobs (personas, blog-seo, linkedin, reddit, etc.)
│   │   ├── crm/            # CRM integration endpoints
│   │   ├── mcp/            # MCP protocol endpoints
│   │   ├── oauth/          # OAuth flow handlers
│   │   ├── stripe/         # Payment webhooks & checkout
│   │   └── ...
│   ├── console/            # Web console with terminal emulator
│   ├── builder/            # MCP server builder
│   ├── convert/            # Brain Transplant (AI workflow converter)
│   ├── marketplace/        # App marketplace
│   ├── blog/               # Blog pages
│   ├── login/signup/       # Auth pages
│   └── ...                 # 50+ route directories total
├── components/             # Shared React components
│   ├── Nav.tsx, Footer.tsx, SiteChrome.tsx  # Layout chrome
│   ├── AuthModal.tsx, LoginModal.tsx        # Auth UI
│   ├── console/            # Console-specific components
│   ├── builder/            # Builder-specific components
│   ├── dashboard/          # Dashboard components
│   ├── terminal/           # Terminal emulator components
│   └── ...
├── lib/                    # Business logic & utilities
│   ├── supabase/           # Supabase client helpers (browser & server)
│   ├── crm*.ts             # CRM integration logic
│   ├── mcp/                # MCP protocol utilities
│   ├── stripe*.ts          # Stripe helpers
│   ├── linkedin/           # LinkedIn integration
│   ├── reddit/             # Reddit integration
│   ├── training/           # Training system
│   └── ...
├── hooks/                  # Custom React hooks (useTerminal.ts)
└── data/                   # Static JSON datasets & templates
    ├── catalog-snapshot.json, services.json  # Large data files
    ├── blog-posts.json
    └── premium-templates/

supabase/
└── migrations/             # 25+ timestamped SQL migrations

scripts/                    # Build & seed scripts (Node.js, Python, Bash)
├── pre-deploy.mjs          # Runs before build (migration check)
├── seed-*.mjs              # Data seeding scripts
└── sync-catalog.mjs

extension/                  # Chrome extension source
apps-sdk/                   # Server & web SDKs
public/                     # Static assets (images, logos, downloads)
docs/                       # Additional documentation
_reference/                 # Static HTML reference pages
```

## Key Conventions

### File Naming
- **Pages**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` (Next.js conventions)
- **API routes**: `route.ts`
- **Components**: PascalCase (`AuthModal.tsx`, `DemoPreview.tsx`)
- **Lib modules**: kebab-case or camelCase (`crm-sync.ts`, `converter.ts`)
- **Data files**: kebab-case JSON (`blog-posts.json`, `catalog-snapshot.json`)

### Import Alias
Use `@/` to import from `src/`:
```ts
import { createSupabaseBrowser } from '@/lib/supabase/client'
import Nav from '@/components/Nav'
```

### Component Patterns
- Client components use `'use client'` directive at top of file
- Server components are the default (no directive needed)
- Supabase browser client: `createSupabaseBrowser()` from `@/lib/supabase/client`
- Supabase server client: `createSupabaseServer()` from `@/lib/supabase/server`
- Icons from `lucide-react`

### TypeScript
- Strict mode enabled
- Target ES2017
- Module resolution: bundler
- `_reference/` and `apps-sdk/` excluded from compilation

## Database

- **Supabase** (PostgreSQL) with Row Level Security
- Migrations in `supabase/migrations/` — timestamped format `YYYYMMDDHHMMSS_description.sql`
- Pre-deploy script (`scripts/pre-deploy.mjs`) runs migrations before build
- Never modify existing migrations; create new ones for schema changes

## Deployment

- **Platform**: Vercel
- **Build command**: `node scripts/pre-deploy.mjs && next build`
- **Cron jobs** defined in `vercel.json` (8 scheduled endpoints)
- **Security headers** (HSTS, CSP, X-Frame-Options, etc.) configured in `vercel.json`
- **Sentry** for error tracking (server, edge, and client)
- **Vercel Analytics** and **Speed Insights** enabled

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | OAuth rewrites, CORS headers, Sentry integration |
| `vercel.json` | Cron jobs, redirects, security headers, cache policies |
| `tsconfig.json` | TypeScript config with `@/*` path alias |
| `postcss.config.mjs` | Tailwind CSS PostCSS plugin |
| `.env.example` | All required environment variables (80+) |

## Environment Variables

See `.env.example` for the full list. Key groups:
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **CRM**: `CRM_APP_CLIENT_ID`, `CRM_APP_CLIENT_SECRET`, OAuth redirect URIs
- **AI Providers**: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- **Sentry**: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`

## Common Tasks

### Adding a new page
Create `src/app/<route>/page.tsx`. Use `layout.tsx` for shared layout within the route.

### Adding an API route
Create `src/app/api/<name>/route.ts` exporting `GET`, `POST`, etc.

### Adding a database migration
Create a new file in `supabase/migrations/` with timestamp prefix: `YYYYMMDDHHMMSS_description.sql`

### Chrome extension
Source in `extension/`. Package with `npm run zip:extension`.

## Testing

No automated test framework is currently configured. Validate changes by:
1. Running `npm run lint`
2. Running `npm run build` to catch type errors
3. Manual testing via `npm run dev`

## Important Notes

- The build runs `scripts/pre-deploy.mjs` before `next build` — ensure it passes
- Large JSON data files in `src/data/` are loaded at build time; keep them valid
- OAuth `.well-known` endpoints are rewritten from root paths to API routes in `next.config.ts`
- Console/terminal routes have special CORS/COEP headers for WebContainer support
- ESM project (`"type": "module"` in package.json)
