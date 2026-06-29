/**
 * Core ledger types. The model is an itemized federal budget: a list of BudgetLines
 * (each cited), grown forward on per-line bases, with levers applied as LineDeltas.
 */

export type GrowthBasis =
  | "nominalGDP" // grows with nominal GDP (most revenue, generic mandatory)
  | "wages" // payroll base
  | "profits" // corporate base
  | "ssCOLA" // Social Security: inflation + demographic drift
  | "healthCost" // Medicare/Medicaid: nominal GDP + excess cost growth
  | "inflation" // discretionary current-law, excise
  | "computed"; // derived each year (net interest), does not grow on its own

export type BudgetSide = "revenue" | "spending";

export interface BudgetLine {
  id: string;
  label: string;
  side: BudgetSide;
  valueB: number; // FY2025 nominal billions
  growthBasis: GrowthBasis;
  citationId: string;
}

/** A signed change a lever makes to one budget line in a given year. */
export interface LineDelta {
  lineId: string;
  amountB: number; // + raises that line, - lowers it
  citationId: string;
  leverId: string;
}

/** One traceable contribution to a headline number (baseline or a specific lever). */
export interface Provenance {
  source: "baseline" | string; // "baseline" or a leverId
  amountB: number;
  citationId: string;
}

export interface YearData {
  year: number;
  lines: BudgetLine[];
  revenueB: number;
  spendingB: number;
  deficitB: number; // spending - revenue (positive = deficit)
  debtT: number;
  gdpT: number;
  debtToGdp: number; // percent
  /** Keyed by line id (and "revenue"/"spending" totals): the contributions behind it. */
  provenance: Record<string, Provenance[]>;
  isProjected: boolean;
}
