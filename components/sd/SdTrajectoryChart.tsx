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
import type { SdYearData } from "@/lib/sd/types";
import type { SdWhatIfPoint } from "@/lib/sd/replay";

/**
 * Fix mode: the General Fund reserve trajectory to 2040 against the city's 16.7% reserve
 * target, with the budget gap as bars-like area underneath. Reserves hitting zero is the
 * "game over" line - after that every remaining gap is a forced cut.
 * Whatif mode: cumulative money the city would have today had it decided differently.
 */
export function SdTrajectoryChart({
  mode,
  years,
  whatIfPoints,
}: {
  mode: "fix" | "whatif";
  years?: SdYearData[];
  whatIfPoints?: SdWhatIfPoint[];
}) {
  if (mode === "fix" && years) {
    const data = years.map((y) => ({
      year: y.year,
      reserves: Math.round(y.reserveM),
      target: Math.round((16.7 / 100) * y.revenueM),
      forcedCuts: Math.round(y.unfundedGapM),
    }));
    return (
      <ChartShell>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
          <XAxis dataKey="year" tick={tick} stroke="var(--border)" />
          <YAxis tick={tick} stroke="var(--border)" width={56} tickFormatter={(v) => `$${Number(v).toLocaleString()}M`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => `$${Number(v).toLocaleString()}M`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={0} stroke="#8A8A8E" strokeDasharray="2 2" />
          <Area dataKey="forcedCuts" stroke="none" fill="#f43f5e" fillOpacity={0.12} name="Forced cuts (cumulative)" />
          <Line dataKey="target" stroke="#8A8A8E" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Reserve target (16.7%)" />
          <Line dataKey="reserves" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Reserves" />
        </ComposedChart>
      </ChartShell>
    );
  }

  const data = (whatIfPoints ?? []).map((p) => ({
    year: p.year,
    saved: Math.round(p.cumSavedM),
  }));
  return (
    <ChartShell>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
        <XAxis dataKey="year" tick={tick} stroke="var(--border)" />
        <YAxis tick={tick} stroke="var(--border)" width={56} tickFormatter={(v) => `$${Number(v).toLocaleString()}M`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => `$${Number(v).toLocaleString()}M`} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line dataKey="saved" stroke="#34d399" strokeWidth={2.5} dot={false} name="Money the city would have (cumulative)" />
      </ComposedChart>
    </ChartShell>
  );
}

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
