import type { TaxPolicy, AdvancedAssumptions, WealthBracket, TaxBracket } from "../types";

export const DEFAULT_BRACKETS: TaxBracket[] = [
  { label: "$0 - $11K", minIncome: 0, maxIncome: 11000, rate: 10, defaultRate: 10 },
  { label: "$11K - $44K", minIncome: 11000, maxIncome: 44725, rate: 12, defaultRate: 12 },
  { label: "$44K - $95K", minIncome: 44725, maxIncome: 95375, rate: 22, defaultRate: 22 },
  { label: "$95K - $183K", minIncome: 95375, maxIncome: 182100, rate: 24, defaultRate: 24 },
  { label: "$183K - $231K", minIncome: 182100, maxIncome: 231250, rate: 32, defaultRate: 32 },
  { label: "$231K - $578K", minIncome: 231250, maxIncome: 578125, rate: 35, defaultRate: 35 },
  { label: "$578K+", minIncome: 578125, maxIncome: Infinity, rate: 37, defaultRate: 37 },
];

export const CURRENT_POLICY: TaxPolicy = {
  topMarginalRate: 37,
  capitalGainsRate: 20,
  corporateRate: 21,
  estateRate: 40,
  brackets: DEFAULT_BRACKETS.map((b) => ({ ...b })),
};

export const DEFAULT_ASSUMPTIONS: AdvancedAssumptions = {
  gdpGrowthRate: 1.8,
  interestRate: 3.2,
  behavioralElasticity: 0.3,
  fiscalMultiplier: 1.2,
  inflationRate: 2.5,
  programCostMultiplier: 1.0,
};

export const WEALTH_BRACKETS: WealthBracket[] = [
  { id: "top01", label: "Top 0.1%", shortLabel: "0.1%", color: "#e94560", shareOfWealth: 0.13 },
  { id: "top1", label: "Top 1% (excl. 0.1%)", shortLabel: "1%", color: "#f0a500", shareOfWealth: 0.18 },
  { id: "next9", label: "Next 9%", shortLabel: "9%", color: "#0f3460", shareOfWealth: 0.27 },
  { id: "middle40", label: "Middle 40%", shortLabel: "40%", color: "#533483", shareOfWealth: 0.28 },
  { id: "bottom50", label: "Bottom 50%", shortLabel: "50%", color: "#666666", shareOfWealth: 0.025 },
];

export const START_YEAR = 2000;
export const LAST_HISTORICAL_YEAR = 2025;
export const DEFAULT_END_YEAR = 2035;
/** Fix This Mess mode projects 25 years forward from the present */
export const FIX_END_YEAR = 2050;
