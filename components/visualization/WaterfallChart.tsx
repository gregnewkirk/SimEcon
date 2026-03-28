"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { YearData } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fmt = any;

interface WaterfallChartProps {
  yearData: YearData;
}

const COLORS = {
  green: "#22c55e",
  red: "#e94560",
  amber: "#f0a500",
  teal: "#2dd4bf",
};
const AXIS_STYLE = { fontSize: 10, fill: "#71717a" };

// Approximate spending breakdown percentages (CBO categories)
const SPENDING_CATEGORIES = [
  { key: "Defense", pct: 0.13 },
  { key: "Healthcare", pct: 0.25 },
  { key: "Soc. Sec.", pct: 0.22 },
  { key: "Interest", pct: 0.13 },
  { key: "Other", pct: 0.27 },
];

export function WaterfallChart({ yearData }: WaterfallChartProps) {
  const revenue = yearData.revenueBillions;
  const spending = yearData.spendingBillions;

  // Build waterfall steps
  let running = revenue;
  const steps: { name: string; invisible: number; value: number; fill: string }[] = [
    { name: "Revenue", invisible: 0, value: revenue, fill: COLORS.green },
  ];

  for (const cat of SPENDING_CATEGORIES) {
    const amount = Math.round(spending * cat.pct);
    running -= amount;
    steps.push({
      name: cat.key,
      invisible: Math.max(running, 0),
      value: amount,
      fill: COLORS.red,
    });
  }

  // Final deficit/surplus bar
  const balance = revenue - spending;
  steps.push({
    name: balance >= 0 ? "Surplus" : "Deficit",
    invisible: 0,
    value: Math.abs(balance),
    fill: balance >= 0 ? COLORS.teal : COLORS.amber,
  });

  return (
    <div className="rounded-lg border border-zinc-800 bg-card p-4">
      <h3 className="mb-1 text-sm font-semibold text-zinc-300">
        Budget Waterfall &mdash; {yearData.year}
      </h3>
      <p className="mb-3 text-xs text-zinc-500">
        How revenue breaks down through spending to the {balance >= 0 ? "surplus" : "deficit"}
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={steps} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="name" tick={AXIS_STYLE} />
          <YAxis
            tick={AXIS_STYLE}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}T`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={((value: number) => [`$${value.toLocaleString()}B`, "Amount"]) as Fmt}
          />
          <Bar dataKey="invisible" stackId="a" fill="transparent" />
          <Bar dataKey="value" stackId="a" radius={[2, 2, 0, 0]}>
            {steps.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
