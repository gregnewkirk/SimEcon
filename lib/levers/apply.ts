import type { BudgetLine, Provenance } from "../ledger/types";
import type { Lever, LeverConfig } from "./types";

export interface ApplyResult {
  lines: BudgetLine[];
  /** Keyed by line id: baseline contribution first, then one entry per lever that touched it. */
  provenance: Record<string, Provenance[]>;
}

/**
 * Apply levers to a set of budget lines. Each lever returns conventional deltas (always)
 * plus dynamic deltas (only when useDynamic). Deltas are summed into the matching line by
 * id, and every contribution is recorded in provenance so the UI can show the full trace.
 *
 * Lines are cloned; the input is never mutated. A delta whose lineId is not present is
 * ignored (a lever can only move lines that exist).
 */
export function applyLevers(
  baseLines: BudgetLine[],
  levers: Lever[],
  cfg: LeverConfig,
  useDynamic: boolean
): ApplyResult {
  const lines = baseLines.map((l) => ({ ...l }));
  const byId = new Map(lines.map((l) => [l.id, l]));
  const provenance: Record<string, Provenance[]> = {};

  // Seed every touched-or-untouched line with its baseline provenance.
  for (const l of lines) {
    provenance[l.id] = [{ source: "baseline", amountB: l.valueB, citationId: l.citationId }];
  }

  for (const lever of levers) {
    const deltas = [
      ...lever.conventional(cfg),
      ...(useDynamic && lever.dynamic ? lever.dynamic(cfg) : []),
    ];
    for (const d of deltas) {
      if (d.amountB === 0) continue;
      const line = byId.get(d.lineId);
      if (!line) continue;
      line.valueB += d.amountB;
      (provenance[d.lineId] ??= []).push({
        source: d.leverId,
        amountB: d.amountB,
        citationId: d.citationId,
      });
    }
  }

  return { lines, provenance };
}
