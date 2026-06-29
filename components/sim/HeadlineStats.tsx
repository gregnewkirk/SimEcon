"use client";

import type { YearData } from "@/lib/ledger/types";
import { AnimatedNumber } from "./AnimatedNumber";
import { ShowYourWork } from "./ShowYourWork";
import { money, trillions, pct } from "./format";

/**
 * The instrument cluster: revenue in, spending out, the gap, and the debt it piles up.
 * Color is functional - green is money in, red is money out and debt.
 */
export function HeadlineStats({ year }: { year: YearData }) {
  const surplus = year.deficitB < 0;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Revenue" hint={<ShowYourWork year={year} side="revenue" label="Revenue" />}>
        <AnimatedNumber value={year.revenueB} format={money} className="text-emerald-400" />
      </Stat>
      <Stat label="Spending" hint={<ShowYourWork year={year} side="spending" label="Spending" />}>
        <AnimatedNumber value={year.spendingB} format={money} className="text-rose-400" />
      </Stat>
      <Stat label={surplus ? "Surplus" : "Deficit"}>
        <AnimatedNumber
          value={Math.abs(year.deficitB)}
          format={money}
          className={surplus ? "text-emerald-400" : "text-rose-400"}
        />
      </Stat>
      <Stat label={`Debt / GDP ${pct(year.debtToGdp)}`}>
        <AnimatedNumber value={year.debtT * 1000} format={trillions} className="text-amber-400" />
      </Stat>
    </div>
  );
}

function Stat({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 px-3 py-2.5">
      <div className="mb-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
        {hint}
      </div>
      <div className="font-mono text-2xl font-semibold tabular-nums">{children}</div>
    </div>
  );
}
