---
title: "Your .env file is a security liability. Here's what replaces it."
published: false
description: "47 million .env files on GitHub contain plain text API keys. The .0n Standard is a universal config format with 7 layers of encryption, 9 file types, and patent-pending execution patterns. Open source. MIT licensed."
tags: security, ai, opensource, devops
cover_image: https://0nmcp.com/brand/og-dot-on-standard.png
canonical_url: https://0nmcp.com/0n-standard
---

Right now, there are 47 million `.env` files on GitHub containing plain text API keys. Yours might be one of them.

And no, `.gitignore` is not a security strategy. It is a prayer.

We built something that replaces `.env` files entirely. It has 7 layers of encryption, works across every AI platform, and it is open source. Let me explain.

---

## The problem nobody talks about

Every developer has done it. You create a `.env` file. You paste in your Stripe secret key, your database URL, your API tokens. You tell `.gitignore` to ignore it. You move on.

Here is what is actually happening:

- **Zero encryption.** Your keys sit in plain text. Any process on your machine can read them.
- **Zero access control.** Anyone with file system access has every credential.
- **Zero portability.** Switch from Cursor to Claude Desktop? Copy-paste your keys again. Switch to Windsurf? Again. Gemini? Again.
- **Zero integrity verification.** No way to know if someone tampered with your config.
- **Zero structure.** A `.env` file is just `KEY=VALUE`. No metadata, no service detection, no validation.

One accidental `git push` and your AWS keys are on GitHub. GitHub's secret scanning catches some of them. Most, it does not. And by the time it does, bots have already harvested them.

This is the state of the art in 2026. We are building autonomous AI agents that orchestrate dozens of services, and we are storing their credentials in the digital equivalent of a Post-it note.

---

## The .0n Standard

The `.0n` Standard is a universal configuration format designed for AI orchestration. It replaces `.env`, `.json` config blobs, and platform-specific formats with a single encrypted, portable, validated standard.

```yaml
# stripe.0n — a .0n connection file
name: stripe
service: stripe
version: "1.0"
credentials:
  api_key: "{{vault:stripe_api_key}}"
  webhook_secret: "{{vault:stripe_webhook}}"
metadata:
  environment: production
  last_verified: "2026-04-01T00:00:00Z"
```

Credentials never exist in plain text. The `{{vault:*}}` references resolve at runtime from your encrypted vault. The file itself can live in version control safely.

### 9 file types

| Type | Extension | Purpose |
|------|-----------|---------|
| **Connection** | `.0n` | Service credentials (encrypted) |
| **Workflow** | `.0n` | Execution definitions (RUNs) |
| **Brain** | `.0n` | AI knowledge + context |
| **Brand** | `.0n` | Visual identity + voice |
| **Task** | `.0n` | Discrete operations |
| **Switch** | `.0n` | Master orchestration profiles |
| **Snapshot** | `.0n` | System state captures |
| **Execution** | `.0n` | Runtime logs + results |
| **Config** | `.0n` | Global settings |

One format. Nine purposes. Every AI platform speaks it.

---

## .env vs .0n — side by side

| | `.env` | `.0n` |
|---|---|---|
| Encryption | None | AES-256-GCM + Argon2id |
| Access control | File permissions | Per-layer encryption, multi-party escrow |
| Portability | Copy-paste | Import/export across 7 AI platforms |
| Validation | None | JSON Schema validation |
| Service detection | None | Auto-maps to 102 services |
| Integrity | None | SHA3-256 Seal of Truth |
| Signing | None | Ed25519 digital signatures |
| Git-safe | Only with .gitignore | By design |
| Tamper detection | None | Seal breaks on any modification |
| Structure | KEY=VALUE | Typed schemas with metadata |

---

## The 7 Knowledge Layers (Patent Pending)

This is where it gets interesting. The `.0n` Standard does not just store credentials. It stores everything your AI needs to operate as you.

| Layer | Name | What it holds |
|-------|------|---------------|
| **K1** | Brand Voice | Tone, vocabulary, banned words, communication style |
| **K2** | Terminology | Industry jargon, internal names, acronyms, mappings |
| **K3** | Business Structure | Org chart, roles, permissions, team topology |
| **K4** | Visual Identity | Colors, fonts, logos, spacing, component styles |
| **K5** | Domain Expertise | Industry knowledge, SOPs, decision frameworks |
| **K6** | Credentials | API keys, tokens, secrets (double-encrypted via Argon2id) |
| **K7** | Audit Trail | Every action logged, timestamped, signed |

Your AI agent does not just have access to your Stripe key. It knows your brand voice, your terminology, your org structure, and your domain expertise. And all of that travels with you when you switch platforms.

Move from Claude to GPT? Your brain comes with you. Switch to Gemini? Same brain. Run it locally with Ollama? Same brain.

That is the point. Your AI context should not be locked to a vendor.

---

## The 7-Layer Security Architecture

Every `.0nv` vault container (the encrypted bundle format) implements all seven:

1. **AES-256-GCM** -- Military-grade symmetric encryption for all content
2. **Argon2id** -- Memory-hard KDF for credential layers (double encryption)
3. **Ed25519** -- Digital signatures for authorship verification
4. **PBKDF2-SHA512** -- 100K iterations for key derivation
5. **X25519 ECDH** -- Multi-party escrow with per-layer access matrices
6. **SHA3-256 Seal of Truth** -- Content-addressed integrity (one bit changes, the seal breaks)
7. **Hardware fingerprint binding** -- Optional machine-lock for maximum security

