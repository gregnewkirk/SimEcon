"use client";

import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from "recharts";
import type { YearData } from "@/lib/ledger/types";
import { money } from "./format";

type Kind = "revenue" | "borrow" | "hub" | "spending";
const COLOR: Record<Kind, string> = {
  revenue: "#34d399",
  borrow: "#f59e0b",
  hub: "#94a3b8",
  spending: "#f43f5e",
};

/**
 * Money flow for the current year: revenue sources and borrowing on the left flow through
 * the federal budget hub out to spending categories on the right. The belt re-flows as
 * levers move, so you watch borrowing fill (or shrink) the gap between revenue and spending.
 */
export function MoneyFlowSankey({ year }: { year: YearData }) {
  const revenue = year.lines.filter((l) => l.side === "revenue" && l.valueB > 1);
  const spending = year.lines.filter((l) => l.side === "spending" && l.valueB > 1);
  const borrow = Math.max(0, year.deficitB);

  const nodes: { name: string; kind: Kind }[] = [];
  const idx = (name: string, kind: Kind) => {
    nodes.push({ name, kind });
    return nodes.length - 1;
  };

  const revIdx = revenue.map((l) => ({ i: idx(l.label, "revenue"), v: l.valueB }));
  const borrowIdx = borrow > 1 ? idx("Borrowing (deficit)", "borrow") : -1;
  const hub = idx("Federal budget", "hub");
  const spendIdx = spending.map((l) => ({ i: idx(l.label, "spending"), v: l.valueB }));

  const links = [
    ...revIdx.map((r) => ({ source: r.i, target: hub, value: r.v })),
    ...(borrowIdx >= 0 ? [{ source: borrowIdx, target: hub, value: borrow }] : []),
    ...spendIdx.map((s) => ({ source: hub, target: s.i, value: s.v })),
  ];

  return (
    <div className="h-[26rem] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={{ nodes, links }}
          nodePadding={18}
          nodeWidth={12}
          linkCurvature={0.5}
          iterations={64}
          margin={{ top: 8, right: 150, bottom: 8, left: 130 }}
          node={<SankeyNode />}
          link={{ stroke: "#475569", strokeOpacity: 0.28 }}
        >
          <Tooltip
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            formatter={(v) => money(Number(v))}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}

function SankeyNode(props: any) {
  const { x, y, width, height, index, payload, containerWidth } = props;
  const kind: Kind = payload.kind;
  const isLeft = x + width / 2 < (containerWidth ?? 800) / 2;
  return (
    <Layer key={`node-${index}`}>
      <Rectangle x={x} y={y} width={width} height={height} fill={COLOR[kind]} fillOpacity={0.9} radius={2} />
      <text
        x={isLeft ? x + width + 6 : x - 6}
        y={y + height / 2}
        textAnchor={isLeft ? "start" : "end"}
        dominantBaseline="middle"
        fontSize={11}
        fill="var(--foreground)"
      >
        {payload.name}
      </text>
      <text
        x={isLeft ? x + width + 6 : x - 6}
        y={y + height / 2 + 12}
        textAnchor={isLeft ? "start" : "end"}
        dominantBaseline="middle"
        fontSize={10}
        fill="var(--muted-foreground)"
      >
        {money(payload.value)}
      </text>
    </Layer>
  );
}
