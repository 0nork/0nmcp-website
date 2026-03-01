/**
 * 0n Console — React Hooks
 * Vault, Flows, and History — all backed by Supabase.
 * localStorage is a fast cache; Supabase is authoritative.
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
type VaultRowMap = Record<string, string>;

// ─── Vault Hook ──────────────────────────────────────────────────

const VAULT_CACHE_KEY = "0n_vault";

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(credentials));
    }
  }, [credentials]);

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
          const plaintext = await decryptVaultData(user.id, row.encrypted_key, row.iv, row.salt);
          try {
            const parsed = JSON.parse(plaintext);
            if (typeof parsed === "object" && parsed !== null) {
              decrypted[row.service_name] = parsed;
            } else {
              decrypted[row.service_name] = { api_key: plaintext };
            }
          } catch {
            decrypted[row.service_name] = { api_key: plaintext };
          }
        } catch {
          // Decryption failed — skip
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

  const persistService = useCallback(
    async (service: string, fields: Record<string, string>) => {
      const sb = supabaseRef.current;
      const userId = userIdRef.current;
      if (!sb || !userId) return;

      try {
        const plaintext = JSON.stringify(fields);
        const { encrypted, iv, salt } = await encryptVaultData(userId, plaintext);
        const firstVal = Object.values(fields).find((v) => v.length > 4) || "";
        const hint = firstVal ? firstVal.slice(-4) : null;

        const existingId = rowMapRef.current[service];
        if (existingId) {
          await sb.from("user_vaults").update({
            encrypted_key: encrypted, iv, salt, key_hint: hint,
            updated_at: new Date().toISOString(),
          }).eq("id", existingId);
        } else {
          const { data } = await sb.from("user_vaults").insert({
            user_id: userId, service_name: service,
            encrypted_key: encrypted, iv, salt, key_hint: hint,
          }).select("id").single();
          if (data) rowMapRef.current[service] = data.id;
        }
      } catch (err) {
        console.error(`[vault] Failed to persist ${service}:`, err);
      }
    },
    []
  );

  const set = useCallback(
    (service: string, key: string, value: string) => {
      setCredentials((prev) => {
        const updated = { ...prev, [service]: { ...(prev[service] || {}), [key]: value } };
        persistService(service, updated[service]);
        return updated;
      });
    },
    [persistService]
  );

  const get = useCallback(
    (service: string, key: string): string => credentials?.[service]?.[key] || "",
    [credentials]
  );

  const isConnected = useCallback(
    (service: string): boolean => {
      const sv = SVC[service];
      if (!sv) return false;
      const required = sv.f.filter((f) => f.s || f.k === "url" || f.k === "client_id");
      return required.length > 0 && required.every((f) => !!credentials?.[service]?.[f.k]);
    },
    [credentials]
  );

  const connectedCount = Object.keys(SVC).filter(isConnected).length;
  const connectedServices = Object.keys(SVC).filter(isConnected);

  const disconnect = useCallback((service: string) => {
    setCredentials((prev) => { const next = { ...prev }; delete next[service]; return next; });
    const sb = supabaseRef.current;
    const existingId = rowMapRef.current[service];
    if (sb && existingId) {
      sb.from("user_vaults").delete().eq("id", existingId);
      delete rowMapRef.current[service];
    }
  }, []);

  const clearAll = useCallback(() => {
    setCredentials({});
    const sb = supabaseRef.current;
    const userId = userIdRef.current;
    if (sb && userId) {
      sb.from("user_vaults").delete().eq("user_id", userId);
      rowMapRef.current = {};
    }
  }, []);

  return { credentials, set, get, isConnected, connectedCount, connectedServices, disconnect, clearAll, loaded };
}

// ─── Flows Hook ──────────────────────────────────────────────────

export function useFlows() {
  const [flows, setFlows] = useState<Workflow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const supabaseRef = useRef(createSupabaseBrowser());

  // Cache key scoped to user
  const cacheKey = userIdRef.current ? `0n_flows_${userIdRef.current}` : null;

  // Sync to localStorage cache
  useEffect(() => {
    if (cacheKey && typeof window !== "undefined") {
      localStorage.setItem(cacheKey, JSON.stringify(flows));
    }
  }, [flows, cacheKey]);

  // Load from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const sb = supabaseRef.current;
      if (!sb) return;

      const { data: { user } } = await sb.auth.getUser();
      if (!user || cancelled) return;
      userIdRef.current = user.id;

      const { data: rows, error } = await sb
        .from("user_console_flows")
        .select("id, name, trigger, actions, enabled, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error || !rows) {
        // Fallback to localStorage
        try {
          const cached = localStorage.getItem(`0n_flows_${user.id}`);
          if (cached) setFlows(JSON.parse(cached));
        } catch { /* ignore */ }
        setLoaded(true);
        return;
      }

      const mapped: Workflow[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        trigger: r.trigger,
        actions: r.actions || [],
        on: r.enabled,
        ts: r.created_at,
      }));
      setFlows(mapped);
      setLoaded(true);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const add = useCallback((w: Omit<Workflow, "id" | "ts">) => {
    const sb = supabaseRef.current;
    const userId = userIdRef.current;
    // Optimistic: add with temp ID
    const tempId = `temp-${Date.now()}`;
    const newFlow: Workflow = { ...w, id: tempId, ts: new Date().toISOString() };
    setFlows((prev) => [newFlow, ...prev]);

    if (sb && userId) {
      sb.from("user_console_flows")
        .insert({ user_id: userId, name: w.name, trigger: w.trigger, actions: w.actions, enabled: w.on })
        .select("id, created_at")
        .single()
        .then(({ data, error }) => {
          if (error) { console.error("[flows] insert failed:", error); return; }
          if (data) {
            setFlows((prev) => prev.map((f) => f.id === tempId ? { ...f, id: data.id, ts: data.created_at } : f));
          }
        });
    }
  }, []);

  const remove = useCallback((id: string) => {
    setFlows((prev) => prev.filter((x) => x.id !== id));
    const sb = supabaseRef.current;
    if (sb && !id.startsWith("temp-")) {
      sb.from("user_console_flows").delete().eq("id", id).then(({ error }) => { if (error) console.warn("[flows] delete failed:", error); });
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setFlows((prev) => {
      const updated = prev.map((x) => (x.id === id ? { ...x, on: !x.on } : x));
      const flow = updated.find((x) => x.id === id);
      const sb = supabaseRef.current;
      if (sb && flow && !id.startsWith("temp-")) {
        sb.from("user_console_flows").update({ enabled: flow.on, updated_at: new Date().toISOString() }).eq("id", id).then(({ error }) => { if (error) console.warn("[flows] toggle failed:", error); });
      }
      return updated;
    });
  }, []);

  const update = useCallback((id: string, patch: Partial<Workflow>) => {
    setFlows((prev) => {
      const updated = prev.map((x) => (x.id === id ? { ...x, ...patch } : x));
      const sb = supabaseRef.current;
      if (sb && !id.startsWith("temp-")) {
        const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (patch.name !== undefined) dbPatch.name = patch.name;
        if (patch.trigger !== undefined) dbPatch.trigger = patch.trigger;
        if (patch.actions !== undefined) dbPatch.actions = patch.actions;
        if (patch.on !== undefined) dbPatch.enabled = patch.on;
        sb.from("user_console_flows").update(dbPatch).eq("id", id).then(({ error }) => { if (error) console.warn("[flows] update failed:", error); });
      }
      return updated;
    });
  }, []);

  return { flows, add, remove, toggle, update };
}

