"use client";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TAX_LEVERS } from "@/lib/levers/registry";
import { PROGRAM_LEVERS } from "@/lib/levers/programs";
import { REVENUE_LEVERS } from "@/lib/levers/revenue-options";
import type { Lever, LeverConfig } from "@/lib/levers/types";
import { getCitation } from "@/lib/citations";
import { LeverDetail } from "./LeverDetail";

function TierBadge({ lever }: { lever: Lever }) {
  if (lever.contested) {
    return <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-400">contested</span>;
  }
  const calibrated = lever.tier === "calibrated";
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
        calibrated ? "bg-emerald-500/15 text-emerald-400" : "bg-sky-500/15 text-sky-400"
      }`}
      title={calibrated ? "Scored to CBO/JCT within a few percent" : "Rougher cited estimate"}
    >
      {calibrated ? "calibrated" : "estimate"}
    </span>
  );
}

function LeverRow({
  lever,
  cfg,
  setLever,
}: {
  lever: Lever;
  cfg: LeverConfig;
  setLever: (id: string, v: number | boolean) => void;
}) {
  const cite = getCitation(lever.citationIds[0]);
  const sourceTitle = cite ? `${cite.agency} - ${cite.dataset}` : undefined;

  if (lever.range) {
    const value = (cfg[lever.id] as number) ?? lever.range.baseline;
    const changed = value !== lever.range.baseline;
    return (
      <div className="py-2">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs" title={sourceTitle}>
            {lever.label}
            <TierBadge lever={lever} />
            <LeverDetail lever={lever} cfg={cfg} />
          </span>
          <span className={`font-mono text-xs tabular-nums ${changed ? "text-foreground" : "text-muted-foreground"}`}>
            {value}%
          </span>
        </div>
        <Slider
          value={[value]}
          min={lever.range.min}
          max={lever.range.max}
          step={lever.range.step}
          onValueChange={(v) => setLever(lever.id, Array.isArray(v) ? v[0] : v)}
        />
      </div>
    );
  }

  const on = cfg[lever.id] === true;
  return (
    <label className="flex items-center justify-between gap-2 py-1.5 text-xs" title={sourceTitle}>
      <span className="flex items-center gap-1.5">
        {lever.label}
        <TierBadge lever={lever} />
      </span>
      <Switch checked={on} onCheckedChange={(v) => setLever(lever.id, v)} />
    </label>
  );
}

function Group({ title, levers, cfg, setLever }: { title: string; levers: Lever[]; cfg: LeverConfig; setLever: (id: string, v: number | boolean) => void }) {
  return (
    <div className="mb-4">
      <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
      <div className="divide-y divide-border/40">
        {levers.map((l) => (
          <LeverRow key={l.id} lever={l} cfg={cfg} setLever={setLever} />
        ))}
      </div>
    </div>
  );
}

export function LeverSidebar({
  cfg,
  setLever,
}: {
  cfg: LeverConfig;
  setLever: (id: string, v: number | boolean) => void;
}) {
  return (
    <div className="space-y-1">
      <Group title="Taxes" levers={TAX_LEVERS} cfg={cfg} setLever={setLever} />
      <Group title="Programs (spending)" levers={PROGRAM_LEVERS} cfg={cfg} setLever={setLever} />
      <Group title="Revenue & savings options" levers={REVENUE_LEVERS} cfg={cfg} setLever={setLever} />
    </div>
  );
}
