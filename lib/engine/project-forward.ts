import type { BudgetLine, YearData } from "../ledger/types";
import type { LeverConfig } from "../levers/types";
import { BASELINE_2025, BASELINE_DEBT_T, BASELINE_GDP_T } from "../ledger/baseline";
import { growthFactor, nominalGdpFactor, effectiveRate, type EconAssumptions } from "../ledger/growth";
import { ALL_LEVERS } from "../levers/registry";
import { applyLevers } from "../levers/apply";
import { buildYearData } from "./year-data";

const LAST_HISTORICAL_YEAR = 2025;

export interface ProjectOptions {
  useDynamic: boolean;
  endYear: number;
}

/**
 * Project the federal budget forward from FY2025 to endYear under a lever configuration.
 *
 * Each year the program-free baseline lines grow on their own bases (never touched by
 * levers), net interest is recomputed from prior debt at the rolling effective rate, and
 * the levers are applied FRESH to that grown baseline, with each delta scaled by its
 * line's cumulative growth so 2025-dollar scores inflate / grow with their base. Lever
 * effects are never folded into the carried-forward baseline, so nothing compounds except
 * the legitimate interest on debt the policy actually adds.
 */
export function projectForward(
  cfg: LeverConfig,
  a: EconAssumptions,
  opts: ProjectOptions
): YearData[] {
  const out: YearData[] = [];

  // Mutable program-free baseline, advanced each year. Cloned so module data is untouched.
  const baseLines: BudgetLine[] = BASELINE_2025.map((l) => ({ ...l }));
  const cum: Record<string, number> = {};
  for (const l of baseLines) cum[l.id] = 1;

  let debtT = BASELINE_DEBT_T;
  let gdpT = BASELINE_GDP_T;

  // Seed the effective rate from the FY2025 net-interest line over debt.
  const ni0 = BASELINE_2025.find((l) => l.id === "net_interest")!.valueB;
  let effRate = (ni0 / (BASELINE_DEBT_T * 1000)) * 100;

  for (let year = LAST_HISTORICAL_YEAR + 1; year <= opts.endYear; year++) {
    gdpT *= nominalGdpFactor(a);
    effRate = effectiveRate(effRate, a);

    // Grow every non-computed baseline line and track cumulative growth per line.
    for (const l of baseLines) {
      if (l.growthBasis !== "computed") {
        const f = growthFactor(l.growthBasis, a);
        l.valueB *= f;
        cum[l.id] *= f;
      }
    }

    // Net interest is computed from the prior year's debt at this year's effective rate.
    const interestB = debtT * 1000 * (effRate / 100);
    const niLine = baseLines.find((l) => l.id === "net_interest")!;
    niLine.valueB = interestB;

    // Apply levers fresh to the grown baseline, scaling each delta by its line's growth.
    const { lines, provenance } = applyLevers(baseLines, ALL_LEVERS, cfg, opts.useDynamic, cum);

    const yd = buildYearData(year, lines, provenance, debtT, gdpT, true);
    debtT += yd.deficitB / 1000; // deficit (spending - revenue) adds to debt
    yd.debtT = debtT;
    yd.debtToGdp = (debtT / gdpT) * 100;

    out.push(yd);
  }

  return out;
}
