"use client";

import { motion } from "framer-motion";
import type { YearData } from "@/lib/ledger/types";
import { AnimatedNumber } from "./AnimatedNumber";
import { ShowYourWork } from "./ShowYourWork";
import { money, trillions, pct } from "./format";
import { C, SHADOW_SM, SPRING } from "./theme";

/** The instrument cluster as iOS widget cards. Color is functional: green in, red out. */
export function HeadlineStats({ year }: { year: YearData }) {
  const surplus = year.deficitB < 0;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Revenue" color={C.green} hint={<ShowYourWork year={year} side="revenue" label="Revenue" />}>
        <AnimatedNumber value={year.revenueB} format={money} />
      </Stat>
      <Stat label="Spending" color={C.red} hint={<ShowYourWork year={year} side="spending" label="Spending" />}>
        <AnimatedNumber value={year.spendingB} format={money} />
      </Stat>
      <Stat label={surplus ? "Surplus" : "Deficit"} color={surplus ? C.green : C.red}>
        <AnimatedNumber value={Math.abs(year.deficitB)} format={money} />
      </Stat>
      <Stat label={`Gross debt / GDP ${pct(year.debtToGdp)}`} color={C.amber}>
        <AnimatedNumber value={year.debtT * 1000} format={trillions} />
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
