"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  SimulationState,
  SimMode,
  TaxPolicy,
  AdvancedAssumptions,
  YearData,
  ViewComplexity,
  ViewPerspective,
} from "@/lib/types";
import { CURRENT_POLICY, DEFAULT_ASSUMPTIONS, START_YEAR, DEFAULT_END_YEAR, LAST_HISTORICAL_YEAR, FIX_END_YEAR } from "@/lib/data/defaults";
import { HISTORICAL_DATA } from "@/lib/data/historical";
import { SCENARIOS_MAP } from "@/lib/data/scenarios";
import { WHAT_IF_EVENTS_MAP } from "@/lib/data/what-if-events";
import { simulate } from "@/lib/engine/simulate";
import { simulateRevision } from "@/lib/engine/simulate-revision";
import { simulateWhatIfMulti, calculateWhatIfDelta } from "@/lib/engine/what-if";
import { useURLStateSync } from "./useURLState";

function createInitialState(): SimulationState {
  return {
    taxPolicy: {
      ...CURRENT_POLICY,
      brackets: CURRENT_POLICY.brackets.map((b) => ({ ...b })),
    },
    enabledPrograms: [],
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    programCostOverrides: {},
    currentYear: START_YEAR,
    isPlaying: false,
    playbackSpeed: 1,
    scenarioId: "current",
    historicalData: HISTORICAL_DATA,
    projectedData: [],
    advancedMode: false,
    mode: "revision",
    whatIfEventIds: [],
    viewComplexity: "simple",
    viewPerspective: "macro",
  };
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(createInitialState);

  const isRevisionMode = state.mode === "revision";

  // === REVISION MODE: simulate user's policy from year 2000 onward ===
  const revisionData = useMemo(() => {
    if (!isRevisionMode) return null;
    const startYear = HISTORICAL_DATA[0]; // Year 2000 starting conditions
    return simulateRevision(
      startYear,
      state.taxPolicy,
      state.enabledPrograms,
      state.assumptions,
      DEFAULT_END_YEAR,
      state.programCostOverrides
    );
  }, [isRevisionMode, state.taxPolicy, state.enabledPrograms, state.assumptions, state.programCostOverrides]);

  // === FIX MODE: projected data from end of historical, 20 years forward ===
  const fixEndYear = isRevisionMode ? DEFAULT_END_YEAR : FIX_END_YEAR;
  const projectedData = useMemo(
    () =>
      simulate(
        HISTORICAL_DATA,
        state.taxPolicy,
        state.enabledPrograms,
        state.assumptions,
        fixEndYear,
        state.programCostOverrides
      ),
    [state.taxPolicy, state.enabledPrograms, state.assumptions, state.programCostOverrides, fixEndYear]
  );

  // Baseline: current policy, no programs, default assumptions (for comparison KPIs)
  const baselineData = useMemo(
    () =>
      simulate(
        HISTORICAL_DATA,
        CURRENT_POLICY,
        [],
        DEFAULT_ASSUMPTIONS,
        fixEndYear
      ),
    [fixEndYear]
  );

  // Combined timelines — mode-aware
  const allData: YearData[] = useMemo(() => {
    if (isRevisionMode && revisionData) {
      // In revision mode: the starting year seed + alternate timeline
      const seed = HISTORICAL_DATA[0]; // year 2000 as anchor
      return [seed, ...revisionData];
    }
    // Fix mode: start from present day (2025) and project forward only
    const lastHistorical = HISTORICAL_DATA[HISTORICAL_DATA.length - 1];
    return [lastHistorical, ...projectedData];
  }, [isRevisionMode, revisionData, projectedData]);

  const baselineAllData: YearData[] = useMemo(
    () => [...HISTORICAL_DATA, ...baselineData],
    [baselineData]
  );

  // What-if mode data — works in both modes
  const whatIfData = useMemo(() => {
    if (state.whatIfEventIds.length === 0) return null;
    // Only compute what-if when in whatif mode OR when events are toggled in either mode
    const events = state.whatIfEventIds
      .map((id) => WHAT_IF_EVENTS_MAP.get(id))
      .filter((e): e is NonNullable<typeof e> => e != null);
    if (events.length === 0) return null;
    return simulateWhatIfMulti(events, state.assumptions, DEFAULT_END_YEAR);
  }, [state.whatIfEventIds, state.assumptions]);

  const whatIfDelta = useMemo(() => {
    if (!whatIfData) return null;
    return calculateWhatIfDelta(whatIfData.actual, whatIfData.counterfactual, state.currentYear);
  }, [whatIfData, state.currentYear]);

  // Current year data lookups
  const currentYearData = useMemo(
    () => allData.find((d) => d.year === state.currentYear) ?? allData[0],
    [allData, state.currentYear]
  );

  const baselineYearData = useMemo(
    () => baselineAllData.find((d) => d.year === state.currentYear) ?? baselineAllData[0],
    [baselineAllData, state.currentYear]
  );

  // "Today" data — always anchored to the last historical year (present day)
  const todayYoursData = useMemo(() => {
    if (isRevisionMode && revisionData) {
      // In revision mode: find year 2025 in the alternate timeline
      const altToday = revisionData.find((d) => d.year === LAST_HISTORICAL_YEAR);
      return altToday ?? allData[0];
    }
    return allData.find((d) => d.year === LAST_HISTORICAL_YEAR) ?? allData[0];
  }, [isRevisionMode, revisionData, allData]);

  const todayActualData = useMemo(
    () => baselineAllData.find((d) => d.year === LAST_HISTORICAL_YEAR) ?? baselineAllData[0],
    [baselineAllData]
  );

  // Actions
  const setTaxPolicy = useCallback((policy: Partial<TaxPolicy>) => {
    setState((prev) => {
      const newPolicy = { ...prev.taxPolicy, ...policy };
      // Keep top bracket in sync with topMarginalRate
      if (policy.topMarginalRate !== undefined && newPolicy.brackets) {
        const brackets = newPolicy.brackets.map((b) => ({ ...b }));
        brackets[brackets.length - 1].rate = policy.topMarginalRate;
        newPolicy.brackets = brackets;
      }
      return {
        ...prev,
        taxPolicy: newPolicy,
        scenarioId: "custom",
      };
    });
  }, []);

  const setBracketRate = useCallback((index: number, rate: number) => {
    setState((prev) => {
      const brackets = prev.taxPolicy.brackets.map((b) => ({ ...b }));
      brackets[index] = { ...brackets[index], rate };
      const topRate = brackets[brackets.length - 1].rate;
      return {
        ...prev,
        taxPolicy: {
          ...prev.taxPolicy,
          brackets,
          topMarginalRate: topRate,
        },
        scenarioId: "custom",
      };
    });
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
      taxPolicy: {
        ...scenario.policy,
        brackets: scenario.policy.brackets.map((b) => ({ ...b })),
      },
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

  const setMode = useCallback((mode: SimMode) => {
    setState((prev) => ({
      ...prev,
      mode,
      // Reset playback to the start of the relevant timeline
      currentYear: mode === "revision" ? START_YEAR : LAST_HISTORICAL_YEAR,
      isPlaying: false,
    }));
  }, []);

  const setViewComplexity = useCallback((viewComplexity: ViewComplexity) => {
    setState((prev) => ({ ...prev, viewComplexity }));
  }, []);

  const setViewPerspective = useCallback((viewPerspective: ViewPerspective) => {
    setState((prev) => ({ ...prev, viewPerspective }));
  }, []);

  const setProgramCostOverride = useCallback((programId: string, multiplier: number) => {
    setState((prev) => ({
      ...prev,
      programCostOverrides: { ...prev.programCostOverrides, [programId]: multiplier },
    }));
  }, []);

  const toggleWhatIfEvent = useCallback((eventId: string) => {
    setState((prev) => {
      const ids = prev.whatIfEventIds.includes(eventId)
        ? prev.whatIfEventIds.filter((id) => id !== eventId)
        : [...prev.whatIfEventIds, eventId];
      return { ...prev, whatIfEventIds: ids };
    });
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
    todayYoursData,
    todayActualData,
    whatIfData,
    whatIfDelta,
    isRevisionMode,
    setTaxPolicy,
    setBracketRate,
    toggleProgram,
    setAssumptions,
    loadScenario,
    setCurrentYear,
    setIsPlaying,
    setPlaybackSpeed,
    setAdvancedMode,
    setMode,
    toggleWhatIfEvent,
    setProgramCostOverride,
    setViewComplexity,
    setViewPerspective,
    reset,
  };
}
