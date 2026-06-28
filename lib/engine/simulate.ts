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
  endYear: number,
  programCostOverrides: Record<string, number> = {}
): YearData[] {
  if (historicalData.length === 0) return [];

  const lastHistorical = historicalData[historicalData.length - 1];
  const projected: YearData[] = [];

  // Base program costs in 2025 dollars (anchored to last historical year)
  // Apply per-program overrides first, then the global multiplier
  const baseProgramCostBillions = enabledPrograms.reduce((sum, programId) => {
    const program = PROGRAMS_MAP.get(programId);
    if (!program) return sum;
    const perProgramMultiplier = programCostOverrides[programId] ?? 1.0;
    return sum + program.netCostBillions * perProgramMultiplier;
  }, 0) * (assumptions.programCostMultiplier ?? 1.0);

  const baseYear = lastHistorical.year; // 2025 — programs expressed in this year's dollars

  let prev = lastHistorical;

  // Program-free, interest-free spending base. Carried independently of prev.spending
  // so program costs and interest are never folded back in and re-grown (see step 4).
  let prevBaselineNonInterest = Math.max(
    lastHistorical.spendingBillions -
      lastHistorical.debtTrillions * 1000 * (assumptions.interestRate / 100),
    0
  );

  for (let year = lastHistorical.year + 1; year <= endYear; year++) {
    // Inflate program costs from base year — costs grow in nominal terms each year
    const yearsFromBase = year - baseYear;
    const programCostBillions =
      baseProgramCostBillions *
      Math.pow(1 + assumptions.inflationRate / 100, yearsFromBase);

    // 1. GDP growth with fiscal stimulus effect
    const fiscalEffect = (programCostBillions / 1000) * assumptions.fiscalMultiplier * 0.01;
    const gdpTrillions = prev.gdpTrillions * (1 + assumptions.gdpGrowthRate / 100 + fiscalEffect);

    // 2. Calculate tax revenue based on policy
    const revenueBillions = calculateTaxRevenue(prev, taxPolicy, gdpTrillions);

    // 3. Interest on current debt
    const interestBillions = prev.debtTrillions * 1000 * (assumptions.interestRate / 100);

    // 4. Non-interest spending: grow the program-free base on its own track, then add
    //    this year's program cost and interest fresh. Folding program cost into the
    //    carried-forward base (the old approach) made a flat program compound and
    //    balloon — a $450B/yr program reached ~$5.5T/yr of modeled spend by year 10.
    const nonInterestSpending = prevBaselineNonInterest * (1 + assumptions.gdpGrowthRate / 100);
    prevBaselineNonInterest = nonInterestSpending;
    const spendingBillions = nonInterestSpending + programCostBillions + interestBillions;

    // 5. Deficit: negative means deficit, positive means surplus
    const deficitBillions = -(spendingBillions - revenueBillions);

    // 6. Debt: subtract deficit (negative deficit = increases debt)
    // Clamp to 0 — in the real world you can't have negative debt
    const debtTrillions = Math.max(0, prev.debtTrillions - deficitBillions / 1000);

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
