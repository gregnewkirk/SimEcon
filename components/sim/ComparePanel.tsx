"use client";

import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from "recharts";
import { SCENARIOS } from "@/lib/scenarios";
import type { LeverConfig } from "@/lib/levers/types";
import type { YearData } from "@/lib/ledger/types";
import { C, SHADOW_SM } from "./theme";
import { trillions } from "./format";

const A = "#0a84ff";
const B = "#a855f7";

function debtFreeYear(years: YearData[]): number | null {
  const hit = years.find((y) => y.debtT <= 0);
  return hit ? hit.year : null;
}

function PlanPicker({
  label,
  color,
  active,
  onPick,
}: {
  label: string;
  color: string;
  active: string | null;
  onPick: (id: string, cfg: LeverConfig) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
        <span className="inline-block size-2.5 rounded-full" style={{ background: color }} />
        {label}
      </div>
      <select
        value={active ?? ""}
        onChange={(e) => {
          const s = SCENARIOS.find((x) => x.id === e.target.value);
          if (s) onPick(s.id, s.config);
        }}
        className="w-full rounded-xl px-3 py-2 text-sm font-medium"
        style={{ background: C.card, color: C.ink, boxShadow: SHADOW_SM, border: `1.5px solid ${active ? color : "transparent"}` }}
      >
        <option value="">Current law (nothing loaded)</option>
        {SCENARIOS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Compare two plans head to head: load a platform on each side and see the debt
 * paths, the debt-free years, and the gap between them. Built for arguments.
 */
export function ComparePanel({
  yearsA,
  yearsB,
  activeA,
  activeB,
  onPickA,
  onPickB,
}: {
  yearsA: YearData[];
  yearsB: YearData[];
  activeA: string | null;
  activeB: string | null;
  onPickA: (id: string, cfg: LeverConfig) => void;
  onPickB: (id: string, cfg: LeverConfig) => void;
}) {
  const mapB = new Map(yearsB.map((y) => [y.year, y.debtToGdp]));
  const data = yearsA.map((y) => ({
    year: y.year,
    a: Math.round(y.debtToGdp * 10) / 10,
    b: mapB.has(y.year) ? Math.round((mapB.get(y.year) as number) * 10) / 10 : undefined,
  }));

  const labelA = SCENARIOS.find((s) => s.id === activeA)?.label ?? "Plan A (current law)";
  const labelB = SCENARIOS.find((s) => s.id === activeB)?.label ?? "Plan B (current law)";
  const freeA = debtFreeYear(yearsA);
  const freeB = debtFreeYear(yearsB);
  const endA = yearsA[yearsA.length - 1];
  const endB = yearsB[yearsB.length - 1];
  const gapT = endA && endB ? endB.debtT - endA.debtT : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <PlanPicker label="Plan A" color={A} active={activeA} onPick={onPickA} />
        <PlanPicker label="Plan B" color={B} active={activeB} onPick={onPickB} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl px-4 py-3" style={{ background: C.card, boxShadow: SHADOW_SM }}>
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: A }}>{labelA}</div>
          <div className="mt-1 font-mono text-lg font-bold tabular-nums" style={{ color: C.ink }}>
            {freeA ? `debt-free ${freeA}` : endA ? `${trillions(endA.debtT * 1000)} in 2050` : "—"}
          </div>
        </div>
        <div className="rounded-2xl px-4 py-3" style={{ background: C.card, boxShadow: SHADOW_SM }}>
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: B }}>{labelB}</div>
          <div className="mt-1 font-mono text-lg font-bold tabular-nums" style={{ color: C.ink }}>
            {freeB ? `debt-free ${freeB}` : endB ? `${trillions(endB.debtT * 1000)} in 2050` : "—"}
          </div>
        </div>
        <div className="rounded-2xl px-4 py-3" style={{ background: C.card, boxShadow: SHADOW_SM }}>
          <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.inkMute }}>Difference in 2050</div>
          <div className="mt-1 font-mono text-lg font-bold tabular-nums" style={{ color: gapT === 0 ? C.inkMute : gapT > 0 ? C.red : C.green }}>
            {gapT === 0 ? "—" : `${gapT > 0 ? "+" : "−"}${trillions(Math.abs(gapT) * 1000)}`}
            <span className="ml-1 text-xs font-medium" style={{ color: C.inkMute }}>
              {gapT === 0 ? "" : gapT > 0 ? "more debt under B" : "less debt under B"}
            </span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#8A8A8E" }} stroke="var(--border)" />
            <YAxis tick={{ fontSize: 11, fill: "#8A8A8E" }} stroke="var(--border)" unit="%" width={44} />
            <Tooltip
              contentStyle={{ background: "#FFFFFF", border: "1px solid #E5E5EA", borderRadius: 12, fontSize: 12, color: "#1C1C1E" }}
              formatter={(v) => `${Number(v)}%`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={0} stroke="#34d399" strokeOpacity={0.5} />
            <Line dataKey="a" stroke={A} strokeWidth={2.5} dot={false} name={labelA} />
            <Line dataKey="b" stroke={B} strokeWidth={2.5} dot={false} strokeDasharray="5 4" name={labelB} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs" style={{ color: C.inkMute }}>
        Both plans run through the same engine and assumptions — only the levers differ. Plan A is the one you edit in the sidebar.
      </p>
    </div>
  );
}
