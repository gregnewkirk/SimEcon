import { describe, it, expect } from "vitest";
import { projectSdForward } from "@/lib/sd/engine";
import { sdDefaultConfig, SD_ALL_LEVERS } from "@/lib/sd/levers";
import { SD_DEFAULT_ASSUMPTIONS } from "@/lib/sd/growth";
import { SD_SCENARIOS } from "@/lib/sd/scenarios";

const run = (cfg = sdDefaultConfig()) =>
  projectSdForward(cfg, SD_DEFAULT_ASSUMPTIONS, { endYear: 2040 });

describe("San Diego projection engine", () => {
  it("shows a structural deficit once FY2026 one-time money vanishes", () => {
    const years = run();
    const fy27 = years[0];
    expect(fy27.year).toBe(2027);
    // IBA projected ~$88.8M for FY2027, later revised toward $118M; we land in that band.
    expect(fy27.gapM).toBeGreaterThan(60);
    expect(fy27.gapM).toBeLessThan(180);
  });

  it("drains reserves and then accumulates forced cuts", () => {
    const years = run();
    const last = years[years.length - 1];
    expect(years[0].reserveM).toBeLessThan(207.1);
    expect(last.reserveM).toBe(0);
    expect(last.unfundedGapM).toBeGreaterThan(0);
  });

  it("keeps the pension deviation ~0 when the full bill is paid", () => {
    const years = run();
    for (const y of years) {
      const dev = y.lines.find((l) => l.id === "pension_adc")!.valueM;
      expect(Math.abs(dev)).toBeLessThan(0.5);
    }
  });

  it("pays the pension down toward full funding on schedule", () => {
    const years = run();
    const last = years[years.length - 1];
    expect(last.pensionFundedPct).toBeGreaterThan(85);
    expect(last.pensionUalM).toBeLessThan(3400 * 0.6);
  });

  it("recreates MP1: underpaying the pension compounds into bigger bills", () => {
    const base = run();
    const cheat = run({ ...sdDefaultConfig(), pension_payment: -100 });
    const baseLast = base[base.length - 1];
    const cheatLast = cheat[cheat.length - 1];
    // The hole grows...
    expect(cheatLast.pensionUalM).toBeGreaterThan(baseLast.pensionUalM + 800);
    expect(cheatLast.pensionFundedPct).toBeLessThan(baseLast.pensionFundedPct - 4);
    // ...and the growing bill claws back the skipped $100M: by 2040 the net "saving"
    // from continuing to underpay has shrunk to under $40M/yr and is still eroding.
    const dev2027 = cheat[0].lines.find((l) => l.id === "pension_adc")!.valueM;
    const dev2040 = cheatLast.lines.find((l) => l.id === "pension_adc")!.valueM;
    expect(dev2027).toBeLessThan(-95); // year one feels like free money
    expect(dev2040).toBeGreaterThan(-40); // the ghost collects

  });

  it("a Measure E-sized sales tax closes the gap for years", () => {
    const years = run({ ...sdDefaultConfig(), sales_tax_measure: 1 });
    expect(years[0].gapM).toBeLessThan(0); // FY2027 surplus
    const surplusYears = years.filter((y) => y.gapM < 0).length;
    expect(surplusYears).toBeGreaterThan(5);
  });

  it("cutting 200 budgeted officers saves ~$40M against the gap", () => {
    const base = run();
    const cut = run({ ...sdDefaultConfig(), sworn_officers: 1840 });
    const delta = base[0].gapM - cut[0].gapM;
    expect(delta).toBeGreaterThan(35);
    expect(delta).toBeLessThan(50);
  });

  it("repealing the trash fee reopens an ~$81M hole", () => {
    const base = run();
    const repeal = run({ ...sdDefaultConfig(), repeal_trash_fee: true });
    const delta = repeal[0].gapM - base[0].gapM;
    expect(delta).toBeGreaterThan(75);
    expect(delta).toBeLessThan(90);
  });
});

describe("New ideas from other cities", () => {
  it("the full slate roughly pays for its own programs", () => {
    const base = run();
    const slate = run({
      ...sdDefaultConfig(),
      mansion_tax: 4,
      payroll_tax: 1.2,
      pied_a_terre: true,
      delivery_fee: true,
      naming_rights: true,
      muni_grocery: true,
      guaranteed_income: 1000,
      free_buses: true,
    });
    // Revenue ideas (~$148M) minus spending ideas (~$72M) should improve the gap.
    const delta = base[0].gapM - slate[0].gapM;
    expect(delta).toBeGreaterThan(50);
    expect(delta).toBeLessThan(110);
  });

  it("every idea lever is cited", () => {
    for (const l of SD_ALL_LEVERS.filter((x) => x.category === "idea")) {
      expect(l.citationIds.length).toBeGreaterThan(0);
    }
  });
});

describe("San Diego scenarios", () => {
  it("every preset key maps to a real lever", () => {
    const ids = new Set(SD_ALL_LEVERS.map((l) => l.id));
    for (const s of SD_SCENARIOS) {
      for (const key of Object.keys(s.config)) {
        expect(ids.has(key), `${s.id} references unknown lever ${key}`).toBe(true);
      }
    }
  });

  it("'1996 all over again' ends with a deeper pension hole than the baseline", () => {
    const preset = SD_SCENARIOS.find((s) => s.id === "1996_again")!;
    const base = run();
    const ghost = run({ ...sdDefaultConfig(), ...preset.config });
    expect(ghost[ghost.length - 1].pensionUalM).toBeGreaterThan(base[base.length - 1].pensionUalM);
  });
});
