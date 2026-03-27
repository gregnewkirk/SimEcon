import type { TaxPolicy, AdvancedAssumptions } from "../types";

/**
 * Calculate new wealth distribution shares based on economic conditions.
 * Returns a new record of bracket ID -> share, normalized to sum to 1.
 */
export function redistributeWealth(
  currentShares: Record<string, number>,
  taxPolicy: TaxPolicy,
  assumptions: AdvancedAssumptions,
  gdpGrowth: number,
  programSpendingBillions: number,
  gdpTrillions: number
): Record<string, number> {
  const gdpBillions = gdpTrillions * 1000;

  // Base growth multipliers per bracket
  const baseGrowthMultipliers: Record<string, number> = {
    top01: 2.0,
    top1: 1.5,
    next9: 1.1,
    middle40: 0.8,
    bottom50: 0.3,
  };

  // Tax drag on top brackets: higher taxes reduce wealth concentration
  const taxDrag = ((taxPolicy.topMarginalRate - 37) / 100) * assumptions.behavioralElasticity;

  // Spending boost on bottom brackets: social spending reduces inequality
  const spendingBoost = (programSpendingBillions / gdpBillions) * 0.1;

  const newShares: Record<string, number> = {};

  for (const [bracketId, share] of Object.entries(currentShares)) {
    const baseMultiplier = baseGrowthMultipliers[bracketId] ?? 1.0;
    let adjustedShare = share * (1 + gdpGrowth * baseMultiplier / 100);

    // Apply tax drag to top brackets (reduces their share)
    if (bracketId === "top01" || bracketId === "top1") {
      adjustedShare *= 1 - taxDrag;
    }

    // Apply spending boost to bottom brackets (increases their share)
    if (bracketId === "bottom50" || bracketId === "middle40") {
      adjustedShare *= 1 + spendingBoost;
    }

    newShares[bracketId] = Math.max(0, adjustedShare);
  }

  // Normalize so all shares sum to 1
  const total = Object.values(newShares).reduce((sum, v) => sum + v, 0);
  if (total > 0) {
    for (const key of Object.keys(newShares)) {
      newShares[key] = newShares[key] / total;
    }
  }

  return newShares;
}
