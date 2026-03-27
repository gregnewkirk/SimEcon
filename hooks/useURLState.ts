"use client";

import { useEffect, useRef, useCallback } from "react";
import type { SimulationState, SimMode, URLState } from "@/lib/types";
import { CURRENT_POLICY, DEFAULT_ASSUMPTIONS, START_YEAR } from "@/lib/data/defaults";
import { SCENARIOS_MAP } from "@/lib/data/scenarios";
import { encodeURLState, decodeURLState } from "@/lib/url-state";

/**
 * Convert full SimulationState to compact URLState.
 * Only includes values that differ from defaults.
 */
export function stateToURL(state: SimulationState): URLState {
  const url: URLState = {};

  if (state.scenarioId !== "current") url.s = state.scenarioId;

  if (state.taxPolicy.topMarginalRate !== CURRENT_POLICY.topMarginalRate)
    url.tr = state.taxPolicy.topMarginalRate;
  if (state.taxPolicy.capitalGainsRate !== CURRENT_POLICY.capitalGainsRate)
    url.cg = state.taxPolicy.capitalGainsRate;
  if (state.taxPolicy.corporateRate !== CURRENT_POLICY.corporateRate)
    url.cr = state.taxPolicy.corporateRate;
  if (state.taxPolicy.estateRate !== CURRENT_POLICY.estateRate)
    url.er = state.taxPolicy.estateRate;

  if (state.enabledPrograms.length > 0)
    url.p = state.enabledPrograms.join(",");

  if (state.currentYear !== START_YEAR)
    url.y = state.currentYear;

  if (state.playbackSpeed !== 1)
    url.sp = state.playbackSpeed;

  if (state.assumptions.gdpGrowthRate !== DEFAULT_ASSUMPTIONS.gdpGrowthRate)
    url.ag = state.assumptions.gdpGrowthRate;
  if (state.assumptions.interestRate !== DEFAULT_ASSUMPTIONS.interestRate)
    url.ai = state.assumptions.interestRate;
  if (state.assumptions.behavioralElasticity !== DEFAULT_ASSUMPTIONS.behavioralElasticity)
    url.ae = state.assumptions.behavioralElasticity;

  if (state.mode === "whatif") url.m = "whatif";
  if (state.whatIfEventId) url.we = state.whatIfEventId;

  return url;
}

/**
 * Convert compact URLState back to partial SimulationState.
 * Loads scenario defaults first if specified, then applies individual overrides.
 */
export function urlToState(urlState: URLState): Partial<SimulationState> {
  const partial: Partial<SimulationState> = {};

  // Load scenario base if specified
  const scenarioId = urlState.s ?? "current";
  const scenario = SCENARIOS_MAP.get(scenarioId);

  if (scenario) {
    partial.scenarioId = scenarioId;
    partial.taxPolicy = { ...scenario.policy };
    partial.enabledPrograms = [...scenario.programs];
  }

  // Override individual tax rates if present
  if (urlState.tr !== undefined)
    partial.taxPolicy = { ...(partial.taxPolicy ?? { ...CURRENT_POLICY }), topMarginalRate: urlState.tr };
  if (urlState.cg !== undefined)
    partial.taxPolicy = { ...(partial.taxPolicy ?? { ...CURRENT_POLICY }), capitalGainsRate: urlState.cg };
  if (urlState.cr !== undefined)
    partial.taxPolicy = { ...(partial.taxPolicy ?? { ...CURRENT_POLICY }), corporateRate: urlState.cr };
  if (urlState.er !== undefined)
    partial.taxPolicy = { ...(partial.taxPolicy ?? { ...CURRENT_POLICY }), estateRate: urlState.er };

  // Programs from comma-separated string
  if (urlState.p !== undefined)
    partial.enabledPrograms = urlState.p.split(",").filter(Boolean);

  if (urlState.y !== undefined) partial.currentYear = urlState.y;
  if (urlState.sp !== undefined) partial.playbackSpeed = urlState.sp as 1 | 5 | 10;

  // Advanced assumptions overrides
  if (urlState.ag !== undefined || urlState.ai !== undefined || urlState.ae !== undefined) {
    partial.assumptions = {
      ...DEFAULT_ASSUMPTIONS,
      ...(urlState.ag !== undefined ? { gdpGrowthRate: urlState.ag } : {}),
      ...(urlState.ai !== undefined ? { interestRate: urlState.ai } : {}),
      ...(urlState.ae !== undefined ? { behavioralElasticity: urlState.ae } : {}),
    };
  }

  // Mode and what-if event
  if (urlState.m === "whatif") {
    partial.mode = "whatif" as SimMode;
  }
  if (urlState.we) {
    partial.whatIfEventId = urlState.we;
    partial.mode = "whatif" as SimMode;
  }

  return partial;
}

/**
 * Hook that syncs SimulationState to/from the URL hash.
 * On mount: reads hash, decodes, calls onLoadFromURL with the parsed state.
 * On state change: writes URL via history.replaceState (no navigation).
 */
export function useURLStateSync(
  state: SimulationState,
  onLoadFromURL: (partial: Partial<SimulationState>) => void
) {
  const initialized = useRef(false);

  // On mount, read URL hash and apply
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const hash = window.location.hash;
    if (!hash) return;

    const urlState = decodeURLState(hash);
    const partial = urlToState(urlState);

    if (Object.keys(partial).length > 0) {
      onLoadFromURL(partial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On state change, write to URL
  useEffect(() => {
    if (!initialized.current) return;

    const urlState = stateToURL(state);
    const hash = encodeURLState(urlState);
    const newUrl = hash || window.location.pathname + window.location.search;

    window.history.replaceState(null, "", newUrl);
  }, [state]);
}
