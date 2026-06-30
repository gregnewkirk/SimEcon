"use client";

import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from "recharts";
import type { YearData } from "@/lib/ledger/types";
import { money } from "./format";
import { C } from "./theme";

type Kind = "revenue" | "borrow" | "hub" | "spending";
const COLOR: Record<Kind, string> = {
  revenue: C.greenFill,
  borrow: C.amberFill,
  hub: "#AEAEB2",
  spending: C.redFill,
};

/**
 * Money flow for the current year: revenue and borrowing on the left flow through the
 * federal budget out to spending on the right. The links carry a moving dashed "belt" so
 * you can see the money traveling, Factorio-style, and it re-flows as levers move.
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
    <div className="h-[30rem] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={{ nodes, links }}
          nodePadding={26}
          nodeWidth={11}
          linkCurvature={0.5}
          iterations={64}
          margin={{ top: 14, right: 168, bottom: 14, left: 150 }}
          node={<SankeyNode />}
          link={<SankeyLink />}
        >
          <Tooltip
            contentStyle={{ background: C.card, border: `1px solid ${C.hair}`, borderRadius: 12, fontSize: 12, color: C.ink, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
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
      <Rectangle x={x} y={y} width={width} height={height} fill={COLOR[kind]} fillOpacity={0.95} radius={3} />
      <text x={isLeft ? x + width + 7 : x - 7} y={y + height / 2} textAnchor={isLeft ? "start" : "end"} dominantBaseline="middle" fontSize={11.5} fontWeight={500} fill={C.ink}>
        {payload.name}
      </text>
      <text x={isLeft ? x + width + 7 : x - 7} y={y + height / 2 + 13} textAnchor={isLeft ? "start" : "end"} dominantBaseline="middle" fontSize={10.5} fill={C.inkMute}>
        {money(payload.value)}
      </text>
    </Layer>
  );
}

function SankeyLink(props: any) {
  const { sourceX, sourceY, sourceControlX, targetControlX, targetX, targetY, linkWidth, index, payload } = props;
  const d = `M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
  const w = Math.max(1, linkWidth);
  // Tint each band by where the money is going: from revenue (green), borrowing (amber),
  // or out to spending (red). Static and soft so it reads as a calm flow, not a pulse.
  const srcKind: Kind | undefined = payload?.source?.kind;
  const tgtKind: Kind | undefined = payload?.target?.kind;
  const color = srcKind === "revenue" ? C.greenFill : srcKind === "borrow" ? C.amberFill : tgtKind === "spending" ? C.redFill : "#C7CCD6";
  return (
    <Layer key={`link-${index}`}>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeOpacity={0.22} />
    </Layer>
  );
}
