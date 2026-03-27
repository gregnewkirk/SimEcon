"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  SimulationState,
  TaxPolicy,
  AdvancedAssumptions,
  YearData,
} from "@/lib/types";
import { CURRENT_POLICY, DEFAULT_ASSUMPTIONS, START_YEAR, DEFAULT_END_YEAR } from "@/lib/data/defaults";
import { HISTORICAL_DATA } from "@/lib/data/historical";
import { SCENARIOS_MAP } from "@/lib/data/scenarios";
import { simulate } from "@/lib/engine/simulate";
import { useURLStateSync } from "./useURLState";

function createInitialState(): SimulationState {
  return {
    taxPolicy: { ...CURRENT_POLICY },
    enabledPrograms: [],
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    currentYear: START_YEAR,
    isPlaying: false,
    playbackSpeed: 1,
    scenarioId: "current",
    historicalData: HISTORICAL_DATA,
    projectedData: [],
    advancedMode: false,
    mode: "forward",
  };
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(createInitialState);

  // Projected data recalculated when policy/programs/assumptions change
  const projectedData = useMemo(
    () =>
      simulate(
        HISTORICAL_DATA,
        state.taxPolicy,
        state.enabledPrograms,
        state.assumptions,
        DEFAULT_END_YEAR
      ),
    [state.taxPolicy, state.enabledPrograms, state.assumptions]
  );

  // Baseline: current policy, no programs, default assumptions (for comparison KPIs)
  const baselineData = useMemo(
    () =>
      simulate(
        HISTORICAL_DATA,
        CURRENT_POLICY,
        [],
        DEFAULT_ASSUMPTIONS,
        DEFAULT_END_YEAR
      ),
    []
  );

  // Combined timelines
  const allData: YearData[] = useMemo(
    () => [...HISTORICAL_DATA, ...projectedData],
    [projectedData]
  );

  const baselineAllData: YearData[] = useMemo(
    () => [...HISTORICAL_DATA, ...baselineData],
    [baselineData]
  );

  // Current year data lookups
  const currentYearData = useMemo(
    () => allData.find((d) => d.year === state.currentYear) ?? allData[0],
    [allData, state.currentYear]
  );

  const baselineYearData = useMemo(
    () => baselineAllData.find((d) => d.year === state.currentYear) ?? baselineAllData[0],
    [baselineAllData, state.currentYear]
  );

  // Actions
  const setTaxPolicy = useCallback((policy: Partial<TaxPolicy>) => {
    setState((prev) => ({
      ...prev,
      taxPolicy: { ...prev.taxPolicy, ...policy },
      scenarioId: "custom",
    }));
  }, []);

  const toggleProgram = useCallback((programId: string) => {
    setState((prev) => {
      const enabled = prev.enabledPrograms.includes(programId)
        ? prev.enabledPrograms.filter((id) => id !== programId)
        : [...prev.enabledPrograms, programId];
      return { ...prev, enabledPrograms: enabled, scenarioId: "custom" };
    });
  }, []);

  const setAssumptions = useCallback((assumptions: Partial<AdvancedAssumptions>) => {
    setState((prev) => ({
      ...prev,
      assumptions: { ...prev.assumptions, ...assumptions },
    }));
  }, []);

  const loadScenario = useCallback((scenarioId: string) => {
    const scenario = SCENARIOS_MAP.get(scenarioId);
    if (!scenario) return;
    setState((prev) => ({
      ...prev,
      scenarioId,
      taxPolicy: { ...scenario.policy },
      enabledPrograms: [...scenario.programs],
    }));
  }, []);

  const setCurrentYear = useCallback((year: number) => {
    setState((prev) => ({ ...prev, currentYear: year }));
  }, []);

  const setIsPlaying = useCallback((isPlaying: boolean) => {
    setState((prev) => ({ ...prev, isPlaying }));
  }, []);

  const setPlaybackSpeed = useCallback((playbackSpeed: 1 | 5 | 10) => {
    setState((prev) => ({ ...prev, playbackSpeed }));
  }, []);

  const setAdvancedMode = useCallback((advancedMode: boolean) => {
    setState((prev) => ({ ...prev, advancedMode }));
  }, []);

  const reset = useCallback(() => {
    setState(createInitialState());
  }, []);

  // URL state sync — load from URL on mount, write to URL on change
  const onLoadFromURL = useCallback((partial: Partial<SimulationState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  // Build the state with computed projectedData for URL sync
  const stateWithProjections = useMemo(
    () => ({ ...state, projectedData }),
    [state, projectedData]
  );

  useURLStateSync(stateWithProjections, onLoadFromURL);

  return {
    state: stateWithProjections,
    allData,
    baselineAllData,
    currentYearData,
    baselineYearData,
    setTaxPolicy,
    toggleProgram,
    setAssumptions,
    loadScenario,
    setCurrentYear,
    setIsPlaying,
    setPlaybackSpeed,
    setAdvancedMode,
    reset,
  };
}
