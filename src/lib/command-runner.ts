interface MCPResult {
  id: string
  content: string
  servicesUsed: string[]
  duration: number
  raw: unknown
}

export async function runMCPCommand(
  userInput: string,
  userId: string
): Promise<MCPResult> {
  const start = Date.now()

  const response = await fetch(`${process.env.MCP_SERVER_URL || 'https://0nmcp.com/api/mcp'}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MCP_API_KEY || ''}`,
      'X-User-ID': userId,
    },
    body: JSON.stringify({
      prompt: `/use 0nmcp\n\n${userInput}`,
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    throw new Error(`MCP server error: ${response.status}`)
  }

  const data = await response.json()

  return {
    id: data.id || crypto.randomUUID(),
    content: data.content,
    servicesUsed: data.tools_used || [],
    duration: Date.now() - start,
    raw: data,
  }
}
