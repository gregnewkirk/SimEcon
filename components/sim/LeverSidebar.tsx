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
import { leverDeficitImpact, leverImpactAt } from "./leverProjection";
import { signedMoney } from "./format";
import { C, SHADOW_SM } from "./theme";

const incomeLevers = [...bracketLevers, topRateLever];
const otherTaxLevers = [corporateLever, payrollCapLever, capGainsLever, estateLever];
const GLOBAL_MAX = Math.max(...[...PROGRAM_LEVERS, ...REVENUE_LEVERS].map((l) => Math.abs(leverDeficitImpact(l))));

const isDial = (l: Lever) => l.category !== "tax" && !!l.range;
const isOn = (l: Lever, cfg: LeverConfig) => (isDial(l) ? ((cfg[l.id] as number) ?? 0) > 0 : cfg[l.id] === true);

function dialReadout(value: number, unit?: string) {
  if (unit === "$/mo") return `$${value}/mo`;
  return `${value}${unit ?? ""}`;
}

function TierBadge({ lever }: { lever: Lever }) {
  const [bg, fg, text] = lever.contested
    ? ["#FFF4E5", C.amber, "contested"]
    : lever.tier === "calibrated"
      ? ["#E7F9EE", C.green, "calibrated"]
      : ["#E9F2FF", C.accent, "est"];
  return <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ background: bg, color: fg }}>{text}</span>;
}

function rowBorder(last?: boolean) {
  return last ? {} : { borderBottom: `1px solid ${C.hair}` };
}

function LeverLabel({ lever, cfg }: { lever: Lever; cfg: LeverConfig }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-[13px]" style={{ color: C.ink }}>
      <span className="truncate">{lever.label}</span>
      <TierBadge lever={lever} />
      <LeverDetail lever={lever} cfg={cfg} />
    </span>
  );
}

function SliderRow({ lever, cfg, setLever, last }: { lever: Lever; cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void; last?: boolean }) {
  if (!lever.range) return null;
  const value = (cfg[lever.id] as number) ?? lever.range.baseline;
  const changed = value !== lever.range.baseline;
  return (
    <div className="px-3.5 py-2.5" style={rowBorder(last)}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <LeverLabel lever={lever} cfg={cfg} />
        <span className="font-mono text-[13px] font-semibold tabular-nums" style={{ color: changed ? C.accent : C.inkMute }}>{value}%</span>
      </div>
      <Slider value={[value]} min={lever.range.min} max={lever.range.max} step={lever.range.step} onValueChange={(v) => setLever(lever.id, Array.isArray(v) ? v[0] : v)} />
    </div>
  );
}

/** A big lever rendered as a dial: live dollar impact + slider + size bar. */
function DialRow({ lever, cfg, setLever, last }: { lever: Lever; cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void; last?: boolean }) {
  if (!lever.range) return null;
  const value = (cfg[lever.id] as number) ?? 0;
  const impact = leverImpactAt(lever, cfg);
  const positive = impact > 0;
  const color = value === 0 ? C.inkMute : positive ? C.green : C.red;
  const widthPct = Math.min(100, Math.max(0, (Math.abs(impact) / GLOBAL_MAX) * 100));
  return (
    <div className="flex items-start gap-3 px-3.5 py-2.5" style={rowBorder(last)}>
      <span className="mt-0.5 w-16 shrink-0 text-right font-mono text-[13px] font-semibold tabular-nums" style={{ color }}>
        {value === 0 ? "—" : signedMoney(impact)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <LeverLabel lever={lever} cfg={cfg} />
          <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums" style={{ color: value === 0 ? C.inkMute : C.accent }}>{dialReadout(value, lever.unit)}</span>
        </div>
        <div className="mt-1.5">
          <Slider value={[value]} min={lever.range.min} max={lever.range.max} step={lever.range.step} onValueChange={(v) => setLever(lever.id, Array.isArray(v) ? v[0] : v)} />
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: C.hair }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${widthPct}%`, background: positive ? C.greenFill : C.redFill }} />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ lever, cfg, setLever, last }: { lever: Lever; cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void; last?: boolean }) {
  const impact = leverDeficitImpact(lever);
  const on = cfg[lever.id] === true;
  const positive = impact > 0;
  const widthPct = Math.max(0.4, (Math.abs(impact) / GLOBAL_MAX) * 100);
  return (
    <motion.div whileTap={{ scale: 0.985 }} className="flex items-center gap-3 px-3.5 py-2.5" style={rowBorder(last)}>
      <span className="w-16 shrink-0 text-right font-mono text-[13px] font-semibold tabular-nums" style={{ color: positive ? C.green : C.red }}>{signedMoney(impact)}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <LeverLabel lever={lever} cfg={cfg} />
          <Switch checked={on} onCheckedChange={(v) => setLever(lever.id, v)} />
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: C.hair }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${widthPct}%`, background: positive ? C.greenFill : C.redFill }} />
        </div>
      </div>
    </motion.div>
  );
}

