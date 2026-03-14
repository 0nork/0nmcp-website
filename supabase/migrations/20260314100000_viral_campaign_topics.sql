-- Viral campaign content topics for LinkedIn + Reddit
-- All topics drive traffic to https://www.0nmcp.com/install0n
-- Optimized for engagement, sharing, and click-through

INSERT INTO content_topics (category, title, description, keywords, platforms, priority, is_active)
VALUES
  -- LinkedIn viral hooks
  ('viral_mcp', 'MCP Server Comparison: Build vs Buy', 'Compare building custom MCP servers from scratch vs using 0nMCP. Include time/cost analysis showing 0nMCP saves weeks of work.', ARRAY['MCP', 'Claude', 'AI tools', 'developer', 'comparison'], ARRAY['linkedin', 'reddit'], 10, true),
  ('viral_mcp', 'Why AI Agents Need Real API Access', 'Opinion piece: AI chatbots without API access are just fancy autocomplete. The real value is when AI can actually execute across services.', ARRAY['AI agents', 'API', 'automation', 'MCP', 'Claude'], ARRAY['linkedin'], 10, true),
  ('viral_mcp', 'The $12K/Year Workflow Tool Problem', 'Break down the cost of Zapier/Make/n8n and show how open-source MCP orchestration eliminates recurring fees while being more powerful.', ARRAY['Zapier', 'automation', 'cost', 'open-source', 'MCP'], ARRAY['linkedin', 'reddit'], 10, true),
  ('viral_mcp', '60-Second AI Setup Challenge', 'Challenge post: install 0nMCP and connect Claude to your entire stack in under 60 seconds. Include the install link.', ARRAY['challenge', 'install', 'Claude', 'MCP', 'speed'], ARRAY['linkedin'], 10, true),
  ('viral_mcp', 'Model Context Protocol Explained Simply', 'Explain MCP to non-technical readers. What it is, why it matters, and how 0nMCP makes it accessible to everyone.', ARRAY['MCP', 'explainer', 'AI', 'beginner', 'protocol'], ARRAY['linkedin', 'reddit'], 9, true),

  -- Reddit community engagement
  ('viral_reddit', 'Show r/ClaudeAI: 1,155 Tools for Claude', 'Show HN style post for r/ClaudeAI introducing 0nMCP and inviting feedback. Focus on what developers can build.', ARRAY['Claude', 'MCP', 'tools', 'open-source', 'showcase'], ARRAY['reddit'], 10, true),
  ('viral_reddit', 'MCP vs REST: The Next API Paradigm', 'Technical comparison of MCP protocol vs traditional REST APIs for AI tool integration. Include code examples.', ARRAY['MCP', 'REST', 'API', 'protocol', 'technical'], ARRAY['reddit'], 9, true),
  ('viral_reddit', 'Self-Hosting AI Orchestration', 'Guide for r/selfhosted on running 0nMCP locally with your own API keys. Encrypted vault, no cloud dependency.', ARRAY['self-hosted', 'privacy', 'encryption', 'local', 'MCP'], ARRAY['reddit'], 9, true),
  ('viral_reddit', 'Free Zapier Alternative for Developers', 'Position 0nMCP as the developer-first, free alternative to Zapier. Open source, AI-native, no per-operation pricing.', ARRAY['Zapier', 'alternative', 'free', 'open-source', 'developer'], ARRAY['reddit'], 10, true),
  ('viral_reddit', 'Building AI Agents That Actually Do Things', 'Tutorial on creating AI agents that can process payments, send emails, update databases via MCP tools.', ARRAY['AI agents', 'tutorial', 'MCP', 'automation', 'practical'], ARRAY['reddit'], 9, true),

  -- Cross-platform thought leadership
  ('viral_thought', 'The End of Workflow Builders', 'Prediction: natural language will replace drag-and-drop workflow builders. Why describing outcomes beats building pipelines.', ARRAY['AI', 'workflow', 'future', 'prediction', 'automation'], ARRAY['linkedin', 'reddit'], 8, true),
  ('viral_thought', 'Why I Open-Sourced 1,155 AI Tools', 'Founder story about the decision to make 0nMCP free and open source. Lessons learned, community growth.', ARRAY['open-source', 'founder', 'story', 'community', 'free'], ARRAY['linkedin'], 9, true),
  ('viral_thought', 'AI API Security: Vault-First Architecture', 'How 0nMCP handles API key security with machine-bound AES-256-GCM encryption. Why most tools get this wrong.', ARRAY['security', 'API keys', 'encryption', 'vault', 'architecture'], ARRAY['linkedin', 'reddit'], 8, true),
  ('viral_thought', '5 Signs Your AI Stack is Overengineered', 'Identify complexity red flags and show how a single MCP server simplifies everything.', ARRAY['AI', 'architecture', 'simplicity', 'developer', 'tips'], ARRAY['linkedin'], 9, true),
  ('viral_thought', 'From 0 to 91 Services: Building a Universal API Orchestrator', 'Technical deep-dive on the architecture behind connecting 91 services. Pipeline > Assembly Line > Radial Burst.', ARRAY['architecture', 'technical', 'API', 'orchestrator', 'deep-dive'], ARRAY['linkedin', 'reddit'], 8, true)
ON CONFLICT DO NOTHING;
