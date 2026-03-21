# OAuth 2.0 Authorization Server — Setup Guide

## Overview

0nMCP's OAuth server implements the **Authorization Code Grant** (RFC 6749) with **PKCE** (RFC 7636) support. Third-party applications (like Claude Desktop) can request scoped access to a user's 0n account.

## Prerequisites

The only env var needed beyond what's already configured:

```
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard → Settings → API>
```

All other env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`) should already be set.

## 1. Run the Migration

```bash
supabase db push
```

This creates 4 tables: `oauth_clients`, `oauth_authorization_codes`, `oauth_access_tokens`, `oauth_refresh_tokens`.

## 2. Register a Client

Generate a client secret and hash it:

```bash
# Generate a random secret
SECRET=$(openssl rand -hex 32)
echo "Client Secret: $SECRET"

# Hash it for storage
node -e "const c=require('crypto');console.log(c.createHash('sha256').update('$SECRET').digest('hex'))"
```

Insert the client:

```sql
INSERT INTO oauth_clients (
  client_id, client_secret_hash, app_name, redirect_uris, allowed_scopes, is_confidential
) VALUES (
  'claude-desktop',
  '<hashed-secret-from-above>',
  'Claude Desktop',
  ARRAY['http://localhost:3000/callback', 'https://claude.ai/oauth/callback'],
  ARRAY['openid', 'email', 'profile', 'read:vault', 'read:workflows'],
  true
);
```

For public clients (SPAs, CLIs) set `is_confidential = false` and `client_secret_hash = NULL`. These must use PKCE.

## 3. Deploy

Push to main — Vercel auto-deploys. No build config changes needed.

## 4. Test the Full Flow

### Step 1: Start authorization

Open in browser:
```
https://www.0nmcp.com/api/oauth/authorize?response_type=code&client_id=claude-desktop&redirect_uri=http://localhost:3000/callback&scope=openid+email+profile&state=test123
```

You'll be redirected to login (if needed) then the consent screen. Click **Allow**. Copy the `code` from the redirect URL.

### Step 2: Exchange code for tokens

```bash
curl -X POST https://www.0nmcp.com/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=<CODE_FROM_STEP_1>" \
  -d "client_id=claude-desktop" \
  -d "client_secret=<YOUR_RAW_SECRET>" \
  -d "redirect_uri=http://localhost:3000/callback"
```

Response:
```json
{
  "access_token": "0nat_...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "0nrt_...",
  "scope": "openid email profile"
}
```

### Step 3: Refresh token

```bash
curl -X POST https://www.0nmcp.com/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=0nrt_..." \
  -d "client_id=claude-desktop" \
  -d "client_secret=<YOUR_RAW_SECRET>"
```

### Step 4: Revoke token

```bash
curl -X POST https://www.0nmcp.com/api/oauth/revoke \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=0nat_..." \
  -d "token_type_hint=access_token" \
  -d "client_id=claude-desktop" \
  -d "client_secret=<YOUR_RAW_SECRET>"
```

## PKCE Flow (for public clients)

```bash
# Generate code verifier (43-128 chars, [A-Za-z0-9-._~])
VERIFIER=$(openssl rand -base64 32 | tr -d '=' | tr '+/' '-_')

# Generate code challenge (S256)
CHALLENGE=$(echo -n "$VERIFIER" | shasum -a 256 | cut -d' ' -f1 | xxd -r -p | base64 | tr -d '=' | tr '+/' '-_')

# Use in authorize request
# Add: &code_challenge=$CHALLENGE&code_challenge_method=S256

# In token exchange, add: -d "code_verifier=$VERIFIER"
```

## Scopes Reference

| Scope | Description |
|---|---|
| `openid` | Verify user identity |
| `email` | View email address |
| `profile` | View profile information |
| `read:vault` | Read vault credentials |
| `write:vault` | Manage vault credentials |
| `read:workflows` | View workflow files |
| `write:workflows` | Manage workflow files |

## Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/oauth/authorize` | GET | Start authorization flow |
| `/api/oauth/authorize` | POST | Process consent decision |
| `/api/oauth/token` | POST | Exchange code / refresh token |
| `/api/oauth/revoke` | POST | Revoke a token |
| `/oauth/authorize` | — | Consent UI page |

## Token Lifetimes

- **Authorization code**: 10 minutes (single-use)
- **Access token**: 1 hour
- **Refresh token**: 30 days

## Cleanup

Expired tokens are cleaned up by calling the database function:

```sql
SELECT cleanup_expired_oauth_data();
```

Hook this into a cron job or call it periodically.
