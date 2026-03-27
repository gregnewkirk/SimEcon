"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { YearData } from "@/lib/types";
import { LAST_HISTORICAL_YEAR } from "@/lib/data/defaults";

interface DebtDeficitChartProps {
  data: YearData[];
  baselineData: YearData[];
  currentYear: number;
}

export function DebtDeficitChart({
  data,
  baselineData,
  currentYear,
}: DebtDeficitChartProps) {
  const chartData = useMemo(() => {
    const filtered = data.filter((d) => d.year <= currentYear);
    const baselineMap = new Map(baselineData.map((d) => [d.year, d]));

    return filtered.map((d) => ({
      year: d.year,
      debt: d.debtTrillions,
      baselineDebt: baselineMap.get(d.year)?.debtTrillions ?? null,
      deficit: Math.abs(d.deficitBillions) / 1000,
    }));
  }, [data, baselineData, currentYear]);

  const formatTrillion = (v: number) => `$${v.toFixed(0)}T`;

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-300">
        Debt & Deficit Over Time
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData}>
          <XAxis
            dataKey="year"
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#333" }}
          />
          <YAxis
            tickFormatter={formatTrillion}
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #333",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            itemStyle={{ padding: 0 }}
          />
          <ReferenceLine
            x={LAST_HISTORICAL_YEAR}
            stroke="#555"
            strokeDasharray="3 3"
            label={{
              value: "Projected \u25B8",
              position: "top",
              fill: "#71717a",
              fontSize: 10,
            }}
          />
          <Bar
            dataKey="deficit"
            name="Deficit"
            fill="#f0a500"
            opacity={0.4}
            radius={[2, 2, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="baselineDebt"
            name="Baseline Debt"
            stroke="#444"
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="debt"
            name="National Debt"
            stroke="#e94560"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
