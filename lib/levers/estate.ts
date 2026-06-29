import type { Lever } from "./types";
import { registerSources } from "../citations";

registerSources([
  {
    id: "jct_estate",
    agency: "Joint Committee on Taxation",
    dataset: "Estate and gift tax revenue estimates",
    year: 2024,
    url: "https://www.jct.gov/publications/",
    accessed: "2026-06-28",
  },
]);

/**
 * Estate and gift tax revenue scales roughly linearly with the top estate rate around the
 * 40% baseline. Small magnitude (~$35B baseline). Source: JCT.
 */
const BASE_RATE = 40;
const BASE_REVENUE_B = 35;

export const estateLever: Lever = {
  id: "estateRate",
  label: "Estate tax rate",
  category: "tax",
  tier: "calibrated",
  targets: ["estate_gift"],
  citationIds: ["jct_estate"],
  range: { min: 0, max: 80, step: 1, baseline: BASE_RATE },
  defaultValue: BASE_RATE,
  conventional: (cfg) => {
    const rate = (cfg.estateRate as number) ?? BASE_RATE;
    const deltaB = BASE_REVENUE_B * ((rate - BASE_RATE) / BASE_RATE);
    return [{ lineId: "estate_gift", amountB: deltaB, citationId: "jct_estate", leverId: "estateRate" }];
  },
};
