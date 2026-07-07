import { describe, it, expect } from "vitest";
import { encodeSdState, decodeSdState, changedLevers } from "@/lib/sd/url-state";
import { sdDefaultConfig } from "@/lib/sd/levers";

describe("San Diego share-URL state", () => {
  it("baseline budget encodes to an empty query string", () => {
    expect(encodeSdState(sdDefaultConfig(), "fix", []).toString()).toBe("");
  });

  it("round-trips lever changes, mode, and events", () => {
    const cfg = { ...sdDefaultConfig(), sworn_officers: 2200, police_raise: 5, repeal_trash_fee: true };
    const params = encodeSdState(cfg, "whatif", ["mp1_mp2", "ash_101"]);
    const back = decodeSdState(params);
    expect(back.cfg.sworn_officers).toBe(2200);
    expect(back.cfg.police_raise).toBe(5);
    expect(back.cfg.repeal_trash_fee).toBe(true);
    expect(back.mode).toBe("whatif");
    expect(back.events).toEqual(["mp1_mp2", "ash_101"]);
    expect(changedLevers(back.cfg).map((c) => c.id).sort()).toEqual(
      ["police_raise", "repeal_trash_fee", "sworn_officers"]
    );
  });

  it("clamps out-of-range values and ignores junk params", () => {
    const params = new URLSearchParams("l.sworn_officers=99999&l.not_a_lever=5&l.police_raise=banana&other=1");
    const back = decodeSdState(params);
    expect(back.cfg.sworn_officers).toBe(2400); // clamped to range max
    expect(back.cfg.police_raise).toBe(0); // non-numeric ignored, stays baseline
    expect("not_a_lever" in back.cfg).toBe(false);
  });
});
