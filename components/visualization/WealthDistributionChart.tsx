"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { YearData } from "@/lib/types";
import { WEALTH_BRACKETS, LAST_HISTORICAL_YEAR } from "@/lib/data/defaults";

interface WealthDistributionChartProps {
  data: YearData[];
  currentYear: number;
}

export function WealthDistributionChart({
  data,
  currentYear,
}: WealthDistributionChartProps) {
  const chartData = useMemo(() => {
    const filtered = data.filter((d) => d.year <= currentYear);
    return filtered.map((d) => {
      const row: Record<string, number> = { year: d.year };
      for (const bracket of WEALTH_BRACKETS) {
        row[bracket.id] = (d.wealthShares[bracket.id] ?? 0) * 100;
      }
      return row;
    });
  }, [data, currentYear]);

  const reversedBrackets = useMemo(
    () => [...WEALTH_BRACKETS].reverse(),
    []
  );

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-300">
        Wealth Distribution
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData}>
          <XAxis
            dataKey="year"
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#333" }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #333",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(value) => `${Number(value).toFixed(1)}%`}
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
          {reversedBrackets.map((bracket) => (
            <Area
              key={bracket.id}
              type="monotone"
              dataKey={bracket.id}
              name={bracket.label}
              stackId="1"
              fill={bracket.color}
              stroke={bracket.color}
              fillOpacity={0.8}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {WEALTH_BRACKETS.map((bracket) => (
          <div key={bracket.id} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: bracket.color }}
            />
            <span className="text-[11px] text-zinc-400">{bracket.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
