"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useSimEngine, type SimMode } from "@/hooks/useSimEngine";
import { LeverSidebar } from "./LeverSidebar";
import { EventControls } from "./EventControls";
import { HeadlineStats } from "./HeadlineStats";
import { TrajectoryChart } from "./TrajectoryChart";
import { MoneyFlowSankey } from "./MoneyFlowSankey";
import { BracketCharacters } from "./BracketCharacters";
import { trillions } from "./format";

export function SimDashboard() {
  const sim = useSimEngine();
  const [yearIdx, setYearIdx] = useState(0); // index into fix-mode years (0 = 2026)
  const fixYear = sim.years[Math.min(yearIdx, sim.years.length - 1)] ?? sim.years[0];

  const cf2025 = sim.counterfactual[sim.counterfactual.length - 1];
  const ac2025 = sim.actual[sim.actual.length - 1];
  const debtSaved = ac2025 && cf2025 ? ac2025.debtT - cf2025.debtT : 0;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 text-foreground">
      {/* Header */}
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight">
            Sim<span className="text-emerald-400">Econ</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            A sandbox of the U.S. federal budget. Pull the levers, watch it flow. Every number is sourced.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Dynamic effects
            <Switch checked={sim.useDynamic} onCheckedChange={sim.setUseDynamic} />
          </label>
          <Button variant="outline" size="sm" onClick={sim.reset}>
            Reset
          </Button>
        </div>
      </header>

      {/* Mode tabs */}
      <Tabs value={sim.mode} onValueChange={(v) => sim.setMode(v as SimMode)} className="mb-4">
        <TabsList>
          <TabsTrigger value="whatif">What if we had...</TabsTrigger>
          <TabsTrigger value="fix">Fix this mess</TabsTrigger>
        </TabsList>
      </Tabs>

      {sim.mode === "fix" ? (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-xl border border-border/60 bg-card/30 p-4">
            <LeverSidebar cfg={sim.cfg} setLever={sim.setLever} />
          </aside>

          <main className="space-y-5">
            {/* Year scrubber */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold tabular-nums">{fixYear?.year}</span>
              <Slider
                value={[yearIdx]}
                min={0}
                max={sim.years.length - 1}
                step={1}
                onValueChange={(v) => setYearIdx(Array.isArray(v) ? v[0] : v)}
                className="flex-1"
              />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">scrub to 2050</span>
            </div>

            {fixYear && <HeadlineStats year={fixYear} />}

            <section className="rounded-xl border border-border/60 bg-card/30 p-4">
              <h2 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Gross federal debt as a share of GDP, through 2050
              </h2>
              <TrajectoryChart mode="fix" years={sim.years} actual={sim.actual} counterfactual={sim.counterfactual} />
            </section>

            <section className="rounded-xl border border-border/60 bg-card/30 p-4">
              <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Where the money flows ({fixYear?.year})
              </h2>
              {fixYear && <MoneyFlowSankey year={fixYear} />}
            </section>

            <section className="rounded-xl border border-border/60 bg-card/30 p-4">
              <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Who pays, who gains (per year)
              </h2>
              <BracketCharacters incidence={sim.incidence} />
            </section>
          </main>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-xl border border-border/60 bg-card/30 p-4">
            <EventControls events={sim.events} toggleEvent={sim.toggleEvent} />
          </aside>
          <main className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Actual debt, 2025" value={ac2025 ? trillions(ac2025.debtT * 1000) : "-"} tone="rose" />
              <MiniStat label="Counterfactual debt, 2025" value={cf2025 ? trillions(cf2025.debtT * 1000) : "-"} tone="emerald" />
              <MiniStat label="Debt avoided" value={`$${debtSaved.toFixed(1)}T`} tone="amber" />
            </div>
            <section className="rounded-xl border border-border/60 bg-card/30 p-4">
              <h2 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                The road from the last balanced budget (2000)
              </h2>
              <TrajectoryChart mode="whatif" years={sim.years} actual={sim.actual} counterfactual={sim.counterfactual} />
            </section>
          </main>
        </div>
      )}

      <footer className="mt-8 text-center text-[10px] text-muted-foreground">
        Illustrative model calibrated to CBO, JCT, OMB, and Treasury figures. Not a forecast.
      </footer>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "rose" | "emerald" | "amber" }) {
  const color = tone === "rose" ? "text-rose-400" : tone === "emerald" ? "text-emerald-400" : "text-amber-400";
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 px-3 py-2.5">
      <div className="mb-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-mono text-xl font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
