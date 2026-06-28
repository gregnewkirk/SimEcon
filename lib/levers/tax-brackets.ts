import type { Lever, LineDelta, LeverConfig } from "./types";
import { registerSources } from "../citations";

registerSources([
  {
    id: "irs_soi_2022",
    agency: "IRS Statistics of Income",
    dataset: "Individual Income Tax Returns, taxable income by marginal bracket",
    year: 2022,
    url: "https://www.irs.gov/statistics/soi-tax-stats-individual-income-tax-returns",
    accessed: "2026-06-28",
  },
  {
    id: "jct_rates",
    agency: "Joint Committee on Taxation",
    dataset: "Revenue estimates for individual marginal-rate changes",
    year: 2024,
    url: "https://www.jct.gov/publications/",
    accessed: "2026-06-28",
  },
]);

/**
 * Taxable income (billions) stacked in each marginal bracket, approximated from IRS SOI.
 * A rate change on a bracket moves individual income tax revenue by
 * (stacked income) x (rate change), which is JCT-consistent for modest changes.
 */
export const SOI_TAXABLE_BY_BRACKET = [
  { key: "b1", label: "$0 - $11K", baseRate: 10, stackedB: 1100 },
  { key: "b2", label: "$11K - $45K", baseRate: 12, stackedB: 1600 },
  { key: "b3", label: "$45K - $95K", baseRate: 22, stackedB: 2100 },
  { key: "b4", label: "$95K - $182K", baseRate: 24, stackedB: 1800 },
  { key: "b5", label: "$182K - $231K", baseRate: 32, stackedB: 500 },
  { key: "b6", label: "$231K - $578K", baseRate: 35, stackedB: 700 },
  { key: "b7", label: "$578K+", baseRate: 37, stackedB: 1200 },
] as const;

function bracketDelta(key: string, baseRate: number, stackedB: number, cfg: LeverConfig): LineDelta[] {
  const rate = (cfg[key] as number) ?? baseRate;
  const amountB = stackedB * ((rate - baseRate) / 100);
  return [{ lineId: "individual_income", amountB, citationId: "jct_rates", leverId: key }];
}

/** Bracket rate levers b1..b6 (the top bracket is exported separately as topRateLever). */
export const bracketLevers: Lever[] = SOI_TAXABLE_BY_BRACKET.slice(0, 6).map((b) => ({
  id: b.key,
  label: `Income rate ${b.label}`,
  category: "tax",
  tier: "calibrated",
  targets: ["individual_income"],
  citationIds: ["irs_soi_2022", "jct_rates"],
  range: { min: 0, max: 60, step: 1, baseline: b.baseRate },
  defaultValue: b.baseRate,
  conventional: (cfg) => bracketDelta(b.key, b.baseRate, b.stackedB, cfg),
}));

/** Top marginal rate lever ($578K+), config key "topRate", baseline 37%. */
export const topRateLever: Lever = (() => {
  const top = SOI_TAXABLE_BY_BRACKET[6];
  return {
    id: "topRate",
    label: "Top marginal rate ($578K+)",
    category: "tax",
    tier: "calibrated",
    targets: ["individual_income"],
    citationIds: ["irs_soi_2022", "jct_rates"],
    range: { min: 0, max: 60, step: 0.1, baseline: 37 },
    defaultValue: 37,
    conventional: (cfg) => bracketDelta("topRate", top.baseRate, top.stackedB, cfg),
  };
})();
