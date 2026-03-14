-- Add OpenRouter as a valid AI provider
-- Valid providers now: "gemini", "openai", "anthropic", "openrouter"
-- OpenRouter = universal AI gateway with 400+ models

COMMENT ON COLUMN profiles.default_ai_providers IS
  'Ordered array of AI provider IDs. NULL = platform default (gemini -> openai -> anthropic -> openrouter). Valid: gemini, openai, anthropic, openrouter.';

-- Set owner (mike@rocketopp.com) to include OpenRouter as priority provider
UPDATE profiles
SET default_ai_providers = '["openrouter","gemini","openai"]'::jsonb
WHERE email = 'mike@rocketopp.com';
