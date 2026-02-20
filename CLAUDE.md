# CLAUDE.md — 0nMCP Website

## Project Overview

**0nMCP** (Universal AI API Orchestrator) website — a full-stack Next.js application for the 0nMCP product. The site provides product info, a visual workflow builder, community forum, learning platform, user accounts, admin dashboard, and a Chrome extension.

- **Production URL:** https://0nmcp.com
- **Repo:** https://github.com/0nork/0nmcp-website
- **Author:** RocketOpp LLC

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5.9 (strict mode) |
| Styling | Tailwind CSS 4 via PostCSS |
| Database | Supabase (PostgreSQL 17, Auth, Realtime) |
| Payments | Stripe |
| Deployment | Vercel |
| Analytics | Vercel Analytics + Speed Insights |
| Workflow UI | @xyflow/react (React Flow) |
| Fonts | Instrument Sans, JetBrains Mono (Google Fonts) |

## Commands

```bash
npm run dev        # Start dev server (Next.js)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run zip:extension  # Package Chrome extension as ZIP
```

No test framework is currently configured.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (SiteChrome wrapper, Analytics)
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   ├── manifest.ts         # PWA manifest
│   ├── robots.ts           # robots.txt generator
│   ├── sitemap.ts          # sitemap.xml generator
│   ├── api/                # API routes (see below)
│   └── [page]/             # Page routes (see below)
├── components/             # Reusable React components
│   ├── builder/            # Workflow builder components (Canvas, Nodes, etc.)
│   ├── onork-mini/         # Mini widget components
│   └── turn-it-on/         # Capability/feature page components
├── data/                   # Static data files
│   ├── capabilities.json   # Feature definitions
│   └── services.json       # Service catalog (v3.0.0, 33 services, 450+ tools)
├── lib/                    # Utility libraries
│   ├── supabase/           # Supabase client setup (client.ts, server.ts, middleware.ts)
│   ├── platforms/           # Social platform integrations (reddit, linkedin, devto)
│   ├── stripe.ts           # Stripe payment integration
│   ├── content-engine.ts   # Content management logic
│   ├── converter.ts        # Format conversion (OpenAI/Gemini/OpenClaw)
│   ├── crm.ts              # CRM integration
│   ├── personas.ts         # AI persona management
│   └── ...                 # Other utilities
└── middleware.ts           # Auth middleware (route protection, onboarding gate)

extension/                  # Chrome extension (Manifest v3)
supabase/                   # Supabase config & migrations
_reference/                 # Archived static HTML pages (not deployed)
public/                     # Static assets (logos, icons, downloads)
```

## Key Routes

### Pages
| Path | Description |
|------|-------------|
| `/` | Home page |
| `/builder` | Visual workflow builder (drag-and-drop) |
| `/community` | Community hub |
| `/forum`, `/forum/[slug]` | Discussion forum |
| `/learn`, `/learn/[slug]/[lessonSlug]` | Learning platform with courses |
| `/convert/{openai,gemini,openclaw}` | Format converters |
| `/turn-it-on/[slug]` | Capability/feature pages |
| `/account` | User account (protected) |
| `/admin/*` | Admin dashboard (restricted to admin emails) |
| `/login`, `/signup` | Authentication |
| `/forgot-password`, `/reset-password` | Password recovery flow |
| `/0nboarding` | New user onboarding (protected) |
| `/products/{web0n,app0n,social0n}` | Product pages |
| `/sponsor` | Sponsorship page |
| `/u/[id]` | Public user profiles |

### API Routes
| Path | Description |
|------|-------------|
| `/api/auth/*` | Auth callbacks, signout, custom email hook |
| `/api/admin/content/*` | Content CRUD (admin only) |
| `/api/builder/generate` | AI-powered workflow generation |
| `/api/catalog` | Service catalog endpoint |
| `/api/community/*` | Forum threads, groups, reactions, votes, profiles |
| `/api/convert` | Format conversion endpoint |
| `/api/courses/*` | Course management |
| `/api/personas/*` | AI persona CRUD, generation, conversation |
| `/api/stripe/*` | Checkout, portal, webhooks |
| `/api/cron/personas` | Cron job (every 2 hours via Vercel) |
| `/api/webhooks/supabase` | Supabase event webhook handler |

## Architecture Patterns

### Authentication
- Supabase Auth with email + OAuth support
- Three Supabase client factories in `src/lib/supabase/`:
  - `client.ts` → `createSupabaseBrowser()` for client components
  - `server.ts` → `createSupabaseServer()` for server components/API routes
  - `middleware.ts` → `updateSession()` for Next.js middleware
- All return `null` when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing (graceful degradation)
- Custom email hook at `/api/auth/send-email` routes auth emails through CRM for branded delivery

### Route Protection (middleware.ts)
- **Admin routes** (`/admin/*`): Restricted to hardcoded admin emails list
- **Protected routes** (`/account`, `/vault`, `/app`, `/store`, `/0nboarding`, `/oauth`): Require authentication
- **Auth pages** (`/login`, `/signup`): Redirect authenticated users away
- **Onboarding gate**: Authenticated users on protected routes are redirected to `/0nboarding` if `onboarding_completed` is false

### Component Patterns
- Pages use `'use client'` directive when they need browser APIs or state
- `SiteChrome` component wraps all pages (provides Nav, Footer, etc.)
- Path alias: `@/*` maps to `./src/*`

### Workflow Builder
- Uses `@xyflow/react` for visual node-based editing
- State managed via React Context (`BuilderContext.tsx`)
- Components: Canvas, WorkflowNode, ServicePalette, ConfigPanel, AIChat, Toolbar
- Import/export via `importWorkflow.ts` / `exportWorkflow.ts`

## Environment Variables

Required environment variables (not committed to repo):

| Variable | Usage |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_AUTH_HOOK_SECRET` | Auth webhook verification |
| `STRIPE_SECRET_KEY` | Stripe API (implied by stripe.ts) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification (implied) |

## Database

- **Provider:** Supabase (PostgreSQL 17)
- **Migrations:** `supabase/migrations/` — numbered SQL files
- **Local config:** `supabase/config.toml` (ports: API 54321, DB 54322, Studio 54323)
- **Key tables** (from migrations): profiles, personas, community/reddit integration, onboarding, converter, SEO enhancements

## Deployment

- **Platform:** Vercel
- **Config:** `vercel.json` defines:
  - Cron jobs (`/api/cron/personas` every 2 hours)
  - Redirects (`/docs`, `/github`, `/npm` → external; `/spec`, `/standard` → `/0n-standard`)
  - Security headers (HSTS, X-Frame-Options DENY, CSP-adjacent headers)
  - Cache headers (static assets: 1 year immutable; sw.js: no-cache)

## Conventions

- **Imports:** Use `@/` path alias (e.g., `import { createSupabaseBrowser } from '@/lib/supabase/client'`)
- **Styling:** Tailwind CSS utility classes + component-scoped CSS files where needed (e.g., `builder.css`, `app.css`, `globals.css`)
- **Client components:** Marked with `'use client'` at top of file
- **Null safety:** Supabase clients return `null` when not configured — always check before using
- **API routes:** Use Next.js route handlers (`route.ts`) with `NextRequest`/`NextResponse`
- **Dynamic routes:** Use `[param]` directory convention (e.g., `[slug]`, `[id]`)
- **ES Modules:** Project uses `"type": "module"` in package.json
- **No trailing slashes:** Configured in `next.config.ts`
