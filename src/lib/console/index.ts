/**
 * 0n Console — Library Barrel Export
 * Import everything from @/lib/console
 */

// Service definitions
export { SVC, SERVICE_KEYS, SERVICE_COUNT } from "./services";
export type { ServiceField, ServiceConfig } from "./services";

// Workflow idea suggestions
export { IDEAS, getIdeas } from "./ideas";

// React hooks (vault, flows, history, store)
export { useVault, useFlows, useHistory } from "./hooks";
export type { Workflow, HistoryEntry } from "./hooks";
export { useStore } from "./useStore";
export { useLinkedIn } from "./useLinkedIn";

// 0nMCP HTTP client
export {
  execute,
  runWorkflow,
  listWorkflows,
  health,
  connectService,
  listConnections,
  isOnline,
  getServerUrl,
} from "./0nmcp-client";
export type {
  ExecuteResult,
  WorkflowResult,
  HealthResult,
  WorkflowInfo,
} from "./0nmcp-client";

// Theme
export { THEME, HEX, GRADIENTS, SHADOWS, TW } from "./theme";
export type { ThemeKey, GradientKey, ShadowKey } from "./theme";
