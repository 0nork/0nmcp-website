/**
 * CRM Agent Studio API Client
 *
 * Wraps the Agent Studio public API for executing, listing, and creating AI agents.
 * Agents live inside CRM sub-locations and can access:
 *   - Knowledge Base (per-location, personalized)
 *   - Web Search
 *   - MCP Server (connects to 0nMCP for 870+ tools)
 *
 * Env vars:
 *   CRM_AGENT_STUDIO_KEY          — Agency PIT with Agent Studio scopes
 *   CRM_AGENT_STUDIO_LOCATION_ID  — Default sub-location (0nMCP community)
 *   CRM_AGENT_STUDIO_AGENT_ID     — Default KB agent
 *   CRM_AGENT_STUDIO_VERSION_ID   — Default agent version
 */

const API_BASE = 'https://services.leadconnectorhq.com'
const API_VERSION = '2021-07-28'

// ── Types ──

export interface AgentExecuteRequest {
  message: string
  locationId?: string
  versionId?: string
  inputVariables?: Record<string, string>
  attachments?: Array<{ type: string; url: string }>
  executionId?: string // Include to continue session
}

export interface AgentExecuteResponse {
  output?: string
  message?: string
  text?: string
  executionId?: string
  status?: string
  error?: string
}

export interface Agent {
  id: string
  name: string
  description?: string
  status?: string
  isPublished?: boolean
  locationId?: string
  createdAt?: string
  updatedAt?: string
}

export interface AgentListResponse {
  agents: Agent[]
  total?: number
}

export interface CreateAgentRequest {
  name: string
  description: string
  locationId: string
  capabilities?: string[]
}

// ── Helpers ──

function getHeaders(): Record<string, string> {
  const key = process.env.CRM_AGENT_STUDIO_KEY
  if (!key) throw new Error('CRM_AGENT_STUDIO_KEY not configured')
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Version': API_VERSION,
  }
}

function getDefaults() {
  return {
    locationId: process.env.CRM_AGENT_STUDIO_LOCATION_ID || '',
    agentId: process.env.CRM_AGENT_STUDIO_AGENT_ID || '',
    versionId: process.env.CRM_AGENT_STUDIO_VERSION_ID || '',
  }
}

// ── Execute Agent ──

/**
 * Execute an agent and get a response.
 * Supports session persistence via executionId.
 *
 * @param agentId - Agent to execute (defaults to env CRM_AGENT_STUDIO_AGENT_ID)
 * @param request - Execute request with message, locationId, etc.
 * @returns Agent response with output text and executionId for session continuity
 */
export async function executeAgent(
  agentId?: string,
  request?: AgentExecuteRequest
): Promise<AgentExecuteResponse> {
  const defaults = getDefaults()
  const id = agentId || defaults.agentId
  if (!id) throw new Error('No agent ID provided and CRM_AGENT_STUDIO_AGENT_ID not set')

  const body = {
    message: request?.message || '',
    locationId: request?.locationId || defaults.locationId,
    versionId: request?.versionId || defaults.versionId,
    inputVariables: request?.inputVariables || {},
    attachments: request?.attachments || [],
    ...(request?.executionId ? { executionId: request.executionId } : {}),
  }

  const res = await fetch(
    `${API_BASE}/agent-studio/public-api/agents/${id}/execute`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000), // Agents can take time
    }
  )

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error')
    return {
      error: `Agent Studio ${res.status}: ${errText}`,
      status: 'failed',
    }
  }

  const data = await res.json()
  return {
    output: data.output || data.message || data.text || '',
    message: data.message,
    text: data.output || data.message || data.text || '',
    executionId: data.executionId,
    status: 'completed',
  }
}

// ── List Agents ──

/**
 * List all active agents for a location.
 */
export async function listAgents(
  locationId?: string,
  options?: { limit?: number; offset?: number; isPublished?: boolean }
): Promise<AgentListResponse> {
  const defaults = getDefaults()
  const locId = locationId || defaults.locationId

  const params = new URLSearchParams({ locationId: locId })
  if (options?.limit) params.set('limit', String(options.limit))
  if (options?.offset) params.set('offset', String(options.offset))
  if (options?.isPublished !== undefined) params.set('isPublished', String(options.isPublished))

  const res = await fetch(
    `${API_BASE}/agent-studio/agent?${params}`,
    { method: 'GET', headers: getHeaders() }
  )

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Agent Studio list failed: ${res.status} — ${errText}`)
  }

  return res.json()
}

// ── Get Agent ──

export async function getAgent(agentId: string): Promise<Agent> {
  const res = await fetch(
    `${API_BASE}/agent-studio/agent/${agentId}`,
    { method: 'GET', headers: getHeaders() }
  )

  if (!res.ok) {
    throw new Error(`Agent Studio get failed: ${res.status}`)
  }

  return res.json()
}

// ── Create Agent ──

/**
 * Create a new agent with an initial staging version.
 */
export async function createAgent(data: CreateAgentRequest): Promise<Agent> {
  const res = await fetch(
    `${API_BASE}/agent-studio/agent`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  )

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Agent Studio create failed: ${res.status} — ${errText}`)
  }

  return res.json()
}

// ── Update Agent ──

export async function updateAgent(
  agentId: string,
  data: Partial<{ name: string; description: string }>
): Promise<Agent> {
  const res = await fetch(
    `${API_BASE}/agent-studio/agent/${agentId}`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  )

  if (!res.ok) {
    throw new Error(`Agent Studio update failed: ${res.status}`)
  }

  return res.json()
}

// ── Promote to Production ──

export async function promoteAgent(agentId: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/agent-studio/agent/${agentId}/promote`,
    { method: 'POST', headers: getHeaders() }
  )

  if (!res.ok) {
    throw new Error(`Agent Studio promote failed: ${res.status}`)
  }
}

// ── Delete Agent ──

export async function deleteAgent(agentId: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/agent-studio/agent/${agentId}`,
    { method: 'DELETE', headers: getHeaders() }
  )

  if (!res.ok) {
    throw new Error(`Agent Studio delete failed: ${res.status}`)
  }
}

// ── Convenience: Execute with session tracking ──

/**
 * Execute the default agent with automatic session handling.
 * Returns text + executionId for multi-turn conversations.
 */
export async function chat(
  message: string,
  options?: {
    executionId?: string
    locationId?: string
    agentId?: string
    inputVariables?: Record<string, string>
  }
): Promise<{ text: string; executionId?: string; source: 'agent-studio' }> {
  const result = await executeAgent(options?.agentId, {
    message,
    executionId: options?.executionId,
    locationId: options?.locationId,
    inputVariables: options?.inputVariables,
  })

  return {
    text: result.text || result.output || result.error || 'No response from agent.',
    executionId: result.executionId,
    source: 'agent-studio',
  }
}
