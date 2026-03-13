-- Add per-user AI provider preferences
-- Admin can assign default AI providers per user
-- Values: jsonb array of provider IDs in priority order
-- e.g. ["gemini","openai"] means try Gemini first, then OpenAI
-- Valid providers: "gemini", "openai", "anthropic"
-- NULL = use platform default order (gemini -> openai -> anthropic)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS default_ai_providers jsonb DEFAULT NULL;

COMMENT ON COLUMN profiles.default_ai_providers IS
  'Ordered array of AI provider IDs. NULL = platform default (gemini -> openai -> anthropic).';

-- Set owner (mike@rocketopp.com) to Gemini + OpenAI
UPDATE profiles
SET default_ai_providers = '["gemini","openai"]'::jsonb
WHERE email = 'mike@rocketopp.com';
