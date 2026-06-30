import { describe, it, expect } from "vitest";
import { computeIncidence } from "@/lib/incidence/compute";

describe("incidence", () => {
  it("raising the top rate burdens top1 far more than bottom50", () => {
    const inc = computeIncidence({ topRate: 45 });
    expect(inc.top1).toBeLessThan(inc.bottom50); // top pays more (more negative)
    expect(inc.top1).toBeLessThan(0);
  });

  it("UBI nets positive for the bottom 50%", () => {
    const inc = computeIncidence({ ubi: 1000 });
    expect(inc.bottom50).toBeGreaterThan(0);
    expect(inc.bottom50).toBeGreaterThan(inc.top1);
  });

  it("a carbon tax is regressive (hits bottom50 relatively hard)", () => {
    const inc = computeIncidence({ carbon_tax: true });
    expect(inc.bottom50).toBeLessThan(0);
    expect(inc.bottom50).toBeLessThan(inc.top1); // bottom bears more than top
  });

  it("VAT is regressive: bottom50 bears more than top1", () => {
    const inc = computeIncidence({ vat5: 5 });
    expect(inc.bottom50).toBeLessThan(0);
    expect(inc.bottom50).toBeLessThan(inc.top1);
  });

  it("billionaire minimum tax lands almost entirely on the top 1%", () => {
    const inc = computeIncidence({ billionaire_min_tax: true });
    expect(inc.top1).toBeLessThan(0);
    expect(inc.bottom50).toBe(0);
  });

  it("Child Tax Credit nets positive for the bottom half", () => {
    const inc = computeIncidence({ child_tax_credit: true });
    expect(inc.bottom50).toBeGreaterThan(0);
  });

  it("buy-borrow-die collateral tax lands on the top 1%", () => {
    const inc = computeIncidence({ collateral_tax: 20 });
    expect(inc.top1).toBeLessThan(0);
    expect(inc.bottom50).toBe(0);
  });

  it("no active levers means no incidence", () => {
    const inc = computeIncidence({});
    expect(inc.top1).toBe(0);
    expect(inc.bottom50).toBe(0);
  });
});
