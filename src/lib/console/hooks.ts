/**
 * 0n Console — React Hooks
 * Combined from onork-app's useVault, useFlows, and useHistory hooks.
 *
 * Vault: Supabase `user_vaults` is the single source of truth.
 *        localStorage is a read-through cache for instant access.
 *        Each service stores its multi-field credentials as one encrypted
 *        JSON blob in the `encrypted_key` column.
 *
 * Storage keys:
 *   - 0n_vault  — localStorage cache (synced from Supabase)
 *   - 0n_flows  — saved workflows
 *   - 0n_history — activity log (max 200 entries)
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SVC } from "@/lib/console/services";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { encryptVaultData, decryptVaultData } from "@/lib/vault-crypto";

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

// Row IDs keyed by service name, for upsert tracking
type VaultRowMap = Record<string, string>;

// ─── Vault Hook ──────────────────────────────────────────────────

const VAULT_CACHE_KEY = "0n_vault";

/**
 * Unified credential vault backed by Supabase `user_vaults`.
 * localStorage serves as a fast cache; Supabase is authoritative.
 * All credential data is encrypted client-side with AES-256-GCM.
 */
export function useVault() {
  const [credentials, setCredentials] = useState<VaultData>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(VAULT_CACHE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  const [loaded, setLoaded] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const rowMapRef = useRef<VaultRowMap>({});
  const supabaseRef = useRef(createSupabaseBrowser());

  // Sync localStorage cache whenever credentials change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(credentials));
    }
  }, [credentials]);

  // Load from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    async function loadFromSupabase() {
      const sb = supabaseRef.current;
      if (!sb) return;

      const { data: { user } } = await sb.auth.getUser();
      if (!user || cancelled) return;
      userIdRef.current = user.id;

      const { data: rows } = await sb
        .from("user_vaults")
        .select("id, service_name, encrypted_key, iv, salt")
        .eq("user_id", user.id);

      if (!rows || cancelled) return;

      const decrypted: VaultData = {};
      const rowMap: VaultRowMap = {};

      for (const row of rows) {
        if (!row.encrypted_key || !row.iv || !row.salt) continue;
        rowMap[row.service_name] = row.id;
        try {
          const plaintext = await decryptVaultData(
            user.id,
            row.encrypted_key,
            row.iv,
            row.salt
          );
          // Try parsing as JSON (multi-field), fall back to single-key
          try {
            const parsed = JSON.parse(plaintext);
            if (typeof parsed === "object" && parsed !== null) {
              decrypted[row.service_name] = parsed;
            } else {
              decrypted[row.service_name] = { api_key: plaintext };
            }
          } catch {
            // Single-value credential (from old account page)
            decrypted[row.service_name] = { api_key: plaintext };
          }
        } catch {
          // Decryption failed — skip silently
        }
      }

      if (cancelled) return;
      rowMapRef.current = rowMap;
      setCredentials(decrypted);
      setLoaded(true);
    }
    loadFromSupabase();
    return () => { cancelled = true; };
  }, []);

  /** Persist a service's credentials to Supabase */
  const persistService = useCallback(
    async (service: string, fields: Record<string, string>) => {
      const sb = supabaseRef.current;
      const userId = userIdRef.current;
      if (!sb || !userId) return;

      const plaintext = JSON.stringify(fields);
      const { encrypted, iv, salt } = await encryptVaultData(userId, plaintext);

      // Generate hint from first secret-looking value
      const firstVal = Object.values(fields).find((v) => v.length > 4) || "";
      const hint = firstVal ? firstVal.slice(-4) : null;

      const existingId = rowMapRef.current[service];
      if (existingId) {
        await sb
          .from("user_vaults")
          .update({
            encrypted_key: encrypted,
            iv,
            salt,
            key_hint: hint,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingId);
      } else {
        const { data } = await sb
          .from("user_vaults")
          .insert({
            user_id: userId,
            service_name: service,
            encrypted_key: encrypted,
            iv,
            salt,
            key_hint: hint,
          })
          .select("id")
          .single();
        if (data) {
          rowMapRef.current[service] = data.id;
        }
      }
    },
    []
  );

  /** Set a credential value for a service field */
  const set = useCallback(
    (service: string, key: string, value: string) => {
      setCredentials((prev) => {
        const updated = {
          ...prev,
          [service]: { ...(prev[service] || {}), [key]: value },
        };
        // Persist the full service fields to Supabase (fire and forget)
        persistService(service, updated[service]);
        return updated;
      });
    },
    [persistService]
  );

  /** Get a credential value for a service field */
  const get = useCallback(
    (service: string, key: string): string => {
      return credentials?.[service]?.[key] || "";
    },
    [credentials]
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
        (f) => f.s || f.k === "url" || f.k === "client_id"
      );
      return (
        required.length > 0 &&
        required.every((f) => !!credentials?.[service]?.[f.k])
      );
    },
    [credentials]
  );

  /** Number of fully connected services */
  const connectedCount = Object.keys(SVC).filter(isConnected).length;

  /** List of connected service keys */
  const connectedServices = Object.keys(SVC).filter(isConnected);

  /** Remove all credentials for a service */
  const disconnect = useCallback(
    (service: string) => {
      setCredentials((prev) => {
        const next = { ...prev };
        delete next[service];
        return next;
      });
      // Remove from Supabase
      const sb = supabaseRef.current;
      const existingId = rowMapRef.current[service];
      if (sb && existingId) {
        sb.from("user_vaults").delete().eq("id", existingId);
        delete rowMapRef.current[service];
      }
    },
    []
  );

  /** Clear the entire vault */
  const clearAll = useCallback(() => {
    setCredentials({});
    // Clear all rows from Supabase
    const sb = supabaseRef.current;
    const userId = userIdRef.current;
    if (sb && userId) {
      sb.from("user_vaults").delete().eq("user_id", userId);
      rowMapRef.current = {};
    }
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
    loaded,
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
