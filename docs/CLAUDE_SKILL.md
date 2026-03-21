# 0nMCP Claude Code Skill

Documentation for the `/0nmcp` Claude Code skill — connecting Claude to the 0nMCP ecosystem.

## Overview

The 0nMCP skill allows Claude Code users to:
- Authenticate with their 0nmcp.com account
- Access the Vault (encrypted API key storage)
- Check and spend Sparks (usage credits)
- Browse and run workflows from the Store
- Contribute to the Council Brain

## Installation

### One-line installer
```bash
curl -sL https://www.0nmcp.com/api/skill/install | sh
```

### Manual
1. Download the skill: `curl -sL https://www.0nmcp.com/api/skill/download -o ~/.claude/skills/0nmcp/SKILL.md`
2. In Claude Code, type: `/0nmcp login`

## API Endpoints

All endpoints are under `https://www.0nmcp.com/api/skill/`.

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `auth` | POST | None | Login (email + password) |
| `auth/refresh` | POST | Refresh token | Refresh expired access token |
| `session` | GET | Bearer | Session info + status |
| `vault` | GET | Bearer | List connected services |
| `vault` | POST | Bearer | Retrieve encrypted key |
| `vault` | PUT | Bearer | Save/update a key |
| `vault` | DELETE | Bearer | Remove a key |
| `sparks` | GET | Bearer | Check Spark balance |
| `sparks` | POST | Bearer | Deduct Sparks for an action |
| `store` | GET | Bearer | Browse store listings |
| `config` | GET | None | Download skill config |
| `dashboard` | GET | None | Download dashboard HTML |
| `download` | GET | None | Download SKILL.md |
| `install` | GET | None | Install script |

## Session Storage

Session data is stored at `~/.0n/0nmcp-session.json`:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "expires_at": 1234567890,
  "user_email": "user@example.com",
  "user_id": "uuid",
  "installed_at": "2026-03-10T00:00:00Z",
  "dashboard_path": "~/.claude/skills/0nmcp/dashboard.html"
}
```

## Vault Encryption

Keys are AES-256-GCM encrypted client-side using PBKDF2 with the user's ID as derivation input. Decrypted keys are never written to disk — they exist only in the current session.

## Spark Costs

| Action | Cost |
|--------|------|
| `api.chat` | 3 |
| `api.execute` | 5 |
| `console.workflow.run` | 5 |
| `console.workflow.create` | 2 |
| `api.builder.generate` | 10 |
| `api.convert` | 1 |
| `api.training.ingest` | 0 (free) |

## Council Brain

Public endpoints:
- `GET /api/training/leaderboard` — Brain status, tiers, coverage

Authenticated:
- `POST /api/training/ingest` — Contribute knowledge (Tier 3+ / Canopy)
- Domains: logic, systems, business, ethics, workflow, cross-domain, optimization, self-optimization
- Rate limit: 50/day
