-- Core AI Provider column
-- Stores user's chosen primary AI provider for BYOK routing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS core_ai_provider TEXT DEFAULT NULL;

COMMENT ON COLUMN profiles.core_ai_provider IS 'Primary AI provider: anthropic, openai, gemini, openrouter, perplexity';
