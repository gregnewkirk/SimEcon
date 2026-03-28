"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { YearData } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fmt = any;

interface RevenueSpendingChartProps {
  data: YearData[];
  currentYear: number;
}

const AXIS_STYLE = { fontSize: 10, fill: "#71717a" };

export function RevenueSpendingChart({ data, currentYear }: RevenueSpendingChartProps) {
  const filtered = data.filter((d) => d.year <= currentYear);
  const chartData = filtered.map((d) => ({
    year: d.year,
    Revenue: d.revenueBillions,
    Spending: d.spendingBillions,
  }));

  return (
    <div className="rounded-lg border border-zinc-800 bg-card p-4">
      <h3 className="mb-1 text-sm font-semibold text-zinc-300">
        Revenue vs Spending
      </h3>
      <p className="mb-3 text-xs text-zinc-500">
        The gap between the areas is the deficit (or surplus)
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="year" tick={AXIS_STYLE} />
          <YAxis
            tick={AXIS_STYLE}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}T`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={((value: number) => [`$${value.toLocaleString()}B`, ""]) as Fmt}
          />
          <Area
            type="monotone"
            dataKey="Spending"
            fill="#e9456040"
            stroke="#e94560"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Revenue"
            fill="#2dd4bf30"
            stroke="#2dd4bf"
            strokeWidth={2}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
