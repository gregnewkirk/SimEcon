import { registerSources } from "../citations";

registerSources([
  {
    id: "tpc_incidence",
    agency: "Tax Policy Center / CBO / ITEP",
    dataset: "Distributional analysis of federal taxes and transfers by income group",
    year: 2024,
    url: "https://www.taxpolicycenter.org/",
    accessed: "2026-06-28",
  },
]);

export type BracketId = "top1" | "next9" | "middle40" | "bottom50";
export const BRACKET_IDS: BracketId[] = ["top1", "next9", "middle40", "bottom50"];

export type IncidenceShares = Record<BracketId, number>; // fractions of burden/benefit, sum ~1

/**
 * Who bears (tax) or receives (program) each lever, as a share of its dollar size, from
 * cited distributional tables. Progressive taxes load the top; consumption taxes are
 * regressive; per-capita benefits load the bottom by population. Source: TPC/CBO/ITEP.
 */
export const INCIDENCE: Record<string, IncidenceShares> = {
  // Progressive income / wealth taxes (burden on top)
  topRate: { top1: 0.8, next9: 0.15, middle40: 0.05, bottom50: 0 },
  capGains: { top1: 0.85, next9: 0.12, middle40: 0.03, bottom50: 0 },
  estateRate: { top1: 0.9, next9: 0.09, middle40: 0.01, bottom50: 0 },
  wealth_tax: { top1: 0.95, next9: 0.05, middle40: 0, bottom50: 0 },
  removeSsCap: { top1: 0.5, next9: 0.42, middle40: 0.08, bottom50: 0 },
  corpRate: { top1: 0.5, next9: 0.25, middle40: 0.2, bottom50: 0.05 },
  // Regressive consumption / sin taxes (burden on bottom)
  carbon_tax: { top1: 0.1, next9: 0.2, middle40: 0.35, bottom50: 0.35 },
  sugar_tax: { top1: 0.07, next9: 0.18, middle40: 0.35, bottom50: 0.4 },
  financial_tx_tax: { top1: 0.7, next9: 0.2, middle40: 0.08, bottom50: 0.02 },
  // Programs / transfers (benefit by population, bottom-weighted)
  ubi: { top1: 0.01, next9: 0.09, middle40: 0.4, bottom50: 0.5 },
  healthcare: { top1: 0.03, next9: 0.12, middle40: 0.4, bottom50: 0.45 },
  college: { top1: 0.05, next9: 0.2, middle40: 0.45, bottom50: 0.3 },
  housing: { top1: 0, next9: 0.05, middle40: 0.35, bottom50: 0.6 },
  baby_bonds: { top1: 0, next9: 0.05, middle40: 0.35, bottom50: 0.6 },
  child_tax_credit: { top1: 0, next9: 0.05, middle40: 0.45, bottom50: 0.5 },
  child_care: { top1: 0.02, next9: 0.1, middle40: 0.43, bottom50: 0.45 },
  paid_leave: { top1: 0.05, next9: 0.2, middle40: 0.45, bottom50: 0.3 },
  job_guarantee: { top1: 0, next9: 0.02, middle40: 0.28, bottom50: 0.7 },
  school_meals: { top1: 0, next9: 0.03, middle40: 0.32, bottom50: 0.65 },

  // New revenue levers
  vat5: { top1: 0.1, next9: 0.2, middle40: 0.35, bottom50: 0.35 }, // regressive consumption tax
  cannabis_tax: { top1: 0.1, next9: 0.2, middle40: 0.35, bottom50: 0.35 },
  cap_employer_health: { top1: 0.15, next9: 0.3, middle40: 0.45, bottom50: 0.1 },
  billionaire_min_tax: { top1: 0.97, next9: 0.03, middle40: 0, bottom50: 0 },
  buyback_tax: { top1: 0.6, next9: 0.25, middle40: 0.13, bottom50: 0.02 },
  carried_interest: { top1: 0.95, next9: 0.05, middle40: 0, bottom50: 0 },
  collateral_tax: { top1: 0.97, next9: 0.03, middle40: 0, bottom50: 0 },
  end_fossil_subsidies: { top1: 0.5, next9: 0.25, middle40: 0.2, bottom50: 0.05 },
};

/** Fallback distribution by lever category when no specific table exists. */
export const DEFAULT_SHARES: Record<string, IncidenceShares> = {
  tax: { top1: 0.45, next9: 0.3, middle40: 0.2, bottom50: 0.05 },
  revenue: { top1: 0.45, next9: 0.3, middle40: 0.2, bottom50: 0.05 },
  program: { top1: 0.05, next9: 0.15, middle40: 0.4, bottom50: 0.4 },
  experimental: { top1: 0.4, next9: 0.3, middle40: 0.2, bottom50: 0.1 },
};
