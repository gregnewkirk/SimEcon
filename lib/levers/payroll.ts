import type { Lever } from "./types";
import { registerSources } from "../citations";

registerSources([
  {
    id: "ssa_cap",
    agency: "SSA Office of the Chief Actuary / CBO",
    dataset: "Revenue from eliminating the Social Security taxable maximum",
    year: 2023,
    url: "https://www.ssa.gov/oact/solvency/provisions/",
    accessed: "2026-06-28",
  },
]);

/**
 * Removing the Social Security taxable-maximum cap (~$168.6K in 2025) applies the 12.4%
 * OASDI tax to wages above the cap. Earnings above the cap are ~$1.1T, so removal raises
 * ~$136B/yr. Source: SSA OACT / CBO budget options.
 */
const WAGES_ABOVE_CAP_B = 1100;
const OASDI_RATE = 0.124;

export const payrollCapLever: Lever = {
  id: "removeSsCap",
  label: "Remove Social Security tax cap",
  category: "tax",
  tier: "calibrated",
  targets: ["payroll"],
  citationIds: ["ssa_cap"],
  defaultValue: false,
  conventional: (cfg) => {
    const on = cfg.removeSsCap === true;
    return [{ lineId: "payroll", amountB: on ? WAGES_ABOVE_CAP_B * OASDI_RATE : 0, citationId: "ssa_cap", leverId: "removeSsCap" }];
  },
};
