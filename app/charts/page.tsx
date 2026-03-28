"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Treemap,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fmt = any;
import { HISTORICAL_DATA } from "../../lib/data/historical";
import { WEALTH_BRACKETS } from "../../lib/data/defaults";

// ─── Shared constants ───────────────────────────────────────────────
const CARD =
  "bg-[#1a1a2e] rounded-lg border border-[#333] p-4";
const GRID_HEIGHT = 250;
const COLORS = {
  teal: "#2dd4bf",
  red: "#e94560",
  amber: "#f0a500",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  gray: "#6b7280",
  darkRed: "#991b1b",
};
const AXIS_STYLE = { fontSize: 10, fill: "#71717a" };

// ─── 1. Waterfall ───────────────────────────────────────────────────
function WaterfallChart() {
  const steps = [
    { name: "Revenue", value: 4920, base: 0, fill: COLORS.green },
    { name: "Defense", value: 886, base: 4920 - 886, fill: COLORS.red },
    { name: "Healthcare", value: 1600, base: 4920 - 886 - 1600, fill: COLORS.red },
    { name: "Soc. Sec.", value: 1400, base: 4920 - 886 - 1600 - 1400, fill: COLORS.red },
    { name: "Interest", value: 900, base: 4920 - 886 - 1600 - 1400 - 900, fill: COLORS.red },
    { name: "Other", value: 1967, base: 4920 - 886 - 1600 - 1400 - 900 - 1967, fill: COLORS.red },
  ];

  // Recompute so deficit step shows correctly
  const data = steps.map((s) => ({
    name: s.name,
    invisible: Math.max(s.base, 0),
    value: s.value,
    fill: s.fill,
  }));

  // Add deficit bar
  const deficit = 4920 - 886 - 1600 - 1400 - 900 - 1967; // -1833
  data.push({
    name: "Deficit",
    invisible: 0,
    value: Math.abs(deficit),
    fill: COLORS.amber,
  });

  return (
    <ResponsiveContainer width="100%" height={GRID_HEIGHT}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="name" tick={AXIS_STYLE} />
        <YAxis tick={AXIS_STYLE} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}T`} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }}
          formatter={((value: number) => [`$${value}B`, "Amount"]) as Fmt}
        />
        <Bar dataKey="invisible" stackId="a" fill="transparent" />
        <Bar dataKey="value" stackId="a">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── 2. Revenue vs Spending Area ────────────────────────────────────
function RevenueSpendingArea() {
  const data = HISTORICAL_DATA.map((d) => ({
    year: d.year,
    Revenue: d.revenueBillions,
    Spending: d.spendingBillions,
  }));

  return (
    <ResponsiveContainer width="100%" height={GRID_HEIGHT}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="year" tick={AXIS_STYLE} />
        <YAxis tick={AXIS_STYLE} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}T`} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }}
          formatter={((value: number) => [`$${value.toLocaleString()}B`, ""]) as Fmt}
        />
        <Area type="monotone" dataKey="Spending" fill="#e9456040" stroke={COLORS.red} />
        <Area type="monotone" dataKey="Revenue" fill="#2dd4bf30" stroke={COLORS.teal} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── 3. Treemap — Wealth Distribution ───────────────────────────────
function WealthTreemap() {
  const yr = HISTORICAL_DATA[HISTORICAL_DATA.length - 1];
  const data = WEALTH_BRACKETS.map((b) => ({
    name: `${b.label} (${(yr.wealthShares[b.id] * 100).toFixed(1)}%)`,
    size: yr.wealthShares[b.id] * 100,
    color: b.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={GRID_HEIGHT}>
      <Treemap
        data={data}
        dataKey="size"
        nameKey="name"
        stroke="#0a0a1a"
        content={<CustomTreemapContent />}
      />
    </ResponsiveContainer>
  );
}

function CustomTreemapContent(props: Record<string, unknown>) {
  const { x, y, width, height, name, color } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    color: string;
  };
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="#0a0a1a" strokeWidth={2} />
      {width > 60 && height > 30 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={10}>
          {name}
        </text>
      )}
    </g>
  );
}

