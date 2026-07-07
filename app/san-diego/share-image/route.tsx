import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { decodeSdState, changedLevers } from "@/lib/sd/url-state";
import { projectSdForward } from "@/lib/sd/engine";
import { replaySdCounterfactual } from "@/lib/sd/replay";
import { SD_DEFAULT_ASSUMPTIONS } from "@/lib/sd/growth";
import { SD_LEVERS_BY_ID } from "@/lib/sd/levers";
import { SD_EVENTS_BY_ID } from "@/lib/sd/events";

export const runtime = "nodejs";

const fmt = (m: number) => {
  const abs = Math.abs(m);
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}B` : `$${Math.round(abs)}M`;
  return m < 0 ? `-${s}` : s;
};

function leverReadout(id: string, value: number | boolean): string {
  const lever = SD_LEVERS_BY_ID.get(id);
  if (!lever) return "";
  if (typeof value === "boolean") return value ? "on" : "off";
  const unit = lever.unit ?? "";
  if (unit === "$M") return `$${value}M`;
  if (unit === "officers") return `${value.toLocaleString("en-US")} officers`;
  return `${value.toLocaleString("en-US")}${unit}`;
}

/**
 * The social share card: 1200x630 PNG of the budget encoded in the query string.
 * Fix mode: FY2027 result + the changes made. Whatif mode: what the selected
 * historical decisions would be worth today.
 */
export async function GET(req: NextRequest) {
  const { cfg, mode, events } = decodeSdState(req.nextUrl.searchParams);

  let headline: string;
  let headlineColor: string;
  let sub: string;
  let rows: { text: string; good: boolean }[];

  if (mode === "whatif") {
    const r = replaySdCounterfactual(events, SD_DEFAULT_ASSUMPTIONS);
    headline = `${fmt(r.totalSavedM)} richer today`;
    headlineColor = "#1E9E4A";
    sub = "if San Diego had decided differently, 1996-2026";
    rows = events.slice(0, 5).map((id) => ({
      text: SD_EVENTS_BY_ID.get(id)?.label ?? id,
      good: true,
    }));
  } else {
    const years = projectSdForward(cfg, SD_DEFAULT_ASSUMPTIONS, { endYear: 2040 });
    const fy27 = years[0];
    const balanced = fy27.gapM < 0;
    headline = balanced ? `${fmt(-fy27.gapM)} surplus` : `${fmt(fy27.gapM)} budget gap`;
    headlineColor = balanced ? "#1E9E4A" : "#E0352B";
    sub = `my San Diego FY2027 budget · reserves ${fmt(fy27.reserveM)}`;
    const changes = changedLevers(cfg);
    rows = changes.slice(0, 5).map((c) => ({
      text: `${SD_LEVERS_BY_ID.get(c.id)?.label ?? c.id}: ${leverReadout(c.id, c.value)}`,
      good: balanced,
    }));
    if (changes.length > 5) rows.push({ text: `...and ${changes.length - 5} more changes`, good: balanced });
    if (changes.length === 0) rows = [{ text: "The FY2026 adopted budget, untouched", good: false }];
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#F2F2F7",
          padding: 56,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#1C1C1E", display: "flex" }}>
            Sim<span style={{ color: "#007AFF" }}>Econ</span>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#E07E00", display: "flex" }}>San Diego</div>
        </div>

        <div style={{ fontSize: 92, fontWeight: 800, color: headlineColor, marginTop: 28, display: "flex" }}>
          {headline}
        </div>
        <div style={{ fontSize: 32, color: "#8A8A8E", marginTop: 4, display: "flex" }}>{sub}</div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 36, gap: 14 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  background: r.good ? "#34C759" : "#FF9500",
                  display: "flex",
                }}
              />
              <div style={{ fontSize: 30, color: "#1C1C1E", display: "flex" }}>{r.text}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 26, color: "#8A8A8E", display: "flex" }}>
            Every number sourced: FY2026 Adopted Budget, IBA, SDCERS
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#007AFF", display: "flex" }}>sd.simecon.app</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
