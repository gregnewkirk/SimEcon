import type { BudgetLine, Provenance, YearData } from "../ledger/types";

/** Assemble a YearData from already-computed lines, debt, and GDP. */
export function buildYearData(
  year: number,
  lines: BudgetLine[],
  provenance: Record<string, Provenance[]>,
  debtT: number,
  gdpT: number,
  isProjected: boolean
): YearData {
  const revenueB = lines.filter((l) => l.side === "revenue").reduce((s, l) => s + l.valueB, 0);
  const spendingB = lines.filter((l) => l.side === "spending").reduce((s, l) => s + l.valueB, 0);
  const deficitB = spendingB - revenueB;
  return {
    year,
    lines,
    revenueB,
    spendingB,
    deficitB,
    debtT,
    gdpT,
    debtToGdp: (debtT / gdpT) * 100,
    provenance,
    isProjected,
  };
}
