"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { SdLeverConfig, SdYearData } from "@/lib/sd/types";
import { projectSdForward } from "@/lib/sd/engine";
import { replaySdCounterfactual, type SdWhatIfResult } from "@/lib/sd/replay";
import { sdDefaultConfig } from "@/lib/sd/levers";
import { SD_DEFAULT_ASSUMPTIONS } from "@/lib/sd/growth";
import { encodeSdState, decodeSdState } from "@/lib/sd/url-state";

export type SdMode = "whatif" | "fix";
export const SD_FORWARD_END = 2040;

export interface SdEngine {
  mode: SdMode;
  setMode: (m: SdMode) => void;
  cfg: SdLeverConfig;
  setLever: (id: string, value: number | boolean) => void;
  setLevers: (updates: SdLeverConfig) => void;
  applyPreset: (partial: SdLeverConfig) => void;
  activePreset: string | null;
  setActivePreset: (id: string | null) => void;
  reset: () => void;
  /** Selected counterfactual event ids (whatif mode). */
  events: string[];
  toggleEvent: (id: string) => void;
  setEventsBulk: (ids: string[], on: boolean) => void;
  /** Forward projection (fix mode). */
  years: SdYearData[];
  /** Historical counterfactual (whatif mode). */
  whatIf: SdWhatIfResult;
}

export function useSdEngine(): SdEngine {
  const [mode, setMode] = useState<SdMode>("fix");
  const [cfg, setCfg] = useState<SdLeverConfig>(() => sdDefaultConfig());
  const [events, setEvents] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once from the URL after mount (avoids an SSR hydration mismatch on
  // shared links: the prerendered HTML is always the baseline budget).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if ([...params.keys()].length > 0) {
      const state = decodeSdState(params);
      setCfg(state.cfg);
      setMode(state.mode);
      setEvents(state.events);
    }
    setHydrated(true);
  }, []);

  // Keep the URL in sync so the address bar is always a shareable snapshot.
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      const qs = encodeSdState(cfg, mode, events).toString();
      window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }, 300);
    return () => clearTimeout(t);
  }, [hydrated, cfg, mode, events]);

  const setLever = useCallback((id: string, value: number | boolean) => {
    setCfg((c) => ({ ...c, [id]: value }));
    setActivePreset(null); // hand-editing leaves the preset
  }, []);
  const setLevers = useCallback((updates: SdLeverConfig) => {
    setCfg((c) => ({ ...c, ...updates }));
    setActivePreset(null);
  }, []);
  const applyPreset = useCallback((partial: SdLeverConfig) => {
    setCfg({ ...sdDefaultConfig(), ...partial });
  }, []);
  const reset = useCallback(() => {
    setCfg(sdDefaultConfig());
    setEvents([]);
    setActivePreset(null);
  }, []);
  const toggleEvent = useCallback((id: string) => {
    setEvents((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  }, []);
  const setEventsBulk = useCallback((ids: string[], on: boolean) => {
    setEvents((e) => {
      const set = new Set(e);
      for (const id of ids) {
        if (on) set.add(id);
        else set.delete(id);
      }
      return [...set];
    });
  }, []);

  const years = useMemo(
    () => projectSdForward(cfg, SD_DEFAULT_ASSUMPTIONS, { endYear: SD_FORWARD_END }),
    [cfg]
  );

  const whatIf = useMemo(
    () => replaySdCounterfactual(events, SD_DEFAULT_ASSUMPTIONS),
    [events]
  );

  return {
    mode,
    setMode,
    cfg,
    setLever,
    setLevers,
    applyPreset,
    activePreset,
    setActivePreset,
    reset,
    events,
    toggleEvent,
    setEventsBulk,
    years,
    whatIf,
  };
}
