"use client";

import { motion } from "framer-motion";
import type { SdYearData } from "@/lib/sd/types";
import { AnimatedNumber } from "@/components/sim/AnimatedNumber";
import { SdShowYourWork } from "./SdShowYourWork";
import { moneyM, pct } from "./format";
import { C, SHADOW_SM, SPRING } from "@/components/sim/theme";

/** The instrument cluster: revenue, spending, the gap, reserves, and the pension. */
export function SdHeadlineStats({ year }: { year: SdYearData }) {
  const surplus = year.gapM < 0;
  const reservesLow = year.reservePct < 8;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Revenue" color={C.green} hint={<SdShowYourWork year={year} side="revenue" label="Revenue" />}>
        <AnimatedNumber value={year.revenueM} format={moneyM} />
      </Stat>
      <Stat label="Spending" color={C.red} hint={<SdShowYourWork year={year} side="spending" label="Spending" />}>
        <AnimatedNumber value={year.spendingM} format={moneyM} />
      </Stat>
      <Stat label={surplus ? "Surplus" : "Budget gap"} color={surplus ? C.green : C.red}>
        <AnimatedNumber value={Math.abs(year.gapM)} format={moneyM} />
      </Stat>
      <Stat
        label={`Reserves ${pct(year.reservePct, 1)} of revenue`}
        color={reservesLow ? C.red : C.amber}
      >
        <AnimatedNumber value={year.reserveM} format={moneyM} />
      </Stat>
    </div>
  );
}

function Stat({
  label,
  color,
  hint,
  children,
}: {
  label: string;
  color: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      style={{ background: C.card, boxShadow: SHADOW_SM }}
      className="rounded-2xl px-4 py-3"
    >
      <div className="mb-0.5 flex items-center gap-1 text-xs font-medium" style={{ color: C.inkMute }}>
        {label}
        {hint}
      </div>
      <div className="font-mono text-2xl font-semibold tabular-nums" style={{ color }}>
        {children}
      </div>
    </motion.div>
  );
}
