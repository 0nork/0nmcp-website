/**
 * 0n Console — React Hooks
 * Flows and History — backed by Supabase.
 * localStorage is a fast cache; Supabase is authoritative.
 *
 * VAULT: Now a singleton context via VaultProvider.
 * Import useVault from '@/lib/console/VaultProvider' or from this file (re-export).
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";

// Re-export useVault from the singleton provider
export { useVault } from "@/lib/console/VaultProvider";

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
