-- 007_personas.sql — AI Persona Plugin for Forum Agents
-- Creates personas, topic seeds, and conversation tracking tables

-- AI Personas — engineered forum characters
CREATE TABLE community_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT,                          -- developer, founder, agency, etc.
  expertise TEXT[],                   -- e.g. ['automation', 'crm', 'security']
  personality JSONB,                  -- { tone, verbosity, emoji_usage, asks_followups }
  knowledge_level TEXT DEFAULT 'intermediate', -- beginner, intermediate, expert
  preferred_groups TEXT[],            -- group slugs this persona frequents
  is_active BOOLEAN DEFAULT true,
  activity_level TEXT DEFAULT 'moderate', -- low, moderate, high
  last_active_at TIMESTAMPTZ,
  thread_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Persona needs a profile row to show up in forum UI
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_persona BOOLEAN DEFAULT false;

-- Topic seeds — what personas should discuss
CREATE TABLE persona_topic_seeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  category TEXT,                      -- maps to group slug
  prompt_hint TEXT,                   -- extra context for AI generation
  priority INT DEFAULT 5,             -- 1=low, 10=urgent
  used_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Track AI conversations to prevent loops
CREATE TABLE persona_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES community_threads(id),
  persona_id UUID REFERENCES community_personas(id),
  action TEXT,                        -- 'created_thread', 'replied'
  content_preview TEXT,               -- first 200 chars
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_personas_active ON community_personas(is_active) WHERE is_active = true;
CREATE INDEX idx_persona_convos_thread ON persona_conversations(thread_id);
CREATE INDEX idx_topic_seeds_priority ON persona_topic_seeds(priority DESC, used_count ASC);

-- RLS policies
ALTER TABLE community_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_topic_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_conversations ENABLE ROW LEVEL SECURITY;

-- Personas: public read (they appear in forum), service-role write
CREATE POLICY "Public can view active personas"
  ON community_personas FOR SELECT
  USING (is_active = true);

-- Topic seeds: only service-role (admin API)
CREATE POLICY "Service role manages topic seeds"
  ON persona_topic_seeds FOR ALL
  USING (true);

-- Conversations: public read for activity logs, service-role write
CREATE POLICY "Public can view persona conversations"
  ON persona_conversations FOR SELECT
  USING (true);
