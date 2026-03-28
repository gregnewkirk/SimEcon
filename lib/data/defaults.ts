import type { TaxPolicy, AdvancedAssumptions, WealthBracket } from "../types";

export const CURRENT_POLICY: TaxPolicy = {
  topMarginalRate: 37,
  capitalGainsRate: 20,
  corporateRate: 21,
  estateRate: 40,
};

export const DEFAULT_ASSUMPTIONS: AdvancedAssumptions = {
  gdpGrowthRate: 1.8,
  interestRate: 3.2,
  behavioralElasticity: 0.3,
  fiscalMultiplier: 1.2,
  inflationRate: 2.5,
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
