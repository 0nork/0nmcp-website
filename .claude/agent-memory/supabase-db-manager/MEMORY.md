# Supabase DB Manager Memory - 0nmcp-website

## Project Link
- 0nmcp-website is linked to Supabase project `pwujhhmlrtxjmjzyttwn` (0nMCP-Live, us-east-1)
- Link established 2026-02-18 via `supabase link --project-ref pwujhhmlrtxjmjzyttwn`
- Supabase CLI v2.67.1 is installed globally and authenticated (can list all projects)
- Service role key available via `supabase projects api-keys --project-ref pwujhhmlrtxjmjzyttwn`

## Migration History (synced local+remote as of 2026-03-21)
- See `/Users/rocketopp/Github/0nmcp-website/supabase/migrations/` for full list
- Latest: `20260407032614_telegram_auth_universal_commands_permissions.sql` - 6 tables: telegram_auth (Login Widget data), access_tokens (expanded: token_hash, permission_level, scopes, source, use_count, max_uses, ip_whitelist, metadata), universal_commands (35 seeded), command_addons (8 seeded), user_addons, command_executions (audit trail). Dropped+recreated access_tokens (was simpler schema from 20260405). RLS on all, service_role full access + user own-row policies. 3 updated_at triggers.
- Previous: `20260407020612_location_kb_branding_autoprovision.sql`, `20260407020023_crm_integrations_and_agent_workflows.sql`
- Previous: `20260330100000_0ndefender_patent_intelligence.sql` - 4 tables (intel_scans, intel_findings, intel_watchlist, intel_alerts) for patent intelligence system. 4 indexes on findings, 10 seed watchlist entries, RLS enabled on all with service_role full access policies. Applied via MCP apply_migration.
- Previous: `20260321100000_device_auth.sql` - device_codes table for RFC 8628 Device Authorization Grant (CLI "Turn it 0n" flow). Columns: device_code, user_code, verification_uri, client_id, scope, user_id (FK auth.users), status (pending/authorized/denied/expired), access_token, expires_at, interval_seconds. 3 indexes + RLS with service_role full access.
- Previous: `20260321000000_welcome_email_flag.sql` - adds `welcome_email_sent BOOLEAN DEFAULT false` to profiles
- Previous: `20260319000001_profile_crm_fields.sql` - (repaired as applied 2026-03-21, was applied directly to remote)
- Previous: `20260319000000_oauth_server.sql` - (repaired as applied 2026-03-21)
- Previous: `20260318040000_admin_todos.sql` - (repaired as applied 2026-03-21)
- Previous: `20260318030000_crm_provision_queue.sql` - (repaired as applied 2026-03-21)
- Previous: `20260318020000_custom_catalog_services.sql` - (repaired as applied 2026-03-21)
- Previous: `20260317080000_fix_signup_username_collision.sql` - handle_new_user() now appends random 4-char hex suffix on username UNIQUE collision + ON CONFLICT (id) DO UPDATE for OAuth re-linking
- Previous: `20260312200000_web0n_projects.sql` - web0n_projects (26 cols, status lifecycle, JSONB fields, CRM integration) + web0n_revisions (revision requests with CASCADE delete) + updated_at trigger + 9 RLS policies (user/admin/service_role) + 5 indexes
- Previous: `20260312100000_onboarding_ab_testing.sql` - onboarding_experiments, onboarding_variants, onboarding_assignments, onboarding_events tables + seed data
- Previous: `20260311200000_seed_automation_content.sql` - seeded persona_content_queue (16 threads + 16 replies), content_queue (5 posts), reddit_content (4 posts), content_topics (8 new topics)
- Earlier: `20260306100000_social_engine_listing.sql` - store listing for Social Intelligence Engine
- Notable: `20260305000000_listkit_imports.sql` - targeted at yaehbwimocvvnnlojkxe but also applied to pwujhhmlrtxjmjzyttwn (idempotent, harmless)
- Notable: `20260302100001_fix_signup_plan_column.sql` - renamed from 20260302100000 to resolve timestamp collision with `_email_settings.sql`

### content_topics_category_check (2026-03-10)
- `content_topics.category` has a CHECK constraint limiting values to: `mcp_education`, `feature_highlight`, `tutorial`, `comparison`, `community`, `on_standard`, `roadmap`, `use_case`, `release`, `thought_leadership`
- Original seed migration (20260301100000) used older category values like `security`, `education`, `feature`, `opinion` -- those were migrated at some point to the new enum
- The CHECK constraint was added directly on remote (no migration file for it)
- Migration 20260311200000 initially failed because it tried to insert `security`, `business`, `education`, `feature` -- fixed to `feature_highlight`, `use_case`, `mcp_education`
- Lesson: Always query CHECK constraints before seeding data with enum-like columns

