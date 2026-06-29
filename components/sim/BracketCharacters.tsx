"use client";

import type { IncidenceResult } from "@/lib/incidence/compute";
import type { BracketId } from "@/lib/incidence/tables";
import { AnimatedNumber } from "./AnimatedNumber";
import { signedMoney } from "./format";

// US population ~335M, split by the bracket population shares (1 / 9 / 40 / 50).
const US_POPULATION = 335_000_000;
const BRACKETS: { id: BracketId; label: string; icon: string; people: number }[] = [
  { id: "top1", label: "Top 1%", icon: "🎩", people: US_POPULATION * 0.01 },
  { id: "next9", label: "Next 9%", icon: "💼", people: US_POPULATION * 0.09 },
  { id: "middle40", label: "Middle 40%", icon: "🏠", people: US_POPULATION * 0.4 },
  { id: "bottom50", label: "Bottom 50%", icon: "🧑‍🏭", people: US_POPULATION * 0.5 },
];

/** Aggregate $B/yr for a group converted to dollars per person, rounded to the nearest $10. */
function perPerson(billions: number, people: number): string {
  const dollars = (billions * 1e9) / people;
  const sign = dollars > 0 ? "+" : dollars < 0 ? "-" : "";
  const abs = Math.abs(dollars);
  const rounded = abs >= 1000 ? Math.round(abs / 10) * 10 : Math.round(abs);
  return `${sign}$${rounded.toLocaleString()}/person`;
}

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
            <div
              className={`font-mono text-[11px] tabular-nums ${
                v === 0 ? "text-muted-foreground/60" : gain ? "text-emerald-400/70" : "text-rose-400/70"
              }`}
            >
              {v === 0 ? "$0/person" : perPerson(v, b.people)}
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
