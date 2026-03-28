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

const AXIS_STYLE = { fontSize: 10, fill: "#86868b" };

export function RevenueSpendingChart({ data, currentYear }: RevenueSpendingChartProps) {
  const filtered = data.filter((d) => d.year <= currentYear);
  const chartData = filtered.map((d) => ({
    year: d.year,
    Revenue: d.revenueBillions,
    Spending: d.spendingBillions,
  }));

  return (
    <div className="rounded-lg border border-[#e5e5ea] bg-white shadow-sm p-4">
      <h3 className="mb-1 text-sm font-semibold text-[#1d1d1f]">
        Revenue vs Spending
      </h3>
      <p className="mb-3 text-xs text-[#86868b]">
        The gap between the areas is the deficit (or surplus)
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" />
          <XAxis dataKey="year" tick={AXIS_STYLE} />
          <YAxis
            tick={AXIS_STYLE}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}T`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5ea", borderRadius: 8, color: "#1d1d1f" }}
            labelStyle={{ color: "#86868b" }}
            formatter={((value: number) => [`$${value.toLocaleString()}B`, ""]) as Fmt}
          />
          <Area
            type="monotone"
            dataKey="Spending"
            fill="#ff3b3020"
            stroke="#ff3b30"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Revenue"
            fill="#34c75920"
            stroke="#34c759"
            strokeWidth={2}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#86868b" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
