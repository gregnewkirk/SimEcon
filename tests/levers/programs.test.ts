import { describe, it, expect } from "vitest";
import { ALL_LEVERS, LEVERS_BY_ID, defaultConfig } from "@/lib/levers/registry";
import { BASELINE_2025 } from "@/lib/ledger/baseline";
import { applyLevers } from "@/lib/levers/apply";
import { getCitation } from "@/lib/citations";

describe("lever registry", () => {
  it("every lever has a tier and at least one registered citation", () => {
    for (const l of ALL_LEVERS) {
      expect(["calibrated", "estimate"]).toContain(l.tier);
      expect(l.citationIds.length).toBeGreaterThan(0);
      for (const id of l.citationIds) expect(getCitation(id)).toBeDefined();
    }
  });

  it("lever ids are unique", () => {
    const ids = ALL_LEVERS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("healthcare is a calibrated program", () => {
    expect(LEVERS_BY_ID.get("healthcare")!.tier).toBe("calibrated");
    expect(LEVERS_BY_ID.get("healthcare")!.category).toBe("program");
  });

  it("wealth tax is flagged contested", () => {
    expect(LEVERS_BY_ID.get("wealth_tax")!.contested).toBe(true);
  });

  it("default config produces the untouched baseline", () => {
    const sumDeficit = (lines: { side: string; valueB: number }[]) =>
      lines.filter((l) => l.side === "spending").reduce((s, l) => s + l.valueB, 0) -
      lines.filter((l) => l.side === "revenue").reduce((s, l) => s + l.valueB, 0);
    const { lines } = applyLevers(BASELINE_2025, ALL_LEVERS, defaultConfig(), false);
    expect(sumDeficit(lines)).toBeCloseTo(1900, 0);
  });

  it("M4A fully phased in adds its net cost to spending", () => {
    const { lines } = applyLevers(BASELINE_2025, ALL_LEVERS, { ...defaultConfig(), healthcare: 100 }, false);
    const programs = lines.find((l) => l.id === "policy_programs")!;
    expect(programs.valueB).toBeCloseTo(450, 6);
  });

  it("VAT is the giant: ~$1.4T of new revenue at 5%", () => {
    const rev = (lines: { side: string; valueB: number }[]) => lines.filter((l) => l.side === "revenue").reduce((s, l) => s + l.valueB, 0);
    const base = rev(applyLevers(BASELINE_2025, ALL_LEVERS, defaultConfig(), false).lines);
    const withVat = rev(applyLevers(BASELINE_2025, ALL_LEVERS, { ...defaultConfig(), vat5: 5 }, false).lines);
    expect(withVat - base).toBeCloseTo(1400, 0);
  });

  it("carried interest is the reveal: a rounding error (~$1.5B)", () => {
    expect(LEVERS_BY_ID.get("carried_interest")!.conventional({ carried_interest: true })[0].amountB).toBeCloseTo(1.5, 6);
  });

  it("the new moonshots are programs and the new revenue options are revenue", () => {
    expect(LEVERS_BY_ID.get("child_tax_credit")!.category).toBe("program");
    expect(LEVERS_BY_ID.get("vat5")!.category).toBe("revenue");
  });
});