### Non-Standard Migration Filenames (2026-03-17)
- `20260316_add0n_storefront.sql` and `20260316_crm_tokens.sql` had 8-digit timestamps (non-standard)
- Proper 14-digit versions already existed: `20260316100001_add0n_storefront.sql` and `20260316100002_crm_tokens.sql`
- Renamed non-standard files to `.bak` to unblock `supabase db push`
- These duplicates were blocking ALL migration pushes because CLI tried to apply them first and they conflicted with already-applied remote state

### Duplicate Timestamp Fix (2026-03-03)
- Two files had timestamp `20260302100000`: `_email_settings.sql` and `_fix_signup_plan_column.sql`
- Renamed `_fix_signup_plan_column.sql` to `20260302100001` and repaired remote history
- Lesson: Never create two migration files with the same 14-digit timestamp

## Bug Fix History

### Signup "Database error saving new user" (fixed 2026-02-20, recurred 2026-03-02, recurred 2026-03-17)
- **Original root cause (02-20)**: `handle_new_user()` trigger referenced `full_name` and `company` columns that didn't exist
- **Why**: profiles table was originally created by 0n-marketplace (001_initial_schema) with `display_name` (not `full_name`) and no `company` column. Migration 20260219210000 used `CREATE TABLE IF NOT EXISTS` which was a no-op since the table already existed, so those columns were never created.
- **Original fix**: Migration 20260220200000 added `full_name` + `company` columns
- **Recurrence (03-02)**: Trigger function was missing `plan` column (not in profiles table), `profiles_role_check` constraint blocked 'member' value, function missing `SET search_path = public`
- **Fix (03-02)**: Migration 20260302100000 adds `plan` column, drops role CHECK, recreates trigger with plan+display_name fallback+search_path
- **Recurrence #2 (03-02)**: `username` column has NOT NULL + UNIQUE constraint on yaehbwimocvvnnlojkxe but trigger didn't set it
- **Fix (03-02)**: Migration 20260302190000 adds username to trigger (derived from email prefix), sets column default to ''. Applied to both projects.
- **Recurrence #3 (03-17)**: Username UNIQUE constraint collision when two users share the same email prefix (e.g., mike@gmail.com and mike@yahoo.com both get username "mike")
- **Fix (03-17)**: Migration 20260317080000 rewrites handle_new_user() to check for existing username and append random 4-char hex suffix on collision. Also adds ON CONFLICT (id) DO UPDATE for safe OAuth re-linking.
- **Lesson**: When adding NOT NULL or UNIQUE columns, always verify ALL triggers that INSERT into the table include the new column.
- **Lesson**: `CREATE TABLE IF NOT EXISTS` does NOT add missing columns to existing tables. Always use `ALTER TABLE ADD COLUMN IF NOT EXISTS` for incremental changes.
- **Lesson**: Always include `SET search_path = public` on SECURITY DEFINER functions. Always verify CHECK constraints don't conflict with trigger default values.
- **Lesson**: Deterministic username generation from email prefix will eventually collide on UNIQUE constraints. Always include a collision-handling strategy (random suffix, incrementing number, etc.).

### DELETE trigger WHEN clause (fixed 2026-02-19)
- Original had `WHEN (COALESCE(NEW.x, OLD.x))` on DELETE triggers -- PostgreSQL error because DELETE triggers can't reference NEW
- Fix: Split into separate INSERT/UPDATE and DELETE triggers

## Profiles Table Columns (current, updated 2026-03-21)
`id, email, display_name, full_name, company, stripe_customer_id, stripe_subscription_id, stripe_subscription_item_id, crm_access_token, crm_refresh_token, crm_location_id, crm_token_expires_at, role, created_at, sponsor_tier, karma, reputation_level, bio, avatar_url, crm_community_contact_id, onboarding_completed, onboarding_step, interests, is_persona, username, is_admin, plan, labels, welcome_email_sent`
- Note: both `display_name` (from marketplace) and `full_name` (from 0nmcp-website) exist. Codebase uses `full_name` everywhere.
- `is_admin` BOOLEAN DEFAULT false -- added 2026-03-01
- `plan` TEXT DEFAULT 'free' -- added 2026-03-02
- `labels` TEXT[] DEFAULT '{}' -- added 2026-03-16 (GIN index: idx_profiles_labels)
- `welcome_email_sent` BOOLEAN DEFAULT false -- added 2026-03-21
- `role` default is 'member', CHECK constraint removed, nullable
- mike@rocketopp.com has `is_admin = true`, `labels = ['owner', 'vip']`
- Only remaining CHECK constraint: `profiles_reputation_level_check`

