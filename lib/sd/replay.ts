import type { SdAssumptions } from "./types";
import { SD_COUNTER_EVENTS } from "./events";

export interface SdWhatIfPoint {
  year: number;
  /** Cumulative money the city would have, compounded at the pension return rate. */
  cumSavedM: number;
  /** Dollars this year's decisions cost within the window. */
  annualAvoidedM: number;
}

export interface SdWhatIfResult {
  points: SdWhatIfPoint[];
  /** Total the city would have today (2026), with investment returns. */
  totalSavedM: number;
  /** Raw dollars spent/forgone, without compounding. */
  rawSpentM: number;
  /** Ongoing General Fund room freed per year today from selected events. */
  annualRoomTodayM: number;
}

const START_YEAR = 1996;
const END_YEAR = 2026;

/**
 * "What if we had..." retrospective for San Diego, 1996-2026. Each selected event is a
 * stream of dollars the decision cost versus the alternative actually on the table (the
 * events catalog documents both). The counterfactual assumes those dollars had instead
 * gone where the era's honest money went - paying down the pension system - so avoided
 * costs compound forward at the SDCERS assumed return. That is the same arithmetic that
 * turned modest skipped contributions in 1996-2008 into a multi-billion-dollar hole,
 * just run in the city's favor. A signed delta off reality, not a re-simulation.
 */
export function replaySdCounterfactual(
  selectedIds: string[],
  a: SdAssumptions
): SdWhatIfResult {
  const events = SD_COUNTER_EVENTS.filter((e) => selectedIds.includes(e.id));
  const r = a.pensionDiscountRate / 100;

  const points: SdWhatIfPoint[] = [];
  let cum = 0;
  let raw = 0;
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    cum *= 1 + r; // returns on everything already saved
    let yearAvoidedM = 0;
    for (const e of events) {
      if (year >= e.startYear && year <= e.endYear) {
        yearAvoidedM += e.sign * e.annualCostM;
      }
    }
    cum += yearAvoidedM;
    raw += yearAvoidedM;
    points.push({ year, cumSavedM: cum, annualAvoidedM: yearAvoidedM });
  }

  const annualRoomTodayM = events.reduce((s, e) => s + (e.ongoingAnnualM ?? 0), 0);

  return { points, totalSavedM: cum, rawSpentM: raw, annualRoomTodayM };
}
