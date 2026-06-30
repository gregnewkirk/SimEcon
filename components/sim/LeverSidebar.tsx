"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { bracketLevers, topRateLever } from "@/lib/levers/tax-brackets";
import { corporateLever } from "@/lib/levers/corporate";
import { payrollCapLever } from "@/lib/levers/payroll";
import { capGainsLever } from "@/lib/levers/capital-gains";
import { estateLever } from "@/lib/levers/estate";
import { PROGRAM_LEVERS } from "@/lib/levers/programs";
import { REVENUE_LEVERS } from "@/lib/levers/revenue-options";
import type { Lever, LeverConfig } from "@/lib/levers/types";
import { LeverDetail } from "./LeverDetail";
import { leverDeficitImpact } from "./leverProjection";
import { signedMoney } from "./format";
import { C, SHADOW_SM } from "./theme";

const incomeLevers = [...bracketLevers, topRateLever];
const otherTaxLevers = [corporateLever, payrollCapLever, capGainsLever, estateLever];
const GLOBAL_MAX = Math.max(...[...PROGRAM_LEVERS, ...REVENUE_LEVERS].map((l) => Math.abs(leverDeficitImpact(l))));

function TierBadge({ lever }: { lever: Lever }) {
  const [bg, fg, text] = lever.contested
    ? ["#FFF4E5", C.amber, "contested"]
    : lever.tier === "calibrated"
      ? ["#E7F9EE", C.green, "calibrated"]
      : ["#E9F2FF", C.accent, "est"];
  return (
    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ background: bg, color: fg }}>
      {text}
    </span>
  );
}

/** A rounded white iOS-settings card wrapping a group of rows. */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: C.card, boxShadow: SHADOW_SM }}>
      {children}
    </div>
  );
}

function GroupHeader({ title }: { title: string }) {
  return <h4 className="mb-1.5 ml-1 mt-4 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>{title}</h4>;
}

function SliderRow({ lever, cfg, setLever, last }: { lever: Lever; cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void; last?: boolean }) {
  if (!lever.range) return null;
  const value = (cfg[lever.id] as number) ?? lever.range.baseline;
  const changed = value !== lever.range.baseline;
  return (
    <div className="px-3.5 py-2.5" style={last ? {} : { borderBottom: `1px solid ${C.hair}` }}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[13px]" style={{ color: C.ink }}>
          {lever.label}
          <TierBadge lever={lever} />
          <LeverDetail lever={lever} cfg={cfg} />
        </span>
        <span className="font-mono text-[13px] font-semibold tabular-nums" style={{ color: changed ? C.accent : C.inkMute }}>{value}%</span>
      </div>
      <Slider value={[value]} min={lever.range.min} max={lever.range.max} step={lever.range.step} onValueChange={(v) => setLever(lever.id, Array.isArray(v) ? v[0] : v)} />
    </div>
  );
}

function ToggleRow({ lever, cfg, setLever, last }: { lever: Lever; cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void; last?: boolean }) {
  const impact = leverDeficitImpact(lever);
  const on = cfg[lever.id] === true;
  const positive = impact > 0;
  const widthPct = Math.max(0.4, (Math.abs(impact) / GLOBAL_MAX) * 100);
  const color = positive ? C.green : C.red;
  return (
    <motion.div whileTap={{ scale: 0.985 }} className="flex items-center gap-3 px-3.5 py-2.5" style={last ? {} : { borderBottom: `1px solid ${C.hair}` }}>
      <span className="w-16 shrink-0 text-right font-mono text-[13px] font-semibold tabular-nums" style={{ color }}>
        {signedMoney(impact)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 text-[13px]" style={{ color: C.ink }}>
            <span className="truncate">{lever.label}</span>
            <TierBadge lever={lever} />
            <LeverDetail lever={lever} cfg={cfg} />
          </span>
          <Switch checked={on} onCheckedChange={(v) => setLever(lever.id, v)} />
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: C.hair }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${widthPct}%`, background: positive ? C.greenFill : C.redFill }} />
        </div>
      </div>
    </motion.div>
  );
}

const maxMag = (levers: Lever[]) => Math.max(...levers.map((l) => Math.abs(leverDeficitImpact(l))));

function groupedBySize(levers: Lever[]): [string, Lever[]][] {
  const m = new Map<string, Lever[]>();
  for (const l of levers) {
    const g = l.group ?? "Other";
    if (!m.has(g)) m.set(g, []);
    m.get(g)!.push(l);
  }
  for (const arr of m.values()) arr.sort((a, b) => Math.abs(leverDeficitImpact(b)) - Math.abs(leverDeficitImpact(a)));
  return [...m.entries()].sort((a, b) => maxMag(b[1]) - maxMag(a[1]));
}

export function LeverSidebar({ cfg, setLever }: { cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void }) {
  const [taxOpen, setTaxOpen] = useState(false);
  const topRate = (cfg.topRate as number) ?? 37;

  return (
    <div>
      <GroupHeader title="Taxes" />
      <Card>
        <Collapsible open={taxOpen} onOpenChange={setTaxOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between px-3.5 py-3 text-[13px]" style={{ color: C.ink, borderBottom: `1px solid ${C.hair}` }}>
            <span className="flex items-center gap-1.5">
              <ChevronRight className={`size-4 transition-transform ${taxOpen ? "rotate-90" : ""}`} style={{ color: C.inkMute }} />
              Income tax rates
            </span>
            <span className="font-mono" style={{ color: C.inkMute }}>top {topRate}%</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {incomeLevers.map((l, i) => (
              <SliderRow key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === incomeLevers.length - 1 && otherTaxLevers.length === 0} />
            ))}
          </CollapsibleContent>
        </Collapsible>
        {otherTaxLevers.map((l, i) => (
          <SliderRow key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === otherTaxLevers.length - 1} />
        ))}
      </Card>

      <div className="mb-1 mt-5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>Programs (spending)</div>
      {groupedBySize(PROGRAM_LEVERS).map(([group, levers]) => (
        <div key={group}>
          <GroupHeader title={group} />
          <Card>
            {levers.map((l, i) => (
              <ToggleRow key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === levers.length - 1} />
            ))}
          </Card>
        </div>
      ))}

      <div className="mb-1 mt-5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>Revenue &amp; savings</div>
      {groupedBySize(REVENUE_LEVERS).map(([group, levers]) => (
        <div key={group}>
          <GroupHeader title={group} />
          <Card>
            {levers.map((l, i) => (
              <ToggleRow key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === levers.length - 1} />
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}
