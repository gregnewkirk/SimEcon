"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useSimEngine } from "@/hooks/useSimEngine";
import { SegmentedControl } from "./SegmentedControl";
import { LeverSidebar } from "./LeverSidebar";
import { ScenarioPresets } from "./ScenarioPresets";
import { EventControls } from "./EventControls";
import { HeadlineStats } from "./HeadlineStats";
import { TrajectoryChart } from "./TrajectoryChart";
import { MoneyFlowSankey } from "./MoneyFlowSankey";
import { BracketCharacters } from "./BracketCharacters";
import { Confetti } from "./Confetti";
import { InfoPopover } from "./InfoPopover";
import { trillions } from "./format";
import { C, SHADOW, SHADOW_SM, SPRING } from "./theme";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="rounded-3xl p-4 sm:p-5" style={{ background: C.card, boxShadow: SHADOW }}>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>{title}</h2>
      {children}
    </motion.section>
  );
}

export function SimDashboard() {
  const sim = useSimEngine();
  const [yearIdx, setYearIdx] = useState(0);
  const fixYear = sim.years[Math.min(yearIdx, sim.years.length - 1)] ?? sim.years[0];

  const [confetti, setConfetti] = useState(0);
  const wasSurplus = useRef(false);
  useEffect(() => {
    const surplus = (fixYear?.deficitB ?? 1) < 0;
    if (surplus && !wasSurplus.current) setConfetti((n) => n + 1);
    wasSurplus.current = surplus;
  }, [fixYear?.deficitB]);

  const cf2025 = sim.counterfactual[sim.counterfactual.length - 1];
  const ac2025 = sim.actual[sim.actual.length - 1];
  const debtSaved = ac2025 && cf2025 ? ac2025.debtT - cf2025.debtT : 0;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-7" style={{ color: C.ink }}>
      <Confetti trigger={confetti} />

      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sim<span style={{ color: C.accent }}>Econ</span>
          </h1>
          <p className="text-sm" style={{ color: C.inkMute }}>
            Tune the U.S. federal budget. Pull a lever, watch it flow. Every number is sourced.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm" style={{ color: C.inkMute }}>
            Dynamic effects
            <InfoPopover title="Dynamic effects">
              Off (default), levers show their conventional score: the dollars they raise or cost on paper, the way CBO and JCT officially publish them. Turn it on to layer in behavioral effects: people respond to taxes, so a hike raises somewhat less (corporate about -15%, the top rate about -25% as income shifts away). More realistic, but more contestable. Capital-gains realization is always included either way.
            </InfoPopover>
            <Switch checked={sim.useDynamic} onCheckedChange={sim.setUseDynamic} />
          </span>
          <motion.button whileTap={{ scale: 0.95 }} onClick={sim.reset} className="rounded-full px-4 py-1.5 text-sm font-medium" style={{ background: C.card, color: C.ink, boxShadow: SHADOW_SM }}>
            Reset
          </motion.button>
        </div>
      </header>

      <div className="mb-6 flex justify-center">
        <SegmentedControl
          value={sim.mode}
          onChange={sim.setMode}
          options={[
            { value: "whatif", label: "What if we had..." },
            { value: "fix", label: "Fix this mess" },
          ]}
        />
      </div>

      {sim.mode === "fix" ? (
        <div className="space-y-5">
          <div className="rounded-3xl p-4 sm:p-5" style={{ background: C.card, boxShadow: SHADOW }}>
            <ScenarioPresets
              activePreset={sim.activePreset}
              onApply={(id, config) => {
                sim.applyPreset(config);
                sim.setActivePreset(id);
              }}
              onReset={sim.reset}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
            <aside>
              <LeverSidebar cfg={sim.cfg} setLever={sim.setLever} setLevers={sim.setLevers} />
            </aside>

            <main className="space-y-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
              <div className="flex items-center gap-3 rounded-3xl px-4 py-3" style={{ background: C.card, boxShadow: SHADOW_SM }}>
                <motion.span key={fixYear?.year} initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING} className="rounded-full px-3 py-1 font-mono text-sm font-bold tabular-nums" style={{ background: C.accent, color: "#fff" }}>
                  {fixYear?.year}
                </motion.span>
                <Slider value={[yearIdx]} min={0} max={sim.years.length - 1} step={1} onValueChange={(v) => setYearIdx(Array.isArray(v) ? v[0] : v)} className="flex-1" />
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: C.inkMute }}>to 2050</span>
              </div>

              {fixYear && <HeadlineStats year={fixYear} />}

              <SectionCard title="Gross federal debt as a share of GDP, through 2050">
                <TrajectoryChart mode="fix" years={sim.years} actual={sim.actual} counterfactual={sim.counterfactual} />
              </SectionCard>

              <SectionCard title={`Where the money flows (${fixYear?.year})`}>
                {fixYear && <MoneyFlowSankey year={fixYear} />}
              </SectionCard>

              <SectionCard title="Who pays, who gains (group total and per person, per year)">
                <BracketCharacters incidence={sim.incidence} />
              </SectionCard>
            </main>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <aside>
            <EventControls events={sim.events} toggleEvent={sim.toggleEvent} setEventsBulk={sim.setEventsBulk} />
          </aside>
          <main className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Actual debt, 2025" value={ac2025 ? trillions(ac2025.debtT * 1000) : "-"} color={C.red} />
              <MiniStat label="Counterfactual, 2025" value={cf2025 ? trillions(cf2025.debtT * 1000) : "-"} color={C.green} />
              <MiniStat label="Debt avoided" value={`$${debtSaved.toFixed(1)}T`} color={C.amber} />
            </div>
            <SectionCard title="The road from the last balanced budget (2000)">
              <TrajectoryChart mode="whatif" years={sim.years} actual={sim.actual} counterfactual={sim.counterfactual} />
            </SectionCard>
          </main>
        </div>
      )}

      <footer className="mt-10 text-center text-[11px]" style={{ color: C.inkMute }}>
        Illustrative model calibrated to CBO, JCT, OMB, and Treasury figures. Not a forecast.
      </footer>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="rounded-2xl px-4 py-3" style={{ background: C.card, boxShadow: SHADOW_SM }}>
      <div className="mb-0.5 text-[11px] font-medium uppercase tracking-wider" style={{ color: C.inkMute }}>{label}</div>
      <div className="font-mono text-xl font-semibold tabular-nums" style={{ color }}>{value}</div>
    </motion.div>
  );
}