The credentials layer (K6) gets double-encrypted. First with the container passphrase, then again with Argon2id. Even if someone cracks the outer encryption, credentials remain locked behind a second wall.

---

## 3 Execution Patterns (Patent Pending)

The `.0n` Standard does not just store config. It defines how work gets done.

### Pipeline
Sequential execution. Step A finishes, then B starts, then C.

```
A --> B --> C --> D
```

Classic workflow. Predictable. Debuggable. Use it when order matters.

### Assembly Line
Parallel execution with dependency resolution. Independent steps run simultaneously. Dependent steps wait.

```
A --> B --|
          |--> D --> E
A --> C --|
```

Two to five times faster than Pipeline for most real-world workflows.

### Radial Burst
Fan out the same prompt to multiple AI models. Score the responses. Return the best one.

```
         /--> Claude  --\
Prompt --+--> GPT-4    --+--> Score --> Best
         \--> Gemini  --/
```

Run the same question through Claude, GPT, and Gemini simultaneously. Score the responses on accuracy, completeness, and relevance. Return the winner. This is how you get reliable AI output without trusting any single model.

---

## Smart Deploy (Patent Pending)

Workflows can include asset generation directives that execute at deployment time:

```yaml
steps:
  - action: deploy_landing_page
    config:
      hero_image: "{{NEW_IMAGE:a modern SaaS dashboard with dark theme}}"
      og_image: "{{NEW_IMAGE:social card for product launch, 1200x630}}"
      favicon: "{{NEW_IMAGE:minimal geometric logo, 32x32}}"
```

When a `.0n` workflow deploys, every `{{NEW_IMAGE:description}}` resolves to a generated asset. The description becomes the prompt. The output gets embedded in the deployment. No separate design step. No asset pipeline. Describe it, deploy it.

---

## Seal of Truth (Patent Pending)

Every `.0nv` container includes a SHA3-256 content-addressed seal:

```
SHA3-256(transferId || timestamp || publicKey || SHA3-256(concat(allCiphertexts)))
```

This seal is computed over every encrypted layer in the container. Change one character in any layer -- credentials, workflows, brain data, anything -- and the seal breaks.

```bash
$ 0nmcp vault verify business.0nv

Seal of Truth: VALID
Signature: VERIFIED (Ed25519)
Layers: 7/7 intact
Fingerprint: a4f2...8c91
Last transfer: 2026-03-28T14:22:00Z
```

You can verify a container was not tampered with in transit, at rest, or during transfer. No trust required. Math handles it.

---

## Free Converter Tool

Already have a `.env` file? Convert it in your browser:

**[https://0nmcp.com/convert/env](https://0nmcp.com/convert/env)**

Paste your `.env` content. Get encrypted `.0n` connection files. Auto-detects services (Stripe, Supabase, OpenAI, GitHub, and 98 others). Your keys never leave your browser -- all encryption happens client-side.

---

## The numbers

| Metric | Value |
|--------|-------|
| Tools | 1,589 across 102 services |
| Patents pending | 5 |
| File types | 9 |
| Knowledge layers | 7 |
| Security layers | 7 |
| Execution patterns | 3 |
| AI platforms supported | 7 (Claude, GPT, Gemini, Ollama, Cursor, Windsurf, Continue) |
| License | MIT |
| Vault tests passing | 48/48 |
| Engine tests passing | 30/30 |

---

## Get started

Install the spec:

```bash
npm install 0n-spec
```

Install the orchestrator (includes vault, engine, and all 1,589 tools):

```bash
npm install 0nmcp
```

Import your existing credentials:

```bash
0nmcp engine import        # reads .env, CSV, JSON
0nmcp engine verify        # tests every key
0nmcp engine platforms     # generates configs for all 7 AI platforms
```

Create an encrypted vault container:

```bash
0nmcp vault create         # interactive, picks your layers
0nmcp vault verify my.0nv  # check Seal of Truth
```

---

## Why we built this

Every AI platform invented its own config format. Claude Desktop has `claude_desktop_config.json`. Cursor has its settings. Windsurf has another format. They all store credentials in plain text.

We asked a simple question: what if there was one format that worked everywhere, encrypted everything, and traveled with you?

Five patents later, here we are.

The `.0n` Standard is not a wrapper around `.env`. It is a complete rethinking of how AI agents store, access, and protect the knowledge they need to operate. Credentials are just one layer. Your brand, your expertise, your business logic -- that is the real payload.

Your `.env` file is a flat list of secrets with no protection. Your `.0n` profile is an encrypted, signed, portable AI brain with 7 knowledge layers, integrity verification, and multi-party access control.

One of those belongs in production. The other belongs in 2019.

---

## Links

- **npm (0n-spec):** [https://npmjs.com/package/0n-spec](https://npmjs.com/package/0n-spec)
- **npm (0nmcp):** [https://npmjs.com/package/0nmcp](https://npmjs.com/package/0nmcp)
- **GitHub:** [https://github.com/0nork/0n-spec](https://github.com/0nork/0n-spec)
- **Website:** [https://0nmcp.com](https://0nmcp.com)
- **Converter:** [https://0nmcp.com/convert/env](https://0nmcp.com/convert/env)
- **The .0n Standard docs:** [https://0nmcp.com/0n-standard](https://0nmcp.com/0n-standard)

Star the repo if this makes sense to you. Try the converter if you want to see it work. And if you are still storing API keys in plain text -- stop.

---

*Built by [RocketOpp LLC](https://rocketopp.com). Patent pending. MIT licensed. Open source.*
