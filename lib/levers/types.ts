import type { BudgetLine, LineDelta } from "../ledger/types";

export type Tier = "calibrated" | "estimate";

export type LeverCategory = "tax" | "program" | "revenue" | "experimental";

/** Slider values (numbers) and toggle states (booleans), keyed by lever id. */
export type LeverConfig = Record<string, number | boolean>;

export interface Lever {
  id: string;
  label: string;
  category: LeverCategory;
  tier: Tier;
  /** Baseline line ids this lever modifies. */
  targets: string[];
  /** Static CBO/JCT score. Always applied. Returns the deltas for the given config. */
  conventional(cfg: LeverConfig): LineDelta[];
  /** Optional behavioral/dynamic adjustment, applied only when the Dynamic toggle is on. */
  dynamic?(cfg: LeverConfig): LineDelta[];
  citationIds: string[];
  /** Themed sub-group for the sidebar (e.g. "Health & care"). */
  group?: string;
  /** True for genuinely disputed levers (e.g. wealth tax); UI shows a range + caveat. */
  contested?: boolean;
  /** Default slider/toggle value when inactive (0 or false = no effect). */
  defaultValue?: number | boolean;
  /** Value representing "on" for select-all (true for toggles, the headline rate/amount for dials). */
  onValue?: number | boolean;
  /** Unit label for dial readouts, e.g. "%" or "$/mo". */
  unit?: string;
  /** For slider levers: min, max, step, and the baseline (current-law) value. */
  range?: { min: number; max: number; step: number; baseline: number };
}

/** Re-export for convenience to lever implementations. */
export type { BudgetLine, LineDelta };
