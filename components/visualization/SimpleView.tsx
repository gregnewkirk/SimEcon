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

// ─── Debt-to-GDP Semicircular Gauge ──────────────────────────────────

function DebtGdpGauge({ actualRatio, yoursRatio }: { actualRatio: number; yoursRatio: number }) {
  // Gauge range: 0% to 150%. Values beyond 150% are clamped visually.
  const MAX_PCT = 150;
  const cx = 160;
  const cy = 140;
  const r = 110;
  const strokeW = 18;

  // Convert a percentage (0-150) to an angle in radians.
  // 0% = right side of semicircle (angle 0), 150% = left side (angle PI).
  // This puts green/healthy (low debt) on the left and red/crisis (high debt) on the right.
  const pctToAngle = (pct: number) => {
    const clamped = Math.max(0, Math.min(pct, MAX_PCT));
    return (clamped / MAX_PCT) * Math.PI;
  };

  // Convert angle to SVG coordinates on the arc
  const angleToXY = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  });

  // Build an arc path from startPct to endPct
  const arcPath = (startPct: number, endPct: number) => {
    const a1 = pctToAngle(startPct);
    const a2 = pctToAngle(endPct);
    const start = angleToXY(a1);
    const end = angleToXY(a2);
    const sweep = a1 < a2 ? 0 : 1;
    const largeArc = Math.abs(a1 - a2) > Math.PI ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
  };

  // debtToGdpRatio is already a percentage (e.g. 128 = 128%)
  const actualPct = actualRatio;
  const yoursPct = yoursRatio;

  // Needle endpoint for user value
  const needleAngle = pctToAngle(Math.max(0, Math.min(yoursPct, MAX_PCT)));
  const needleTip = angleToXY(needleAngle);
  const needleLen = r - strokeW / 2 - 8;
  const needleTipInner = {
    x: cx + needleLen * Math.cos(needleAngle),
    y: cy - needleLen * Math.sin(needleAngle),
  };

  // Actual value marker position (small triangle on the outer edge)
  const actualAngle = pctToAngle(Math.max(0, Math.min(actualPct, MAX_PCT)));
  const markerOuter = {
    x: cx + (r + strokeW / 2 + 6) * Math.cos(actualAngle),
    y: cy - (r + strokeW / 2 + 6) * Math.sin(actualAngle),
  };
  const markerLeft = {
    x: cx + (r + strokeW / 2 + 14) * Math.cos(actualAngle + 0.06),
    y: cy - (r + strokeW / 2 + 14) * Math.sin(actualAngle + 0.06),
  };
  const markerRight = {
    x: cx + (r + strokeW / 2 + 14) * Math.cos(actualAngle - 0.06),
    y: cy - (r + strokeW / 2 + 14) * Math.sin(actualAngle - 0.06),
  };

  const yoursColor = yoursPct <= 60 ? "#34c759" : yoursPct <= 90 ? "#ff9500" : "#ff3b30";

  // Label positions along the arc
  const label60 = angleToXY(pctToAngle(60));
  const label90 = angleToXY(pctToAngle(90));

  return (
    <div className="rounded-xl border border-[#e5e5ea] bg-white shadow-sm p-5">
      <h3 className="text-sm font-semibold text-[#1d1d1f] mb-0.5">Debt-to-GDP Ratio</h3>
      <p className="text-xs text-[#86868b] mb-3">
        How much the country owes relative to its annual output. Lower is better.
      </p>
      <div className="flex justify-center">
        <svg viewBox="0 0 320 185" width="100%" style={{ maxWidth: 400 }}>
          {/* Background track */}
          <path
            d={arcPath(0, MAX_PCT)}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
          {/* Green zone: 0-60% */}
          <path
            d={arcPath(0, 60)}
            fill="none"
            stroke="#34c759"
            strokeWidth={strokeW}
            strokeLinecap="round"
            opacity={0.3}
          />
          {/* Yellow zone: 60-90% */}
          <path
            d={arcPath(60, 90)}
            fill="none"
            stroke="#ff9500"
            strokeWidth={strokeW}
            opacity={0.3}
          />
          {/* Red zone: 90-150% */}
          <path
            d={arcPath(90, MAX_PCT)}
            fill="none"
            stroke="#ff3b30"
            strokeWidth={strokeW}
            strokeLinecap="round"
            opacity={0.3}
          />

          {/* Zone boundary ticks */}
          <line
            x1={label60.x}
            y1={label60.y - strokeW / 2 - 2}
            x2={label60.x}
            y2={label60.y + strokeW / 2 + 2}
            stroke="#86868b"
            strokeWidth={1}
            opacity={0.4}
          />
          <line
            x1={label90.x}
            y1={label90.y - strokeW / 2 - 2}
            x2={label90.x}
            y2={label90.y + strokeW / 2 + 2}
            stroke="#86868b"
            strokeWidth={1}
            opacity={0.4}
          />

          {/* Zone labels */}
          <text x={angleToXY(pctToAngle(30)).x} y={cy + 24} textAnchor="middle" fill="#34c759" fontSize="9" fontWeight="600">
            Healthy
          </text>
          <text x={label60.x + 16} y={cy + 24} textAnchor="middle" fill="#ff9500" fontSize="9" fontWeight="600">
            Warning
          </text>
          <text x={angleToXY(pctToAngle(120)).x} y={cy + 24} textAnchor="middle" fill="#ff3b30" fontSize="9" fontWeight="600">
            Crisis
          </text>

          {/* Scale labels */}
          <text x={angleToXY(pctToAngle(0)).x} y={cy + 14} textAnchor="middle" fill="#86868b" fontSize="9">
            0%
          </text>
          <text x={label60.x} y={label60.y - strokeW / 2 - 6} textAnchor="middle" fill="#86868b" fontSize="8">
            60%
          </text>
          <text x={label90.x} y={label90.y - strokeW / 2 - 6} textAnchor="middle" fill="#86868b" fontSize="8">
            90%
          </text>
          <text x={angleToXY(pctToAngle(MAX_PCT)).x} y={cy + 14} textAnchor="middle" fill="#86868b" fontSize="9">
            150%+
          </text>

          {/* Actual value triangle marker on arc */}
          <polygon
            points={`${markerOuter.x},${markerOuter.y} ${markerLeft.x},${markerLeft.y} ${markerRight.x},${markerRight.y}`}
            fill="#86868b"
          />

          {/* Needle for user value */}
          <line
            x1={cx}
            y1={cy}
            x2={needleTipInner.x}
            y2={needleTipInner.y}
            stroke={yoursColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Needle hub */}
          <circle cx={cx} cy={cy} r={6} fill={yoursColor} />
          <circle cx={cx} cy={cy} r={3} fill="white" />

          {/* Needle tip dot */}
          <circle cx={needleTip.x} cy={needleTip.y} r={5} fill={yoursColor} />

          {/* Center values */}
          <text x={cx} y={cy - 24} textAnchor="middle" fill="#86868b" fontSize="10">
            Yours
          </text>
          <text x={cx} y={cy - 8} textAnchor="middle" fill={yoursColor} fontSize="22" fontWeight="800">
            {yoursPct.toFixed(0)}%
          </text>
        </svg>
      </div>
      {/* Legend below gauge */}
      <div className="flex items-center justify-center gap-6 mt-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: "#86868b" }} />
          <span className="text-[#86868b]">Actual: <span className="font-semibold text-[#1d1d1f]">{actualPct.toFixed(0)}%</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: yoursColor }} />
          <span className="text-[#86868b]">Yours: <span className="font-semibold" style={{ color: yoursColor }}>{yoursPct.toFixed(0)}%</span></span>
        </div>
      </div>
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

      {/* Two stat cards + gauge */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Revenue change */}
        <div className="rounded-lg border border-[#e5e5ea] bg-white shadow-sm p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#86868b]">Revenue change</p>
          <p
            className="mt-1 text-xl font-bold tabular-nums"
            style={{ color: revChange >= 0 ? "#34c759" : "#ff3b30" }}
          >
            {revChange >= 0 ? "+" : "-"}{fmtB(revChange)}/yr
          </p>
          {todayActual.revenueBillions > 0 && (
            <p className="mt-0.5 text-xs text-[#86868b]">
              {((revChange / todayActual.revenueBillions) * 100).toFixed(1)}% change
            </p>
          )}
        </div>

        {/* Annual deficit */}
        <div className="rounded-lg border border-[#e5e5ea] bg-white shadow-sm p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#86868b]">Annual deficit</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-[#1d1d1f]">
            {fmtB(Math.abs(deficitActual))}{" "}
            <span
              style={{
                color:
                  Math.abs(deficitYours) < Math.abs(deficitActual)
                    ? "#34c759"
                    : "#ff3b30",
              }}
            >
              {"\u2192"} {fmtB(Math.abs(deficitYours))}
            </span>
          </p>
          {deficitActual !== 0 && (
            <p className="mt-0.5 text-xs text-[#86868b]">
              {(((Math.abs(deficitYours) - Math.abs(deficitActual)) / Math.abs(deficitActual)) * 100).toFixed(1)}% change
            </p>
          )}
        </div>
      </div>

      {/* Debt-to-GDP Gauge (replaces the old stat card) */}
      <DebtGdpGauge actualRatio={dgdpActual} yoursRatio={dgdpYours} />
    </div>
  );
}
