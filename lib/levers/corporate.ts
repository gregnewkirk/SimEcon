import type { Lever } from "./types";
import { registerSources } from "../citations";

registerSources([
  {
    id: "jct_corporate",
    agency: "Joint Committee on Taxation",
    dataset: "Revenue estimate, corporate income tax rate change (21% to 28%)",
    year: 2024,
    url: "https://www.jct.gov/publications/",
    accessed: "2026-06-28",
  },
]);

/**
 * Corporate revenue is roughly linear in the rate around the 21% baseline. JCT scores a
 * 21% to 28% increase at ~$1.3T over ten years (~$130B/yr annualized), so each point is
 * about $18B/yr. Source: JCT.
 */
const PER_POINT_B = 18;
const BASE_RATE = 21;

export const corporateLever: Lever = {
  id: "corpRate",
  label: "Corporate income tax rate",
  category: "tax",
  tier: "calibrated",
  targets: ["corporate"],
  citationIds: ["jct_corporate"],
  range: { min: 0, max: 40, step: 0.5, baseline: BASE_RATE },
  defaultValue: BASE_RATE,
  conventional: (cfg) => {
    const rate = (cfg.corpRate as number) ?? BASE_RATE;
    return [{ lineId: "corporate", amountB: (rate - BASE_RATE) * PER_POINT_B, citationId: "jct_corporate", leverId: "corpRate" }];
  },
  // Dynamic: profit shifting and reduced investment claw back ~15% of a static increase.
  dynamic: (cfg) => {
    const rate = (cfg.corpRate as number) ?? BASE_RATE;
    const staticDelta = (rate - BASE_RATE) * PER_POINT_B;
    return [{ lineId: "corporate", amountB: -0.15 * staticDelta, citationId: "jct_corporate", leverId: "corpRate" }];
  },
};
