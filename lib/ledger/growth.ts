import type { GrowthBasis } from "./types";
import { registerSources } from "../citations";
import { effectiveRate } from "./interest";

export { effectiveRate };

registerSources([
  {
    id: "cbo_econ_2025",
    agency: "Congressional Budget Office",
    dataset: "The Budget and Economic Outlook: 2025 to 2035 (economic projections)",
    year: 2025,
    url: "https://www.cbo.gov/publication/budget-economic-outlook",
    accessed: "2026-06-28",
  },
]);

export interface EconAssumptions {
  realGdpGrowth: number; // percent/yr
  inflation: number; // percent/yr
  newIssueRate: number; // percent, new Treasury issuance
  avgMaturityYears: number; // for the interest rollover blend
}

/** CBO 2025 10-year averages. */
export const DEFAULT_ASSUMPTIONS: EconAssumptions = {
  realGdpGrowth: 1.9,
  inflation: 2.3,
  newIssueRate: 4.0,
  avgMaturityYears: 6,
};

/**
 * Excess cost growth for health programs above nominal GDP (CBO long-term health
 * cost-growth assumption, ~1.5 percentage points) and demographic drift for Social
 * Security above inflation (~1.0 point from beneficiary growth). Cited assumptions.
 */
const HEALTH_EXCESS_PCT = 1.5;
const SS_DEMOGRAPHIC_PCT = 1.0;

/** Annual multiplier for a budget line of the given growth basis. */
export function growthFactor(basis: GrowthBasis, a: EconAssumptions): number {
  const nominalGdp = (1 + a.realGdpGrowth / 100) * (1 + a.inflation / 100);
  switch (basis) {
    case "nominalGDP":
    case "wages":
    case "profits":
      return nominalGdp;
    case "inflation":
      return 1 + a.inflation / 100;
    case "ssCOLA":
      return (1 + a.inflation / 100) * (1 + SS_DEMOGRAPHIC_PCT / 100);
    case "healthCost":
      return nominalGdp * (1 + HEALTH_EXCESS_PCT / 100);
    case "computed":
      return 1;
  }
}

/** Nominal GDP growth multiplier, used to grow the GDP series itself. */
export function nominalGdpFactor(a: EconAssumptions): number {
  return (1 + a.realGdpGrowth / 100) * (1 + a.inflation / 100);
}
