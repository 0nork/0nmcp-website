# 0nMCP System State
**Last updated:** 2026-04-08 23:15
**Updated by:** Claude Code — Session 10
**Active repo:** ~/Github/0nmcp-website

---

## Revenue States
- [ ] STATE 1: Spa Ligonier automated (webhook + campaign)
- [ ] STATE 2: CRO9 tracking live (embed.js + /api/track)
- [ ] STATE 3: 0nmcp.com converts visitors (homepage fix + signup flow)
- [ ] STATE 4: Atomic billing active (ONMCP_URL + metered Stripe)

---

## Active Task
**ID:** TASK-002
**Title:** Register Spa Ligonier webhook on CRM sub-account
**Status:** queued
**Assigned:** mike
**Type:** zero-code — one button click in /console/agent-workflows
**Proof:** POST to 0nmcp.com/api/webhooks/crm returns 200 from Spa trigger

> Priority 1. Zero code. Mike clicks one button. Do this before any build work starts.

---

## Last Verified Item
**Task:** Nuke inline styles from Chat.tsx, ChatInput.tsx, console.css
**Date:** 2026-04-08
**Proof:** Build compiles clean. 828 lines deleted, 158 Tailwind lines replaced. Awaiting Mike's browser verification.

---

## Stack Status
| Component | Status | Blocked By |
|---|---|---|
| 0nmcp npm v3.2.2 | Live | ONMCP_URL not wired (console uses 15 tools) |
| 0nmcp.com homepage V2 | Broken | Scroll reveal bug — sections invisible |
| 0nmcp.com console | Partial | Dark theme applied, needs browser verify |
| 0nmcp.com chat | Needs verify | Inline styles nuked, Tailwind rebuild pushed |
| 0nmcp.com style-docs | Needs verify | Native component showcase pushed |
| Webhook banner | Needs verify | Amber alert redesign pushed |
| 0nCommand backend | Live | 5 tables + 6 API routes + all seeds |
| CRO9 embed.js | Not built | — |
| Spa Ligonier webhook | Not activated | Button exists — Mike clicks it |
| Korean Facial campaign | Draft saved | Not sent — template 69d58910bcd74b84eba8fe3a |
| MCPFed patent fee $325 | URGENT | Due May 10, 2026 |
| Wowdash theme | Installed | Shell + sidebar live, tokens in console.css |
| Rocket+ rocketadd.com | Live | — |

---

## Patent Deadline Monitor
| Patent | Deadline | Days Left |
|---|---|---|
| MCPFed $325 fee | May 10, 2026 | 32 — URGENT |
| Vault Protocol non-prov | Feb 24, 2027 | 322 |
| 0nPlex non-prov | Mar 15, 2027 | 341 |
| 0nCore non-prov | Mar 15, 2027 | 341 |
| Knowledge Layers non-prov | Apr 1, 2027 | 358 |

---

## Task Queue (Priority Order)
| ID | Title | Assigned | Type | Status |
|---|---|---|---|---|
| TASK-001 | Pay $325 MCPFed patent fee | mike | zero-code | queued |
| TASK-002 | Register Spa Ligonier webhook | mike | zero-code | queued |
| TASK-003 | Send Korean Facial campaign | mike | zero-code | queued |
| TASK-004 | Fix homepage scroll reveal bug | claude+mike | frontend | queued |
| TASK-005 | Build CRO9 embed.js + /api/track | claude | backend | queued |
| TASK-006 | Wire ONMCP_URL to persistent server | claude | backend | queued |
| TASK-007 | Rebuild chat interface layout | claude+mike | frontend | in-progress |
| TASK-008 | Redesign webhook banner (workflows) | claude+mike | frontend | needs-verify |

---

## Completed This Session
- BUILD-001: 5 onc_ tables in Supabase (tasks, knowledge, directives, stack, sessions)
- BUILD-002: 6 API routes under /api/command/
- BUILD-003: Seeded 13 knowledge entries
- BUILD-004: Seeded 10 directives
- BUILD-005: Seeded 19 task cards + 10 stack components
- Wowdash app shell installed (WowdashSidebar + header + footer)
- Chat three-column layout rebuilt (flex-1 + w-72 shrink-0)
- Webhook banner redesigned (amber alert with action buttons)
- Style docs page — native component showcase (12 sections)
- Nuked 828 lines of inline styles from Chat.tsx, ChatInput.tsx, console.css
- STATE.md protocol established
- Spa Ligonier Rocket+ API key saved to memory

---

## Confirmed Repo Map
| Repo | Purpose | Visibility |
|---|---|---|
| github.com/0nork/0nMCP | 0nmcp npm package source (1,554 tools) | Public |
| github.com/0nork/0nmcp-website | 0nmcp.com Next.js app | Public |
| github.com/Crypto-Goatz/rocket-mods | rocketadd.com + 21 mods | Private |

---

## Key Corrections from Today's Session
- CRM tools = **245** (not 289 as previously stated)
- Both 0nork repos are **public** — no patent spec language in commits
- 0nDefender is live functionality in/alongside the npm package
- Certifications system is live at 0nmcp.com/verify/{certId}
- Patent descriptions on npm page differ from USPTO filed titles — flag for attorney
- Wowdash (not Velzon) is the confirmed console theme — downloaded April 8 2026
- Layout rewrites MUST preserve all imports (console.css, TooltipProvider) — logged as feedback
- Cart.tsx still uses old jp-* bridge variables — separate task needed
- console.css reduced from 607 lines to 44 lines (shadcn tokens only)

---

## How This File Works
**Claude Code:** Read at session start. Write after every verified task. Commit: `"chore: update STATE.md — [task]"`
**Mike:** Upload to claude.ai project after each Claude Code session.
**Claude chat:** Search project knowledge for "STATE.md" to get current state before answering questions.
