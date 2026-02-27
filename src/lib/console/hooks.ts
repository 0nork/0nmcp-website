/**
 * 0n Console — React Hooks
 * Combined from onork-app's useVault, useFlows, and useHistory hooks.
 * Adapted for the 0nmcp.com console with localStorage persistence.
 *
 * Storage keys:
 *   - 0n_vault  — encrypted credential store
 *   - 0n_flows  — saved workflows
 *   - 0n_history — activity log (max 200 entries)
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { SVC } from "@/lib/console/services";

// ─── Types ───────────────────────────────────────────────────────

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  on: boolean;
  ts: string;
}

export interface HistoryEntry {
  id: string;
  ts: string;
  type: string;
  detail: string;
}

type VaultData = Record<string, Record<string, string>>;

// ─── Vault Hook ──────────────────────────────────────────────────

const VAULT_KEY = "0n_vault";

/**
 * Credential vault stored in localStorage.
 * Provides get/set per service+field, connection detection, and count.
 */
export function useVault() {
  const [credentials, setCredentials] = useState<VaultData>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(VAULT_KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(VAULT_KEY, JSON.stringify(credentials));
  }, [credentials]);

  /** Set a credential value for a service field */
  const set = useCallback((service: string, key: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [service]: { ...(prev[service] || {}), [key]: value },
    }));
  }, []);

  /** Get a credential value for a service field */
  const get = useCallback(
    (service: string, key: string): string => {
      return credentials?.[service]?.[key] || "";
    },
    [credentials],
  );

  /**
   * Check if a service is "connected" — all required fields
   * (secrets, URLs, client IDs) must have values.
   */
  const isConnected = useCallback(
    (service: string): boolean => {
      const sv = SVC[service];
      if (!sv) return false;
      const required = sv.f.filter(
        (f) => f.s || f.k === "url" || f.k === "client_id",
      );
      return (
        required.length > 0 &&
        required.every((f) => !!credentials?.[service]?.[f.k])
      );
    },
    [credentials],
  );

  /** Number of fully connected services */
  const connectedCount = Object.keys(SVC).filter(isConnected).length;

  /** List of connected service keys */
  const connectedServices = Object.keys(SVC).filter(isConnected);

  /** Remove all credentials for a service */
  const disconnect = useCallback((service: string) => {
    setCredentials((prev) => {
      const next = { ...prev };
      delete next[service];
      return next;
    });
  }, []);

  /** Clear the entire vault */
  const clearAll = useCallback(() => {
    setCredentials({});
  }, []);

  return {
    credentials,
    set,
    get,
    isConnected,
    connectedCount,
    connectedServices,
    disconnect,
    clearAll,
  };
}

// ─── Flows Hook ──────────────────────────────────────────────────

const FLOWS_KEY = "0n_flows";

/**
 * Workflow (flows) management stored in localStorage.
 * Provides add, remove, toggle enable/disable.
 */
export function useFlows() {
  const [flows, setFlows] = useState<Workflow[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(FLOWS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(FLOWS_KEY, JSON.stringify(flows));
  }, [flows]);

  /** Add a new workflow (id and ts are auto-generated) */
  const add = useCallback((w: Omit<Workflow, "id" | "ts">) => {
    setFlows((prev) => [
      ...prev,
      { ...w, id: Date.now().toString(), ts: new Date().toISOString() },
    ]);
  }, []);

  /** Remove a workflow by ID */
  const remove = useCallback((id: string) => {
    setFlows((prev) => prev.filter((x) => x.id !== id));
  }, []);

  /** Toggle a workflow's on/off state */
  const toggle = useCallback((id: string) => {
    setFlows((prev) =>
      prev.map((x) => (x.id === id ? { ...x, on: !x.on } : x)),
    );
  }, []);

  /** Update a workflow by ID (partial update) */
  const update = useCallback((id: string, patch: Partial<Workflow>) => {
    setFlows((prev) =>
      prev.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    );
  }, []);

  return { flows, add, remove, toggle, update };
}

// ─── History Hook ────────────────────────────────────────────────

const HISTORY_KEY = "0n_history";
const HISTORY_MAX = 200;

/**
 * Activity log stored in localStorage. New entries are prepended.
 * Automatically trims to HISTORY_MAX entries.
 */
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  /** Add a new history entry (prepended, auto-trimmed) */
  const add = useCallback((type: string, detail: string) => {
    setHistory((prev) =>
      [
        {
          id: Date.now().toString(),
          ts: new Date().toISOString(),
          type,
          detail,
        },
        ...prev,
      ].slice(0, HISTORY_MAX),
    );
  }, []);

  /** Clear all history */
  const clear = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, add, clear };
}
