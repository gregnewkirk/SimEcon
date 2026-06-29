"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import type { YearData } from "@/lib/ledger/types";
import { getCitation } from "@/lib/citations";
import { LEVERS_BY_ID } from "@/lib/levers/registry";
import { money, signedMoney } from "./format";

/**
 * Expands a headline number into its full trace: each budget line on the side, its
 * baseline value, and every lever that moved it, with the source behind each figure.
 * This is the credibility spine - no number on screen is unsourced.
 */
export function ShowYourWork({
  year,
  side,
  label,
}: {
  year: YearData;
  side: "revenue" | "spending";
  label: string;
}) {
  const lines = year.lines.filter((l) => l.side === side);

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Show your work for ${label}`}
        className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <Info className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-96 w-96 overflow-auto text-xs">
        <p className="mb-2 font-mono text-sm font-semibold">{label} - Show your work</p>
        <div className="space-y-2">
          {lines.map((l) => {
            const prov = year.provenance[l.id] ?? [];
            const levers = prov.filter((p) => p.source !== "baseline");
            return (
              <div key={l.id} className="border-b border-border/40 pb-1.5 last:border-0">
                <div className="flex justify-between font-medium">
                  <span>{l.label}</span>
                  <span className="font-mono">{money(l.valueB)}</span>
                </div>
                {levers.map((p, i) => {
                  const lever = LEVERS_BY_ID.get(p.source);
                  const cite = getCitation(p.citationId);
                  return (
                    <div key={i} className="flex justify-between pl-3 text-muted-foreground">
                      <span title={cite ? `${cite.agency}, ${cite.dataset}` : undefined}>
                        {lever?.label ?? p.source}
                        {cite ? ` (${cite.agency})` : ""}
                      </span>
                      <span className="font-mono">{signedMoney(p.amountB)}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
