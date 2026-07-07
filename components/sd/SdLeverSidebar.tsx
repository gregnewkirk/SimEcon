"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { SD_POLICE_LEVERS, SD_DEPT_LEVERS, SD_REVENUE_LEVERS, SD_PENSION_LEVERS } from "@/lib/sd/levers";
import type { SdLever, SdLeverConfig } from "@/lib/sd/types";
import { SdLeverDetail } from "./SdLeverDetail";
import { sdLeverGapImpact, sdLeverImpactAt } from "./leverProjection";
import { signedMoneyM } from "./format";
import { C, SHADOW_SM } from "@/components/sim/theme";

const ALL_SIDEBAR_LEVERS = [...SD_POLICE_LEVERS, ...SD_DEPT_LEVERS, ...SD_REVENUE_LEVERS, ...SD_PENSION_LEVERS];
const GLOBAL_MAX = Math.max(...ALL_SIDEBAR_LEVERS.map((l) => Math.abs(sdLeverGapImpact(l))));

const isDial = (l: SdLever) => !!l.range;
const isOn = (l: SdLever, cfg: SdLeverConfig) =>
  isDial(l) ? ((cfg[l.id] as number) ?? l.range!.baseline) !== l.range!.baseline : cfg[l.id] === true;

function dialReadout(value: number, unit?: string) {
  if (unit === "officers") return value.toLocaleString("en-US");
  if (unit === "$M") return `$${value}M`;
  return `${value}${unit ?? ""}`;
}

function TierBadge({ lever }: { lever: SdLever }) {
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

function LeverLabel({ lever, cfg }: { lever: SdLever; cfg: SdLeverConfig }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-[13px]" style={{ color: C.ink }}>
      <span className="truncate">{lever.label}</span>
      <TierBadge lever={lever} />
      <SdLeverDetail lever={lever} cfg={cfg} />
    </span>
  );
}

