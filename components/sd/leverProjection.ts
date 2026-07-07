import type { SdLever, SdLeverConfig } from "@/lib/sd/types";
import { SD_BASELINE_2026 } from "@/lib/sd/baseline";
import { sdGrowthFactor, SD_DEFAULT_ASSUMPTIONS as A } from "@/lib/sd/growth";

export interface SdLeverProjection {
  /** Dollar effect in FY2026 terms (sum of conventional deltas; signed millions). */
  base: number;
  y2027: number;
  y2040: number;
  /** "spending" if it adds outlays, "revenue" if it adds receipts, else "gap". */
  kind: "spending" | "revenue" | "gap";
}

/**
 * Projects a lever's scored effect forward using the same per-line growth bases the SD
 * engine uses, so the detail panel can show real FY2027 and FY2040 numbers.
 */
export function sdLeverProjection(lever: SdLever, cfg: SdLeverConfig): SdLeverProjection {
  const onCfg: SdLeverConfig = lever.range ? cfg : { ...cfg, [lever.id]: true };
  const deltas = lever.conventional(onCfg);
  const base = deltas.reduce((s, d) => s + d.amountM, 0);

  const firstTarget = lever.targets[0];
  const line = SD_BASELINE_2026.find((l) => l.id === firstTarget);
  const f = line ? sdGrowthFactor(line.growthBasis, A) : 1 + A.inflation / 100;

  const kind: SdLeverProjection["kind"] =
    line?.side === "spending" ? "spending" : line?.side === "revenue" ? "revenue" : "gap";

  return {
    base,
    y2027: base * f,
    y2040: base * Math.pow(f, 14),
    kind,
  };
}

function impactFromCfg(lever: SdLever, cfgForLever: SdLeverConfig): number {
  let impact = 0;
  for (const d of lever.conventional(cfgForLever)) {
    const line = SD_BASELINE_2026.find((l) => l.id === d.lineId);
    if (!line) continue;
    impact += line.side === "revenue" ? d.amountM : -d.amountM;
  }
  return impact;
}

/**
 * Signed gap impact (FY2026 millions) of a lever at its "on" setting: positive improves
 * the budget (raises revenue or cuts spending), negative worsens it. Used for sizing the
 * bars and sorting. For dials this is the impact at their headline onValue.
 */
export function sdLeverGapImpact(lever: SdLever): number {
  return impactFromCfg(lever, { [lever.id]: lever.onValue ?? true });
}

/** Signed gap impact at the current config value (live, for dial readouts). */
export function sdLeverImpactAt(lever: SdLever, cfg: SdLeverConfig): number {
  return impactFromCfg(lever, cfg);
}
