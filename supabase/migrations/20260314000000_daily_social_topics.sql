-- Seed content_topics for the daily social media workflow
-- These drive the AI-generated industry tips for LinkedIn + GHL

INSERT INTO content_topics (category, title, description, keywords, platforms, priority, is_active)
VALUES
  ('ai_automation', 'AI Workflow Orchestration Tips', 'Share practical tips on orchestrating AI workflows across multiple services', ARRAY['AI', 'automation', 'workflow', 'orchestration', 'MCP'], ARRAY['linkedin'], 10, true),
  ('ai_automation', 'API Integration Best Practices', 'Practical advice on connecting APIs without boilerplate', ARRAY['API', 'integration', 'developer', 'best-practices'], ARRAY['linkedin'], 9, true),
  ('ai_automation', 'No-Code AI Automation', 'How non-technical teams can leverage AI automation tools', ARRAY['no-code', 'automation', 'AI', 'business'], ARRAY['linkedin'], 8, true),
  ('productivity', 'Developer Productivity with AI', 'Tips on using AI tools to 10x developer productivity', ARRAY['developer', 'productivity', 'AI', 'coding'], ARRAY['linkedin'], 9, true),
  ('productivity', 'Automating Repetitive Tasks', 'Identify and automate the tasks eating your time', ARRAY['automation', 'productivity', 'efficiency', 'time-saving'], ARRAY['linkedin'], 8, true),
  ('business', 'AI for Small Business', 'How small businesses can compete using AI automation', ARRAY['small-business', 'AI', 'automation', 'growth'], ARRAY['linkedin'], 7, true),
  ('business', 'Reducing SaaS Tool Sprawl', 'Consolidate your tech stack with unified orchestration', ARRAY['SaaS', 'tech-stack', 'consolidation', 'efficiency'], ARRAY['linkedin'], 7, true),
  ('security', 'API Key Security Best Practices', 'How to securely manage credentials across services', ARRAY['security', 'API-keys', 'vault', 'encryption'], ARRAY['linkedin'], 6, true),
  ('trends', 'MCP Protocol and the Future of AI', 'The Model Context Protocol and what it means for developers', ARRAY['MCP', 'AI', 'protocol', 'future', 'Claude'], ARRAY['linkedin'], 8, true),
  ('trends', 'AI Agent Workflows', 'Building autonomous AI agent workflows that actually work', ARRAY['AI-agents', 'autonomous', 'workflow', 'orchestration'], ARRAY['linkedin'], 9, true)
ON CONFLICT DO NOTHING;
