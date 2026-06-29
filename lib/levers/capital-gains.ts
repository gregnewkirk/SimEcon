import type { Lever } from "./types";
import { registerSources } from "../citations";

registerSources([
  {
    id: "cbo_capgains",
    agency: "Congressional Budget Office",
    dataset: "Capital gains realizations response to tax rate changes",
    year: 2022,
    url: "https://www.cbo.gov/publication/budget-options",
    accessed: "2026-06-28",
  },
]);

/**
 * Capital gains revenue is Laffer-shaped because realizations fall as the rate rises.
 * Modeled as realizations(r) = R0 * exp(-K * (r - r0)), revenue = r * realizations, which
 * peaks near 29% (1/K). Past the peak, raising the rate LOSES revenue. CBO bakes a
 * realization response into its conventional cap-gains scores, so this lives in the
 * conventional (toggle-off) score, not the dynamic add-on. Source: CBO.
 *
 * R0 (baseline realizations, ~$1.25T) is set so baseline revenue at 20% is ~$250B, the
 * real magnitude of cap-gains receipts inside individual income tax.
 */
const R0_B = 1250;
const K = 3.45; // peak at r = 1/K ~= 0.29
const BASE_RATE = 20;

function revenueAt(ratePct: number): number {
  const r = ratePct / 100;
  const r0 = BASE_RATE / 100;
  return r * R0_B * Math.exp(-K * (r - r0));
}

export const capGainsLever: Lever = {
  id: "capGains",
  label: "Capital gains tax rate",
  category: "tax",
  tier: "calibrated",
  targets: ["individual_income"],
  citationIds: ["cbo_capgains"],
  range: { min: 0, max: 60, step: 1, baseline: BASE_RATE },
  defaultValue: BASE_RATE,
  conventional: (cfg) => {
    const rate = (cfg.capGains as number) ?? BASE_RATE;
    const deltaB = revenueAt(rate) - revenueAt(BASE_RATE);
    return [{ lineId: "individual_income", amountB: deltaB, citationId: "cbo_capgains", leverId: "capGains" }];
  },
};
