# 0nmcp.com — Project Pointer

> **Pointer file.** Canonical rules + ecosystem map live in `0n-dispatch`,
> mirrored to Supabase, served at `https://www.0ncore.com/api/dispatch/*`.
>
> Run `bash scripts/sync-from-dispatch.sh` to refresh the local cache.

## What this repo is

Marketing site, community hub, programmatic SEO engine. 200+ indexable pages. Next.js 16 + Supabase pwujhhmlrtxjmjzyttwn.

**Domain / npm:** 0nmcp.com
**Slug:** `0nmcp.com`

## Where the rules live

| Source | URL |
|---|---|
| Canonical | github.com/Crypto-Goatz/0n-dispatch (private) |
| Live rules | https://www.0ncore.com/api/dispatch/rules |
| Live ecosystem | https://www.0ncore.com/api/dispatch/ecosystem |
| This repo's status | https://www.0ncore.com/api/dispatch/products/0nmcp.com |
| Version / SHA | https://www.0ncore.com/api/dispatch/version |
| Signed .0n | https://www.0ncore.com/api/dispatch/.0n/<section> |
| Verify key | https://www.0ncore.com/.well-known/dispatch.pub |

## How to refresh

```bash
bash scripts/sync-from-dispatch.sh
```

## Hard rules (live source: `/api/dispatch/rules`)

1. Groq for production AI — never Anthropic / OpenAI SDK in prod paths.
2. Lucide React icons only — no emoji.
3. Tailwind only — no inline `style={{}}`.
4. shadcn via CSS variables — no custom CSS layers.
5. Push to `main`, no branches.
6. PIT tokens `type:plain` on Vercel, never encrypted.
7. NEVER say GHL / Go High Level / HighLevel — always "CRM" or "ROCKET".
8. Verify `NEXT_PUBLIC_SUPABASE_URL` from Vercel before any migration.

For the full numbered list, fetch `/api/dispatch/rules` or read
`0n-dispatch/memory/rules.md`.
