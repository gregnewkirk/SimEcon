import { describe, it, expect } from "vitest";
import { SD_BASELINE_2026, SD_FISCAL } from "@/lib/sd/baseline";
import { getCitation } from "@/lib/citations";

describe("San Diego FY2026 baseline", () => {
  const revenue = SD_BASELINE_2026.filter((l) => l.side === "revenue").reduce((s, l) => s + l.valueM, 0);
  const spending = SD_BASELINE_2026.filter((l) => l.side === "spending").reduce((s, l) => s + l.valueM, 0);

  it("adopts a balanced ~$2.17B General Fund", () => {
    expect(revenue).toBeGreaterThan(2150);
    expect(revenue).toBeLessThan(2190);
    expect(Math.abs(revenue - spending)).toBeLessThan(1);
  });

  it("police is the largest department line", () => {
    const spendLines = SD_BASELINE_2026.filter((l) => l.side === "spending");
    const biggest = spendLines.reduce((a, b) => (b.valueM > a.valueM ? b : a));
    expect(biggest.id).toBe("police");
    expect(biggest.valueM).toBeCloseTo(703.5, 1);
    // ~32% of the General Fund, per IBA
    expect(biggest.valueM / spending).toBeGreaterThan(0.31);
    expect(biggest.valueM / spending).toBeLessThan(0.34);
  });

  it("every line has a registered citation and a unique id", () => {
    const ids = new Set<string>();
    for (const l of SD_BASELINE_2026) {
      expect(ids.has(l.id), `duplicate id ${l.id}`).toBe(false);
      ids.add(l.id);
      expect(getCitation(l.citationId), `missing citation ${l.citationId}`).toBeDefined();
    }
  });

  it("carries the researched fiscal facts", () => {
    expect(SD_FISCAL.reserveM).toBeCloseTo(207.1, 1);
    expect(SD_FISCAL.pensionUalM).toBe(3400);
    // GF share of the $533M ADC should be ~$378M
    const adcGf = SD_FISCAL.pensionGfShare * (SD_FISCAL.pensionNormalCostM + SD_FISCAL.pensionAmortFactor * SD_FISCAL.pensionUalM);
    expect(adcGf).toBeGreaterThan(360);
    expect(adcGf).toBeLessThan(395);
  });
});
