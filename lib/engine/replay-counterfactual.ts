import type { YearData } from "../ledger/types";
import type { EconAssumptions } from "../ledger/growth";
import { HISTORICAL_DATA } from "../data/historical";
import { COUNTER_EVENTS } from "../events/catalog";

export interface CounterfactualResult {
  actual: YearData[];
  counterfactual: YearData[];
}

/** Map a legacy historical row to the new YearData shape (history has no itemized lines). */
function toYearData(row: (typeof HISTORICAL_DATA)[number]): YearData {
  return {
    year: row.year,
    lines: [],
    revenueB: row.revenueBillions,
    spendingB: row.spendingBillions,
    deficitB: row.spendingBillions - row.revenueBillions,
    debtT: row.debtTrillions,
    gdpT: row.gdpTrillions,
    debtToGdp: row.debtToGdpRatio,
    provenance: {},
    isProjected: false,
  };
}

/**
 * "What if we had..." retrospective. The actual timeline is real historical data. The
 * counterfactual is real history with each selected event's annual cost removed within its
 * window, plus the interest never paid on the avoided debt compounded forward at the
 * new-issue rate. This is a signed delta off reality, NOT a re-simulation from 2000, so it
 * stays anchored to what actually happened.
 */
export function replayCounterfactual(
  selectedIds: string[],
  a: EconAssumptions
): CounterfactualResult {
  const events = COUNTER_EVENTS.filter((e) => selectedIds.includes(e.id));
  const actual = HISTORICAL_DATA.map(toYearData);

  let avoidedDebtT = 0; // cumulative debt avoided, in trillions
  const counterfactual: YearData[] = actual.map((row) => {
    const interestSavedT = avoidedDebtT * (a.newIssueRate / 100);
    let yearAvoidedB = 0;
    for (const e of events) {
      if (row.year >= e.startYear && row.year <= e.endYear) {
        yearAvoidedB += e.sign * e.annualCostB;
      }
    }
    avoidedDebtT += yearAvoidedB / 1000 + interestSavedT;

    return {
      ...row,
      spendingB: row.spendingB - yearAvoidedB,
      deficitB: row.deficitB - yearAvoidedB - interestSavedT * 1000,
      debtT: row.debtT - avoidedDebtT,
      debtToGdp: ((row.debtT - avoidedDebtT) / row.gdpT) * 100,
      isProjected: true,
    };
  });

  return { actual, counterfactual };
}
