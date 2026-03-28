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
  // Income-to-wealth ratios calibrated so total revenue ≈ $5T at 2025 GDP
  // with CURRENT_POLICY (37% top rate, 21% corporate, 20% cap gains, 40% estate)
  const topRate = taxPolicy.topMarginalRate / 100;
  const bracketParams: Record<string, { incomeToWealthRatio: number; effectiveRate: number }> = {
    top01: {
      incomeToWealthRatio: 0.10,
      effectiveRate: topRate * 0.85,
    },
    top1: {
      incomeToWealthRatio: 0.08,
      effectiveRate: topRate * 0.70,
    },
    next9: {
      incomeToWealthRatio: 0.07,
      effectiveRate: topRate * 0.50,
    },
    middle40: {
      incomeToWealthRatio: 0.12,
      effectiveRate: 0.12 + topRate * 0.08,
    },
    bottom50: {
      incomeToWealthRatio: 0.25,
      effectiveRate: 0.04 + topRate * 0.02,
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

  // Other federal revenue (payroll taxes, excise, customs, fees)
  // ~1% of GDP, not directly affected by income/corporate rate changes
  const otherRevenueBillions = gdpBillions * 0.01;

  // Convert income tax from trillions to billions and sum all sources
  return incomeTaxTrillions * 1000 + corporateTaxBillions + capitalGainsBillions + estateTaxBillions + otherRevenueBillions;
}
