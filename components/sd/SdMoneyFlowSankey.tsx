"use client";

import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from "recharts";
import type { SdYearData } from "@/lib/sd/types";
import { moneyM } from "./format";
import { C } from "@/components/sim/theme";

type Kind = "revenue" | "draw" | "hub" | "spending";
const COLOR: Record<Kind, string> = {
  revenue: C.greenFill,
  draw: C.amberFill,
  hub: "#AEAEB2",
  spending: C.redFill,
};

/**
 * Money flow for the current year: revenues on the left flow through the General Fund out
 * to departments on the right. A budget gap shows up as a "Reserve draw / gap" inflow -
 * the city's version of borrowing.
 */
export function SdMoneyFlowSankey({ year }: { year: SdYearData }) {
  const revenue = year.lines.filter((l) => l.side === "revenue" && l.valueM > 1);
  const spending = year.lines.filter((l) => l.side === "spending" && l.valueM > 1);
  const draw = Math.max(0, year.gapM);

  const nodes: { name: string; kind: Kind }[] = [];
  const idx = (name: string, kind: Kind) => {
    nodes.push({ name, kind });
    return nodes.length - 1;
  };

  const revIdx = revenue.map((l) => ({ i: idx(l.label, "revenue"), v: l.valueM }));
  const drawIdx = draw > 1 ? idx("Reserve draw (gap)", "draw") : -1;
  const hub = idx("General Fund", "hub");
  const spendIdx = spending.map((l) => ({ i: idx(l.label, "spending"), v: l.valueM }));

  const links = [
    ...revIdx.map((r) => ({ source: r.i, target: hub, value: r.v })),
    ...(drawIdx >= 0 ? [{ source: drawIdx, target: hub, value: draw }] : []),
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
            formatter={(v) => moneyM(Number(v))}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
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
        {moneyM(payload.value)}
      </text>
    </Layer>
  );
}

function SankeyLink(props: any) {
  const { sourceX, sourceY, sourceControlX, targetControlX, targetX, targetY, linkWidth, index, payload } = props;
  const d = `M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
  const w = Math.max(1, linkWidth);
  const srcKind: Kind | undefined = payload?.source?.kind;
  const tgtKind: Kind | undefined = payload?.target?.kind;
  const color = srcKind === "revenue" ? C.greenFill : srcKind === "draw" ? C.amberFill : tgtKind === "spending" ? C.redFill : "#C7CCD6";
  return (
    <Layer key={`link-${index}`}>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeOpacity={0.22} />
    </Layer>
  );
}
