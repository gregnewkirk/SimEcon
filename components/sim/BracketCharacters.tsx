"use client";

import type { IncidenceResult } from "@/lib/incidence/compute";
import type { BracketId } from "@/lib/incidence/tables";
import { AnimatedNumber } from "./AnimatedNumber";
import { signedMoney } from "./format";

const BRACKETS: { id: BracketId; label: string; icon: string }[] = [
  { id: "top1", label: "Top 1%", icon: "🎩" },
  { id: "next9", label: "Next 9%", icon: "💼" },
  { id: "middle40", label: "Middle 40%", icon: "🏠" },
  { id: "bottom50", label: "Bottom 50%", icon: "🧑‍🏭" },
];

/**
 * Who pays, who gains. Each group is a character whose net annual change reacts live as you
 * move levers. Numbers are aggregate $/yr across the group, from cited incidence tables.
 */
export function BracketCharacters({ incidence }: { incidence: IncidenceResult }) {
  const max = Math.max(1, ...BRACKETS.map((b) => Math.abs(incidence[b.id])));
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {BRACKETS.map((b) => {
        const v = incidence[b.id];
        const gain = v >= 0;
        const widthPct = (Math.abs(v) / max) * 100;
        return (
          <div key={b.id} className="rounded-lg border border-border/60 bg-card/60 p-3 text-center">
            <div className="text-2xl leading-none">{b.icon}</div>
            <div className="mt-1 text-[11px] font-medium text-muted-foreground">{b.label}</div>
            <div
              className={`mt-1 font-mono text-sm font-semibold tabular-nums ${
                v === 0 ? "text-muted-foreground" : gain ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              <AnimatedNumber value={v} format={(n) => (Math.abs(n) < 0.5 ? "$0" : `${signedMoney(n)}/yr`)} />
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border/40">
              <div
                className={`h-full rounded-full transition-all duration-500 ${gain ? "bg-emerald-400" : "bg-rose-400"}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
