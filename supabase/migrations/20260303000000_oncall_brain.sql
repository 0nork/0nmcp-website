-- 0ncall Brain: persistent AI memory per user
CREATE TABLE IF NOT EXISTS oncall_brain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_key TEXT NOT NULL,
  context_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, context_key)
);

CREATE INDEX IF NOT EXISTS idx_oncall_brain_user ON oncall_brain(user_id);
CREATE INDEX IF NOT EXISTS idx_oncall_brain_user_key ON oncall_brain(user_id, context_key);

ALTER TABLE oncall_brain ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own brain" ON oncall_brain
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users write own brain" ON oncall_brain
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own brain" ON oncall_brain
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own brain" ON oncall_brain
  FOR DELETE USING (auth.uid() = user_id);

-- 0ncall Conversations: chat history per session
CREATE TABLE IF NOT EXISTS oncall_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  summary TEXT,
  page_context TEXT,
  provider_used TEXT,
  message_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oncall_conv_user ON oncall_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_oncall_conv_created ON oncall_conversations(created_at DESC);

ALTER TABLE oncall_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own conversations" ON oncall_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users write own conversations" ON oncall_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own conversations" ON oncall_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own conversations" ON oncall_conversations
  FOR DELETE USING (auth.uid() = user_id);
