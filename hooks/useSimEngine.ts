"use client";

import { useMemo, useState, useCallback } from "react";
import type { YearData } from "@/lib/ledger/types";
import type { LeverConfig } from "@/lib/levers/types";
import { projectForward } from "@/lib/engine/project-forward";
import { replayCounterfactual } from "@/lib/engine/replay-counterfactual";
import { computeIncidence, type IncidenceResult } from "@/lib/incidence/compute";
import { defaultConfig } from "@/lib/levers/registry";
import { DEFAULT_ASSUMPTIONS } from "@/lib/ledger/growth";

export type SimMode = "whatif" | "fix";
export const FORWARD_END = 2050;

export interface SimEngine {
  mode: SimMode;
  setMode: (m: SimMode) => void;
  cfg: LeverConfig;
  setLever: (id: string, value: number | boolean) => void;
  reset: () => void;
  useDynamic: boolean;
  setUseDynamic: (v: boolean) => void;
  /** Selected counterfactual event ids (whatif mode). */
  events: string[];
  toggleEvent: (id: string) => void;
  /** Forward projection (fix mode). */
  years: YearData[];
  /** Counterfactual pair (whatif mode). */
  actual: YearData[];
  counterfactual: YearData[];
  /** The displayed end-year snapshot for the active mode. */
  current: YearData | undefined;
  incidence: IncidenceResult;
}

export function useSimEngine(): SimEngine {
  const [mode, setMode] = useState<SimMode>("fix");
  const [cfg, setCfg] = useState<LeverConfig>(() => defaultConfig());
  const [useDynamic, setUseDynamic] = useState(false);
  const [events, setEvents] = useState<string[]>([]);

  const setLever = useCallback((id: string, value: number | boolean) => {
    setCfg((c) => ({ ...c, [id]: value }));
  }, []);
  const reset = useCallback(() => {
    setCfg(defaultConfig());
    setEvents([]);
  }, []);
  const toggleEvent = useCallback((id: string) => {
    setEvents((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  }, []);

  const years = useMemo(
    () => projectForward(cfg, DEFAULT_ASSUMPTIONS, { useDynamic, endYear: FORWARD_END }),
    [cfg, useDynamic]
  );

  const { actual, counterfactual } = useMemo(
    () => replayCounterfactual(events, DEFAULT_ASSUMPTIONS),
    [events]
  );

  const incidence = useMemo(() => computeIncidence(cfg), [cfg]);

  const current =
    mode === "fix"
      ? years[years.length - 1]
      : counterfactual[counterfactual.length - 1];

  return {
    mode,
    setMode,
    cfg,
    setLever,
    reset,
    useDynamic,
    setUseDynamic,
    events,
    toggleEvent,
    years,
    actual,
    counterfactual,
    current,
    incidence,
  };
}
