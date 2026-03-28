"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type { TaxPolicy, AdvancedAssumptions, YearData } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fmt = any;

interface TornadoChartProps {
  taxPolicy: TaxPolicy;
  assumptions: AdvancedAssumptions;
  currentYearData: YearData;
}

const COLORS = {
  red: "#ff3b30",
  green: "#34c759",
};
const AXIS_STYLE = { fontSize: 10, fill: "#86868b" };

/**
 * Simplified sensitivity estimation.
 * For each variable, estimate the deficit impact of a +/-20% change.
 * Revenue-side: rate changes scale revenue proportionally (with dampening).
 * Macro-side: GDP growth affects revenue; interest rate affects spending.
 */
function estimateSensitivity(
  taxPolicy: TaxPolicy,
  assumptions: AdvancedAssumptions,
  yearData: YearData
) {
  const revenue = yearData.revenueBillions;
  const spending = yearData.spendingBillions;
  const interestShare = 0.13; // ~13% of spending is interest

  const variables = [
    {
      name: "Top Tax Rate",
      // Top marginal rate affects ~30% of revenue from high earners
      lowDeficit: -(taxPolicy.topMarginalRate * 0.2 * 0.3 * revenue) / 100,
      highDeficit: (taxPolicy.topMarginalRate * 0.2 * 0.3 * revenue) / 100,
    },
    {
      name: "Corporate Rate",
      // Corporate tax is ~10% of revenue
      lowDeficit: -(taxPolicy.corporateRate * 0.2 * 0.10 * revenue) / 100,
      highDeficit: (taxPolicy.corporateRate * 0.2 * 0.10 * revenue) / 100,
    },
    {
      name: "Capital Gains",
      // Cap gains is ~5% of revenue
      lowDeficit: -(taxPolicy.capitalGainsRate * 0.2 * 0.05 * revenue) / 100,
      highDeficit: (taxPolicy.capitalGainsRate * 0.2 * 0.05 * revenue) / 100,
    },
    {
      name: "Interest Rate",
      // Higher interest rate increases interest payments
      lowDeficit: -(assumptions.interestRate * 0.2 * interestShare * spending) / 100,
      highDeficit: (assumptions.interestRate * 0.2 * interestShare * spending) / 100,
    },
    {
      name: "GDP Growth",
      // Higher GDP growth increases revenue
      lowDeficit: (assumptions.gdpGrowthRate * 0.2 * 0.6 * revenue) / 100,
      highDeficit: -(assumptions.gdpGrowthRate * 0.2 * 0.6 * revenue) / 100,
    },
  ];

  // Sort by total absolute impact
  return variables
    .map((v) => ({
      name: v.name,
      // "low" = impact on deficit of -20% change, "high" = +20% change
      // Positive = worse (higher deficit), negative = better (lower deficit)
      low: Math.round(v.lowDeficit),
      high: Math.round(v.highDeficit),
    }))
    .sort(
      (a, b) =>
        Math.abs(b.low) + Math.abs(b.high) - (Math.abs(a.low) + Math.abs(a.high))
    );
}

export function TornadoChart({
  taxPolicy,
  assumptions,
  currentYearData,
}: TornadoChartProps) {
  const data = useMemo(
    () => estimateSensitivity(taxPolicy, assumptions, currentYearData),
    [taxPolicy, assumptions, currentYearData]
  );

  return (
    <div className="rounded-lg border border-[#e5e5ea] bg-white shadow-sm p-4">
      <h3 className="mb-1 text-sm font-semibold text-[#1d1d1f]">
        Sensitivity Analysis
      </h3>
      <p className="mb-3 text-xs text-[#86868b]">
        Impact of &plusmn;20% change in each variable on the annual deficit
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5ea" />
          <XAxis
            type="number"
            tick={AXIS_STYLE}
            tickFormatter={(v: number) =>
              `${v > 0 ? "+" : ""}$${Math.round(v)}B`
            }
          />
          <YAxis type="category" dataKey="name" tick={AXIS_STYLE} width={75} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5ea", borderRadius: 8, color: "#1d1d1f" }}
            labelStyle={{ color: "#86868b" }}
            formatter={((value: number) => [
              `${value > 0 ? "+" : ""}$${value.toLocaleString()}B`,
              "Deficit Impact",
            ]) as Fmt}
          />
          <ReferenceLine x={0} stroke="#c7c7cc" />
          <Bar dataKey="low" fill={COLORS.red} name="-20% Change" radius={[2, 2, 2, 2]} />
          <Bar dataKey="high" fill={COLORS.green} name="+20% Change" radius={[2, 2, 2, 2]} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#86868b" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
