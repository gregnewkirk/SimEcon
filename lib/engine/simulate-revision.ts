import type { TaxPolicy, AdvancedAssumptions, YearData } from "../types";
import { PROGRAMS_MAP } from "../data/programs";
import { calculateTaxRevenue } from "./tax-revenue";
import { redistributeWealth } from "./wealth-redistribution";

/**
 * Run a "historical revision" simulation: apply the user's policy from year 2000
 * (or whatever startingConditions.year is) all the way through to endYear.
 *
 * Every year in the output is isProjected: true since it's an alternate timeline.
 * The startingConditions (year 2000) serve as the seed — they are NOT included in
 * the output array (they anchor the first projected year's "prev").
 */
export function simulateRevision(
  startingConditions: YearData,
  taxPolicy: TaxPolicy,
  enabledPrograms: string[],
  assumptions: AdvancedAssumptions,
  endYear: number
): YearData[] {
  const projected: YearData[] = [];

  // Base program costs in 2025 dollars — inflate/deflate to each simulation year
  const BASE_DOLLAR_YEAR = 2025;
  const baseProgramCostBillions = enabledPrograms.reduce((sum, programId) => {
    const program = PROGRAMS_MAP.get(programId);
    return sum + (program?.netCostBillions ?? 0);
  }, 0) * (assumptions.programCostMultiplier ?? 1.0);

  let prev = startingConditions;

  for (let year = startingConditions.year + 1; year <= endYear; year++) {
    // Adjust program costs to this year's nominal dollars.
    // Positive exponent = future (inflate). Negative = past (deflate).
    const yearsFromBase = year - BASE_DOLLAR_YEAR;
    const programCostBillions =
      baseProgramCostBillions *
      Math.pow(1 + assumptions.inflationRate / 100, yearsFromBase);

    // 1. GDP growth with fiscal stimulus effect
    const fiscalEffect =
      (programCostBillions / 1000) * assumptions.fiscalMultiplier * 0.01;
    const gdpTrillions =
      prev.gdpTrillions * (1 + assumptions.gdpGrowthRate / 100 + fiscalEffect);

    // 2. Calculate tax revenue based on user's policy
    const revenueBillions = calculateTaxRevenue(prev, taxPolicy, gdpTrillions);

    // 3. Interest on current debt
    const interestBillions =
      prev.debtTrillions * 1000 * (assumptions.interestRate / 100);

    // 4. Non-interest spending: strip out previous year's interest before growing
    const prevInterestBillions =
      prev.debtTrillions * 1000 * (assumptions.interestRate / 100);
    const prevNonInterestSpending = Math.max(
      prev.spendingBillions - prevInterestBillions,
      0
    );
    const nonInterestSpending =
      prevNonInterestSpending * (1 + assumptions.gdpGrowthRate / 100);
    const spendingBillions =
      nonInterestSpending + programCostBillions + interestBillions;

    // 5. Deficit: negative means deficit, positive means surplus
    const deficitBillions = -(spendingBillions - revenueBillions);

    // 6. Debt: subtract deficit (negative deficit = increases debt)
    const debtTrillions = Math.max(
      0,
      prev.debtTrillions - deficitBillions / 1000
    );

    // 7. Wealth redistribution
    const wealthShares = redistributeWealth(
      prev.wealthShares,
      taxPolicy,
      assumptions,
      assumptions.gdpGrowthRate,
      programCostBillions,
      gdpTrillions
    );

    const yearData: YearData = {
      year,
      debtTrillions,
      deficitBillions,
      revenueBillions,
      spendingBillions,
      gdpTrillions,
      debtToGdpRatio: (debtTrillions / gdpTrillions) * 100,
      wealthShares,
      isProjected: true,
    };

    projected.push(yearData);
    prev = yearData;
  }

  return projected;
}
