/**
 * San Diego city-budget ledger types. Mirrors lib/ledger/types.ts but with city semantics:
 * values are in nominal MILLIONS (a $2.2B General Fund reads as 2,200), growth bases are
 * local (assessed value, taxable sales, tourism, CPI, labor contracts), and the year rollup
 * carries city concepts the federal model has no use for: reserves, the pension system's
 * unfunded liability and funded ratio, and the structural gap. California cities must adopt
 * balanced budgets, so a "deficit" here is a gap that has to be closed with reserves,
 * one-time fixes, or cuts - it never quietly accumulates into sovereign debt.
 */

export type SdGrowthBasis =
  | "assessedValue" // property tax: Prop 13 caps assessed growth at 2% + turnover/new construction
  | "salesEconomy" // sales tax: local taxable sales growth
  | "touristEconomy" // TOT: hotel room revenue growth
  | "cpi" // fees, franchise, misc revenue, non-personnel costs
  | "personnel" // salaries + benefits: contract raises + pension normal cost drift
  | "computed" // set by the engine each year (pension ADC)
  | "flat" // fixed-schedule items (bond debt service)
  | "oneTime"; // FY2026-only money; disappears in the first projected year

export type SdBudgetSide = "revenue" | "spending";

export interface SdBudgetLine {
  id: string;
  label: string;
  side: SdBudgetSide;
  /** FY2026 nominal millions. */
  valueM: number;
  growthBasis: SdGrowthBasis;
  citationId: string;
}

/** A signed change a lever makes to one budget line in a given year (millions). */
export interface SdLineDelta {
  lineId: string;
  amountM: number; // + raises that line, - lowers it
  citationId: string;
  leverId: string;
}

/** One traceable contribution to a headline number (baseline or a specific lever). */
export interface SdProvenance {
  source: "baseline" | string; // "baseline" or a leverId
  amountM: number;
  citationId: string;
}

export type SdTier = "calibrated" | "estimate";

export type SdLeverCategory = "police" | "department" | "revenue" | "pension";

/** Slider values (numbers) and toggle states (booleans), keyed by lever id. */
export type SdLeverConfig = Record<string, number | boolean>;

export interface SdLever {
  id: string;
  label: string;
  category: SdLeverCategory;
  tier: SdTier;
  /** Baseline line ids this lever modifies. */
  targets: string[];
  /** Deltas (millions/yr) for the given config. */
  conventional(cfg: SdLeverConfig): SdLineDelta[];
  citationIds: string[];
  /** Themed sub-group for the sidebar (e.g. "Police (SDPD)"). */
  group?: string;
  /** True for genuinely disputed levers; UI shows a caveat badge. */
  contested?: boolean;
  /** Default slider/toggle value when inactive. */
  defaultValue?: number | boolean;
  /** Value representing "on" for select-all (true for toggles, the headline value for dials). */
  onValue?: number | boolean;
  /** Unit label for dial readouts, e.g. "%", "officers", "$M". */
  unit?: string;
  /** For slider levers: min, max, step, and the baseline (current-budget) value. */
  range?: { min: number; max: number; step: number; baseline: number };
}

export interface SdYearData {
  year: number;
  lines: SdBudgetLine[];
  revenueM: number;
  spendingM: number;
  /** spending - revenue (positive = gap to close). */
  gapM: number;
  /** General Fund reserve balance after absorbing this year's gap/surplus. */
  reserveM: number;
  /** Reserve as % of revenue (city target is a policy number, see baseline). */
  reservePct: number;
  /** SDCERS unfunded actuarial liability, millions (city share). */
  pensionUalM: number;
  /** SDCERS funded ratio, percent. */
  pensionFundedPct: number;
  /** Cumulative gap the city could not absorb with reserves ("forced cuts to balance"). */
  unfundedGapM: number;
  /** Keyed by line id: the contributions behind it. */
  provenance: Record<string, SdProvenance[]>;
  isProjected: boolean;
}

/** Economic assumptions the SD projection runs on. */
export interface SdAssumptions {
  /** Assessed-value growth (Prop 13 base + turnover), %/yr. */
  assessedValueGrowth: number;
  /** Taxable retail sales growth, %/yr. */
  salesGrowth: number;
  /** Hotel/tourism revenue growth, %/yr. */
  tourismGrowth: number;
  /** Local CPI, %/yr. */
  inflation: number;
  /** Personnel cost growth (negotiated raises + benefit drift), %/yr. */
  personnelGrowth: number;
  /** SDCERS assumed investment return / UAL discount rate, %/yr. */
  pensionDiscountRate: number;
}
