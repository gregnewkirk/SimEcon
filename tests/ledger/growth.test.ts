import { describe, it, expect } from "vitest";
import { growthFactor, effectiveRate, nominalGdpFactor, DEFAULT_ASSUMPTIONS as A } from "@/lib/ledger/growth";

describe("growth", () => {
  it("nominalGDP ~= real and inflation compounded", () => {
    expect(growthFactor("nominalGDP", A)).toBeCloseTo(1.042, 2);
  });
  it("inflation basis tracks inflation only", () => {
    expect(growthFactor("inflation", A)).toBeCloseTo(1.023, 3);
  });
  it("computed basis does not grow on its own", () => {
    expect(growthFactor("computed", A)).toBe(1);
  });
  it("healthCost grows faster than nominal GDP", () => {
    expect(growthFactor("healthCost", A)).toBeGreaterThan(nominalGdpFactor(A));
  });
  it("ssCOLA grows faster than inflation alone", () => {
    expect(growthFactor("ssCOLA", A)).toBeGreaterThan(growthFactor("inflation", A));
  });
});

describe("interest rollover", () => {
  it("effective rate moves toward the new-issue rate, not instantly", () => {
    const next = effectiveRate(3.2, A);
    expect(next).toBeGreaterThan(3.2);
    expect(next).toBeLessThan(4.0);
  });
  it("converges to the new-issue rate over many years", () => {
    let r = 3.2;
    for (let i = 0; i < 50; i++) r = effectiveRate(r, A);
    expect(r).toBeCloseTo(4.0, 2);
  });
});
