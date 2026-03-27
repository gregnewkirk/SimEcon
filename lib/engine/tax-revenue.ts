import type { TaxPolicy, YearData } from "../types";
import { WEALTH_BRACKETS } from "../data/defaults";

/**
 * Calculate total federal revenue for a given year based on tax policy.
 * Returns revenue in billions of dollars.
 */
export function calculateTaxRevenue(
  previousYear: YearData,
  taxPolicy: TaxPolicy,
  gdpTrillions: number
): number {
  const totalWealthTrillions = gdpTrillions * 5.5;

  // Income tax revenue from each wealth bracket
  const bracketParams: Record<string, { incomeToWealthRatio: number; effectiveRate: number }> = {
    top01: {
      incomeToWealthRatio: 0.08,
      effectiveRate: (taxPolicy.topMarginalRate / 100) * 0.85,
    },
    top1: {
      incomeToWealthRatio: 0.06,
      effectiveRate: (taxPolicy.topMarginalRate / 100) * 0.70,
    },
    next9: {
      incomeToWealthRatio: 0.05,
      effectiveRate: (taxPolicy.topMarginalRate / 100) * 0.45,
    },
    middle40: {
      incomeToWealthRatio: 0.10,
      effectiveRate: 0.15,
    },
    bottom50: {
      incomeToWealthRatio: 0.20,
      effectiveRate: 0.05,
    },
  };

  let incomeTaxTrillions = 0;
  for (const bracket of WEALTH_BRACKETS) {
    const params = bracketParams[bracket.id];
    if (!params) continue;
    const bracketWealth =
      totalWealthTrillions * (previousYear.wealthShares[bracket.id] ?? bracket.shareOfWealth);
    incomeTaxTrillions += bracketWealth * params.incomeToWealthRatio * params.effectiveRate;
  }

  // Corporate tax revenue
  const gdpBillions = gdpTrillions * 1000;
  const corporateTaxBillions = gdpBillions * 0.05 * (taxPolicy.corporateRate / 21);

  // Capital gains tax revenue (applied to top brackets' wealth)
  const topWealth =
    totalWealthTrillions *
    ((previousYear.wealthShares["top01"] ?? 0.13) + (previousYear.wealthShares["top1"] ?? 0.18));
  const capitalGainsBillions = topWealth * 0.05 * (taxPolicy.capitalGainsRate / 100) * 1000;

  // Estate tax revenue
  const estateTaxBillions = topWealth * 0.002 * (taxPolicy.estateRate / 100) * 1000;

  // Convert income tax from trillions to billions and sum all sources
  return incomeTaxTrillions * 1000 + corporateTaxBillions + capitalGainsBillions + estateTaxBillions;
}
