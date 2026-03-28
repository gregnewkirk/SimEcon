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
  Label,
} from "recharts";
import type { YearData } from "@/lib/types";
import { LAST_HISTORICAL_YEAR } from "@/lib/data/defaults";

interface DebtDeficitChartProps {
  data: YearData[];
  baselineData: YearData[];
  currentYear: number;
  whatIfCounterfactual?: YearData[];
  whatIfDelta?: { debtDeltaTrillions: number } | null;
  isRevisionMode?: boolean;
}

export function DebtDeficitChart({
  data,
  baselineData,
  currentYear,
  whatIfCounterfactual,
  whatIfDelta,
  isRevisionMode = false,
}: DebtDeficitChartProps) {
  const chartData = useMemo(() => {
    const filtered = data.filter((d) => d.year <= currentYear);
    const baselineMap = new Map(baselineData.map((d) => [d.year, d]));
    const cfMap = whatIfCounterfactual
      ? new Map(whatIfCounterfactual.map((d) => [d.year, d]))
      : null;

    return filtered.map((d) => ({
      year: d.year,
      debt: d.debtTrillions,
      baselineDebt: baselineMap.get(d.year)?.debtTrillions ?? null,
      deficit: Math.abs(d.deficitBillions) / 1000,
      counterfactualDebt: cfMap?.get(d.year)?.debtTrillions ?? null,
    }));
  }, [data, baselineData, whatIfCounterfactual, currentYear]);

  const formatTrillion = (v: number) => `$${v.toFixed(2)}T`;

  const deltaLabel =
    whatIfDelta != null
      ? whatIfDelta.debtDeltaTrillions >= 0
        ? `Without these events, debt would be $${Math.abs(whatIfDelta.debtDeltaTrillions).toFixed(2)}T higher`
        : `Without these events, debt would be $${Math.abs(whatIfDelta.debtDeltaTrillions).toFixed(2)}T lower`
      : null;

  return (
    <div className="rounded-lg border border-[#e5e5ea] bg-white shadow-sm p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1d1d1f]">
          {isRevisionMode ? "Alternate Timeline: Debt & Deficit" : "Debt & Deficit Over Time"}
        </h3>
        {deltaLabel && (
          <span className="rounded-md bg-[#f5f5f7] px-2 py-0.5 text-xs font-medium text-[#34c759]">
            {deltaLabel}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData}>
          <XAxis
            dataKey="year"
            tick={{ fill: "#86868b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e5e5ea" }}
          />
          <YAxis
            tickFormatter={formatTrillion}
            tick={{ fill: "#86868b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e5ea",
              borderRadius: 8,
              fontSize: 12,
              color: "#1d1d1f",
            }}
            labelStyle={{ color: "#86868b" }}
            itemStyle={{ padding: 0 }}
            formatter={(value) => `$${Number(value).toFixed(2)}T`}
          />
          {!isRevisionMode && (
            <ReferenceLine
              x={LAST_HISTORICAL_YEAR}
              stroke="#c7c7cc"
              strokeDasharray="3 3"
              label={{
                value: "Projected \u25B8",
                position: "top",
                fill: "#86868b",
                fontSize: 10,
              }}
            />
          )}
          <Bar
            dataKey="deficit"
            name="Deficit"
            fill="#ff9500"
            opacity={0.4}
            radius={[2, 2, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="baselineDebt"
            name={isRevisionMode ? "What Actually Happened" : "Current Policy (no changes)"}
            stroke={isRevisionMode ? "#c7c7cc" : "#c7c7cc"}
            strokeDasharray="5 5"
            strokeWidth={isRevisionMode ? 2 : 1}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="debt"
            name={isRevisionMode ? "Your Alternate Timeline" : "Your Policy"}
            stroke="#ff3b30"
            strokeWidth={2}
            dot={false}
          />
          {whatIfCounterfactual && (
            <Line
              type="monotone"
              dataKey="counterfactualDebt"
              name="What Would Have Been"
              stroke="#34c759"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
