import type { TaxPolicy, AdvancedAssumptions, YearData } from "../types";
import { PROGRAMS_MAP } from "../data/programs";
import { calculateTaxRevenue } from "./tax-revenue";
import { redistributeWealth } from "./wealth-redistribution";

/**
 * Run the simulation from the end of historical data to the given end year.
 * Returns an array of projected YearData entries with isProjected: true.
 */
export function simulate(
  historicalData: YearData[],
  taxPolicy: TaxPolicy,
  enabledPrograms: string[],
  assumptions: AdvancedAssumptions,
  endYear: number
): YearData[] {
  if (historicalData.length === 0) return [];

  const lastHistorical = historicalData[historicalData.length - 1];
  const projected: YearData[] = [];

  // Calculate total program costs
  const totalProgramCostBillions = enabledPrograms.reduce((sum, programId) => {
    const program = PROGRAMS_MAP.get(programId);
    return sum + (program?.netCostBillions ?? 0);
  }, 0);

  let prev = lastHistorical;

  for (let year = lastHistorical.year + 1; year <= endYear; year++) {
    // 1. GDP growth with fiscal stimulus effect
    const fiscalEffect = (totalProgramCostBillions / 1000) * assumptions.fiscalMultiplier * 0.01;
    const gdpTrillions = prev.gdpTrillions * (1 + assumptions.gdpGrowthRate / 100 + fiscalEffect);

    // 2. Calculate tax revenue based on policy
    const revenueBillions = calculateTaxRevenue(prev, taxPolicy, gdpTrillions);

    // 3. Interest on current debt
    const interestBillions = prev.debtTrillions * 1000 * (assumptions.interestRate / 100);

    // 4. Non-interest spending: strip out previous year's interest before growing
    //    Historical spending already includes interest, so we must separate them
    //    to avoid double-counting interest each year.
    const prevInterestBillions = prev.debtTrillions * 1000 * (assumptions.interestRate / 100);
    const prevNonInterestSpending = Math.max(prev.spendingBillions - prevInterestBillions, 0);
    const nonInterestSpending = prevNonInterestSpending * (1 + assumptions.gdpGrowthRate / 100);
    const spendingBillions = nonInterestSpending + totalProgramCostBillions + interestBillions;

    // 5. Deficit: negative means deficit, positive means surplus
    const deficitBillions = -(spendingBillions - revenueBillions);

    // 6. Debt: subtract deficit (negative deficit = increases debt)
    const debtTrillions = prev.debtTrillions - deficitBillions / 1000;

    // 7. Wealth redistribution
    const wealthShares = redistributeWealth(
      prev.wealthShares,
      taxPolicy,
      assumptions,
      assumptions.gdpGrowthRate,
      totalProgramCostBillions,
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
