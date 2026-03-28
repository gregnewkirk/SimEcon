"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Label,
} from "recharts";
import type { YearData } from "@/lib/types";
import { LAST_HISTORICAL_YEAR } from "@/lib/data/defaults";

interface SimpleViewProps {
  todayYours: YearData;
  todayActual: YearData;
  allData: YearData[];
  baselineAllData: YearData[];
  currentYear: number;
  isRevisionMode: boolean;
}

function fmtT(value: number): string {
  return `$${Math.abs(value).toFixed(1)}T`;
}

function fmtB(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) return `$${(abs / 1000).toFixed(2)}T`;
  return `$${abs.toFixed(0)}B`;
}

function fmtPct(ratio: number): string {
  // debtToGdpRatio is already a percentage (e.g. 128 = 128%)
  return `${ratio.toFixed(1)}%`;
}

// ─── Metric Bar: side-by-side comparison bars ───────────────────────

function MetricBar({
  label,
  actualValue,
  yoursValue,
  format,
  higherIsBetter,
}: {
  label: string;
  actualValue: number;
  yoursValue: number;
  format: (v: number) => string;
  higherIsBetter: boolean;
}) {
  const isBetter = higherIsBetter
    ? yoursValue >= actualValue
    : yoursValue <= actualValue;
  const yoursColor = isBetter ? "#34c759" : "#ff3b30";
  const maxVal = Math.max(actualValue, yoursValue, 1);
  const actualBarPct = (actualValue / maxVal) * 100;
  const yoursBarPct = (yoursValue / maxVal) * 100;
  const changePct = actualValue !== 0
    ? (((yoursValue - actualValue) / actualValue) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="rounded-lg border border-[#e5e5ea] bg-white shadow-sm p-4">
      <p className="text-xs uppercase tracking-wider text-[#86868b] mb-3">{label}</p>
      {/* Actual bar */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-[#86868b] w-10 shrink-0">Actual</span>
        <div className="flex-1 h-5 bg-[#f5f5f7] rounded overflow-hidden">
          <div
            className="h-full rounded bg-[#c7c7cc] transition-all"
            style={{ width: `${actualBarPct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-[#1d1d1f] tabular-nums w-16 text-right shrink-0">
          {format(actualValue)}
        </span>
      </div>
      {/* Yours bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold w-10 shrink-0" style={{ color: yoursColor }}>Yours</span>
        <div className="flex-1 h-5 bg-[#f5f5f7] rounded overflow-hidden">
          <div
            className="h-full rounded transition-all"
            style={{ width: `${yoursBarPct}%`, backgroundColor: yoursColor }}
          />
        </div>
        <span className="text-xs font-bold tabular-nums w-16 text-right shrink-0" style={{ color: yoursColor }}>
          {format(yoursValue)}
        </span>
      </div>
      {/* Change percentage */}
      <p className="mt-2 text-xs text-center" style={{ color: yoursColor }}>
        {Number(changePct) >= 0 ? "+" : ""}{changePct}% {isBetter ? "✓" : ""}
      </p>
    </div>
  );
}

export function SimpleView({
  todayYours,
  todayActual,
  allData,
  baselineAllData,
  currentYear,
  isRevisionMode,
}: SimpleViewProps) {
  // Hero number: debt difference at present day (2025)
  const debtDiff = todayYours.debtTrillions - todayActual.debtTrillions;
  const isSaving = debtDiff < 0;
  const heroColor = isSaving ? "#34c759" : "#ff3b30";
  const heroText = isSaving
    ? `Your policy saves ${fmtT(debtDiff)}`
    : `Your policy costs ${fmtT(debtDiff)} more`;

  // Chart data: merge user line and baseline line
  const chartData = useMemo(() => {
    const baselineMap = new Map(baselineAllData.map((d) => [d.year, d]));
    const filtered = allData.filter((d) => d.year <= currentYear);
    return filtered.map((d) => {
      const bl = baselineMap.get(d.year);
      return {
        year: d.year,
        yours: d.debtTrillions,
        actual: bl?.debtTrillions ?? null,
      };
    });
  }, [allData, baselineAllData, currentYear]);

  // Stat cards
  const revChange = todayYours.revenueBillions - todayActual.revenueBillions;
  const deficitActual = todayActual.deficitBillions;
  const deficitYours = todayYours.deficitBillions;
  const dgdpActual = todayActual.debtToGdpRatio;
  const dgdpYours = todayYours.debtToGdpRatio;

  return (
    <div className="space-y-4">
      {/* Hero number */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-[#e5e5ea] bg-white shadow-sm py-8 px-4">
        <p
          className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl"
          style={{ color: heroColor }}
        >
          {heroText}
        </p>
        <p className="mt-2 text-xs text-[#86868b]">
          Compared to current policy at {LAST_HISTORICAL_YEAR}
        </p>
      </div>

      {/* Big chart */}
      <div className="rounded-xl border border-[#e5e5ea] bg-white shadow-sm p-4">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 24, right: 16, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGap" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isSaving ? "#34c759" : "#ff3b30"}
                  stopOpacity={0.15}
                />
                <stop
                  offset="100%"
                  stopColor={isSaving ? "#34c759" : "#ff3b30"}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="year"
              tick={{ fill: "#86868b", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#e5e5ea" }}
            />
            <YAxis
              tickFormatter={(v: number) => `$${v.toFixed(0)}T`}
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
              formatter={(value) => [`$${Number(value).toFixed(2)}T`, ""]}
            />
            {/* Shaded region for projected data (after 2025) */}
            <ReferenceArea
              x1={LAST_HISTORICAL_YEAR}
              fill="#f5f5f7"
              fillOpacity={0.6}
              ifOverflow="extendDomain"
            />
            {/* Hard line at 2025 boundary */}
            <ReferenceLine
              x={LAST_HISTORICAL_YEAR}
              stroke="#86868b"
              strokeWidth={1.5}
              strokeDasharray="6 3"
            >
              <Label
                value="← Historical | Projected →"
                position="top"
                fill="#86868b"
                fontSize={10}
                offset={8}
              />
            </ReferenceLine>
            {/* Actual: gray dashed */}
            <Area
              type="monotone"
              dataKey="actual"
              name="What actually happened"
              stroke="#c7c7cc"
              strokeDasharray="6 4"
              strokeWidth={2}
              fill="none"
              dot={false}
              connectNulls
            />
            {/* Your policy: colored with fill */}
            <Area
              type="monotone"
              dataKey="yours"
              name="Your policy"
              stroke={heroColor}
              strokeWidth={2.5}
              fill="url(#fillGap)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Three metric cards with mini bar comparisons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Revenue */}
        <MetricBar
          label="Revenue"
          actualValue={todayActual.revenueBillions}
          yoursValue={todayYours.revenueBillions}
          format={fmtB}
          higherIsBetter={true}
        />
        {/* Deficit (show as positive numbers — smaller is better) */}
        <MetricBar
          label="Annual Deficit"
          actualValue={Math.abs(todayActual.deficitBillions)}
          yoursValue={Math.abs(todayYours.deficitBillions)}
          format={fmtB}
          higherIsBetter={false}
        />
        {/* Debt-to-GDP */}
        <MetricBar
          label="Debt / GDP"
          actualValue={dgdpActual}
          yoursValue={dgdpYours}
          format={(v) => `${v.toFixed(1)}%`}
          higherIsBetter={false}
        />
      </div>
    </div>
  );
}
