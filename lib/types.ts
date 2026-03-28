export interface Citation {
  value: number;
  agency: string;
  dataset: string;
  year: number;
  url: string;
  accessedDate: string;
}

export interface CitedValue {
  value: number;
  citation: Citation;
}

export interface TaxBracket {
  label: string;        // e.g., "$0-$11K"
  minIncome: number;    // dollars
  maxIncome: number;    // dollars (Infinity for top)
  rate: number;         // 0-100
  defaultRate: number;  // current actual rate
}

export interface TaxPolicy {
  topMarginalRate: number;
  capitalGainsRate: number;
  corporateRate: number;
  estateRate: number;
  brackets: TaxBracket[];
}

export interface AdvancedAssumptions {
  gdpGrowthRate: number;
  interestRate: number;
  behavioralElasticity: number;
  fiscalMultiplier: number;
  inflationRate: number;
}

export interface Program {
  id: string;
  name: string;
  icon: string;
  annualCostBillions: number;
  annualSavingsBillions: number;
  netCostBillions: number;
  source: Citation;
  description: string;
  warning?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  policy: TaxPolicy;
  programs: string[];
  source?: string;
}

export interface WealthBracket {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  shareOfWealth: number;
}

export interface YearData {
  year: number;
  debtTrillions: number;
  deficitBillions: number;
  revenueBillions: number;
  spendingBillions: number;
  gdpTrillions: number;
  debtToGdpRatio: number;
  wealthShares: Record<string, number>;
  isProjected: boolean;
}

export interface SimulationState {
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
  assumptions: AdvancedAssumptions;
  currentYear: number;
  isPlaying: boolean;
  playbackSpeed: 1 | 5 | 10;
  scenarioId: string;
  historicalData: YearData[];
  projectedData: YearData[];
  advancedMode: boolean;
  mode: SimMode;
  whatIfEventIds: string[];
}

export type SimMode = "revision" | "fix" | "forward" | "whatif";

export interface WhatIfEvent {
  id: string;
  name: string;
  year: number;
  endYear?: number; // When the spending ended (for wars, temporary programs)
  description: string;
  counterfactualPolicy?: TaxPolicy; // Tax policy counterfactual
  spendingReductionBillionsPerYear?: number; // Annual spending avoided
  totalCostTrillions?: number; // Display: total cost of the event
  category: "tax" | "spending" | "both";
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  icon: string;
  householdIncome: number;
  netWorth: number;
  effectiveTaxRate: number;
  programBenefits: Record<string, number>;
}

export interface URLState {
  s?: string;
  tr?: number;
  cg?: number;
  cr?: number;
  er?: number;
  p?: string;
  y?: number;
  sp?: number;
  ag?: number;
  ai?: number;
  ae?: number;
  m?: string;   // mode: revision | fix | forward | whatif
  we?: string;  // what-if event IDs (comma-separated)
  // Bracket rates: b1-b7 for brackets that differ from default
  b1?: number;
  b2?: number;
  b3?: number;
  b4?: number;
  b5?: number;
  b6?: number;
  b7?: number;
}
