import type { SdBudgetLine, SdLever, SdLeverConfig, SdProvenance } from "./types";

export interface SdApplyResult {
  lines: SdBudgetLine[];
  /** Keyed by line id: baseline contribution first, then one entry per lever that touched it. */
  provenance: Record<string, SdProvenance[]>;
}

/**
 * Apply levers to a set of city budget lines. Same contract as the federal applyLevers:
 * deltas are summed into the matching line by id, every contribution is recorded in
 * provenance, lines are cloned (input never mutated), and a delta whose lineId is not
 * present is ignored. Deltas are optionally scaled by a per-line cumulative growth factor
 * so an FY2026-dollar score grows with its base in projected years.
 */
export function applySdLevers(
  baseLines: SdBudgetLine[],
  levers: SdLever[],
  cfg: SdLeverConfig,
  scale?: Record<string, number>
): SdApplyResult {
  const lines = baseLines.map((l) => ({ ...l }));
  const byId = new Map(lines.map((l) => [l.id, l]));
  const provenance: Record<string, SdProvenance[]> = {};

  for (const l of lines) {
    provenance[l.id] = [{ source: "baseline", amountM: l.valueM, citationId: l.citationId }];
  }

  for (const lever of levers) {
    for (const d of lever.conventional(cfg)) {
      const factor = scale?.[d.lineId] ?? 1;
      const amountM = d.amountM * factor;
      if (amountM === 0) continue;
      const line = byId.get(d.lineId);
      if (!line) continue;
      line.valueM += amountM;
      (provenance[d.lineId] ??= []).push({
        source: d.leverId,
        amountM,
        citationId: d.citationId,
      });
    }
  }

  return { lines, provenance };
}
