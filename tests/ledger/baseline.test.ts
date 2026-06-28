import { describe, it, expect } from "vitest";
import { BASELINE_2025 } from "@/lib/ledger/baseline";
import { getCitation } from "@/lib/citations";

const sum = (side: "revenue" | "spending") =>
  BASELINE_2025.filter((l) => l.side === side).reduce((s, l) => s + l.valueB, 0);

describe("FY2025 baseline reconciliation", () => {
  it("revenue totals ~5.0T within 2%", () => {
    expect(sum("revenue")).toBeGreaterThan(4900);
    expect(sum("revenue")).toBeLessThan(5100);
  });
  it("spending totals ~6.9T within 2%", () => {
    expect(sum("spending")).toBeGreaterThan(6760);
    expect(sum("spending")).toBeLessThan(7040);
  });
  it("deficit is ~1.9T", () => {
    const deficit = sum("spending") - sum("revenue");
    expect(deficit).toBeGreaterThan(1800);
    expect(deficit).toBeLessThan(2000);
  });
  it("every line has a registered citation", () => {
    for (const l of BASELINE_2025) {
      expect(l.citationId).toBeTruthy();
      expect(getCitation(l.citationId)).toBeDefined();
    }
  });
  it("line ids are unique", () => {
    const ids = BASELINE_2025.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
