import type { WhatIfEvent, AdvancedAssumptions, TaxPolicy, YearData } from "../types";
import { CURRENT_POLICY } from "../data/defaults";
import { HISTORICAL_DATA } from "../data/historical";
import { calculateTaxRevenue } from "./tax-revenue";
import { redistributeWealth } from "./wealth-redistribution";

export interface WhatIfResult {
  actual: YearData[];
  counterfactual: YearData[];
}

export interface WhatIfDelta {
  year: number;
  debtDeltaTrillions: number;
  deficitDeltaBillions: number;
  revenueDeltaBillions: number;
}

/**
 * Simulate a what-if scenario.
 *
 * For TAX events: replays history from the event year with counterfactual tax rates.
 * For SPENDING events: replays history with reduced spending (e.g., no war costs).
 * For BOTH: applies both counterfactual tax rates AND spending reductions.
 *
 * The "actual" timeline uses real historical data + current-policy projections.
 * The "counterfactual" timeline diverges from (event.year - 1) with alternate policy.
 */
export function simulateWhatIf(
  event: WhatIfEvent,
  assumptions: AdvancedAssumptions,
  endYear: number
): WhatIfResult {
  // Historical data before the event
  const preEventData = HISTORICAL_DATA.filter((d) => d.year < event.year);

  if (preEventData.length === 0) {
    return { actual: [], counterfactual: [] };
  }

  // === ACTUAL TIMELINE ===
  // Use real historical data, then project forward with current policy
  const allHistorical = HISTORICAL_DATA.filter((d) => d.year <= endYear);
  const lastHistYear = allHistorical[allHistorical.length - 1]?.year ?? endYear;
  const actual: YearData[] = [...allHistorical];

  if (endYear > lastHistYear) {
    const projected = simulateForward(
      allHistorical,
      CURRENT_POLICY,
      0, // no spending change
      0,
      endYear,
      assumptions,
      endYear // never active (no spending reduction for actual)
    );
    actual.push(...projected);
  }

  // === COUNTERFACTUAL TIMELINE ===
  // Use pre-event historical data, then simulate forward with counterfactual
  const cfPolicy = event.counterfactualPolicy ?? CURRENT_POLICY;
  const spendingReduction = event.spendingReductionBillionsPerYear ?? 0;
  const spendingEndYear = event.endYear ?? endYear;

  const counterfactualProjected = simulateForward(
    preEventData,
    cfPolicy,
    spendingReduction,
    event.year,
    endYear,
    assumptions,
    spendingEndYear
  );

  const counterfactual: YearData[] = [
    ...preEventData,
    ...counterfactualProjected,
  ];

  return { actual, counterfactual };
}

/**
 * Forward simulation with optional spending reduction during a time window.
 * Used by what-if to replay history under alternate policy.
 */
function simulateForward(
  historicalData: YearData[],
  taxPolicy: TaxPolicy,
  spendingReductionPerYear: number,
  spendingStartYear: number,
  endYear: number,
  assumptions: AdvancedAssumptions,
  spendingEndYear: number
): YearData[] {
  if (historicalData.length === 0) return [];

  const lastHistorical = historicalData[historicalData.length - 1];
  const projected: YearData[] = [];
  let prev = lastHistorical;

  for (let year = lastHistorical.year + 1; year <= endYear; year++) {
    // GDP growth
    const gdpTrillions = prev.gdpTrillions * (1 + assumptions.gdpGrowthRate / 100);

    // Tax revenue under counterfactual policy
    const revenueBillions = calculateTaxRevenue(prev, taxPolicy, gdpTrillions);

    // Interest on debt
    const interestBillions = prev.debtTrillions * 1000 * (assumptions.interestRate / 100);

    // Non-interest spending (strip previous interest, grow with GDP)
    const prevInterest = prev.debtTrillions * 1000 * (assumptions.interestRate / 100);
    const prevNonInterest = Math.max(prev.spendingBillions - prevInterest, 0);
    let nonInterestSpending = prevNonInterest * (1 + assumptions.gdpGrowthRate / 100);

    // Apply spending reduction if within the event window
    if (spendingReductionPerYear > 0 && year >= spendingStartYear && year <= spendingEndYear) {
      nonInterestSpending = Math.max(nonInterestSpending - spendingReductionPerYear, 0);
    }

    const spendingBillions = nonInterestSpending + interestBillions;

    // Deficit
    const deficitBillions = -(spendingBillions - revenueBillions);

    // Debt
    const debtTrillions = prev.debtTrillions - deficitBillions / 1000;

    // Wealth redistribution
    const wealthShares = redistributeWealth(
      prev.wealthShares,
      taxPolicy,
      assumptions,
      assumptions.gdpGrowthRate,
      0,
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

/**
 * Calculate the delta between actual and counterfactual timelines at a specific year.
 */
export function calculateWhatIfDelta(
  actual: YearData[],
  counterfactual: YearData[],
  year: number
): WhatIfDelta {
  const actualYear = actual.find((d) => d.year === year);
  const counterfactualYear = counterfactual.find((d) => d.year === year);

  if (!actualYear || !counterfactualYear) {
    return {
      year,
      debtDeltaTrillions: 0,
      deficitDeltaBillions: 0,
      revenueDeltaBillions: 0,
    };
  }

  return {
    year,
    debtDeltaTrillions:
      actualYear.debtTrillions - counterfactualYear.debtTrillions,
    deficitDeltaBillions:
      actualYear.deficitBillions - counterfactualYear.deficitBillions,
    revenueDeltaBillions:
      actualYear.revenueBillions - counterfactualYear.revenueBillions,
  };
}
