import { describe, it, expect } from "vitest";
import { projectForward } from "@/lib/engine/project-forward";
import { DEFAULT_ASSUMPTIONS as A } from "@/lib/ledger/growth";

describe("projectForward", () => {
  it("a flat program does not compound (delta ~ inflation + interest, not a balloon)", () => {
    const base = projectForward({}, A, { useDynamic: false, endYear: 2035 });
    const prog = projectForward({ healthcare: true }, A, { useDynamic: false, endYear: 2035 });
    const y1 = prog[0].spendingB - base[0].spendingB;
    const y10 = prog[9].spendingB - base[9].spendingB;
    // Year-10 delta is the program cost grown by inflation (~1.25x) plus interest on the
    // extra debt. It must stay well below the old balloon (which was >10x) and above y1.
    expect(y10).toBeLessThan(y1 * 2.2);
    expect(y10).toBeGreaterThan(y1);
  });

  it("baseline starts near the real FY2026 deficit and debt grows", () => {
    const r = projectForward({}, A, { useDynamic: false, endYear: 2050 });
    expect(r[0].year).toBe(2026);
    expect(r[0].deficitB).toBeGreaterThan(1500);
    expect(r[0].deficitB).toBeLessThan(2600);
    expect(r[r.length - 1].debtT).toBeGreaterThan(r[0].debtT);
  });

  it("debt-to-GDP is finite and positive", () => {
    const r = projectForward({}, A, { useDynamic: false, endYear: 2050 });
    const last = r[r.length - 1];
    expect(Number.isFinite(last.debtToGdp)).toBe(true);
    expect(last.debtToGdp).toBeGreaterThan(0);
  });

  it("every projected year carries provenance", () => {
    const r = projectForward({ corpRate: 28 }, A, { useDynamic: false, endYear: 2030 });
    expect(Object.keys(r[0].provenance).length).toBeGreaterThan(0);
    expect(r[0].provenance.corporate.some((p) => p.source === "corpRate")).toBe(true);
  });

  it("raising taxes reduces the deficit vs baseline", () => {
    const base = projectForward({}, A, { useDynamic: false, endYear: 2030 });
    const taxed = projectForward({ corpRate: 28, topRate: 45 }, A, { useDynamic: false, endYear: 2030 });
    expect(taxed[0].deficitB).toBeLessThan(base[0].deficitB);
  });
});
