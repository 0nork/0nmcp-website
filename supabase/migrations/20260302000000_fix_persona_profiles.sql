-- Fix persona profile creation
-- Problem: profiles.id REFERENCES auth.users(id) — AI personas have no auth.users row,
-- so direct INSERTs fail with FK violation.
-- Solution: SECURITY DEFINER function that temporarily disables FK checks via
-- session_replication_role = 'replica', inserts the persona profile, then re-enables checks.

CREATE OR REPLACE FUNCTION create_persona_profile(
  p_full_name TEXT,
  p_email TEXT,
  p_avatar_url TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_reputation_level TEXT DEFAULT 'member',
  p_karma INT DEFAULT 10
) RETURNS UUID AS $$
DECLARE
  new_id UUID := gen_random_uuid();
BEGIN
  -- Temporarily disable FK checks for this transaction
  SET LOCAL session_replication_role = 'replica';

  INSERT INTO profiles (
    id, email, full_name, avatar_url, bio,
    is_persona, reputation_level, karma, role,
    onboarding_completed, onboarding_step
  )
  VALUES (
    new_id, p_email, p_full_name, p_avatar_url, p_bio,
    true, p_reputation_level, p_karma, 'member',
    true, 0
  );

  -- Re-enable FK checks
  SET LOCAL session_replication_role = 'origin';

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
