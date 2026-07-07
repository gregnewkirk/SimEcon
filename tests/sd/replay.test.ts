import { describe, it, expect } from "vitest";
import { replaySdCounterfactual } from "@/lib/sd/replay";
import { SD_COUNTER_EVENTS } from "@/lib/sd/events";
import { SD_DEFAULT_ASSUMPTIONS } from "@/lib/sd/growth";
import { getCitation } from "@/lib/citations";

describe("San Diego what-if replay", () => {
  it("no events selected means nothing saved", () => {
    const r = replaySdCounterfactual([], SD_DEFAULT_ASSUMPTIONS);
    expect(r.totalSavedM).toBe(0);
    expect(r.rawSpentM).toBe(0);
    expect(r.annualRoomTodayM).toBe(0);
  });

  it("every event is cited and windowed sanely", () => {
    for (const e of SD_COUNTER_EVENTS) {
      expect(getCitation(e.citationId), `missing citation ${e.citationId}`).toBeDefined();
      expect(e.startYear).toBeGreaterThanOrEqual(1996);
      expect(e.endYear).toBeGreaterThanOrEqual(e.startYear);
      expect(e.endYear).toBeLessThanOrEqual(2026);
      expect(e.annualCostM).toBeGreaterThan(0);
    }
  });

  it("compounding beats the raw dollars (that is the point)", () => {
    const r = replaySdCounterfactual(["mp1_mp2"], SD_DEFAULT_ASSUMPTIONS);
    expect(r.rawSpentM).toBeCloseTo(45 * 13, 0);
    expect(r.totalSavedM).toBeGreaterThan(r.rawSpentM * 2);
  });

  it("the pension scandal counterfactual is on the scale of today's UAL", () => {
    const r = replaySdCounterfactual(["mp1_mp2", "psc_credits", "prop_b", "scandal_cleanup"], SD_DEFAULT_ASSUMPTIONS);
    // Should recover a large share of the $3.4B hole - the era's compounding did the damage.
    expect(r.totalSavedM).toBeGreaterThan(1800);
    expect(r.totalSavedM).toBeLessThan(4500);
  });

  it("101 Ash total lands near its reported ~$200M cost", () => {
    const r = replaySdCounterfactual(["ash_101"], SD_DEFAULT_ASSUMPTIONS);
    expect(r.rawSpentM).toBeCloseTo(200, -1);
  });

  it("ongoing room adds up across selected events", () => {
    const r = replaySdCounterfactual(["measure_e_2024", "petco_debt"], SD_DEFAULT_ASSUMPTIONS);
    expect(r.annualRoomTodayM).toBeCloseTo(411.3, 1);
  });

  it("cumulative series is monotonic while events are active", () => {
    const r = replaySdCounterfactual(["ticket_guarantee"], SD_DEFAULT_ASSUMPTIONS);
    for (let i = 1; i < r.points.length; i++) {
      expect(r.points[i].cumSavedM).toBeGreaterThanOrEqual(r.points[i - 1].cumSavedM);
    }
  });
});
