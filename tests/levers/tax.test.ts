import { describe, it, expect } from "vitest";
import { BASELINE_2025 } from "@/lib/ledger/baseline";
import { applyLevers } from "@/lib/levers/apply";
import { topRateLever } from "@/lib/levers/tax-brackets";
import { corporateLever } from "@/lib/levers/corporate";
import { payrollCapLever } from "@/lib/levers/payroll";
import { capGainsLever } from "@/lib/levers/capital-gains";
import { estateLever } from "@/lib/levers/estate";
import type { Lever, LeverConfig } from "@/lib/levers/types";

const rev = (lines: { side: string; valueB: number }[]) =>
  lines.filter((l) => l.side === "revenue").reduce((s, l) => s + l.valueB, 0);
const base = rev(BASELINE_2025);
const revWith = (lever: Lever, cfg: LeverConfig) =>
  rev(applyLevers(BASELINE_2025, [lever], cfg, false).lines);

describe("tax lever golden numbers (conventional / static)", () => {
  it("top rate 37 to 39.6 raises ~25-45B/yr (JCT range)", () => {
    const d = revWith(topRateLever, { topRate: 39.6 }) - base;
    expect(d).toBeGreaterThan(25);
    expect(d).toBeLessThan(45);
  });

  it("corporate 21 to 28 raises ~100-150B/yr (JCT range)", () => {
    const d = revWith(corporateLever, { corpRate: 28 }) - base;
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(150);
  });

  it("removing the SS cap raises ~110-160B/yr (SSA/CBO range)", () => {
    const d = revWith(payrollCapLever, { removeSsCap: true }) - base;
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(160);
  });

  it("capital gains revenue peaks between 20% and 50% (Laffer)", () => {
    const at = (r: number) => revWith(capGainsLever, { capGains: r });
    expect(at(29)).toBeGreaterThan(at(20));
    expect(at(29)).toBeGreaterThan(at(50));
  });

  it("doubling the estate rate roughly doubles estate revenue", () => {
    const d = revWith(estateLever, { estateRate: 80 }) - base;
    expect(d).toBeGreaterThan(30);
    expect(d).toBeLessThan(40);
  });

  it("dynamic scoring shows less revenue than static for a tax hike", () => {
    const staticGain = rev(applyLevers(BASELINE_2025, [corporateLever], { corpRate: 28 }, false).lines) - base;
    const dynamicGain = rev(applyLevers(BASELINE_2025, [corporateLever], { corpRate: 28 }, true).lines) - base;
    expect(dynamicGain).toBeLessThan(staticGain);
    expect(dynamicGain).toBeGreaterThan(staticGain * 0.5); // a haircut, not a collapse
  });

  it("top-rate behavioral offset is larger than the corporate one (more elastic)", () => {
    const corpStatic = rev(applyLevers(BASELINE_2025, [corporateLever], { corpRate: 28 }, false).lines) - base;
    const corpDyn = rev(applyLevers(BASELINE_2025, [corporateLever], { corpRate: 28 }, true).lines) - base;
    const topStatic = rev(applyLevers(BASELINE_2025, [topRateLever], { topRate: 45 }, false).lines) - base;
    const topDyn = rev(applyLevers(BASELINE_2025, [topRateLever], { topRate: 45 }, true).lines) - base;
    expect(1 - corpDyn / corpStatic).toBeCloseTo(0.15, 2);
    expect(1 - topDyn / topStatic).toBeCloseTo(0.25, 2);
  });

  it("levers at baseline values produce no change", () => {
    expect(revWith(topRateLever, { topRate: 37 })).toBeCloseTo(base, 6);
    expect(revWith(corporateLever, { corpRate: 21 })).toBeCloseTo(base, 6);
    expect(revWith(capGainsLever, { capGains: 20 })).toBeCloseTo(base, 6);
  });
});
