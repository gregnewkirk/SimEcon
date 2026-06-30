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
    return (
      <ChartShell>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
          <XAxis dataKey="year" tick={tick} stroke="var(--border)" />
          <YAxis tick={tick} stroke="var(--border)" unit="%" width={44} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${Number(v)}%`} />
          <Area dataKey="band" stroke="none" fill="#f59e0b" fillOpacity={0.12} name="Uncertainty" />
          <Line dataKey="debtToGdp" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Debt / GDP" />
        </ComposedChart>
      </ChartShell>
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
