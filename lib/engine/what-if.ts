import type { WhatIfEvent, AdvancedAssumptions, YearData } from "../types";
import { simulate } from "./simulate";
import { HISTORICAL_DATA } from "../data/historical";

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
 * Simulate a what-if scenario: what would have happened if a historical
 * policy event had NOT occurred (i.e. the counterfactual policy applied).
 *
 * Takes historical data up to (event.year - 1), then runs the simulation
 * forward with the counterfactual tax policy. Also runs the simulation
 * with the actual policy so both timelines can be compared.
 */
export function simulateWhatIf(
  event: WhatIfEvent,
  assumptions: AdvancedAssumptions,
  endYear: number
): WhatIfResult {
  // Historical data up to and including the year before the event
  const preEventData = HISTORICAL_DATA.filter((d) => d.year < event.year);

  if (preEventData.length === 0) {
    return { actual: [], counterfactual: [] };
  }

  // Actual policy: use whatever rates were in effect after the event.
  // We approximate this by finding the historical data entry at event.year
  // and running the simulation from the pre-event baseline with a "status quo"
  // policy derived from the year the event took effect.
  const actualPostEventData = HISTORICAL_DATA.filter(
    (d) => d.year >= event.year
  );

  // For the actual timeline, use full historical data plus projections
  const actualHistorical = HISTORICAL_DATA.filter((d) => d.year <= endYear);
  const lastHistoricalYear = actualHistorical[actualHistorical.length - 1]?.year ?? endYear;

  // Derive actual policy from defaults (post-event rates)
  // We infer the actual policy from the counterfactual by assuming
  // the event changed rates FROM counterfactual TO the actual rates in history.
  // The actual rates for TCJA era: 37% top, 20% CG, 21% corp, 40% estate
  // We use the historical data as-is for the actual timeline.
  const actual: YearData[] = [...actualHistorical];

  // If we need to project beyond historical data
  if (endYear > lastHistoricalYear) {
    // Use a "status quo" policy for the actual timeline
    // This approximates the rates that were actually in effect
    const lastEntry = HISTORICAL_DATA[HISTORICAL_DATA.length - 1];
    const actualProjected = simulate(
      actualHistorical,
      {
        // Current law rates (post all events)
        topMarginalRate: 37,
        capitalGainsRate: 20,
        corporateRate: 21,
        estateRate: 40,
      },
      [],
      assumptions,
      endYear
    );
    actual.push(...actualProjected);
  }

  // Counterfactual: run from pre-event data with the counterfactual policy
  const counterfactualProjected = simulate(
    preEventData,
    event.counterfactualPolicy,
    [],
    assumptions,
    endYear
  );

  const counterfactual: YearData[] = [
    ...preEventData,
    ...counterfactualProjected,
  ];

  return { actual, counterfactual };
}

/**
 * Calculate the delta between actual and counterfactual timelines
 * at a specific year.
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
