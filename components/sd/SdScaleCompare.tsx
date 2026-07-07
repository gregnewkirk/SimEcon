"use client";

import { getCitation } from "@/lib/citations";
import { moneyM } from "./format";
import { C } from "@/components/sim/theme";

/**
 * The "how big is each fight, really?" panel. Every FY2026 budget battle on one linear
 * scale, so the $1.7M restroom fight and the $703.5M police department sit on the same
 * axis - and a zoomed strip for everything overtime-sized and smaller, where the actual
 * headlines happened. All values are the researched FY2026 figures (see citations).
 */
interface CompareItem {
  label: string;
  valueM: number;
  kind: "spending" | "revenue" | "context";
  citationId: string;
  note?: string;
}

const ITEMS: CompareItem[] = [
  { label: "Police department (SDPD), total", valueM: 703.5, kind: "spending", citationId: "sd_iba_police" },
  { label: "Measure E would have raised (failed by 3,500 votes)", valueM: 400, kind: "context", citationId: "sd_measure_e_lever" },
  { label: "Pension payment, General Fund share", valueM: 378.1, kind: "spending", citationId: "sd_sdcers" },
  { label: "Trash fee: cost moved off the General Fund", valueM: 80.8, kind: "revenue", citationId: "sd_trash_lever" },
  { label: "Police overtime, typical actual spend", valueM: 51, kind: "spending", citationId: "sd_ot_audit", note: "budgeted $45.3M; overruns 10 of last 11 years" },
  { label: "Parking meter package (rates doubled, Sundays, surge)", valueM: 18.4, kind: "revenue", citationId: "sd_parking_lever" },
  { label: "Balboa Park & Zoo paid parking", valueM: 15.5, kind: "revenue", citationId: "sd_balboa_parking_lever" },
  { label: "Police overtime overrun alone (FY2023: $40.2M → $50.8M)", valueM: 10.6, kind: "spending", citationId: "sd_ot_audit" },
  { label: "Rec center hours cut, 60 → 40/week (proposed, reversed)", valueM: 10, kind: "spending", citationId: "sd_rec_hours" },
  { label: "Library Sunday + Monday closures", valueM: 8, kind: "spending", citationId: "sd_library_hours" },
  { label: "Restoring the 7-year tree-trimming cycle", valueM: 6, kind: "spending", citationId: "sd_trees" },
  { label: "Closing dozens of beach & park restrooms", valueM: 1.7, kind: "spending", citationId: "sd_restrooms" },
];

const ZOOM_CUTOFF_M = 60; // the second strip: everything overtime-sized and smaller

const KIND_COLOR: Record<CompareItem["kind"], string> = {
  spending: C.redFill,
  revenue: C.greenFill,
  context: C.amberFill,
};

function BarRow({ item, maxM }: { item: CompareItem; maxM: number }) {
  const cite = getCitation(item.citationId);
  const widthPct = Math.max(0.25, (item.valueM / maxM) * 100);
  return (
    <div className="py-1.5" title={cite ? `${cite.agency} - ${cite.dataset}` : undefined}>
      <div className="mb-0.5 flex items-baseline justify-between gap-2 text-[12px]">
        <span className="min-w-0 truncate" style={{ color: C.ink }}>
          {item.label}
          {item.note && <span style={{ color: C.inkMute }}> ({item.note})</span>}
        </span>
        <span className="shrink-0 font-mono font-semibold tabular-nums" style={{ color: C.ink }}>{moneyM(item.valueM)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: C.hair }}>
        <div className="h-full rounded-full" style={{ width: `${widthPct}%`, background: KIND_COLOR[item.kind] }} />
      </div>
    </div>
  );
}

export function SdScaleCompare() {
  const maxAll = Math.max(...ITEMS.map((i) => i.valueM));
  const zoomed = ITEMS.filter((i) => i.valueM <= ZOOM_CUTOFF_M);
  const maxZoom = Math.max(...zoomed.map((i) => i.valueM));
  return (
    <div>
      <p className="mb-3 text-[12px] leading-relaxed" style={{ color: C.inkMute }}>
        Every FY2026 budget fight on one scale. The restroom closures and paid parking that
        dominated headlines are slivers next to the police department - and the police
        overtime <em>overrun alone</em> outweighs several of them combined.
      </p>
      {ITEMS.map((i) => <BarRow key={i.label} item={i} maxM={maxAll} />)}

      <h3 className="mb-1 mt-5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>
        Zoomed in: the fights under {moneyM(ZOOM_CUTOFF_M)}
      </h3>
      {zoomed.map((i) => <BarRow key={i.label} item={i} maxM={maxZoom} />)}

      <div className="mt-3 flex flex-wrap gap-3 text-[10px]" style={{ color: C.inkMute }}>
        <LegendDot color={KIND_COLOR.spending} label="what it costs" />
        <LegendDot color={KIND_COLOR.revenue} label="what it raises / saves the General Fund" />
        <LegendDot color={KIND_COLOR.context} label="for scale" />
        <span>Hover a row for its source.</span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="inline-block size-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