// ─── 4. Tornado (Sensitivity) ───────────────────────────────────────
function TornadoChart() {
  // Approximate impact of +/-10% change on annual deficit ($B)
  const vars = [
    { name: "GDP Growth", low: -180, high: 160 },
    { name: "Interest Rate", low: 120, high: -140 },
    { name: "Top Tax Rate", low: -95, high: 85 },
    { name: "Corporate Rate", low: -70, high: 65 },
    { name: "Cap Gains Rate", low: -45, high: 40 },
  ].sort((a, b) => Math.abs(b.low) + Math.abs(b.high) - (Math.abs(a.low) + Math.abs(a.high)));

  return (
    <ResponsiveContainer width="100%" height={GRID_HEIGHT}>
      <BarChart data={vars} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis type="number" tick={AXIS_STYLE} tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}B`} />
        <YAxis type="category" dataKey="name" tick={AXIS_STYLE} width={75} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }}
          formatter={((value: number) => { const v = value; return [`${v > 0 ? "+" : ""}$${v}B`, ""]; }) as Fmt}
        />
        <ReferenceLine x={0} stroke="#555" />
        <Bar dataKey="low" fill={COLORS.red} name="-10% Change" />
        <Bar dataKey="high" fill={COLORS.green} name="+10% Change" />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── 5. Stacked Bar (Annual Budget) ─────────────────────────────────
function StackedBudgetBar() {
  const data = HISTORICAL_DATA.map((d) => {
    const s = d.spendingBillions;
    return {
      year: d.year,
      Defense: Math.round(s * 0.15),
      Healthcare: Math.round(s * 0.25),
      "Social Security": Math.round(s * 0.23),
      Interest: Math.round(s * 0.10),
      Other: Math.round(s * 0.27),
      Revenue: d.revenueBillions,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={GRID_HEIGHT}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="year" tick={AXIS_STYLE} />
        <YAxis tick={AXIS_STYLE} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}T`} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }}
          formatter={((value: number) => [`$${value.toLocaleString()}B`, ""]) as Fmt}
        />
        <Bar dataKey="Defense" stackId="a" fill="#3b82f6" />
        <Bar dataKey="Healthcare" stackId="a" fill="#e94560" />
        <Bar dataKey="Social Security" stackId="a" fill="#a855f7" />
        <Bar dataKey="Interest" stackId="a" fill="#f0a500" />
        <Bar dataKey="Other" stackId="a" fill="#6b7280" />
        <Line type="monotone" dataKey="Revenue" stroke={COLORS.teal} strokeWidth={2} dot={false} />
        <Legend wrapperStyle={{ fontSize: 10 }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── 6. Sankey-style Flow (SVG) ─────────────────────────────────────
function SankeyFlow() {
  const leftItems = [
    { label: "Top 0.1%", color: "#e94560", pct: 0.22 },
    { label: "Top 1%", color: "#f0a500", pct: 0.21 },
    { label: "Next 9%", color: "#3b82f6", pct: 0.32 },
    { label: "Middle 40%", color: "#a855f7", pct: 0.20 },
    { label: "Bottom 50%", color: "#6b7280", pct: 0.05 },
  ];
  const rightItems = [
    { label: "Defense", color: "#3b82f6", pct: 0.13 },
    { label: "Healthcare", color: "#e94560", pct: 0.24 },
    { label: "Soc. Sec.", color: "#a855f7", pct: 0.21 },
    { label: "Interest", color: "#f0a500", pct: 0.13 },
    { label: "Other", color: "#6b7280", pct: 0.29 },
  ];

  const W = 500,
    H = 220;
  const boxW = 90,
    midX = W / 2;
  const gap = 4;
  const leftX = 10;
  const rightX = W - boxW - 10;

  let leftY = 10;
  let rightY = 10;
  const usableH = H - 20;

  const leftRects = leftItems.map((item) => {
    const h = usableH * item.pct - gap;
    const rect = { ...item, x: leftX, y: leftY, w: boxW, h: Math.max(h, 12) };
    leftY += h + gap;
    return rect;
  });

  const rightRects = rightItems.map((item) => {
    const h = usableH * item.pct - gap;
    const rect = { ...item, x: rightX, y: rightY, w: boxW, h: Math.max(h, 12) };
    rightY += h + gap;
    return rect;
  });

  return (
    <div className="w-full overflow-x-auto" style={{ height: GRID_HEIGHT }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Center tax box */}
        <rect x={midX - 40} y={H / 2 - 20} width={80} height={40} rx={6} fill="#1e3a5f" stroke="#2dd4bf" strokeWidth={1} />
        <text x={midX} y={H / 2 - 3} textAnchor="middle" fill="#2dd4bf" fontSize={9} fontWeight="bold">Tax</text>
        <text x={midX} y={H / 2 + 10} textAnchor="middle" fill="#2dd4bf" fontSize={9}>Collection</text>

        {/* Left boxes + paths */}
        {leftRects.map((r, i) => (
          <g key={`l-${i}`}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={3} fill={r.color} opacity={0.85} />
            {r.h > 14 && (
              <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 3} textAnchor="middle" fill="#fff" fontSize={8}>
                {r.label}
              </text>
            )}
            <path
              d={`M${r.x + r.w},${r.y + r.h / 2} C${midX - 60},${r.y + r.h / 2} ${midX - 60},${H / 2} ${midX - 40},${H / 2}`}
              fill="none"
              stroke={r.color}
              strokeWidth={Math.max(r.pct * 8, 1)}
              opacity={0.4}
            />
          </g>
        ))}

        {/* Right boxes + paths */}
        {rightRects.map((r, i) => (
          <g key={`r-${i}`}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={3} fill={r.color} opacity={0.85} />
            {r.h > 14 && (
              <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 3} textAnchor="middle" fill="#fff" fontSize={8}>
                {r.label}
              </text>
            )}
            <path
              d={`M${midX + 40},${H / 2} C${midX + 60},${H / 2} ${midX + 60},${r.y + r.h / 2} ${r.x},${r.y + r.h / 2}`}
              fill="none"
              stroke={r.color}
              strokeWidth={Math.max(r.pct * 8, 1)}
              opacity={0.4}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── 7. Gauge Chart (Debt-to-GDP) ───────────────────────────────────
function GaugeChart() {
  const currentRatio = HISTORICAL_DATA[HISTORICAL_DATA.length - 1].debtToGdpRatio;
  const maxRatio = 200;
  const angleRange = Math.PI; // 180 degrees
  const cx = 200,
    cy = 170,
    r = 130;

  const zones = [
    { start: 0, end: 60, color: COLORS.green },
    { start: 60, end: 100, color: COLORS.amber },
    { start: 100, end: 150, color: COLORS.red },
    { start: 150, end: 200, color: COLORS.darkRed },
  ];

  function ratioToAngle(ratio: number) {
    return Math.PI + (ratio / maxRatio) * angleRange;
  }

  function arcPath(startRatio: number, endRatio: number, innerR: number, outerR: number) {
    const s = ratioToAngle(startRatio);
    const e = ratioToAngle(endRatio);
    const x1 = cx + outerR * Math.cos(s);
    const y1 = cy + outerR * Math.sin(s);
    const x2 = cx + outerR * Math.cos(e);
    const y2 = cy + outerR * Math.sin(e);
    const x3 = cx + innerR * Math.cos(e);
    const y3 = cy + innerR * Math.sin(e);
    const x4 = cx + innerR * Math.cos(s);
    const y4 = cy + innerR * Math.sin(s);
    const large = e - s > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${outerR},${outerR} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${innerR},${innerR} 0 ${large} 0 ${x4},${y4} Z`;
  }

  const needleAngle = ratioToAngle(Math.min(currentRatio, maxRatio));
  const needleLen = r - 15;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy + needleLen * Math.sin(needleAngle);

  return (
    <div className="w-full flex justify-center" style={{ height: GRID_HEIGHT }}>
      <svg viewBox="0 0 400 210" className="w-full max-w-[400px] h-full" preserveAspectRatio="xMidYMid meet">
        {/* Zone arcs */}
        {zones.map((z, i) => (
          <path key={i} d={arcPath(z.start, z.end, r - 30, r)} fill={z.color} opacity={0.7} />
        ))}

        {/* Tick labels */}
        {[0, 60, 100, 150, 200].map((ratio) => {
          const a = ratioToAngle(ratio);
          const tx = cx + (r + 14) * Math.cos(a);
          const ty = cy + (r + 14) * Math.sin(a);
          return (
            <text key={ratio} x={tx} y={ty} textAnchor="middle" fill="#71717a" fontSize={10}>
              {ratio}%
            </text>
          );
        })}

        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={6} fill="#fff" />

        {/* Value */}
        <text x={cx} y={cy + 35} textAnchor="middle" fill="#fff" fontSize={22} fontWeight="bold">
          {currentRatio.toFixed(1)}%
        </text>
        <text x={cx} y={cy + 50} textAnchor="middle" fill="#71717a" fontSize={11}>
          Debt-to-GDP
        </text>
      </svg>
    </div>
  );
}

// ─── 8. Small Multiples (Sparklines) ────────────────────────────────
function SparklineGrid() {
  const metrics: { label: string; key: string; fmt: (v: number) => string }[] = [
    { label: "Debt ($T)", key: "debtTrillions", fmt: (v) => `$${v.toFixed(1)}T` },
    { label: "Deficit ($B)", key: "deficitBillions", fmt: (v) => `$${v.toFixed(0)}B` },
    { label: "Revenue ($B)", key: "revenueBillions", fmt: (v) => `$${v.toFixed(0)}B` },
    { label: "GDP ($T)", key: "gdpTrillions", fmt: (v) => `$${v.toFixed(1)}T` },
    { label: "Top 0.1% Wealth", key: "top01wealth", fmt: (v) => `${(v * 100).toFixed(1)}%` },
    { label: "Debt-to-GDP", key: "debtToGdpRatio", fmt: (v) => `${v.toFixed(0)}%` },
  ];

  const sparkData = HISTORICAL_DATA.map((d) => ({
    year: d.year,
    debtTrillions: d.debtTrillions,
    deficitBillions: d.deficitBillions,
    revenueBillions: d.revenueBillions,
    gdpTrillions: d.gdpTrillions,
    top01wealth: d.wealthShares.top01,
    debtToGdpRatio: d.debtToGdpRatio,
  }));

  return (
    <div className="grid grid-cols-3 gap-2" style={{ height: GRID_HEIGHT }}>
      {metrics.map((m) => {
        const last = sparkData[sparkData.length - 1][m.key as keyof (typeof sparkData)[0]] as number;
        return (
          <div key={m.key} className="flex flex-col">
            <span className="text-[9px] text-zinc-500 mb-0.5">{m.label}</span>
            <span className="text-[10px] text-zinc-300 font-semibold">{m.fmt(last)}</span>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <Line type="monotone" dataKey={m.key} stroke={COLORS.teal} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 9. Diverging Bar (Winners & Losers) ────────────────────────────
function DivergingBar() {
  const personas = [
    { name: "Nurse ($65K)", impact: 2800 },
    { name: "Small Biz ($180K)", impact: -1200 },
    { name: "Tech Exec ($450K)", impact: -8500 },
    { name: "Hedge Fund ($10M)", impact: -185000 },
    { name: "Billionaire ($2B+)", impact: -4200000 },
  ];

  // Log-scale the values for display since range is huge
  const displayData = personas.map((p) => ({
    name: p.name,
    displayValue:
      p.impact > 0
        ? Math.log10(Math.abs(p.impact)) * 10
        : -Math.log10(Math.abs(p.impact)) * 10,
    rawValue: p.impact,
  }));

  return (
    <ResponsiveContainer width="100%" height={GRID_HEIGHT}>
      <BarChart data={displayData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis type="number" tick={AXIS_STYLE} tickFormatter={() => ""} />
        <YAxis type="category" dataKey="name" tick={AXIS_STYLE} width={95} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }}
          formatter={((_value: number, _name: string, entry: { payload: { rawValue: number } }) => {
            const raw = entry.payload.rawValue;
            if (Math.abs(raw) >= 1000000) return [`${raw > 0 ? "+" : ""}$${(raw / 1000000).toFixed(1)}M/yr`, "Net Impact"];
            if (Math.abs(raw) >= 1000) return [`${raw > 0 ? "+" : ""}$${(raw / 1000).toFixed(1)}K/yr`, "Net Impact"];
            return [`${raw > 0 ? "+" : ""}$${raw}/yr`, "Net Impact"];
          }) as Fmt}
        />
        <ReferenceLine x={0} stroke="#555" />
        <Bar dataKey="displayValue">
          {displayData.map((entry, i) => (
            <Cell key={i} fill={entry.rawValue > 0 ? COLORS.green : COLORS.red} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── 10. Treemap — Budget Composition ───────────────────────────────
function BudgetTreemap() {
  const data = [
    { name: "Healthcare $1,600B", size: 1600, color: COLORS.red },
    { name: "Other $1,967B", size: 1967, color: COLORS.gray },
    { name: "Social Security $1,400B", size: 1400, color: COLORS.purple },
    { name: "Interest $900B", size: 900, color: COLORS.amber },
    { name: "Defense $886B", size: 886, color: COLORS.blue },
  ];

  return (
    <ResponsiveContainer width="100%" height={GRID_HEIGHT}>
      <Treemap
        data={data}
        dataKey="size"
        nameKey="name"
        stroke="#0a0a1a"
        content={<BudgetTreemapContent />}
      />
    </ResponsiveContainer>
  );
}

function BudgetTreemapContent(props: Record<string, unknown>) {
  const { x, y, width, height, name, color } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    color: string;
  };
  if (width < 20 || height < 15) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="#0a0a1a" strokeWidth={2} />
      {width > 70 && height > 25 && (
        <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={11} fontWeight="bold">
          {name}
        </text>
      )}
    </g>
  );
}

// ─── Chart Card Wrapper ─────────────────────────────────────────────
function ChartCard({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className={CARD}>
      <h3 className="text-sm font-semibold text-zinc-300 mb-1">
        {number}. {title}
      </h3>
      <p className="text-xs text-zinc-500 mb-3">{description}</p>
      <div style={{ height: GRID_HEIGHT }}>{children}</div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────
export default function ChartsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white px-4 py-8 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block"
        >
          &larr; Back to Simulator
        </Link>

        <h1 className="text-2xl font-bold text-zinc-100 mb-1">
          Chart Type Explorer
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Which visualizations should SimEcon use? All charts render the same
          2000 &ndash; 2025 historical data.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard
            number={1}
            title="Waterfall Chart (Bridge)"
            description="Step-by-step from Revenue to Deficit for FY 2024"
          >
            <WaterfallChart />
          </ChartCard>

          <ChartCard
            number={2}
            title="Revenue vs Spending Area"
            description="Overlapping areas show the deficit gap over 25 years"
          >
            <RevenueSpendingArea />
          </ChartCard>

          <ChartCard
            number={3}
            title="Treemap — Wealth Distribution"
            description="Rectangle size = share of total wealth by bracket"
          >
            <WealthTreemap />
          </ChartCard>

          <ChartCard
            number={4}
            title="Tornado Chart (Sensitivity)"
            description="How +/-10% in each variable impacts the annual deficit"
          >
            <TornadoChart />
          </ChartCard>

          <ChartCard
            number={5}
            title="Stacked Bar — Annual Budget"
            description="Spending composition with revenue overlay, 2000-2025"
          >
            <StackedBudgetBar />
          </ChartCard>

          <ChartCard
            number={6}
            title="Sankey-style Flow"
            description="Tax revenue flows from wealth brackets to spending categories"
          >
            <SankeyFlow />
          </ChartCard>

          <ChartCard
            number={7}
            title="Gauge — Debt-to-GDP Ratio"
            description="Semicircle gauge with color zones: green, yellow, red, dark red"
          >
            <GaugeChart />
          </ChartCard>

          <ChartCard
            number={8}
            title="Small Multiples (Sparklines)"
            description="Six key metrics at a glance, 2000-2025"
          >
            <SparklineGrid />
          </ChartCard>

          <ChartCard
            number={9}
            title="Diverging Bar — Winners & Losers"
            description="Net impact of a 52% top rate by income level (log scale)"
          >
            <DivergingBar />
          </ChartCard>

          <ChartCard
            number={10}
            title="Treemap — 2024 Budget Composition"
            description="Federal spending breakdown by category, sized by amount"
          >
            <BudgetTreemap />
          </ChartCard>
        </div>

        <p className="text-xs text-zinc-600 mt-8 text-center">
          Data: U.S. Treasury, CBO, OMB, BEA, Federal Reserve (2000 &ndash; 2025)
        </p>
      </div>
    </div>
  );
}
