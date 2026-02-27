/**
 * 0nMCP HTTP Client — Connects the 0nmcp.com console to the 0nMCP server
 * Ported from onork-app/lib/0nmcp-client.ts, adapted for 0nmcp.com
 *
 * Server URL comes from NEXT_PUBLIC_ONMCP_URL env var.
 * Falls back to http://localhost:3001 for local development.
 */

const ONMCP_URL =
  process.env.NEXT_PUBLIC_ONMCP_URL || "http://localhost:3001";

// ─── Types ───────────────────────────────────────────────────────

export interface ExecuteResult {
  status: "completed" | "failed";
  message: string;
  steps_executed?: number;
  services_used?: string[];
  plan?: string[];
}

export interface WorkflowResult {
  status: "completed" | "failed";
  workflow: string;
  execution_id?: string;
  steps_executed?: number;
  duration_ms?: number;
  outputs?: Record<string, unknown>;
}

export interface HealthResult {
  status: string;
  version: string;
  uptime?: number;
  connections?: number;
  services?: string[];
}

export interface WorkflowInfo {
  name: string;
  path: string;
  type?: string;
  version?: string;
}

// ─── Internal Fetch ──────────────────────────────────────────────

async function mcpFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${ONMCP_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`0nMCP ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

// ─── Public API ──────────────────────────────────────────────────

/** Execute a natural language task across all connected services */
export async function execute(task: string): Promise<ExecuteResult> {
  return mcpFetch<ExecuteResult>("/api/execute", {
    method: "POST",
    body: JSON.stringify({ task }),
  });
}

/** Run a named .0n workflow with optional inputs */
export async function runWorkflow(
  workflow: string,
  inputs?: Record<string, unknown>,
): Promise<WorkflowResult> {
  return mcpFetch<WorkflowResult>("/api/run", {
    method: "POST",
    body: JSON.stringify({ workflow, inputs }),
  });
}

/** List all deployed .0n workflows */
export async function listWorkflows(): Promise<WorkflowInfo[]> {
  const data = await mcpFetch<{ workflows: WorkflowInfo[] }>("/api/workflows");
  return data.workflows || [];
}

/** Get 0nMCP server health status */
export async function health(): Promise<HealthResult> {
  return mcpFetch<HealthResult>("/api/health");
}

/** Connect a service by describing it in natural language */
export async function connectService(
  service: string,
  credentialDescription: string,
): Promise<ExecuteResult> {
  return execute(`Connect to ${service} with ${credentialDescription}`);
}

/** List all connected services */
export async function listConnections(): Promise<ExecuteResult> {
  return execute("List all connected services and their status");
}

/** Check if 0nMCP server is reachable */
export async function isOnline(): Promise<boolean> {
  try {
    await health();
    return true;
  } catch {
    return false;
  }
}

/** Get the configured 0nMCP server URL */
export function getServerUrl(): string {
  return ONMCP_URL;
}
