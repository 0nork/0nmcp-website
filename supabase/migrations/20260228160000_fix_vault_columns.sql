-- Migration: fix_vault_columns
-- The user_vaults table was created manually with columns (service, field_key,
-- encrypted_value) but our code uses (service_name, encrypted_key). Both sets
-- exist. Add defaults to the legacy columns so inserts using the new schema
-- don't fail on NOT NULL constraints for unused columns.
-- Author: supabase-db-manager
-- Date: 2026-02-28

-- Add defaults to legacy columns
ALTER TABLE public.user_vaults ALTER COLUMN service SET DEFAULT '';
ALTER TABLE public.user_vaults ALTER COLUMN field_key SET DEFAULT '';
ALTER TABLE public.user_vaults ALTER COLUMN encrypted_value SET DEFAULT '';

-- Ensure user_id has NOT NULL (may be nullable from original creation)
-- Can't add NOT NULL if there are null rows, but table is empty so safe
ALTER TABLE public.user_vaults ALTER COLUMN user_id SET NOT NULL;

-- Notify PostgREST to pick up schema changes
NOTIFY pgrst, 'reload schema';