function Row({ lever, cfg, setLever, last }: { lever: Lever; cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void; last?: boolean }) {
  if (lever.category === "tax") return <SliderRow lever={lever} cfg={cfg} setLever={setLever} last={last} />;
  if (isDial(lever)) return <DialRow lever={lever} cfg={cfg} setLever={setLever} last={last} />;
  return <ToggleRow lever={lever} cfg={cfg} setLever={setLever} last={last} />;
}

function SelectAllButton({ levers, cfg, setLevers }: { levers: Lever[]; cfg: LeverConfig; setLevers: (u: LeverConfig) => void }) {
  const allOn = levers.every((l) => isOn(l, cfg));
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={(e) => {
        e.stopPropagation();
        const updates: LeverConfig = {};
        for (const l of levers) updates[l.id] = allOn ? (isDial(l) ? 0 : false) : (l.onValue ?? true);
        setLevers(updates);
      }}
      className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={allOn ? { background: "#F0F0F3", color: C.inkMute } : { background: C.accent, color: "#fff" }}
    >
      {allOn ? "Clear" : "All"}
    </motion.button>
  );
}

function Section({ title, summary, action, defaultOpen = false, children }: { title: string; summary?: React.ReactNode; action?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2.5 overflow-hidden rounded-2xl" style={{ background: C.card, boxShadow: SHADOW_SM }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2 pr-2.5">
          <CollapsibleTrigger className="flex flex-1 items-center justify-between gap-2 px-3.5 py-3 text-left">
            <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: C.ink }}>
              <ChevronRight className={`size-4 transition-transform ${open ? "rotate-90" : ""}`} style={{ color: C.inkMute }} />
              {title}
            </span>
            {summary}
          </CollapsibleTrigger>
          {action}
        </div>
        <CollapsibleContent style={{ borderTop: `1px solid ${C.hair}` }}>{children}</CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function ToggleSummary({ levers, cfg }: { levers: Lever[]; cfg: LeverConfig }) {
  const active = levers.filter((l) => isOn(l, cfg));
  if (active.length === 0) return <span className="text-xs" style={{ color: C.inkMute }}>{levers.length}</span>;
  const net = active.reduce((s, l) => s + leverImpactAt(l, cfg), 0);
  return (
    <span className="flex items-center gap-1.5">
      <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: C.accent, color: "#fff" }}>{active.length} on</span>
      <span className="font-mono text-xs font-semibold tabular-nums" style={{ color: net > 0 ? C.green : C.red }}>{signedMoney(net)}</span>
    </span>
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

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 ml-1 mt-4 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>{children}</div>;
}

export function LeverSidebar({ cfg, setLever, setLevers }: { cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void; setLevers: (u: LeverConfig) => void }) {
  const topRate = (cfg.topRate as number) ?? 37;
  const changedOther = otherTaxLevers.filter((l) => l.range && cfg[l.id] !== l.range.baseline).length;

  return (
    <div>
      <GroupLabel>Taxes</GroupLabel>
      <Section title="Income tax rates" summary={<span className="font-mono text-xs" style={{ color: C.inkMute }}>top {topRate}%</span>}>
        {incomeLevers.map((l, i) => <Row key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === incomeLevers.length - 1} />)}
      </Section>
      <Section title="Other taxes" summary={changedOther > 0 ? <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: C.accent, color: "#fff" }}>{changedOther} changed</span> : <span className="text-xs" style={{ color: C.inkMute }}>{otherTaxLevers.length}</span>}>
        {otherTaxLevers.map((l, i) => <Row key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === otherTaxLevers.length - 1} />)}
      </Section>

      <GroupLabel>Programs (spending)</GroupLabel>
      {groupedBySize(PROGRAM_LEVERS).map(([group, levers]) => (
        <Section key={group} title={group} summary={<ToggleSummary levers={levers} cfg={cfg} />} action={<SelectAllButton levers={levers} cfg={cfg} setLevers={setLevers} />}>
          {levers.map((l, i) => <Row key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === levers.length - 1} />)}
        </Section>
      ))}

      <GroupLabel>Revenue &amp; savings</GroupLabel>
      {groupedBySize(REVENUE_LEVERS).map(([group, levers]) => (
        <Section key={group} title={group} summary={<ToggleSummary levers={levers} cfg={cfg} />} action={<SelectAllButton levers={levers} cfg={cfg} setLevers={setLevers} />}>
          {levers.map((l, i) => <Row key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === levers.length - 1} />)}
        </Section>
      ))}
    </div>
  );
}
