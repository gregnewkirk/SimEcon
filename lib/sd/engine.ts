import type { SdAssumptions, SdBudgetLine, SdLeverConfig, SdYearData } from "./types";
import { SD_BASELINE_2026, SD_FISCAL } from "./baseline";
import { SD_ALL_LEVERS } from "./levers";
import { applySdLevers } from "./apply";
import { sdGrowthFactor } from "./growth";

const LAST_ADOPTED_YEAR = 2026; // FY2026 adopted budget is the launch point
const MAX_YEAR = 2040;

export interface SdProjectOptions {
  endYear: number;
}

/**
 * Pension model (citywide, millions). The ADC is normal cost plus a level-payment
 * amortization of the UAL; paying the full ADC retires the UAL by ~2040, matching the
 * SDCERS schedule's shape. The scheduled path is what the adopted department budgets
 * already embed, so the pension_adc budget line carries only DEVIATIONS from schedule:
 * zero if you pay the full bill, negative in the year you shortchange it, and then
 * relentlessly positive afterward as the skipped money compounds at the assumed return.
 * That is Manager's Proposal 1, as a game mechanic.
 */
interface PensionYear {
  adcCityM: number;
  ualM: number;
  normalCostM: number;
}

function pensionSchedule(a: SdAssumptions): Record<number, PensionYear> {
  const out: Record<number, PensionYear> = {};
  let ualM = SD_FISCAL.pensionUalM;
  const r = a.pensionDiscountRate / 100;
  const g = 1 + SD_FISCAL.pensionPayrollGrowth / 100;
  let nc = SD_FISCAL.pensionNormalCostM;
  for (let year = LAST_ADOPTED_YEAR + 1; year <= MAX_YEAR; year++) {
    nc *= g;
    const adc = nc + SD_FISCAL.pensionAmortFactor * ualM;
    out[year] = { adcCityM: adc, ualM, normalCostM: nc };
    ualM = Math.max(0, ualM * (1 + r) - (adc - nc));
  }
  return out;
}

/**
 * Project the General Fund forward from the FY2026 adopted budget under a lever
 * configuration. Mirrors the federal projectForward mechanics (baseline lines grow on
 * their own bases; levers are applied fresh each year, scaled by cumulative line growth)
 * with city semantics:
 *
 * - No sovereign debt. A gap (spending > revenue) drains the General Fund reserve; a
 *   surplus rebuilds it. California cities must adopt balanced budgets, so once reserves
 *   hit zero the remaining gap accumulates in unfundedGapM - the forced cuts or gimmicks
 *   a real council would face. That's the "you haven't actually solved it" meter.
 * - The pension follows the model above; underpaying via the pension lever raises the
 *   UAL and every later year's bill.
 */
export function projectSdForward(
  cfg: SdLeverConfig,
  a: SdAssumptions,
  opts: SdProjectOptions
): SdYearData[] {
  const out: SdYearData[] = [];

  const baseLines: SdBudgetLine[] = SD_BASELINE_2026.map((l) => ({ ...l }));
  const cum: Record<string, number> = {};
  for (const l of baseLines) cum[l.id] = 1;

  const schedule = pensionSchedule(a);
  const r = a.pensionDiscountRate / 100;
  const gfShare = SD_FISCAL.pensionGfShare;

  let reserveM = SD_FISCAL.reserveM;
  let ualM = SD_FISCAL.pensionUalM;
  let liabilityM = SD_FISCAL.pensionLiabilityM;
  let unfundedGapM = 0;

  for (let year = LAST_ADOPTED_YEAR + 1; year <= Math.min(opts.endYear, MAX_YEAR); year++) {
    // Grow every non-computed baseline line and track cumulative growth per line.
    for (const l of baseLines) {
      if (l.growthBasis !== "computed") {
        const f = sdGrowthFactor(l.growthBasis, a);
        l.valueM *= f;
        cum[l.id] *= f;
      }
    }
    liabilityM *= 1 + SD_FISCAL.pensionPayrollGrowth / 100;

    // This year's actual bill given the live UAL, vs the scheduled bill the department
    // budgets already embed. The difference lands on the pension_adc line.
    const sched = schedule[year];
    const computedAdcM = sched.normalCostM + SD_FISCAL.pensionAmortFactor * ualM;
    const deviationGfM = gfShare * (computedAdcM - sched.adcCityM);
    const adcLine = baseLines.find((l) => l.id === "pension_adc")!;
    adcLine.valueM = deviationGfM;
    cum["pension_adc"] = 1; // lever deltas on this line are face-value dollars

    // Apply levers fresh to the grown baseline.
    const { lines, provenance } = applySdLevers(baseLines, SD_ALL_LEVERS, cfg, cum);

    // What the city actually paid SDCERS this year (citywide dollars).
    const paidDevGfM = lines.find((l) => l.id === "pension_adc")!.valueM;
    const paidCityM = computedAdcM + (paidDevGfM - deviationGfM);
    ualM = Math.max(0, ualM * (1 + r) - (paidCityM - sched.normalCostM));

    const revenueM = sum(lines, "revenue");
    const spendingM = sum(lines, "spending");
    const gapM = spendingM - revenueM;

    // Balanced-budget mechanics: gaps drain reserves, surpluses rebuild them.
    reserveM -= gapM;
    if (reserveM < 0) {
      unfundedGapM += -reserveM;
      reserveM = 0;
    }

    out.push({
      year,
      lines,
      revenueM,
      spendingM,
      gapM,
      reserveM,
      reservePct: (reserveM / revenueM) * 100,
      pensionUalM: ualM,
      pensionFundedPct: ((liabilityM - ualM) / liabilityM) * 100,
      unfundedGapM,
      provenance,
      isProjected: true,
    });
  }

  return out;
}

function sum(lines: SdBudgetLine[], side: "revenue" | "spending"): number {
  return lines.filter((l) => l.side === side).reduce((s, l) => s + l.valueM, 0);
}