// ─── History Hook ────────────────────────────────────────────────

const HISTORY_MAX = 200;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const userIdRef = useRef<string | null>(null);
  const supabaseRef = useRef(createSupabaseBrowser());

  const cacheKey = userIdRef.current ? `0n_history_${userIdRef.current}` : null;

  useEffect(() => {
    if (cacheKey && typeof window !== "undefined") {
      localStorage.setItem(cacheKey, JSON.stringify(history));
    }
  }, [history, cacheKey]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const sb = supabaseRef.current;
      if (!sb) return;

      const { data: { user } } = await sb.auth.getUser();
      if (!user || cancelled) return;
      userIdRef.current = user.id;

      const { data: rows, error } = await sb
        .from("user_console_history")
        .select("id, type, detail, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(HISTORY_MAX);

      if (cancelled) return;

      if (error || !rows) {
        try {
          const cached = localStorage.getItem(`0n_history_${user.id}`);
          if (cached) setHistory(JSON.parse(cached));
        } catch { /* ignore */ }
        return;
      }

      const mapped: HistoryEntry[] = rows.map((r) => ({
        id: r.id,
        ts: r.created_at,
        type: r.type,
        detail: r.detail,
      }));
      setHistory(mapped);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const add = useCallback((type: string, detail: string) => {
    const tempId = `temp-${Date.now()}`;
    const entry: HistoryEntry = { id: tempId, ts: new Date().toISOString(), type, detail };
    setHistory((prev) => [entry, ...prev].slice(0, HISTORY_MAX));

    const sb = supabaseRef.current;
    const userId = userIdRef.current;
    if (sb && userId) {
      sb.from("user_console_history")
        .insert({ user_id: userId, type, detail })
        .select("id")
        .single()
        .then(({ data, error }) => {
          if (error) { console.error("[history] insert failed:", error); return; }
          if (data) {
            setHistory((prev) => prev.map((h) => h.id === tempId ? { ...h, id: data.id } : h));
          }
        });
    }
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    const sb = supabaseRef.current;
    const userId = userIdRef.current;
    if (sb && userId) {
      sb.from("user_console_history").delete().eq("user_id", userId).then(({ error }) => { if (error) console.warn("[history] clear failed:", error); });
    }
    if (userIdRef.current) {
      localStorage.removeItem(`0n_history_${userIdRef.current}`);
    }
  }, []);

  return { history, add, clear };
}
