import type { Lever, LeverConfig } from "@/lib/levers/types";
import { BASELINE_2025 } from "@/lib/ledger/baseline";
import { growthFactor, DEFAULT_ASSUMPTIONS as A } from "@/lib/ledger/growth";

export interface LeverProjection {
  /** Dollar effect in 2025 terms (sum of conventional deltas; signed). */
  base: number;
  y2026: number;
  y2050: number;
  /** "spending" if it adds outlays, "revenue" if it adds receipts, else "deficit". */
  kind: "spending" | "revenue" | "deficit";
}

/**
 * Projects a lever's scored effect forward using the same per-line growth bases the engine
 * uses. For a toggle, shows the effect "if enabled"; for a slider, the effect at its current
 * value vs current law. Lets the detail panel show real FY2026 and FY2050 numbers.
 */
export function leverProjection(lever: Lever, cfg: LeverConfig): LeverProjection {
  const onCfg: LeverConfig = lever.range ? cfg : { ...cfg, [lever.id]: true };
  const deltas = lever.conventional(onCfg);
  const base = deltas.reduce((s, d) => s + d.amountB, 0);

  const firstTarget = lever.targets[0];
  const line = BASELINE_2025.find((l) => l.id === firstTarget);
  const f = line ? growthFactor(line.growthBasis, A) : 1 + A.inflation / 100;

  const kind: LeverProjection["kind"] =
    line?.side === "spending" ? "spending" : line?.side === "revenue" ? "revenue" : "deficit";

  return {
    base,
    y2026: base * f,
    y2050: base * Math.pow(f, 25),
    kind,
  };
}

function impactFromCfg(lever: Lever, cfgForLever: LeverConfig): number {
  let impact = 0;
  for (const d of lever.conventional(cfgForLever)) {
    const line = BASELINE_2025.find((l) => l.id === d.lineId);
    if (!line) continue;
    impact += line.side === "revenue" ? d.amountB : -d.amountB;
  }
  return impact;
}

/**
 * Signed deficit impact (2025 dollars) of a lever at its "on" setting: positive improves the
 * deficit (raises revenue or cuts spending), negative worsens it (new spending). Used for
 * sizing the bars and sorting. For dials this is the impact at their headline onValue.
 */
export function leverDeficitImpact(lever: Lever): number {
  return impactFromCfg(lever, { [lever.id]: lever.onValue ?? true });
}

/** Signed deficit impact at the current config value (live, for dial readouts). */
export function leverImpactAt(lever: Lever, cfg: LeverConfig): number {
  return impactFromCfg(lever, cfg);
}
