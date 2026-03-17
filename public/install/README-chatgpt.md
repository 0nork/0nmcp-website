# Install 0nMCP on ChatGPT (Custom GPT)

## Quick Setup (2 minutes)

### Option 1: System Prompt (Any ChatGPT conversation)

1. Start a new ChatGPT conversation
2. Paste the system prompt from: https://0nmcp.com/chatgpt-0n-builder.md
3. Describe what you want to automate
4. ChatGPT generates a valid `.0n` workflow file
5. Import it at https://0nmcp.com/builder

### Option 2: Create a Custom GPT

1. Go to https://chat.openai.com/gpts/editor
2. Name: **0nMCP Workflow Builder**
3. Description: **Generate .0n workflow files for the 0nMCP automation platform. 1,171 tools across 54 services.**
4. Instructions: Copy the full prompt from https://0nmcp.com/chatgpt-0n-builder.md
5. Enable **Code Interpreter** (helps validate JSON)
6. Save and publish

### Option 3: API Actions (Advanced)

Add 0nMCP as an API action in your Custom GPT:

```yaml
openapi: 3.0.0
info:
  title: 0nMCP API
  version: 2.5.0
servers:
  - url: https://0nmcp.com/api
paths:
  /mcp:
    post:
      operationId: callMcpTool
      summary: Execute an 0nMCP tool
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                tool:
                  type: string
                params:
                  type: object
      responses:
        '200':
          description: Tool result
    get:
      operationId: getMcpStatus
      summary: Get 0nMCP server status
      responses:
        '200':
          description: Server info
```

## What You Can Build

Ask ChatGPT to generate workflows like:
- "Create a lead follow-up that tags contacts and sends welcome emails"
- "Build a daily pipeline report that posts to Slack"
- "Set up appointment reminders via SMS"
- "Automate social media posting when blog articles are published"
- "Create a customer onboarding sequence with email drip"

## The Flow

```
ChatGPT → generates .0n file → import to 0nmcp.com/builder → deploy to CRM
```

## Learn More

- Console: https://0nmcp.com/console
- Builder: https://0nmcp.com/builder
- Workflow Generator: https://0nmcp.com/console/workflow-generator
- npm: https://www.npmjs.com/package/0nmcp
- GitHub: https://github.com/0nork/0nMCP
