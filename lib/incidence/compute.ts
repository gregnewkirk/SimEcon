import type { LeverConfig } from "../levers/types";
import { ALL_LEVERS } from "../levers/registry";
import { INCIDENCE, DEFAULT_SHARES, BRACKET_IDS, type BracketId, type IncidenceShares } from "./tables";

export type IncidenceResult = Record<BracketId, number>; // net $B/yr, + = net benefit

/**
 * Static distributional incidence for the current config: how each wealth bracket's annual
 * taxes/benefits change, now. Each active lever's dollar size is distributed across brackets
 * by its cited incidence shares. Taxes (revenue raised) are a burden (negative to payers);
 * programs (spending) are a benefit (positive to recipients). Spending CUTS used as revenue
 * options (e.g. defense reduction) are excluded here because they do not directly transfer
 * cash to or from households.
 */
export function computeIncidence(cfg: LeverConfig): IncidenceResult {
  const result: IncidenceResult = { top1: 0, next9: 0, middle40: 0, bottom50: 0 };

  for (const lever of ALL_LEVERS) {
    const amountB = lever.conventional(cfg).reduce((s, d) => s + d.amountB, 0);
    if (amountB === 0) continue;

    const shares: IncidenceShares = INCIDENCE[lever.id] ?? DEFAULT_SHARES[lever.category];

    if (lever.category === "program") {
      // Positive amountB is program cost = benefit delivered to recipients.
      for (const b of BRACKET_IDS) result[b] += amountB * shares[b];
    } else if (lever.category === "tax") {
      // Positive amountB is revenue raised = burden on payers.
      for (const b of BRACKET_IDS) result[b] -= amountB * shares[b];
    } else if (lever.category === "revenue") {
      // Only new taxes (positive amount on a revenue line) have household incidence here;
      // spending cuts (negative amount on a spending line) are skipped.
      if (amountB > 0) {
        for (const b of BRACKET_IDS) result[b] -= amountB * shares[b];
      }
    }
  }

  return result;
}
