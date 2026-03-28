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
 * Simulate a what-if scenario for a single event.
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
  return simulateWhatIfMulti([event], assumptions, endYear);
}

/**
 * Simulate a what-if scenario with multiple events combined.
 *
 * Merges counterfactual tax policies (earliest event's policy wins for each rate)
 * and sums spending reductions across all events within their active windows.
 * The counterfactual diverges from the earliest event year.
 */
export function simulateWhatIfMulti(
  events: WhatIfEvent[],
  assumptions: AdvancedAssumptions,
  endYear: number
): WhatIfResult {
  if (events.length === 0) {
    return { actual: [], counterfactual: [] };
  }

  // Find earliest event year
  const earliestYear = Math.min(...events.map((e) => e.year));

  // Historical data before the earliest event
  const preEventData = HISTORICAL_DATA.filter((d) => d.year < earliestYear);

  if (preEventData.length === 0) {
    return { actual: [], counterfactual: [] };
  }

  // === ACTUAL TIMELINE ===
  const allHistorical = HISTORICAL_DATA.filter((d) => d.year <= endYear);
  const lastHistYear = allHistorical[allHistorical.length - 1]?.year ?? endYear;
  const actual: YearData[] = [...allHistorical];

  if (endYear > lastHistYear) {
    const projected = simulateForward(
      allHistorical,
      CURRENT_POLICY,
      0,
      0,
      endYear,
      assumptions,
      endYear
    );
    actual.push(...projected);
  }

  // === COUNTERFACTUAL TIMELINE ===
  // Merge counterfactual tax policies — use the most aggressive counterfactual rate
  const mergedPolicy: TaxPolicy = {
    ...CURRENT_POLICY,
    brackets: CURRENT_POLICY.brackets.map((b) => ({ ...b })),
  };
  for (const event of events) {
    if (event.counterfactualPolicy) {
      mergedPolicy.topMarginalRate = Math.max(mergedPolicy.topMarginalRate, event.counterfactualPolicy.topMarginalRate);
      mergedPolicy.capitalGainsRate = Math.max(mergedPolicy.capitalGainsRate, event.counterfactualPolicy.capitalGainsRate);
      mergedPolicy.corporateRate = Math.max(mergedPolicy.corporateRate, event.counterfactualPolicy.corporateRate);
      mergedPolicy.estateRate = Math.max(mergedPolicy.estateRate, event.counterfactualPolicy.estateRate);
      // Merge brackets — take highest rate per bracket
      if (event.counterfactualPolicy.brackets) {
        event.counterfactualPolicy.brackets.forEach((b, i) => {
          if (mergedPolicy.brackets[i]) {
            mergedPolicy.brackets[i].rate = Math.max(mergedPolicy.brackets[i].rate, b.rate);
          }
        });
      }
    }
  }

  // Build per-year spending reduction schedule.
  // Event costs are expressed in 2025 dollars (modern CBO/Watson Institute estimates).
  // Deflate to each historical year's nominal dollars using the inflation assumption.
  const BASE_DOLLAR_YEAR = 2025;
  const spendingSchedule = new Map<number, number>();
  for (const event of events) {
    if (event.spendingReductionBillionsPerYear && event.spendingReductionBillionsPerYear > 0) {
      const startYr = event.year;
      const endYr = event.endYear ?? endYear;
      for (let y = startYr; y <= endYr; y++) {
        // (1+r)^(y-2025): negative exponent for past years → deflates the figure
        const cpiAdjustment = Math.pow(1 + assumptions.inflationRate / 100, y - BASE_DOLLAR_YEAR);
        const adjustedReduction = event.spendingReductionBillionsPerYear * cpiAdjustment;
        spendingSchedule.set(y, (spendingSchedule.get(y) ?? 0) + adjustedReduction);
      }
    }
  }

  const counterfactualProjected = simulateForwardMulti(
    preEventData,
    mergedPolicy,
    spendingSchedule,
    endYear,
    assumptions
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
 * Forward simulation with per-year spending reduction schedule.
 * Used by simulateWhatIfMulti to replay history under merged alternate policy.
 */
function simulateForwardMulti(
  historicalData: YearData[],
  taxPolicy: TaxPolicy,
  spendingSchedule: Map<number, number>,
  endYear: number,
  assumptions: AdvancedAssumptions
): YearData[] {
  if (historicalData.length === 0) return [];

  const lastHistorical = historicalData[historicalData.length - 1];
  const projected: YearData[] = [];
  let prev = lastHistorical;

  for (let year = lastHistorical.year + 1; year <= endYear; year++) {
    const gdpTrillions = prev.gdpTrillions * (1 + assumptions.gdpGrowthRate / 100);
    const revenueBillions = calculateTaxRevenue(prev, taxPolicy, gdpTrillions);
    const interestBillions = prev.debtTrillions * 1000 * (assumptions.interestRate / 100);
    const prevInterest = prev.debtTrillions * 1000 * (assumptions.interestRate / 100);
    const prevNonInterest = Math.max(prev.spendingBillions - prevInterest, 0);
    let nonInterestSpending = prevNonInterest * (1 + assumptions.gdpGrowthRate / 100);

    const reduction = spendingSchedule.get(year) ?? 0;
    if (reduction > 0) {
      nonInterestSpending = Math.max(nonInterestSpending - reduction, 0);
    }

    const spendingBillions = nonInterestSpending + interestBillions;
    const deficitBillions = -(spendingBillions - revenueBillions);
    const debtTrillions = prev.debtTrillions - deficitBillions / 1000;

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
