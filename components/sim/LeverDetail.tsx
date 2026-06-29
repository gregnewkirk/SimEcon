"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import type { Lever, LeverConfig } from "@/lib/levers/types";
import { getCitation } from "@/lib/citations";
import { LEVER_DESCRIPTIONS } from "@/lib/levers/descriptions";
import { leverProjection } from "./leverProjection";
import { signedMoney } from "./format";

/**
 * Click-to-open detail for a single lever: what it does, its scored effect now and the
 * projection to 2050, and the source behind the number.
 */
export function LeverDetail({ lever, cfg }: { lever: Lever; cfg: LeverConfig }) {
  const desc = LEVER_DESCRIPTIONS[lever.id];
  const proj = leverProjection(lever, cfg);
  const cite = getCitation(lever.citationIds[0]);

  const verb =
    proj.kind === "spending"
      ? lever.range
        ? "Spending change"
        : "Net cost"
      : "Revenue";
  const enabledHint = !lever.range && cfg[lever.id] !== true ? " (if enabled)" : "";

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Details for ${lever.label}`}
        className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <Info className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 text-xs">
        <p className="mb-1 flex items-center gap-2 font-mono text-sm font-semibold">
          {lever.label}
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
              lever.contested
                ? "bg-amber-500/15 text-amber-400"
                : lever.tier === "calibrated"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-sky-500/15 text-sky-400"
            }`}
          >
            {lever.contested ? "contested" : lever.tier}
          </span>
        </p>

        {desc && <p className="mb-3 leading-relaxed text-muted-foreground">{desc}</p>}

        <div className="mb-3 space-y-1 rounded-md border border-border/50 bg-card/40 p-2 font-mono">
          <Row label={`${verb}${enabledHint}, FY2026`} value={proj.y2026} />
          <Row label="Projected FY2050" value={proj.y2050} muted />
        </div>

        {cite && (
          <p className="text-[10px] text-muted-foreground">
            Source:{" "}
            {cite.url ? (
              <a href={cite.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {cite.agency}
              </a>
            ) : (
              cite.agency
            )}
            , {cite.dataset}.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  const display = Math.abs(value) < 0.5 ? "no change at current setting" : `${signedMoney(value)}/yr`;
  return (
    <div className={`flex justify-between ${muted ? "text-muted-foreground" : ""}`}>
      <span className="font-sans">{label}</span>
      <span className="tabular-nums">{display}</span>
    </div>
  );
}
