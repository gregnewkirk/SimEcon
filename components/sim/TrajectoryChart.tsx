"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import type { YearData } from "@/lib/ledger/types";

const CONE_START_OFFSET = 10; // years past the start before uncertainty widens

/**
 * Fix mode: debt-to-GDP from 2026 to 2050, with a widening uncertainty cone past ~10 years
 * because no one can credibly forecast 2050. Whatif mode: actual vs counterfactual debt.
 */
export function TrajectoryChart({
  mode,
  years,
  actual,
  counterfactual,
}: {
  mode: "fix" | "whatif";
  years: YearData[];
  actual: YearData[];
  counterfactual: YearData[];
}) {
  if (mode === "fix") {
    const start = years[0]?.year ?? 2026;
    const data = years.map((y) => {
      const beyond = Math.max(0, y.year - (start + CONE_START_OFFSET));
      const spread = y.debtToGdp * 0.012 * beyond; // widening band
      return {
        year: y.year,
        debtToGdp: round(y.debtToGdp),
        band: beyond > 0 ? [round(y.debtToGdp - spread), round(y.debtToGdp + spread)] : undefined,
      };
    });
    // The headline question: when are we debt-free? A zero-crossing inside the
    // projection wins; otherwise extrapolate the final years' pace beyond 2050.
    const crossed = years.find((y) => y.debtT <= 0);
    let debtFree: { year: number; extrapolated: boolean } | null = null;
    if (crossed) {
      debtFree = { year: crossed.year, extrapolated: false };
    } else if (years.length >= 4) {
      const last = years[years.length - 1];
      const pace = (last.debtT - years[years.length - 4].debtT) / 3; // $T per year
      if (pace < -0.01) debtFree = { year: last.year + Math.ceil(last.debtT / -pace), extrapolated: true };
    }
    const endRising = !debtFree && years.length >= 2 && years[years.length - 1].debtT >= years[0].debtT;

    return (
      <div>
        {debtFree && !debtFree.extrapolated && (
          <div className="mb-3 rounded-2xl px-4 py-3 text-center" style={{ background: "#ecfdf5", border: "1px solid #34d399" }}>
            <div className="text-xl font-bold tabular-nums" style={{ color: "#047857" }}>
              🎉 Debt-free by {debtFree.year}
            </div>
            <div className="text-xs" style={{ color: "#059669" }}>
              {debtFree.year - start} years from now, on your current settings
            </div>
          </div>
        )}
        {debtFree && debtFree.extrapolated && (
          <div className="mb-3 rounded-2xl px-4 py-3 text-center" style={{ background: "#fffbeb", border: "1px solid #f59e0b" }}>
            <div className="text-lg font-bold tabular-nums" style={{ color: "#b45309" }}>
              On track: debt-free around {debtFree.year}
            </div>
            <div className="text-xs" style={{ color: "#b45309" }}>
              {debtFree.year - start} years from now, extrapolating today&apos;s pace beyond 2050
            </div>
          </div>
        )}
        {!debtFree && (
          <div className="mb-3 rounded-2xl px-4 py-3 text-center" style={{ background: "#fff1f2", border: "1px solid #f43f5e" }}>
            <div className="text-lg font-bold" style={{ color: "#be123c" }}>
              Debt-free: never on this path
            </div>
            <div className="text-xs" style={{ color: "#be123c" }}>
              {endRising ? "The debt keeps growing. Pull harder on the levers." : "The debt shrinks but never hits zero — close, keep pushing."}
            </div>
          </div>
        )}
        <ChartShell>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
            <XAxis dataKey="year" tick={tick} stroke="var(--border)" />
            <YAxis tick={tick} stroke="var(--border)" unit="%" width={44} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${Number(v)}%`} />
            <Area dataKey="band" stroke="none" fill="#f59e0b" fillOpacity={0.12} name="Uncertainty" />
            <Line dataKey="debtToGdp" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Debt / GDP" />
            {debtFree && !debtFree.extrapolated && (
              <ReferenceLine x={debtFree.year} stroke="#34d399" strokeWidth={2} strokeDasharray="4 3" label={{ value: "$0 debt", fontSize: 11, fill: "#047857", position: "top" }} />
            )}
            {debtFree && !debtFree.extrapolated && <ReferenceLine y={0} stroke="#34d399" strokeOpacity={0.5} />}
          </ComposedChart>
        </ChartShell>
      </div>
    );
  }

  const map = new Map(counterfactual.map((c) => [c.year, c.debtT]));
  const data = actual.map((a) => ({
    year: a.year,
    actual: round(a.debtT),
    counterfactual: round(map.get(a.year) ?? a.debtT),
  }));
  return (
    <ChartShell>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
        <XAxis dataKey="year" tick={tick} stroke="var(--border)" />
        <YAxis tick={tick} stroke="var(--border)" unit="T" width={44} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => `$${Number(v)}T`} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line dataKey="actual" stroke="#f43f5e" strokeWidth={2.5} dot={false} name="What happened" />
        <Line dataKey="counterfactual" stroke="#34d399" strokeWidth={2.5} dot={false} name="What if we had..." />
      </ComposedChart>
    </ChartShell>
  );
}

const round = (n: number) => Math.round(n * 10) / 10;
const tick = { fontSize: 11, fill: "#8A8A8E" };
const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E5E5EA",
  borderRadius: 12,
  fontSize: 12,
  color: "#1C1C1E",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

function ChartShell({ children }: { children: React.ReactElement }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
