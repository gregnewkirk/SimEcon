"use client";

import { motion } from "framer-motion";
import type { IncidenceResult } from "@/lib/incidence/compute";
import type { BracketId } from "@/lib/incidence/tables";
import { AnimatedNumber } from "./AnimatedNumber";
import { signedMoney } from "./format";
import { C, SHADOW_SM } from "./theme";

const US_POPULATION = 335_000_000;
const BRACKETS: { id: BracketId; label: string; icon: string; people: number }[] = [
  { id: "top1", label: "Top 1%", icon: "🎩", people: US_POPULATION * 0.01 },
  { id: "next9", label: "Next 9%", icon: "💼", people: US_POPULATION * 0.09 },
  { id: "middle40", label: "Middle 40%", icon: "🏠", people: US_POPULATION * 0.4 },
  { id: "bottom50", label: "Bottom 50%", icon: "🧑‍🏭", people: US_POPULATION * 0.5 },
];

function perPerson(billions: number, people: number): string {
  const dollars = (billions * 1e9) / people;
  const sign = dollars > 0 ? "+" : dollars < 0 ? "-" : "";
  const abs = Math.abs(dollars);
  const rounded = abs >= 1000 ? Math.round(abs / 10) * 10 : Math.round(abs);
  return `${sign}$${rounded.toLocaleString()}/person`;
}

export function BracketCharacters({ incidence }: { incidence: IncidenceResult }) {
  const max = Math.max(1, ...BRACKETS.map((b) => Math.abs(incidence[b.id])));
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {BRACKETS.map((b) => {
        const v = incidence[b.id];
        const gain = v >= 0;
        const color = v === 0 ? C.inkMute : gain ? C.green : C.red;
        const widthPct = (Math.abs(v) / max) * 100;
        return (
          <div key={b.id} className="rounded-2xl p-3 text-center" style={{ background: C.card, boxShadow: SHADOW_SM }}>
            <motion.div key={Math.round(v)} animate={{ scale: [1, 1.22, 1] }} transition={{ duration: 0.4 }} className="text-3xl leading-none">
              {b.icon}
            </motion.div>
            <div className="mt-1 text-[11px] font-medium" style={{ color: C.inkMute }}>{b.label}</div>
            <div className="mt-1 font-mono text-sm font-semibold tabular-nums" style={{ color }}>
              <AnimatedNumber value={v} format={(n) => (Math.abs(n) < 0.5 ? "$0" : `${signedMoney(n)}/yr`)} />
            </div>
            <div className="font-mono text-[11px]" style={{ color: v === 0 ? C.inkMute : color, opacity: 0.85 }}>
              {v === 0 ? "$0/person" : perPerson(v, b.people)}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: C.hair }}>
              <motion.div className="h-full rounded-full" style={{ background: gain ? C.greenFill : C.redFill }} animate={{ width: `${widthPct}%` }} transition={{ type: "spring", stiffness: 200, damping: 24 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
