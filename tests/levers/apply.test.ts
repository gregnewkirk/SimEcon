import { describe, it, expect } from "vitest";
import { applyLevers } from "@/lib/levers/apply";
import type { Lever } from "@/lib/levers/types";
import type { BudgetLine } from "@/lib/ledger/types";

const lines: BudgetLine[] = [
  { id: "corp", label: "Corporate", side: "revenue", valueB: 530, growthBasis: "profits", citationId: "c" },
];

const lever: Lever = {
  id: "corpRate",
  label: "Corporate rate",
  category: "tax",
  tier: "calibrated",
  targets: ["corp"],
  citationIds: ["c"],
  conventional: (cfg) => [
    { lineId: "corp", amountB: ((cfg.corpRate as number) - 21) * 18, citationId: "c", leverId: "corpRate" },
  ],
};

describe("applyLevers", () => {
  it("adds the conventional delta to the target line and records provenance", () => {
    const { lines: out, provenance } = applyLevers(lines, [lever], { corpRate: 28 }, false);
    expect(out.find((l) => l.id === "corp")!.valueB).toBeCloseTo(530 + 7 * 18, 6);
    expect(provenance.corp.some((p) => p.source === "corpRate")).toBe(true);
    expect(provenance.corp[0].source).toBe("baseline");
  });

  it("does not mutate the input lines", () => {
    applyLevers(lines, [lever], { corpRate: 35 }, false);
    expect(lines[0].valueB).toBe(530);
  });

  it("ignores dynamic deltas when useDynamic is false", () => {
    const withDyn: Lever = {
      ...lever,
      dynamic: () => [{ lineId: "corp", amountB: -50, citationId: "c", leverId: "corpRate" }],
    };
    const off = applyLevers(lines, [withDyn], { corpRate: 28 }, false);
    const on = applyLevers(lines, [withDyn], { corpRate: 28 }, true);
    expect(on.lines.find((l) => l.id === "corp")!.valueB).toBeCloseTo(
      off.lines.find((l) => l.id === "corp")!.valueB - 50,
      6
    );
  });

  it("ignores deltas targeting a non-existent line", () => {
    const ghost: Lever = {
      ...lever,
      conventional: () => [{ lineId: "nope", amountB: 999, citationId: "c", leverId: "corpRate" }],
    };
    const { lines: out } = applyLevers(lines, [ghost], { corpRate: 28 }, false);
    expect(out.find((l) => l.id === "corp")!.valueB).toBe(530);
  });
});