/** A lever rendered as a dial: live dollar impact + slider + size bar. */
function DialRow({ lever, cfg, setLever, last }: { lever: SdLever; cfg: SdLeverConfig; setLever: (id: string, v: number | boolean) => void; last?: boolean }) {
  if (!lever.range) return null;
  const value = (cfg[lever.id] as number) ?? lever.range.baseline;
  const changed = value !== lever.range.baseline;
  const impact = sdLeverImpactAt(lever, cfg);
  const positive = impact > 0;
  const color = !changed ? C.inkMute : positive ? C.green : C.red;
  const widthPct = Math.min(100, Math.max(0, (Math.abs(impact) / GLOBAL_MAX) * 100));
  return (
    <div className="flex items-start gap-3 px-3.5 py-2.5" style={rowBorder(last)}>
      <span className="mt-0.5 w-16 shrink-0 text-right font-mono text-[13px] font-semibold tabular-nums" style={{ color }}>
        {!changed ? "—" : signedMoneyM(impact)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <LeverLabel lever={lever} cfg={cfg} />
          <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums" style={{ color: !changed ? C.inkMute : C.accent }}>{dialReadout(value, lever.unit)}</span>
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

function ToggleRow({ lever, cfg, setLever, last }: { lever: SdLever; cfg: SdLeverConfig; setLever: (id: string, v: number | boolean) => void; last?: boolean }) {
  const impact = sdLeverGapImpact(lever);
  const on = cfg[lever.id] === true;
  const positive = impact > 0;
  const widthPct = Math.max(0.4, (Math.abs(impact) / GLOBAL_MAX) * 100);
  return (
    <motion.div whileTap={{ scale: 0.985 }} className="flex items-center gap-3 px-3.5 py-2.5" style={rowBorder(last)}>
      <span className="w-16 shrink-0 text-right font-mono text-[13px] font-semibold tabular-nums" style={{ color: positive ? C.green : C.red }}>{signedMoneyM(impact)}</span>
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

function Row({ lever, cfg, setLever, last }: { lever: SdLever; cfg: SdLeverConfig; setLever: (id: string, v: number | boolean) => void; last?: boolean }) {
  if (isDial(lever)) return <DialRow lever={lever} cfg={cfg} setLever={setLever} last={last} />;
  return <ToggleRow lever={lever} cfg={cfg} setLever={setLever} last={last} />;
}

function Section({ title, icon, summary, defaultOpen = false, children }: { title: string; icon?: string; summary?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2.5 overflow-hidden rounded-2xl" style={{ background: C.card, boxShadow: SHADOW_SM }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2 pr-2.5">
          <CollapsibleTrigger className="flex flex-1 items-center justify-between gap-2 px-3.5 py-3 text-left">
            <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: C.ink }}>
              <ChevronRight className={`size-4 transition-transform ${open ? "rotate-90" : ""}`} style={{ color: C.inkMute }} />
              {icon && <span aria-hidden>{icon}</span>}
              {title}
            </span>
            {summary}
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent style={{ borderTop: `1px solid ${C.hair}` }}>{children}</CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function SectionSummary({ levers, cfg }: { levers: SdLever[]; cfg: SdLeverConfig }) {
  const active = levers.filter((l) => isOn(l, cfg));
  if (active.length === 0) return <span className="text-xs" style={{ color: C.inkMute }}>{levers.length}</span>;
  const net = active.reduce((s, l) => s + sdLeverImpactAt(l, cfg), 0);
  return (
    <span className="flex items-center gap-1.5">
      <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: C.accent, color: "#fff" }}>{active.length} changed</span>
      <span className="font-mono text-xs font-semibold tabular-nums" style={{ color: net > 0 ? C.green : C.red }}>{signedMoneyM(net)}</span>
    </span>
  );
}

function groupOf(levers: SdLever[]): [string, SdLever[]][] {
  const m = new Map<string, SdLever[]>();
  for (const l of levers) {
    const g = l.group ?? "Other";
    if (!m.has(g)) m.set(g, []);
    m.get(g)!.push(l);
  }
  return [...m.entries()];
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 ml-1 mt-4 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>{children}</div>;
}

export function SdLeverSidebar({ cfg, setLever }: { cfg: SdLeverConfig; setLever: (id: string, v: number | boolean) => void }) {
  return (
    <div>
      <GroupLabel>Police - the biggest line in the budget</GroupLabel>
      <Section title="Police (SDPD)" icon="🚔" summary={<SectionSummary levers={SD_POLICE_LEVERS} cfg={cfg} />} defaultOpen>
        {SD_POLICE_LEVERS.map((l, i) => <Row key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === SD_POLICE_LEVERS.length - 1} />)}
      </Section>

      <GroupLabel>Everything else the city runs</GroupLabel>
      {groupOf(SD_DEPT_LEVERS).map(([group, levers]) => (
        <Section key={group} title={group} summary={<SectionSummary levers={levers} cfg={cfg} />}>
          {levers.map((l, i) => <Row key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === levers.length - 1} />)}
        </Section>
      ))}

      <GroupLabel>Revenue</GroupLabel>
      {groupOf(SD_REVENUE_LEVERS).map(([group, levers]) => (
        <Section key={group} title={group} summary={<SectionSummary levers={levers} cfg={cfg} />}>
          {levers.map((l, i) => <Row key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === levers.length - 1} />)}
        </Section>
      ))}

      <GroupLabel>The pension (history&apos;s ghost)</GroupLabel>
      {groupOf(SD_PENSION_LEVERS).map(([group, levers]) => (
        <Section key={group} title={group} icon="👻" summary={<SectionSummary levers={levers} cfg={cfg} />}>
          {levers.map((l, i) => <Row key={l.id} lever={l} cfg={cfg} setLever={setLever} last={i === levers.length - 1} />)}
        </Section>
      ))}
    </div>
  );
}
