-- Extension auth tokens for Chrome extension
CREATE TABLE IF NOT EXISTS extension_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_extension_tokens_user ON extension_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_extension_tokens_hash ON extension_tokens(token_hash);

-- RLS
ALTER TABLE extension_tokens ENABLE ROW LEVEL SECURITY;

-- Users can read their own tokens
CREATE POLICY "Users read own tokens" ON extension_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can do everything (used by API routes)
CREATE POLICY "Service role full access" ON extension_tokens
  FOR ALL USING (true) WITH CHECK (true);

-- Add workflow_data column to store_listings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'store_listings' AND column_name = 'workflow_data'
  ) THEN
    ALTER TABLE store_listings ADD COLUMN workflow_data jsonb DEFAULT '{}';
  END IF;
END $$;
