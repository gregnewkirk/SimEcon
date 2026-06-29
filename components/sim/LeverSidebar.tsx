"use client";

import { useState } from "react";
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
import { getCitation } from "@/lib/citations";
import { LeverDetail } from "./LeverDetail";
import { leverDeficitImpact } from "./leverProjection";
import { signedMoney } from "./format";

const incomeLevers = [...bracketLevers, topRateLever];
const otherTaxLevers = [corporateLever, payrollCapLever, capGainsLever, estateLever];

// Largest single toggle magnitude (VAT) sets the size-bar scale, so the bars show true
// relative scale: the carbon-tax sliver next to the VAT giant.
const GLOBAL_MAX = Math.max(
  ...[...PROGRAM_LEVERS, ...REVENUE_LEVERS].map((l) => Math.abs(leverDeficitImpact(l)))
);

function TierBadge({ lever }: { lever: Lever }) {
  if (lever.contested) {
    return <span className="rounded bg-amber-500/15 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-400">contested</span>;
  }
  const calibrated = lever.tier === "calibrated";
  return (
    <span
      className={`rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${calibrated ? "bg-emerald-500/15 text-emerald-400" : "bg-sky-500/15 text-sky-400"}`}
      title={calibrated ? "Scored to CBO/JCT within a few percent" : "Rougher cited estimate"}
    >
      {calibrated ? "calibrated" : "est"}
    </span>
  );
}

/** Tax-rate slider row. */
function SliderRow({ lever, cfg, setLever }: { lever: Lever; cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void }) {
  if (!lever.range) return null;
  const value = (cfg[lever.id] as number) ?? lever.range.baseline;
  const changed = value !== lever.range.baseline;
  const cite = getCitation(lever.citationIds[0]);
  return (
    <div className="py-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs" title={cite ? `${cite.agency} - ${cite.dataset}` : undefined}>
          {lever.label}
          <TierBadge lever={lever} />
          <LeverDetail lever={lever} cfg={cfg} />
        </span>
        <span className={`font-mono text-xs tabular-nums ${changed ? "text-foreground" : "text-muted-foreground"}`}>{value}%</span>
      </div>
      <Slider value={[value]} min={lever.range.min} max={lever.range.max} step={lever.range.step} onValueChange={(v) => setLever(lever.id, Array.isArray(v) ? v[0] : v)} />
    </div>
  );
}

/** Program / revenue toggle row with inline signed amount and size bar. */
function ToggleRow({ lever, cfg, setLever }: { lever: Lever; cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void }) {
  const impact = leverDeficitImpact(lever);
  const on = cfg[lever.id] === true;
  const positive = impact > 0;
  const widthPct = Math.max(0.4, (Math.abs(impact) / GLOBAL_MAX) * 100);
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className={`w-14 shrink-0 text-right font-mono text-xs font-medium tabular-nums ${positive ? "text-emerald-400" : "text-rose-400"}`}>
        {signedMoney(impact)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 truncate text-xs">
            <span className="truncate">{lever.label}</span>
            <TierBadge lever={lever} />
            <LeverDetail lever={lever} cfg={cfg} />
          </span>
          <Switch checked={on} onCheckedChange={(v) => setLever(lever.id, v)} />
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-border/40">
          <div className={`h-full rounded-full ${positive ? "bg-emerald-400/60" : "bg-rose-400/60"}`} style={{ width: `${widthPct}%` }} />
        </div>
      </div>
    </div>
  );
}

const maxMag = (levers: Lever[]) => Math.max(...levers.map((l) => Math.abs(leverDeficitImpact(l))));

/** Group toggles by lever.group, sort within group by size, order groups by their biggest item. */
function groupedBySize(levers: Lever[]): [string, Lever[]][] {
  const m = new Map<string, Lever[]>();
  for (const l of levers) {
    const g = l.group ?? "Other";
    if (!m.has(g)) m.set(g, []);
    m.get(g)!.push(l);
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => Math.abs(leverDeficitImpact(b)) - Math.abs(leverDeficitImpact(a)));
  }
  return [...m.entries()].sort((a, b) => maxMag(b[1]) - maxMag(a[1]));
}

function GroupHeader({ title }: { title: string }) {
  return <h4 className="mb-1 mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">{title}</h4>;
}

export function LeverSidebar({ cfg, setLever }: { cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void }) {
  const [taxOpen, setTaxOpen] = useState(false);
  const topRate = (cfg.topRate as number) ?? 37;

  return (
    <div className="space-y-5">
      {/* Taxes */}
      <section>
        <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Taxes</h3>
        <Collapsible open={taxOpen} onOpenChange={setTaxOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border border-border/50 bg-card/40 px-2.5 py-2 text-xs hover:bg-card/70">
            <span className="flex items-center gap-1.5">
              <ChevronRight className={`size-3.5 transition-transform ${taxOpen ? "rotate-90" : ""}`} />
              Income tax rates
            </span>
            <span className="font-mono text-muted-foreground">top {topRate}%</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-1">
            {incomeLevers.map((l) => (
              <SliderRow key={l.id} lever={l} cfg={cfg} setLever={setLever} />
            ))}
          </CollapsibleContent>
        </Collapsible>
        <div className="mt-1 divide-y divide-border/40">
          {otherTaxLevers.map((l) => (
            <SliderRow key={l.id} lever={l} cfg={cfg} setLever={setLever} />
          ))}
        </div>
      </section>

      {/* Programs */}
      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Programs (spending)</h3>
        {groupedBySize(PROGRAM_LEVERS).map(([group, levers]) => (
          <div key={group}>
            <GroupHeader title={group} />
            {levers.map((l) => (
              <ToggleRow key={l.id} lever={l} cfg={cfg} setLever={setLever} />
            ))}
          </div>
        ))}
      </section>

      {/* Revenue */}
      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Revenue & savings</h3>
        {groupedBySize(REVENUE_LEVERS).map(([group, levers]) => (
          <div key={group}>
            <GroupHeader title={group} />
            {levers.map((l) => (
              <ToggleRow key={l.id} lever={l} cfg={cfg} setLever={setLever} />
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
