# Install 0nMCP on Claude Desktop

## Quick Install (30 seconds)

1. Open Claude Desktop
2. Go to **Settings** > **Developer** > **Edit Config**
3. Paste this into your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp@latest"],
      "env": {}
    }
  }
}
```

4. Restart Claude Desktop
5. You now have **1,171 tools** across **54 services** available in every conversation

## With Your API Keys

To connect your services, add env vars:

```json
{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp@latest"],
      "env": {
        "STRIPE_SECRET_KEY": "sk_...",
        "OPENAI_API_KEY": "sk-...",
        "ANTHROPIC_API_KEY": "sk-ant-...",
        "SLACK_BOT_TOKEN": "xoxb-...",
        "GITHUB_TOKEN": "ghp_...",
        "CRM_PIT": "pit-...",
        "SUPABASE_URL": "https://xxx.supabase.co",
        "SUPABASE_KEY": "eyJ..."
      }
    }
  }
}
```

## What You Get

- **1,171 tools** across 54 services
- CRM contacts, conversations, calendar, pipelines
- Stripe payments, customers, invoices
- Slack, Discord, Twilio messaging
- GitHub repos, issues, PRs
- Google Sheets, Calendar, Drive
- OpenAI, Anthropic, Gemini AI
- Supabase, MongoDB, Airtable databases
- And 40+ more services

## Learn More

- Website: https://0nmcp.com
- Console: https://0nmcp.com/console
- Builder: https://0nmcp.com/builder
- npm: https://www.npmjs.com/package/0nmcp
- GitHub: https://github.com/0nork/0nMCP
