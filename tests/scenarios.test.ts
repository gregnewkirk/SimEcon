import { describe, it, expect } from "vitest";
import { SCENARIOS } from "@/lib/scenarios";
import { LEVERS_BY_ID } from "@/lib/levers/registry";
import { projectForward } from "@/lib/engine/project-forward";
import { DEFAULT_ASSUMPTIONS as A } from "@/lib/ledger/growth";
import { defaultConfig } from "@/lib/levers/registry";

describe("preset scenarios", () => {
  it("every config key references a real lever", () => {
    for (const s of SCENARIOS) {
      for (const key of Object.keys(s.config)) {
        expect(LEVERS_BY_ID.has(key), `${s.id} references unknown lever ${key}`).toBe(true);
      }
    }
  });

  it("the Balance plan cuts the deficit vs current law", () => {
    const balance = SCENARIOS.find((s) => s.id === "balance")!;
    const base = projectForward(defaultConfig(), A, { useDynamic: false, endYear: 2030 });
    const balanced = projectForward({ ...defaultConfig(), ...balance.config }, A, { useDynamic: false, endYear: 2030 });
    expect(balanced[0].deficitB).toBeLessThan(base[0].deficitB);
  });

  it("Trump 2025 widens the deficit (tax cuts)", () => {
    const trump = SCENARIOS.find((s) => s.id === "trump2025")!;
    const base = projectForward(defaultConfig(), A, { useDynamic: false, endYear: 2030 });
    const cut = projectForward({ ...defaultConfig(), ...trump.config }, A, { useDynamic: false, endYear: 2030 });
    expect(cut[0].deficitB).toBeGreaterThan(base[0].deficitB);
  });
});