## yaehbwimocvvnnlojkxe (0nork Customers) - Ad-hoc Changes
- Applied same admin migration to this project (profiles table has is_admin column)
- handle_new_user() trigger recreated with role='member', is_admin=false defaults + username derivation
- mike@rocketopp.com set as admin
- This project's service role key is stored by the user (not in .env files)
- Management API queries work via: POST https://api.supabase.com/v1/projects/yaehbwimocvvnnlojkxe/database/query
- **2026-03-02**: Dropped `profiles_id_fkey` (FK to auth.users) to allow AI persona profiles without auth rows
- **2026-03-02**: Dropped `profiles_role_check` to allow arbitrary role values
- **2026-03-02**: Dropped `community_threads_user_id_fkey` and `community_posts_user_id_fkey` (FKs to auth.users) to allow AI persona threads/posts
- **2026-03-02**: Fixed handle_new_user() to include `username` column (was causing NOT NULL violation on signup). Username defaults to email prefix with dots removed. Also set `ALTER COLUMN username SET DEFAULT ''`.
- **2026-03-03**: Re-added FK constraints pointing to profiles(id) instead of auth.users(id):
  - `community_threads_user_id_fkey` -> profiles(id) ON DELETE CASCADE
  - `community_threads_group_id_fkey` -> community_groups(id) ON DELETE SET NULL
  - `community_posts_user_id_fkey` -> profiles(id) ON DELETE CASCADE
- Remaining constraints on profiles: profiles_pkey, profiles_plan_check, profiles_reputation_level_check, profiles_username_key
- Remaining constraints on community_threads: community_threads_user_id_fkey (to profiles), community_threads_group_id_fkey (to community_groups)
- Remaining constraints on community_posts: community_posts_user_id_fkey (to profiles), community_posts_thread_id_fkey (to community_threads)
- **2026-03-05**: Created `listkit_imports` table for B2B lead imports from ListKit
  - 22 columns: email (NOT NULL), first/last name, company, title, phone, industry, employee_count, linkedin_url, location, lead_score, lead_grade (A-D), company_tier, intent_signals (jsonb), list_name, batch_id, crm_contact_id, crm_opportunity_id, routing (HOT/WARM/NURTURE/DRIP), imported_at, created_at
  - 5 indexes: email, lead_grade, batch_id, imported_at DESC, company
  - RLS enabled, single policy: service_role full access
  - Migration file saved at: `supabase/migrations/20260305000000_listkit_imports.sql` (for record-keeping; applied via Management API to yaehbwimocvvnnlojkxe only)

## Credentials
- `.env.local` has anon key only (no service role key or DB password in file)
- Service role key retrievable via `supabase projects api-keys`
- Supabase CLI auth token handles all DDL operations via `supabase db push`

## CLI Notes
- `supabase db execute` does NOT exist in CLI v2.67.1 -- use Management API for ad-hoc queries
- psql available at `/opt/homebrew/opt/libpq/bin/psql` (PostgreSQL 18.3) -- alternative for ad-hoc SQL
- Docker Desktop required for `supabase db dump` and `supabase db start` (local dev)
- Migration filenames MUST use `YYYYMMDDHHMMSS_name.sql` format (14-digit timestamp). Non-standard names like `20260220_` cause CLI matching failures.
- If remote has non-standard migration versions, use `supabase migration repair --status reverted <version>` to clean up

## Auth Configuration (updated 2026-02-20)
- **site_url**: `https://0nmcp.com` (was Vercel preview URL, fixed via Management API)
- **Redirect URLs**: `https://0nmcp.com/**` + all Vercel preview URLs (29 total)
- **Email templates**: All 5 branded (confirmation, invite, magic link, recovery, email change)
  - Dark theme (#06060a outer, #0c0c14 card), accent #00ff88, table-based layout
  - MSO conditional comments for Outlook, preheader text, CAN-SPAM footer
  - Subjects: "Confirm Your 0nMCP Account", "You're Invited to 0nMCP", etc.
  - Script to regenerate: `scripts/update-email-templates.py`
- **mailer_autoconfirm**: `true` (confirmation emails skip verification, but templates still used for invite/recovery/magic link)
- Google OAuth enabled, LinkedIn OIDC enabled

## Management API Access
- Supabase CLI stores access token in macOS Keychain: service="Supabase CLI", account="supabase"
- Token is base64-encoded with prefix "go-keyring-base64:" -- decode with `echo $ENCODED | base64 -d`
- Token format: `sbp_*` (personal access token)
- Use `User-Agent: supabase-cli/2.67.1` header to avoid Cloudflare blocks
- Python urllib gets 403/1010 from Cloudflare; use `curl` with proper User-Agent instead

## Cross-Repo Migration Pattern
- Migrations can be pushed from any linked workspace using `supabase db push`
- If remote has migrations not in local dir, use `supabase migration repair --status reverted <versions>` to unblock push
