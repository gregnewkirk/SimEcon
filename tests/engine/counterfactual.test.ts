import { describe, it, expect } from "vitest";
import { replayCounterfactual } from "@/lib/engine/replay-counterfactual";
import { DEFAULT_ASSUMPTIONS as A } from "@/lib/ledger/growth";

const debtAt = (rows: { year: number; debtT: number }[], year: number) =>
  rows.find((d) => d.year === year)!.debtT;

describe("replayCounterfactual", () => {
  it("removing the Bush tax cuts lowers 2010 debt vs actual", () => {
    const { actual, counterfactual } = replayCounterfactual(["bush_tax_cuts"], A);
    expect(debtAt(counterfactual, 2010)).toBeLessThan(debtAt(actual, 2010));
  });

  it("with no events selected, counterfactual equals actual", () => {
    const { actual, counterfactual } = replayCounterfactual([], A);
    expect(debtAt(counterfactual, 2010)).toBeCloseTo(debtAt(actual, 2010), 6);
    expect(debtAt(counterfactual, 2025)).toBeCloseTo(debtAt(actual, 2025), 6);
  });

  it("combined events compound: removing wars + cuts saves more than cuts alone by 2025", () => {
    const cutsOnly = replayCounterfactual(["bush_tax_cuts"], A).counterfactual;
    const all = replayCounterfactual(["bush_tax_cuts", "iraq_war", "afghan_war"], A).counterfactual;
    expect(debtAt(all, 2025)).toBeLessThan(debtAt(cutsOnly, 2025));
  });

  it("COVID removal sharply lowers 2021 debt", () => {
    const { actual, counterfactual } = replayCounterfactual(["covid_cares", "covid_arp"], A);
    expect(debtAt(actual, 2021) - debtAt(counterfactual, 2021)).toBeGreaterThan(4);
  });
});
